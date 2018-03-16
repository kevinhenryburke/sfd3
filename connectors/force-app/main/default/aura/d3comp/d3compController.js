({
	
    onInit: function(component, event, helper) {
		console.log('afterScriptsLoaded panel started');

        console.log("afterScriptsLoaded: panel");
                
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
                var panelClickedFilters = component.get("v.panelClickedFilters");     
                
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
                        "configjson" : configjson, 
                        "currentMeasure" : panelCurrentMeasure, 
                        "primaryId" : panelPrimaryId, 
                        "clickedFilters" : panelClickedFilters,
                        "componentReference" : componentReference
                    }
                        
                    helper.publishEvent("ConfigInitialized", publisher, componentType, configEventParameters);    
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
        console.log('afterScriptsLoaded panel finished');
    },

    /* handlers */  

    handle_evt_sfd3  : function(component, event, helper) {
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
                var panelClickedFilters = component.get("v.panelClickedFilters");     
                
                // publish event - configuration loaded
    
                var configEventParameters = { 
                    "datajson" : datajson, 
                    "configjson" : configjson, 
                    "currentMeasure" : panelCurrentMeasure, 
                    "primaryId" : panelPrimaryId, 
                    "clickedFilters" : panelClickedFilters,
                    "componentReference" : componentReference                
                }
    
                //publish to this component
                var publisher = component.get("v.UserComponentId");
                var componentType = component.get("v.componentType");
                console.log("calling publishEvent");
                helper.publishEvent("ConfigInitialized", publisher, componentType, configEventParameters);    

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
        if (topic == "UpdateCard")
        {
            var parameters = event.getParam("parameters");
            component.set("v.card1", parameters["card1"]);
            component.set("v.card2", parameters["card2"]);
            component.set("v.card3", parameters["card3"]);
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
            helper.publishEvent("ShowLevelsMore", publisher, componentType, {"levels" : panelShowLevels});
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
            helper.publishEvent("ShowLevelsFewer", publisher, componentType, {"levels" : panelShowLevels});
        }
    },

    
    onClickMeasureV1 : function(component, event, helper) {
        var currentMeasure = helper.setMeasure(component, 1);
        var publisher = component.get("v.UserComponentId");
        var componentType = component.get("v.componentType");
        helper.publishEvent("SetMeasure", publisher, componentType, {"index" : 1, "measure" : currentMeasure });
    },
    onClickMeasureV2 : function(component, event, helper) {
        var currentMeasure = helper.setMeasure(component, 2);
        var publisher = component.get("v.UserComponentId");
        var componentType = component.get("v.componentType");
        helper.publishEvent("SetMeasure", publisher, componentType, {"index" : 2, "measure" : currentMeasure });
    },
    onClickMeasureV3 : function(component, event, helper) {
        var currentMeasure = helper.setMeasure(component, 3);
        var publisher = component.get("v.UserComponentId");
        var componentType = component.get("v.componentType");
        helper.publishEvent("SetMeasure", publisher, componentType, {"index" : 3, "measure" : currentMeasure });
    },
    onClickMeasureV4 : function(component, event, helper) {
        var currentMeasure = helper.setMeasure(component, 4);
        var publisher = component.get("v.UserComponentId");
        var componentType = component.get("v.componentType");
        helper.publishEvent("SetMeasure", publisher, componentType, {"index" : 4, "measure" : currentMeasure });
    },
    onClickMeasureV5 : function(component, event, helper) {
        var currentMeasure = helper.setMeasure(component, 5);
        var publisher = component.get("v.UserComponentId");
        var componentType = component.get("v.componentType");
        helper.publishEvent("SetMeasure", publisher, componentType, {"index" : 5, "measure" : currentMeasure });
    },
    
    handleRelationshipTypeB1 : function(component, event, helper) {
		helper.setThisRelationshipType(component, 1);
    },
    handleRelationshipTypeB2 : function(component, event, helper) {
		helper.setThisRelationshipType(component, 2);
    },
    handleRelationshipTypeB3 : function(component, event, helper) {
		helper.setThisRelationshipType(component, 3);
    },
    handleRelationshipTypeB4 : function(component, event, helper) {
		helper.setThisRelationshipType(component, 4);
    },
    handleRelationshipTypeB5 : function(component, event, helper) {
		helper.setThisRelationshipType(component, 5);
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