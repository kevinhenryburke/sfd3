({
	
    onInit: function(component, event, helper) {
        console.log('afterScriptsLoaded panel enter');

        var masterConfig = component.get("v.masterConfig");
        if (typeof masterConfig === 'string' || masterConfig instanceof String) {
            console.log("masterConfig is a string");
            component.set("v.masterConfigObject", JSON.parse(masterConfig));
        }
        else {
            console.log("masterConfig is an object?");
            component.set("v.masterConfigObject", masterConfig);
        }
        var masterConfigObject = component.get("v.masterConfigObject");

        component.set("v.configuredAllowSearch", masterConfigObject["search"]["configuredAllowSearch"]);
        component.set("v.searchAction", masterConfigObject["search"]["searchAction"]);
        component.set("v.showBanner" , masterConfigObject["panels"]["ControlPanel"]["showBanner"]);

        var action = component.get(masterConfigObject["data"]["dataSourceMethod"]);

        var queryJSONObject = masterConfigObject["data"]["queryJSON"];


        var thisLevel = queryJSONObject.initialLevelsToRetrieve;
        // shift removes from front....
        component.set("v.currentLevels", thisLevel );

        // build up an array of ids that are still to be queried and the levels that are indexed by the arrays   
        var queryLevels = [thisLevel];
        var queryLevelIds = [[]];
        component.set("v.queryLevels", queryLevels );
        component.set("v.queryLevelIds", queryLevelIds );

        console.log("queryJSONObject");
        console.log(queryJSONObject);

        console.log("recordId:" + component.get("v.recordId"));

        var masterConfigObject = component.get("v.masterConfigObject");
        var queryJSONObject = masterConfigObject["data"]["queryJSON"];
        var queryJSONString = JSON.stringify(queryJSONObject);        
        
        action.setParams({
            'queryJSON': queryJSONString,
            "recordId" : component.get("v.recordId")
          });
        
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                console.log('data returned from apex');
                console.log(response.getReturnValue());
                
                helper.initializeConfig(component, response.getReturnValue());

                var datajson = component.get("v.datajson");
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
                var controllerId = component.get("v.UserComponentId");

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
                        
                    var preppedEvent = helper.prepareEvent("InitializeData", configEventParameters, controllerId);
                    helper.publishPreppedEvent(component,preppedEvent);
                }
                component.set("v.initEventsQueue",[]);


                // KB: TODO COME BACK
                var thisLevel = component.get("v.currentLevels");
                helper.extractLeafIds(component, datajson, thisLevel);
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
        var topic, parameters, controller;

        // if there is an arguments parameter this has been triggered by a method call
        // in which case we need to source our information from a level down in the event
        var argumentsParameter = event.getParam("arguments");
        var tpc = null;

        if (argumentsParameter != null) {
            bzutils.log('controller: invoked from method');
            tpc = argumentsParameter.tpc;
            topic = tpc.topic;
            parameters = tpc.parameters;
            controller = tpc.controller;
        }
        else {
            bzutils.log('controller: invoked from event');
            topic = event.getParam("topic");
            parameters = event.getParam("parameters");
            controller = event.getParam("controller");    
        }

        var UserComponentId = component.get("v.UserComponentId");

        console.log("handle_evt_sfd3: topic: " + topic + " component: " + UserComponentId);

        // If the event propagated from a component related to another controller then we ignore it.
        if (UserComponentId != controller) {
            console.log("handle_evt_sfd3: controller: ignoring message in " + UserComponentId + " intended for component " + controller);
            return;
        }        

        if (topic == "ChartRendered")
        {
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
                var controllerId = component.get("v.UserComponentId");

                var preppedEvent = helper.prepareEvent("InitializeData", configEventParameters, controllerId);
                helper.publishPreppedEvent(component,preppedEvent);
            
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
        if (topic == "InitializeData")
        {
            console.log("handle_evt_sfd3: InitializeData received by Controller: " + UserComponentId);
            var autoIncreaseLevels = component.get("v.autoIncreaseLevels");
            console.log("auto increasing levels: value: " + autoIncreaseLevels);
            if (autoIncreaseLevels == true) {
                console.log("auto increasing levels");
                var canIncreaseLevels = helper.canIncreaseLevels(component);
                if (canIncreaseLevels) { // if is not strictly necessary as event is disabling the button but keep for now
                    helper.updateData(component, event);
                }
            }
        }
        if (topic == "RefreshData")
        {
            console.log("handle_evt_sfd3: RefreshData received by Controller: " + UserComponentId);
            var autoIncreaseLevels = component.get("v.autoIncreaseLevels");
            if (autoIncreaseLevels == true) {
                console.log("auto increasing levels");
                var canIncreaseLevels = helper.canIncreaseLevels(component);
                if (canIncreaseLevels) { // if is not strictly necessary as event is disabling the button but keep for now
                    helper.updateData(component, event);
                }
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
            var measureIndex = parameters["index"];
            // refresh Buttons
            helper.updateButtonStyles(component, 'v', measureIndex, 5);
        }
        if (topic == "SetFilter")
        {
            // toogle the button styles
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
        if (topic == "InitiateRefreshChart")
        {
            // for a RefreshChart event we assume everything is initialized
            console.log("One time refresh");
            helper.updateData(component, event);
        }

        if (topic == "SearchRecordSelected")
        {
            // for a RefreshChart event we assume everything is initialized
            console.log("process SearchRecordSelected");
            helper.processSearchRecordSelected(component, event);
        }

        

        // finally push down to contained components if this is a component event received from a direct method call
        if (argumentsParameter != null) 
        {
            var customLookup = component.find("customLookup");
            customLookup.callFromContainer(tpc);
        }

    },

    /* onClick methods */

    onClickLevelMore : function(component, event, helper) {
        console.log("enter setConnectionLevelMore");
        helper.increaseLevels(component);
    },

    onClickLevelFewer : function(component, event, helper) {
        helper.decreaseLevels(component);
    },
    
    onClickMeasureV1 : function(component, event, helper) {
        var currentMeasure = helper.setMeasure(component, 1);
        var controllerId = component.get("v.UserComponentId");
        var preppedEvent = helper.prepareEvent("SetMeasure", {"index" : 1, "measure" : currentMeasure }, controllerId);
        helper.publishPreppedEvent(component,preppedEvent);
    },
    onClickMeasureV2 : function(component, event, helper) {
        var currentMeasure = helper.setMeasure(component, 2);
        var controllerId = component.get("v.UserComponentId");
        var preppedEvent = helper.prepareEvent("SetMeasure", {"index" : 2, "measure" : currentMeasure }, controllerId);
        helper.publishPreppedEvent(component,preppedEvent);
    },
    onClickMeasureV3 : function(component, event, helper) {
        var currentMeasure = helper.setMeasure(component, 3);
        var controllerId = component.get("v.UserComponentId");
        var preppedEvent = helper.prepareEvent("SetMeasure", {"index" : 3, "measure" : currentMeasure }, controllerId);
        helper.publishPreppedEvent(component,preppedEvent);
    },
    onClickMeasureV4 : function(component, event, helper) {
        var currentMeasure = helper.setMeasure(component, 4);
        var controllerId = component.get("v.UserComponentId");
        var preppedEvent = helper.prepareEvent("SetMeasure", {"index" : 4, "measure" : currentMeasure }, controllerId);
        helper.publishPreppedEvent(component,preppedEvent);
    },
    onClickMeasureV5 : function(component, event, helper) {
        var currentMeasure = helper.setMeasure(component, 5);
        var controllerId = component.get("v.UserComponentId");
        var preppedEvent = helper.prepareEvent("SetMeasure", {"index" : 5, "measure" : currentMeasure }, controllerId);
        helper.publishPreppedEvent(component,preppedEvent);
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
        var canIncreaseLevels = helper.canIncreaseLevels(component);
        if (canIncreaseLevels) { // if is not strictly necessary as event is disabling the button but keep for now
            helper.updateData(component, event);
        }
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
var controllerId = component.get("v.UserComponentId");

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
    var preppedEvent = helper.prepareEvent("RefreshData", configEventParameters, controllerId);
    helper.publishPreppedEvent(component,preppedEvent);
    d.setMonth(d.getMonth() + 1);
}),
1000);

console.log("onClickTimeSeriesRefresh exit");
    },
    
    
})