({
	
    onInit: function(component, event, helper) {
		console.log('afterScriptsLoaded panel enter');

        var action = component.get("c.returnData");

        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                console.log('data returned from apex');
                
                helper.initializeConfig(component, response.getReturnValue());

                var datajson = component.get("v.datajson");
                var configjson = component.get("v.configjson");
                var panelCurrentMeasure = component.get("v.panelCurrentMeasure");
                var panelPrimaryId = component.get("v.panelPrimaryId");            
                var panelShowFilters = component.get("v.panelShowFilters");     
                
                var arrayNames = configjson.filtertypes;
                var idprefix = "b";
                var maxbuttons = 5;                
                helper.formatButtons (component, arrayNames, idprefix, maxbuttons);

                arrayNames = configjson.measures;
                idprefix = "v";
                maxbuttons = 5;
                helper.formatButtons (component, arrayNames, idprefix, maxbuttons);

                component.set("v.initialized", true);
                
                // now we have initialized the configuration we can publish all of the events that are enqueued

                var eventQueue = component.get("v.initEventsQueue");
                var publisher = component.get("v.UserComponentId");
                var componentType = component.get("v.componentType");

                for (var i = 0; i < eventQueue.length; i++) {
                    var componentReference = eventQueue[i]["componentReference"];

                    console.log("enrich queued event and publish from onInit, componentReference: " + componentReference);
                    
                    var configEventParameters = { 
                        "datajson" : datajson, 
//                        "configjson" : configjson, 
                        "currentMeasure" : panelCurrentMeasure, 
                        "primaryId" : panelPrimaryId, 
                        "showFilters" : panelShowFilters,
                        "componentReference" : componentReference
                    }
                        
                    berlioz.utils.publishEvent("InitializeData", publisher, componentType, configEventParameters, null);    
                }
                component.set("v.initEventsQueue",[]);


            }
            else if (state === "ERROR") {
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        console.error("Error message: " + errors[0].message);
                    }
                } else {
                    console.error("Unknown error retrieving data");
                }
            }
        });

        $A.enqueueAction(action);        
        console.log('afterScriptsLoaded panel exit');
    },

    /* handlers */  

    handle_evt_sfd3  : function(component, event, helper) {
        var _this = this;
        var topic = event.getParam("topic");
        console.log("topic: " + topic);

        var publisher = event.getParam("publisher");
        var publisherType = event.getParam("publisherType");
        var UserComponentId = component.get("v.UserComponentId");
        var controller = event.getParam("controller");

        console.log("handling publisherType: " + publisherType + " from publisher " + publisher + " in " + UserComponentId);
                
        // if the component is named and the event propagated from another controller then we ignore it.
        if (publisherType == "Controller" && UserComponentId != null && UserComponentId != "") {
            if (UserComponentId != publisher) {
                console.log("controller: ignoring message from " + publisher + " in component " + UserComponentId);
                return;
            }
        }

        // if the component is named and the event propagated from a chart controlled by a controller with another name then we ignore it.
        if (publisherType == "Chart" && UserComponentId != null && UserComponentId != ""  && controller != null && controller != "") {
            if (UserComponentId != controller) {
                console.log("controller: ignoring message in " + UserComponentId + " intended for component " + controller);
                return;
            }
        }
        

        if (topic == "ChartRendered")
        {
            var parameters = event.getParam("parameters");
            var componentReference = parameters["componentReference"];
            console.log("Publish Initializing Instruction for Charts: " + componentReference);

            var initialized = component.get("v.initialized");     

            if (initialized == true) {

                // as the component is initialized we have values for parameters and can publish immediately

                var datajson = component.get("v.datajson");
                var configjson = component.get("v.configjson");
                var panelCurrentMeasure = component.get("v.panelCurrentMeasure");
                var panelPrimaryId = component.get("v.panelPrimaryId");            
                var panelShowFilters = component.get("v.panelShowFilters");     
                
                // publish event - configuration loaded
    
                var configEventParameters = { 
                    "datajson" : datajson, 
//                    "configjson" : configjson, 
                    "currentMeasure" : panelCurrentMeasure, 
                    "primaryId" : panelPrimaryId, 
                    "showFilters" : panelShowFilters,
                    "componentReference" : componentReference                
                }
    
                //publish to this component
                var publisher = component.get("v.UserComponentId");
                var componentType = component.get("v.componentType");
                berlioz.utils.publishEvent("InitializeData", publisher, componentType, configEventParameters, null);    

                // clear the queue
                component.set("v.initEventsQueue",[]);

            }
            else {
                // as the component is not initialized we have need to queue up received events

                console.log("queue up the event from handler as this component is not initialized");
                var eventQueue = component.get("v.initEventsQueue");
                eventQueue.push({"componentReference" : componentReference});
            }
        
        }
        if (topic == "ShowLevelsMore")
        {
            helper.setConnectionLevelMoreButtons(component);
        }
        if (topic == "ShowLevelsFewer")
        {
            helper.setConnectionLevelFewerButtons(component);
        }
        if (topic == "SetMeasure")
        {
            var parameters = event.getParam("parameters");
            var measureIndex = parameters["index"];
            // refresh Buttons
            helper.updateButtonStyles(component, 'v', measureIndex, 5);
        }
        if (topic == "SetFilter")
        {
            // toogle the button styles
            var parameters = event.getParam("parameters");
            var indexer = parameters["index"];
            var cmpTarget = component.find('b' + indexer);
            // set attributes to indicate filter on/off status
            $A.util.toggleClass(cmpTarget, 'filter_show');
            $A.util.toggleClass(cmpTarget, 'filter_hide');
            // restyle
            $A.util.toggleClass(cmpTarget, 'slds-button_neutral');
            $A.util.toggleClass(cmpTarget, 'slds-button_brand');
        }
        if (topic == "ChartMouseOver")
        {
            var parameters = event.getParam("parameters");
            console.log("Reading UpdateCard fields from configuration");
            component.set("v.card1", parameters[component.get("v.card1Field")]);  
            component.set("v.card2", parameters[component.get("v.card2Field")]);  
            component.set("v.card3", parameters[component.get("v.card3Field")]);  
        }
        if (topic == "InitiateRefreshChart")
        {
            // for a RefreshChart event we assume everything is initialized

            var action = component.get("c.returnDataUpdate");
            console.log('InitiateRefreshChart: running apex callback');    

            action.setCallback(_this, $A.getCallback(function(response) {
                console.log('InitiateRefreshChart: data returned from apex for udpate');    
                var state = response.getState();
                console.log('InitiateRefreshChart: state ' + state);    
                if (state === "SUCCESS") {

                    var datastring = response.getReturnValue();
                    var datajson = JSON.parse(datastring);
                    console.log('InitiateRefreshChart: datastring: ' + datastring);    
                    // Review - this is setting datajson to be whatever is new ... NOT the full data set in the CHART ...
                    component.set("v.datajson", datajson);
                            
                    var parameters = event.getParam("parameters");
                    var componentReference = parameters["componentReference"];
                    console.log("Publish data upon refresh request for charts: " + componentReference);


        // TODO - this sends data that is picked up by the target component, however work needs to be done on updating / removing nodes

                    // TODO - will need to retrieve data based on new selections
                    var datajson = component.get("v.datajson");
                    var configjson = component.get("v.configjson");
                    var panelCurrentMeasure = component.get("v.panelCurrentMeasure");
                    var panelPrimaryId = parameters["primaryNodeId"];            
                    component.set("v.panelPrimaryId", panelPrimaryId);   
                    var panelShowFilters = component.get("v.panelShowFilters");     

                    
                    // publish event - configuration loaded

                    var configEventParameters = { 
                        "datajson" : datajson, 
//                        "configjson" : configjson, 
                        "currentMeasure" : panelCurrentMeasure,
                        "primaryId" : panelPrimaryId, 
                        "showFilters" : panelShowFilters,
                        "componentReference" : componentReference                
                    }

                    //publish to this component
                    var publisher = component.get("v.UserComponentId");
                    var componentType = component.get("v.componentType");
                    berlioz.utils.publishEvent("RefreshData", publisher, componentType, configEventParameters, null);            
                }
            }))
            $A.enqueueAction(action);        
        }
        
    },

    /* onClick methods */

    onClickLevelMore : function(component, event, helper) {
        console.log("enter setConnectionLevelMore");

        var _this = this;

        var panelShowLevels = component.get("v.panelShowLevels");
        var maxlevels = component.get("v.maxlevels");

        // publish event if it is valid to do so
        if (panelShowLevels < maxlevels) {
            panelShowLevels++;
            console.log("increasing levels to: " + panelShowLevels);
            component.set("v.panelShowLevels", panelShowLevels);
            var publisher = component.get("v.UserComponentId");
            var componentType = component.get("v.componentType");
            berlioz.utils.publishEvent("ShowLevelsMore", publisher, componentType, {"levels" : panelShowLevels}, null);
        }
        
    },

    onClickLevelFewer : function(component, event, helper) {
        var _this = this;
        var panelShowLevels = component.get("v.panelShowLevels");

        // publish event if it is valid to do so
        if (panelShowLevels > 1) {
            panelShowLevels--;
            console.log("decreasing levels to: " + panelShowLevels);
            component.set("v.panelShowLevels", panelShowLevels);
            var publisher = component.get("v.UserComponentId");
            var componentType = component.get("v.componentType");
            berlioz.utils.publishEvent("ShowLevelsFewer", publisher, componentType, {"levels" : panelShowLevels}, null);
        }
    },
    
    onClickMeasureV1 : function(component, event, helper) {
        var currentMeasure = helper.setMeasure(component, 1);
        var publisher = component.get("v.UserComponentId");
        var componentType = component.get("v.componentType");
        berlioz.utils.publishEvent("SetMeasure", publisher, componentType, {"index" : 1, "measure" : currentMeasure }, null);
    },
    onClickMeasureV2 : function(component, event, helper) {
        var currentMeasure = helper.setMeasure(component, 2);
        var publisher = component.get("v.UserComponentId");
        var componentType = component.get("v.componentType");
        berlioz.utils.publishEvent("SetMeasure", publisher, componentType, {"index" : 2, "measure" : currentMeasure }, null);
    },
    onClickMeasureV3 : function(component, event, helper) {
        var currentMeasure = helper.setMeasure(component, 3);
        var publisher = component.get("v.UserComponentId");
        var componentType = component.get("v.componentType");
        berlioz.utils.publishEvent("SetMeasure", publisher, componentType, {"index" : 3, "measure" : currentMeasure }, null);
    },
    onClickMeasureV4 : function(component, event, helper) {
        var currentMeasure = helper.setMeasure(component, 4);
        var publisher = component.get("v.UserComponentId");
        var componentType = component.get("v.componentType");
        berlioz.utils.publishEvent("SetMeasure", publisher, componentType, {"index" : 4, "measure" : currentMeasure }, null);
    },
    onClickMeasureV5 : function(component, event, helper) {
        var currentMeasure = helper.setMeasure(component, 5);
        var publisher = component.get("v.UserComponentId");
        var componentType = component.get("v.componentType");
        berlioz.utils.publishEvent("SetMeasure", publisher, componentType, {"index" : 5, "measure" : currentMeasure }, null);
    },

    
    onClickMeasureV1 : function(component, event, helper) {
        var currentMeasure = helper.setMeasure(component, 1);
        var publisher = component.get("v.UserComponentId");
        var componentType = component.get("v.componentType");
        berlioz.utils.publishEvent("SetMeasure", publisher, componentType, {"index" : 1, "measure" : currentMeasure }, null);
    },
    
    onClickFilterB1 : function(component, event, helper) {
        helper.setFilter(component, 1);
    },
    onClickFilterB2 : function(component, event, helper) {
		helper.setFilter(component, 2);
    },
    onClickFilterB3 : function(component, event, helper) {
		helper.setFilter(component, 3);
    },
    onClickFilterB4 : function(component, event, helper) {
		helper.setFilter(component, 4);
    },
    onClickFilterB5 : function(component, event, helper) {
		helper.setFilter(component, 5);
    },

    navigateToRecord : function(component){
        var evtNav = $A.get("e.force:navigateToSObject");
        evtNav.setParams({
        "recordId": component.get("v.card4"),
        "slideDevName": "detail"
        });
        sObectEvent.fire(); 
     },

    
})