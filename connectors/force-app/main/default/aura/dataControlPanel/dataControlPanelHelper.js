({

    initializeConfig: function(component, datastring) {

        var _this = this;
        var initialized = component.get("v.initialized");

        if (initialized != true) {
            /* Configuration initialization */

            var masterConfigObject = component.get("v.masterConfigObject");
            var buttonParameters = masterConfigObject["panels"]["ControlPanel"]["buttonParameters"];            
            var queryJSONObject = masterConfigObject["data"]["queryJSON"];
            var topObjectLevel = queryJSONObject["objectLevels"][0];
            var topObjectLevelFields = topObjectLevel.fields;

            var measureNames = [];
            var panelShowMeasures = [];
            var measureSchemes = [];
            var numberMeasuresFound = 0;

            var sizeNames = [];
            var panelShowSizes = [];
            var numberSizesFound = 0;

            var filterPublish = {};

            for (var j = 0; j < topObjectLevelFields.length; j++) {

                // measure configuration
                if (topObjectLevelFields[j].measureName != null) {
                    if (numberMeasuresFound == 0){
                        component.set("v.configuredMeasures", true);
                        // set the first measure as default
                        var panelCurrentMeasure = topObjectLevelFields[j].measureName;
                        component.set("v.panelCurrentMeasure", panelCurrentMeasure);
                    }
                    // create arrays for measure and schemes
                    measureNames.push(topObjectLevelFields[j].measureName);
                    panelShowMeasures.push(topObjectLevelFields[j].measureName);
                    var measureSchemeListLoop = topObjectLevelFields[j].measureScheme;
                    if (measureSchemeListLoop != null) {
                        measureSchemes.push(measureSchemeListLoop);
                    }
                    else {
                        measureSchemes.push(null);
                    }
                    numberMeasuresFound++;
                }


                // size configuration
                if (topObjectLevelFields[j].sizeName != null) {
                    if (numberSizesFound == 0){
                        component.set("v.configuredSizes", true);
                        // set the first size as default
                        var panelCurrentSize = topObjectLevelFields[j].sizeName;
                        component.set("v.panelCurrentSize", panelCurrentSize);
                    }
                    // create arrays for size and schemes
                    sizeNames.push(topObjectLevelFields[j].sizeName);
                    panelShowSizes.push(topObjectLevelFields[j].sizeName);
                    numberSizesFound++;
                }

                // Filter configuration
                // At present only one filter field is possible
                var panelFilter = topObjectLevelFields[j].filter;
                if (panelFilter != null) {
                    component.set("v.filterFieldsCount", panelFilter.length);
                    component.set("v.filterAPIField", topObjectLevelFields[j].api);

                    filterPublish["filterAPIField"] = topObjectLevelFields[j].api;
                    filterPublish["filterValues"] = panelFilter;
                    component.set("v.filterPublish", filterPublish);
                }
            }

            component.set("v.measureNames", measureNames);
            component.set("v.measuresCount", measureNames.length)
            component.set("v.panelShowMeasures", panelShowMeasures);
            component.set("v.measureSchemes", measureSchemes);

            component.set("v.sizeNames", sizeNames);
            component.set("v.sizesCount", sizeNames.length)
            component.set("v.panelShowSizes", panelShowSizes);
            
            for (var key in buttonParameters) {  
                var subObj = buttonParameters[key];

                if (key == "levels") {
                    component.set("v.configuredLevels", true);                    
                    // set the maximum number of levels
                    var maxlevels = buttonParameters.levels;
                    if ((typeof maxlevels === 'number'))
                    {
                        component.set("v.maxlevels", maxlevels);          
                    }  
                    else
                    {
                        // using default maxlevels
                    }
                }
                if (key == "allowrefresh") {
                    component.set("v.configuredAllowRefresh", true);                    
                }
                if (key == "levelsIncreaseOnly") {
                    component.set("v.levelsIncreaseOnly", buttonParameters.levelsIncreaseOnly);                    
                }
                if (key == "autoIncreaseLevels") {
                    component.set("v.autoIncreaseLevels", buttonParameters.autoIncreaseLevels);                    
                }

                // this is a developer setting to allow some group of test buttons to display
                if (key == "showtestbuttons") {
                    component.set("v.configuredShowTestButtons", true);                    
                }

                

                // this may be required if we need to go down another level in the future.
                for (var subKey in subObj) {
                    // possible future requirement
                }
            }                            

            // underlying data parsed to JSON object
            var datajson = JSON.parse(datastring);
            component.set("v.datajson", datajson);

            // primary node - this is interesting as could be provided by datajson or config (e.g. on a record detail page)
            var primaryNodeInitialization = masterConfigObject["data"]["primaryNodeInitialization"];

            //TODO - need to add in when primary node is derived from recordId. In which case derive in config section
            if (primaryNodeInitialization == 'FirstInData')
            {
                var panelPrimaryId = datajson.nodes[0].id;
                component.set("v.panelPrimaryId", panelPrimaryId);            
            }
        }
    },

    updateData : function(component, parameters) {
        var _this = this;
        // for a RefreshChart event we assume everything is initialized

        var masterConfigObject = component.get("v.masterConfigObject");
        var action = component.get(masterConfigObject["data"]["dataUpdateMethod"]);

        var thisLevel = component.get("v.currentLevels");

        var queryLevelIds = _this.getQueryLevelIds(component,thisLevel);

        var masterConfigObject = component.get("v.masterConfigObject");
        var queryJSONObject = masterConfigObject["data"]["queryJSON"];
        var queryJSONString = JSON.stringify(queryJSONObject);        

        action.setParams({
            'queryJSON': queryJSONString,
            'queryLevelIds' : queryLevelIds,
            'queryLevel' : thisLevel
          });
        
        console.log('updateData: running apex callback');    

        action.setCallback(_this, $A.getCallback(function(response) {
            var state = response.getState();
            console.log('updateData: data returned from apex for udpate with state: ' + state);   
            if (state === "SUCCESS") {

                var datastring = response.getReturnValue();
                var datajson = JSON.parse(datastring);
                // bzutils.log('InitiateRefreshChart: datastring: ' + datastring);    

                // lay down candidate ids for further queries
                var thisLevel = component.get("v.currentLevels");
                _this.extractLeafIds(component, datajson, thisLevel);
                _this.increaseLevels (component);

                // Review - this is setting datajson to be whatever is new ... NOT the full data set in the CHART ...
                component.set("v.datajson", datajson);
                console.log('updateData: datajson: ' , datajson);   

    // TODO - this sends data that is picked up by the target component, however work needs to be done on updating / removing nodes

                // TODO - will need to retrieve data based on new selections
                var datajson = component.get("v.datajson");
                var masterConfigObject = component.get("v.masterConfigObject");
                var panelCurrentMeasure = component.get("v.panelCurrentMeasure");
                var panelCurrentSize = component.get("v.panelCurrentSize");
                var filterPublish = component.get("v.filterPublish");     

                var configEventParameters;

                if (parameters != null) {
                    // Extract data from the event to update control panel and send out details.
                    var componentReference = parameters["componentReference"];
                    bzutils.log("Publish data upon refresh request for charts: " + componentReference);
                    var panelPrimaryId = parameters["primaryNodeId"];            
                    component.set("v.panelPrimaryId", panelPrimaryId);   
                    
                    // publish event - configuration loaded

                    configEventParameters = { 
                        "datajson" : datajson, 
                        "currentMeasure" : panelCurrentMeasure,
                        "currentSize" : panelCurrentSize,
                        "masterConfigObject" : masterConfigObject,
                        "primaryId" : panelPrimaryId, 
                        "showFilters" : filterPublish,
                        "componentReference" : componentReference        // be aware this is the receiving component's reference        
                    }
                }
                else {
                    configEventParameters = { 
                        "datajson" : datajson, 
                        "currentMeasure" : panelCurrentMeasure,
                        "currentSize" : panelCurrentSize,
                        "masterConfigObject" : masterConfigObject,
                        "primaryId" : panelPrimaryId, 
                        "showFilters" : filterPublish,
                    }
                }

                //publish to this component
                var controllerId = component.get("v.UserComponentId");
                var preppedEvent = _this.prepareEvent("RefreshData", configEventParameters, controllerId);
                _this.publishPreppedEvent(component,preppedEvent);
            
            }
        }))
        $A.enqueueAction(action);        
    },

    publishSearchChartEvent : function(component) {

        console.log("helper.publishSearchChartEvent");

        var _this = this;
        var searchTermId = component.get("v.searchTermId");
        var searchAction = component.get("v.searchAction");
        var showLevels = component.get("v.maxlevels");

        _this.publishSearchChartEventBase (component, searchTermId, searchAction, showLevels);
    },

    publishSearchChartEventBase : function(component, searchTermId, searchAction, showLevels) {
        var _this = this;

        console.log("helper.publishSearchChartEventBase");

        var configEventParameters = { 
            "searchTermId" : searchTermId,
            "searchAction" : searchAction,
            "showLevels" : showLevels
        }

        //publish to this component
        var controllerId = component.get("v.UserComponentId");
        var preppedEvent = _this.prepareEvent("SearchChart", configEventParameters, controllerId);
        _this.publishPreppedEvent(component,preppedEvent);

    },

    canIncreaseLevels : function(component) {
        var _this = this;

        var currentLevels = component.get("v.currentLevels");
        var maxlevels = component.get("v.maxlevels");

        return (currentLevels < maxlevels);
    },
    
    increaseLevels : function(component) {
        var _this = this;
        var canIncreaseLevels = _this.canIncreaseLevels(component);

        // publish event if it is valid to do so
        if (canIncreaseLevels) {
            var currentLevels = component.get("v.currentLevels");
            currentLevels++;
            component.set("v.currentLevels", currentLevels);
            var controllerId = component.get("v.UserComponentId");
            var preppedEvent = _this.prepareEvent("ShowLevelsMore", {"levels" : currentLevels}, controllerId);
            _this.publishPreppedEvent(component,preppedEvent);
        }
    },
    
    decreaseLevels : function(component) {
        var _this = this;
        var currentLevels = component.get("v.currentLevels");

        // publish event if it is valid to do so
        if (currentLevels > 1) {
            currentLevels--;
            component.set("v.currentLevels", currentLevels);
            var controllerId = component.get("v.UserComponentId");
            var preppedEvent = _this.prepareEvent("ShowLevelsFewer", {"levels" : currentLevels}, controllerId);
            _this.publishPreppedEvent(component,preppedEvent);
        }
    },
    
    /* BUTTON methods */
    
    setConnectionLevelFewerButtons: function(component) {
        var _this = this;
        var levelsIncreaseOnly = component.get("v.levelsIncreaseOnly");
        // if levels cannot decrease then nothing to do here as there is no Fewer Button to press
        if (!levelsIncreaseOnly) {
            var currentLevels = component.get("v.currentLevels");
            // "more" button should be enabled, "less" button should be disabled if we've reached lowest level
            var cmpTargetMore = component.find('more');
            cmpTargetMore.set("v.disabled", "false");
            if (currentLevels == 1) {
                var cmpTargetLess = component.find("less");
                cmpTargetLess.set("v.disabled", "true");
            }
        }
    },

    setConnectionLevelMoreButtons: function(component) {
        var _this = this;
        var currentLevels = component.get("v.currentLevels");
        var maxlevels = component.get("v.maxlevels");

        // refresh buttons : "less" button should be enabled, "more" button should be disabled if we've reached max level
        // if levels cannot decrease then no action for the "less" button as there is no button to press

        var levelsIncreaseOnly = component.get("v.levelsIncreaseOnly");
        if (! levelsIncreaseOnly) {
            var cmpTargetLess = component.find("less");
            cmpTargetLess.set("v.disabled", "false");
        }
        if (currentLevels >= maxlevels) {
            var cmpTargetMore = component.find('more');
            cmpTargetMore.set("v.disabled", "true");
        }
    },

    setConnectionLevelMaxButtons: function(component) {
        var _this = this;
        var maxlevels = component.get("v.maxlevels");
        component.set("v.currentLevels", maxlevels);
        
        // if levels cannot decrease then no action for the "less" button as there is no button to press
        var levelsIncreaseOnly = component.get("v.levelsIncreaseOnly");
        if (! levelsIncreaseOnly) {
            var cmpTargetLess = component.find("less");
            cmpTargetLess.set("v.disabled", "false");
        }
        var cmpTargetMore = component.find('more');
        cmpTargetMore.set("v.disabled", "true");
    },

    setMenuMeasure : function(component, currentMeasure) {
        var _this = this;
        component.set("v.panelCurrentMeasure", currentMeasure);
        var controllerId = component.get("v.UserComponentId");
        var preppedEvent = _this.prepareEvent("SetMeasure", {"measure" : currentMeasure }, controllerId);
        _this.publishPreppedEvent(component,preppedEvent);
    },

    setMenuSize : function(component, currentSize) {
        var _this = this;
        component.set("v.panelCurrentSize", currentSize);
        var controllerId = component.get("v.UserComponentId");
        var preppedEvent = _this.prepareEvent("SetSize", {"size" : currentSize }, controllerId);
        _this.publishPreppedEvent(component,preppedEvent);
    },



    setMenuFilter: function(component, thisType, newClickedState) {
        var _this = this;
        var controllerId = component.get("v.UserComponentId");
        var filterState = newClickedState ? "Show" : "Hide"; // if before it was show then now it is hide

        var preppedEvent = _this.prepareEvent("SetFilter", {"filterState" : filterState, "filterType" : thisType }, controllerId);
        _this.publishPreppedEvent(component,preppedEvent);
    },

    // TODO TODO TODO - come back, not even half finished.
    
    /* This may need to change but at present it attempts to parse both hierarchy and node formats
    More control could be had by informing what the format to expect is of course */

    extractLeafIds : function(component, topnode, thisLevel) {
        var _this = this;
        var queryLevels = component.get("v.queryLevels");
        var queryLevelIds = component.get("v.queryLevelIds");     

        if (Array.isArray(topnode) == true) {
            for (var i=0; i < topnode.length; i++ ) {
                _this.extractLeafIds(component, topnode[i], thisLevel);
            }
        }
        else {
            // parse the hierarchy - using children node
            if (topnode.children) {
                for (var i=0; i < topnode.children.length; i++ ) {
                    _this.extractLeafIds(component, topnode.children[i], thisLevel);
                }
            } 
            else {
                if (topnode.level >= thisLevel) {
                    _this.addIdToQueryList(component, topnode.level, topnode.id);
                }
            }
        }
        // parse the node structure - using nodes // TODO - need to be sorted for nodes
        if (topnode.nodes) {
            for (var i=0; i < topnode.nodes.length; i++ ) {
                _this.extractLeafIds(component, topnode.nodes[i], thisLevel);
            }
        }        
    },

    getQueryLevelIds : function(component, thisLevel) {
        var _this = this;

        var queryLevels = component.get("v.queryLevels");

        var levelIndex = queryLevels.indexOf(thisLevel);

        if (levelIndex == -1) {
            return [];            
        }
        else {
            var queryLevelIds = component.get("v.queryLevelIds");     
            return queryLevelIds[levelIndex];
        }
    },


    getLevelIndex : function(component, thisLevel) {
        var _this = this;

        var queryLevels = component.get("v.queryLevels");

        var levelIndex = queryLevels.indexOf(thisLevel);

        if (levelIndex == -1) {
            // this is a new level
            var queryLevelIds = component.get("v.queryLevelIds");     

            // push the new level to the levels array and create a new array at the end of the ids array
            queryLevels.push(thisLevel);
            queryLevelIds.push([]);
            // set these as new values
            component.set("v.queryLevels", queryLevels);
            component.set("v.queryLevelIds", queryLevelIds);     
            // and set the level index to the the last index of the new array
            levelIndex = queryLevels.length -1;
            bzutils.log("create new level: levelIndex: " + levelIndex + " thisLevel: " + thisLevel);
        }
        return levelIndex;
        
    },


    addIdToQueryList : function(component, thisLevel, thisid) {
        var _this = this;
        var levelIndex = _this.getLevelIndex(component, thisLevel);
        var queryLevelIds = component.get("v.queryLevelIds");     
        queryLevelIds[levelIndex].push(thisid);
        component.set("v.queryLevelIds", queryLevelIds); 
    },

    // TODO function appears in many places, try to consolidate
    publishPreppedEvent : function(component,preppedEvent){
        var _this = this;
        if (preppedEvent != null) {
            var event;
            console.log("publishPreppedEvent: enter "+ preppedEvent.topic + " and " + preppedEvent.eventType);

            if (preppedEvent.eventType != null) {
                // go with preset value
                console.log("publishPreppedEvent: override eventType: " + preppedEvent.eventType);
            }
            else {
                preppedEvent.eventType = component.get("v.defaultEventType");
                console.log("publishPreppedEvent: use default eventType: " + preppedEvent.eventType);
            }

            if (preppedEvent.eventType == "Component"){
                console.log("publishPreppedEvent: eventType used will be: " +  preppedEvent.eventType);
                event = component.getEvent("evt_bzc");
            }
            if (preppedEvent.eventType == "Application"){
                console.log("publishPreppedEvent: eventType used will be: " +  preppedEvent.eventType);
                event = $A.get("e.c:evt_sfd3");
            }
            bzutils.publishEventHelper(event, preppedEvent.topic, preppedEvent.parameters, preppedEvent.controllerId);     
        }
    },

    prepareEvent : function (topic, parameters, controllerId) {
        var eventType = bzutils.getEventTypeByTopic(topic);
        return {
            "eventType" : eventType ,
            "topic" : topic,
            "parameters" : parameters,
            "controllerId" : controllerId
        }
    },

    // Processes selection event from the search component
    // Effectively just extracts record id and invokes a publisher method for the chart to pick up    
    processSearchRecordSelected : function(component, parameters) {
        var _this = this;

        console.log("helper.processSearchRecordSelected enter");

        var selectedRecord = parameters["recordByEvent"];    
        component.set("v.selectedRecord" , selectedRecord); 

        var searchTermId = selectedRecord.id;
        component.set("v.searchTermId", searchTermId);

        var configuredLevels = component.get("v.configuredLevels");
        if (configuredLevels == true) {
            // TODO this is wrong and will need to change 
            // for networks I'm pushing ot max levels - probably shouldn't
            // code here is temporary and should probably just go
            var levelsIncreaseOnly = component.get("v.levelsIncreaseOnly");
            // set the configured levels buttons
            if (! levelsIncreaseOnly) {
                _this.setConnectionLevelMaxButtons(component);
            }
        }

        console.log("helper.SearchRecordSelected last call");

        _this.publishSearchChartEvent(component);

    },

})