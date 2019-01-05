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
        component.set("v.currentLevels", thisLevel );

        // build up an array of ids that are still to be queried and the levels that are indexed by the arrays   
        var queryLevels = [thisLevel];
        var queryLevelIds = [[]];
        component.set("v.queryLevels", queryLevels );
        component.set("v.queryLevelIds", queryLevelIds );

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
                // console.log('data returned from apex');
                // console.log(response.getReturnValue());
                
                helper.initializeConfig(component, response.getReturnValue());

                var datajson = component.get("v.datajson");

                var masterConfigObject = component.get("v.masterConfigObject");

                var panelCurrentMeasure = component.get("v.panelCurrentMeasure");
                var panelCurrentSize = component.get("v.panelCurrentSize");
                var panelPrimaryId = component.get("v.panelPrimaryId");            
                var filterPublish = component.get("v.filterPublish");     
                
                component.set("v.initialized", true);
                
                // now we have initialized the configuration we can publish all of the events that are enqueued

                var eventQueue = component.get("v.initEventsQueue");
                var controllerId = component.get("v.UserComponentId");

                for (var i = 0; i < eventQueue.length; i++) {
                    var componentReference = eventQueue[i]["componentReference"];

                    console.log("enrich queued event and publish from onInit, componentReference: " + componentReference);

                    console.log("xxxxx: currentMeasure: " + panelCurrentMeasure);
                    console.log("xxxxx: currentSize: " + panelCurrentSize);


                    var configEventParameters = { 
                        "datajson" : datajson, 
                        "currentMeasure" : panelCurrentMeasure, 
                        "currentSize" : panelCurrentSize, 
                        "masterConfigObject" : masterConfigObject,
                        "primaryId" : panelPrimaryId, 
                        "showFilters" : filterPublish,
                        "componentReference" : componentReference
                    }

                    console.log("publish InitializeData from OnInit method")
                    
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

    handleCustomEvent  : function(component, event, helper) {

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
            // console.log('dataControlPanel: handleCustomEvent enter from method, topic: ' + topic);
        }
        else {
            bzutils.log('controller: invoked from event');
            topic = event.getParam("topic");
            parameters = event.getParam("parameters");
            controller = event.getParam("controller");    
            // console.log('dataControlPanel: handleCustomEvent enter from event, topic: ' + topic);
        }

        var UserComponentId = component.get("v.UserComponentId");

        // console.log("handleCustomEvent: topic: " + topic + " component: " + UserComponentId);

        // If the event propagated from a component related to another controller then we ignore it.
        if (UserComponentId != controller) {
            console.log("handleCustomEvent: controller: ignoring message in " + UserComponentId + " intended for component " + controller);
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
                var panelCurrentMeasure = component.get("v.panelCurrentMeasure");
                var panelCurrentSize = component.get("v.panelCurrentSize");
                var panelPrimaryId = component.get("v.panelPrimaryId");            
                var filterPublish = component.get("v.filterPublish");     
                
                var masterConfigObject = component.get("v.masterConfigObject");

                // publish event - configuration loaded
    
                var configEventParameters = { 
                    "datajson" : datajson, 
                    "currentMeasure" : panelCurrentMeasure, 
                    "currentSize" : panelCurrentSize, 
                    "masterConfigObject" : masterConfigObject,
                    "primaryId" : panelPrimaryId, 
                    "showFilters" : filterPublish,
                    "componentReference" : componentReference                
                }
    
                //publish to this component
                var controllerId = component.get("v.UserComponentId");

                console.log("publish InitializeData from ChartRendered Event")

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
            console.log("handleCustomEvent: InitializeData received by Controller: " + UserComponentId);
            var autoIncreaseLevels = component.get("v.autoIncreaseLevels");
            if (autoIncreaseLevels == true) {
                console.log("InitializeData: auto increasing levels");
                var canIncreaseLevels = helper.canIncreaseLevels(component);
                if (canIncreaseLevels) { // if is not strictly necessary as event is disabling the button but keep for now
                    helper.updateData(component, parameters);
                }
            }
        }
        if (topic == "RefreshData")
        {
            console.log("handleCustomEvent: RefreshData received by Controller: " + UserComponentId);
            var autoIncreaseLevels = component.get("v.autoIncreaseLevels");
            if (autoIncreaseLevels == true) {
                console.log("RefreshData: auto increasing levels");
                var canIncreaseLevels = helper.canIncreaseLevels(component);
                if (canIncreaseLevels) { // if is not strictly necessary as event is disabling the button but keep for now
                    helper.updateData(component, parameters);
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
        if (topic == "InitiateRefreshChart")
        {
            // for a RefreshChart event we assume everything is initialized
            console.log("One time refresh");
            helper.updateData(component, parameters);
        }

        if (topic == "SearchRecordSelected")
        {
            // a search item has been selected from the search result set
            console.log("process SearchRecordSelected");
            helper.processSearchRecordSelected(component, parameters);
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
    
    onClickRefreshOneTime : function(component, event, helper) {
        var _this = this;
        console.log("onClickRefreshOneTime enter");
        var canIncreaseLevels = helper.canIncreaseLevels(component);
        if (canIncreaseLevels) { // if is not strictly necessary as event is disabling the button but keep for now
            var parameters = event.getParam("arguments");
            helper.updateData(component, parameters);
        }
        console.log("onClickRefreshOneTime exit");
    },

    handleMenuMeasures: function (component, event, helper) {
        var selectedMenuItemValue = event.getParam("value");
        helper.setMenuMeasure(component, selectedMenuItemValue);
    },    

    handleMenuSizes: function (component, event, helper) {
        var selectedMenuItemValue = event.getParam("value");
        helper.setMenuSize(component, selectedMenuItemValue);
    },    

    handleMenuFilter: function (component, event, helper) {
        var selectedMenuItemValue = event.getParam("value");

        var menuItems = component.find("actionMenuFilterItems");
        var menuItem = menuItems.find(function(menuItem) {
            return menuItem.get("v.value") === selectedMenuItemValue;
        });

        var newClickedState = !menuItem.get("v.checked");
        menuItem.set("v.checked", newClickedState);
        helper.setMenuFilter(component, selectedMenuItemValue, newClickedState);
    },    

    onClickTimeSeriesRefresh : function(component, event, helper) {
        console.log("onClickTimeSeriesRefresh enter");

        var datajson = component.get("v.datajson");
        var panelPrimaryId = component.get("v.panelPrimaryId");            
        var filterPublish = component.get("v.filterPublish");     

        var configEventParameters = { 
            "datajson" : datajson, 
            "primaryId" : panelPrimaryId, 
            "showFilters" : filterPublish,
        }

        //publish to this component
        var controllerId = component.get("v.UserComponentId");

        // THIS ALL TEMPORARY
        var d = new Date(2014, 1, 1, 0, 0, 0, 0);
        var counter = -1;
        var interval = window.setInterval(
        $A.getCallback(function() {
            counter++;
            configEventParameters["valueDate"] = d;
            for (var i = 0; i < datajson.nodes.length; i++){
                // grow most nodes and shrink a few too but make sure don't go too small.
                var djNode = datajson.nodes[i];
                var fields = djNode.fields;

                for (var j = 0; j < fields.length; j++) {
                    if (fields[j].retrievedInteger != null) {
                        fields[j].retrievedInteger= 
                            Math.max(10,fields[j].retrievedInteger + Math.floor(Math.random() * 20) - 5); 
                    }
                    if (fields[j].retrievedDecimal != null) {
                        fields[j].retrievedDecimal= 
                            Math.max(10,fields[j].retrievedDecimal + Math.floor(Math.random() * 20) - 5); 
                    }
                }
            }    
            configEventParameters["datajson"] = datajson;

            if (counter < 6) {
                var preppedEvent = helper.prepareEvent("RefreshData", configEventParameters, controllerId);
                helper.publishPreppedEvent(component,preppedEvent);
                d.setMonth(d.getMonth() + 1);    
            }
            else {
                clearInterval(interval);
            }
        }),
        2000);

        console.log("onClickTimeSeriesRefresh exit");
    },
    
    
})