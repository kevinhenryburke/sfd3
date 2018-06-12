({
	
    onInit: function(component, event, helper) {
        console.log('afterScriptsLoaded panel enter');

        var dataSourceMethod = component.get("v.dataSourceMethod");

        var action = component.get(dataSourceMethod);

        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                console.log('data returned from apex');
                
                helper.initializeConfig(component, response.getReturnValue());

                var datajson = component.get("v.datajson");
                var configjsonString = component.get("v.configjsonString");
                var configjson = component.get("v.configjson");
                var panelCurrentMeasure = component.get("v.panelCurrentMeasure");
                var panelPrimaryId = component.get("v.panelPrimaryId");            
                var panelShowFilters = component.get("v.panelShowFilters");     
                
                if (component.get("v.configuredFilterTypes") == true) {                   
                    var arrayNames = configjson.filtertypes;
                    var idprefix = "b";
                    var maxbuttons = 5;                
                    helper.formatButtons (component, arrayNames, idprefix, maxbuttons);
                }

                if (component.get("v.configuredMeasures") == true) {                   
                    var arrayNames = configjson.measures;
                    var idprefix = "v";
                    var maxbuttons = 5;
                    helper.formatButtons (component, arrayNames, idprefix, maxbuttons);
                }

                component.set("v.initialized", true);
                
                // now we have initialized the configuration we can publish all of the events that are enqueued

                var eventQueue = component.get("v.initEventsQueue");
                var publisher = component.get("v.UserComponentId");
                var componentCategory = component.get("v.componentCategory");
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
                        
                    bzutils.publishEvent("InitializeData", publisher, componentCategory, componentType, configEventParameters, null);    
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
        var publisherCategory = event.getParam("publisherCategory");
        var publisherType = event.getParam("publisherType");
        var UserComponentId = component.get("v.UserComponentId");
        var controller = event.getParam("controller");

        console.log("handling publisherCategory: " + publisherCategory + " from publisher " + publisher + " in " + UserComponentId);
                
        // if the component is named and the event propagated from another controller then we ignore it.
        if (publisherCategory == "Controller" && UserComponentId != null && UserComponentId != "") {
            if (UserComponentId != publisher) {
                console.log("controller: ignoring message from " + publisher + " in component " + UserComponentId);
                return;
            }
        }

        // if the component is named and the event propagated from a chart controlled by a controller with another name then we ignore it.
        if (publisherCategory == "Display" && UserComponentId != null && UserComponentId != ""  && controller != null && controller != "") {
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
                var componentCategory = component.get("v.componentCategory");
                var componentType = component.get("v.componentType");
                bzutils.publishEvent("InitializeData", publisher, componentCategory, componentType, configEventParameters, null);    

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
            
            // restyle is straightforward, flip styles depending on whether we are showing or hiding the filter

            var nowShow = $A.util.hasClass(cmpTarget, 'filter_show');

            if (nowShow) {
                $A.util.addClass(cmpTarget, 'slds-button_brand');                                
                $A.util.removeClass(cmpTarget, 'slds-button_neutral');                
            }
            else {
                $A.util.addClass(cmpTarget, 'slds-button_neutral');                                
                $A.util.removeClass(cmpTarget, 'slds-button_brand');                
            }
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
            console.log("One time refresh");
            helper.refreshOneTime(component, event);
        }
    },

   // This function call when the end User Select any record from the result list.   
   handleEmbeddedComponentEvent : function(component, event, helper) {
    // get the selected Account record from the COMPONETN event 	 
       var selectedAccountGetFromEvent = event.getParam("recordByEvent");

       // validate that we want to process this - i.e. it is for us?
       var parentUserComponentIdFromEvent = event.getParam("parentUserComponentId");
       var parentUserComponentId = component.get("v.UserComponentId");
       if (parentUserComponentId != parentUserComponentIdFromEvent) {
           console.log("d3comp: ignoring event: " + parentUserComponentId + "/" + parentUserComponentIdFromEvent);
       } 
       else {
           console.log("d3comp: event received");
       }

       component.set("v.selectedRecord" , selectedAccountGetFromEvent); 
       
       console.log("selectedAccountGetFromEvent");
       console.log(JSON.stringify(selectedAccountGetFromEvent));

       console.log("id");
       console.log(selectedAccountGetFromEvent.id);

       var searchTermId = selectedAccountGetFromEvent.id;

       component.set("v.searchTermId", searchTermId);
       // Note: v.searchAction is set via Design Parameter

        helper.setConnectionLevelMaxButtons(component);
        helper.publishSearchChartEvent(component);

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
            var componentCategory = component.get("v.componentCategory");
            var componentType = component.get("v.componentType");
            bzutils.publishEvent("ShowLevelsMore", publisher, componentCategory, componentType, {"levels" : panelShowLevels}, null);
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
            var componentCategory = component.get("v.componentCategory");
            var componentType = component.get("v.componentType");
            bzutils.publishEvent("ShowLevelsFewer", publisher, componentCategory, componentType, {"levels" : panelShowLevels}, null);
        }
    },
    
    onClickMeasureV1 : function(component, event, helper) {
        var currentMeasure = helper.setMeasure(component, 1);
        var publisher = component.get("v.UserComponentId");
        var componentCategory = component.get("v.componentCategory");
        var componentType = component.get("v.componentType");
        bzutils.publishEvent("SetMeasure", publisher, componentCategory, componentType, {"index" : 1, "measure" : currentMeasure }, null);
    },
    onClickMeasureV2 : function(component, event, helper) {
        var currentMeasure = helper.setMeasure(component, 2);
        var publisher = component.get("v.UserComponentId");
        var componentCategory = component.get("v.componentCategory");
        var componentType = component.get("v.componentType");
        bzutils.publishEvent("SetMeasure", publisher, componentCategory, componentType, {"index" : 2, "measure" : currentMeasure }, null);
    },
    onClickMeasureV3 : function(component, event, helper) {
        var currentMeasure = helper.setMeasure(component, 3);
        var publisher = component.get("v.UserComponentId");
        var componentCategory = component.get("v.componentCategory");
        var componentType = component.get("v.componentType");
        bzutils.publishEvent("SetMeasure", publisher, componentCategory, componentType, {"index" : 3, "measure" : currentMeasure }, null);
    },
    onClickMeasureV4 : function(component, event, helper) {
        var currentMeasure = helper.setMeasure(component, 4);
        var publisher = component.get("v.UserComponentId");
        var componentCategory = component.get("v.componentCategory");        
        var componentType = component.get("v.componentType");
        bzutils.publishEvent("SetMeasure", publisher, componentCategory, componentType, {"index" : 4, "measure" : currentMeasure }, null);
    },
    onClickMeasureV5 : function(component, event, helper) {
        var currentMeasure = helper.setMeasure(component, 5);
        var publisher = component.get("v.UserComponentId");
        var componentCategory = component.get("v.componentCategory");
        var componentType = component.get("v.componentType");
        bzutils.publishEvent("SetMeasure", publisher, componentCategory, componentType, {"index" : 5, "measure" : currentMeasure }, null);
    },

    
    onClickMeasureV1 : function(component, event, helper) {
        var currentMeasure = helper.setMeasure(component, 1);
        var publisher = component.get("v.UserComponentId");
        var componentCategory = component.get("v.componentCategory");
        var componentType = component.get("v.componentType");
        bzutils.publishEvent("SetMeasure", publisher, componentCategory, componentType, {"index" : 1, "measure" : currentMeasure }, null);
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

    onClickRefreshOneTime : function(component, event, helper) {
        var _this = this;
        console.log("onClickRefreshOneTime enter");
		helper.refreshOneTime(component, event);
        console.log("onClickRefreshOneTime exit");
    },
    

    onClickTimeSeriesRefresh : function(component, event, helper) {
        var _this = this;
        console.log("onClickTimeSeriesRefresh enter");

// ALL DUPLICATE WITH other refresh metthod = refactor

var datajson = component.get("v.datajson");
var configjson = component.get("v.configjson");
var panelCurrentMeasure = component.get("v.panelCurrentMeasure");
var panelPrimaryId = component.get("v.panelPrimaryId");            
var panelShowFilters = component.get("v.panelShowFilters");     


// publish event - configuration loaded

var configEventParameters = { 
    "datajson" : datajson, 
//                        "configjson" : configjson, 
    "currentMeasure" : panelCurrentMeasure,
    "primaryId" : panelPrimaryId, 
    "showFilters" : panelShowFilters,
//    "componentReference" : componentReference                
}

//publish to this component
var publisher = component.get("v.UserComponentId");
var componentCategory = component.get("v.componentCategory");
var componentType = component.get("v.componentType");


// bzutils.publishEvent("RefreshData", publisher, componentCategory, componentType, configEventParameters, null);            

// THIS ALL TEMPORARY
var d = new Date(2014, 1, 1, 0, 0, 0, 0);
window.setInterval(
$A.getCallback(function() {
    configEventParameters["valueDate"] = d;
    for (var i = 0; i < datajson.nodes.length; i++){
        // grow most nodes and shrink a few too but make sure don't go too small.
        datajson.nodes[i].measures["Posts"].radius = Math.max(10,datajson.nodes[i].measures["Posts"].radius + Math.floor(Math.random() * 20) - 5); 
        datajson.nodes[i].measures["Hot"].radius = Math.max(10,datajson.nodes[i].measures["Hot"].radius + Math.floor(Math.random() * 20) - 5); 
    }    
    configEventParameters["datajson"] = datajson;
    bzutils.publishEvent("RefreshData", publisher, componentCategory, componentType, configEventParameters, null);            
    d.setMonth(d.getMonth() + 1);
}),
1000);

console.log("onClickTimeSeriesRefresh exit");
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