({

    initializeConfig: function(component, datastring) {

        var _this = this;
        var initialized = component.get("v.initialized");

        if (initialized != true) {
            /* Configuration initialization */
            // TODO - review, this may be better hard coded but design parameter allows for some flexibility for end users

            var configjson = JSON.parse(component.get("v.configjsonString"));            
            component.set("v.configjson", configjson);

            for (var key in configjson) {  
                var subObj = configjson[key];

                if (key == "levels") {
                    component.set("v.configuredLevels", true);                    
                    // set the maximum number of levels
                    var maxlevels = configjson.levels;
                    if ((typeof maxlevels === 'number'))
                    {
                        component.set("v.maxlevels", maxlevels);          
                    }  
                    else
                    {
                        // using default maxlevels
                    }
                }
                if (key == "filtertypes") {
                    component.set("v.configuredFilterTypes", true);                    
                    // set all filters as clicked by default
                    var panelShowFilters = component.get("v.panelShowFilters");
                    configjson.filtertypes.forEach(function(filtertype) {
                        panelShowFilters.push(filtertype);
                    });
                    component.set("v.panelShowFilters", panelShowFilters);
                }
                if (key == "measures") {
                    component.set("v.configuredMeasures", true);                    
                    // set the first measure as default
                    var panelCurrentMeasure = configjson.measures[0];
                    component.set("v.panelCurrentMeasure", panelCurrentMeasure);
                }
                if (key == "allowrefresh") {
                    component.set("v.configuredAllowRefresh", true);                    
                }
                if (key == "levelsIncreaseOnly") {
                    console.log("xxx: levelsIncreaseOnly: " + configjson.levelsIncreaseOnly );
                    component.set("v.levelsIncreaseOnly", configjson.levelsIncreaseOnly);                    
                    component.set("v.levelsIncreaseDecrease", ! configjson.levelsIncreaseOnly);                    
                }
                if (key == "autoIncreaseLevels") {
                    console.log("xxx: autoIncreaseLevels: set to: " + configjson.autoIncreaseLevels );
                    component.set("v.autoIncreaseLevels", configjson.autoIncreaseLevels);                    
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
            console.log("init:initializing data ");
            var datajson = JSON.parse(datastring);
            component.set("v.datajson", datajson);

            // primary node - this is interesting as could be provided by datajson or config (e.g. on a record detail page)
            var primaryNodeInitialization = component.get("v.primaryNodeInitialization");
            //TODO - need to add in when primary node is derived from recordId. In which case derive in config section
            if (primaryNodeInitialization == 'FirstInData')
            {
                var panelPrimaryId = datajson.nodes[0].id;
                component.set("v.panelPrimaryId", panelPrimaryId);            
            }
        }
    },

    updateData : function(component, event) {
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
        
        console.log('InitiateRefreshChart: running apex callback');    

        action.setCallback(_this, $A.getCallback(function(response) {
            var state = response.getState();
            bzutils.log('InitiateRefreshChart: data returned from apex for udpate with state: ' + state);   
            if (state === "SUCCESS") {

                var datastring = response.getReturnValue();
                var datajson = JSON.parse(datastring);
                bzutils.log('InitiateRefreshChart: datastring: ' + datastring);    

                // lay down candidate ids for further queries
                var thisLevel = component.get("v.currentLevels");
                _this.extractLeafIds(component, datajson, thisLevel);
//                component.set("v.currentLevels", thisLevel+1);
                _this.increaseLevels (component);

                // Review - this is setting datajson to be whatever is new ... NOT the full data set in the CHART ...
                component.set("v.datajson", datajson);

    // TODO - this sends data that is picked up by the target component, however work needs to be done on updating / removing nodes

                // TODO - will need to retrieve data based on new selections
                var datajson = component.get("v.datajson");
                var configjson = component.get("v.configjson");
                var panelCurrentMeasure = component.get("v.panelCurrentMeasure");
                var panelShowFilters = component.get("v.panelShowFilters");     

                var configEventParameters;

                if (event != null && event.getParam("parameters") != null) {
                    // Extract data from the event to update control panel and send out details.
                    var parameters = event.getParam("parameters");
                    var componentReference = parameters["componentReference"];
                    bzutils.log("Publish data upon refresh request for charts: " + componentReference);
                    var panelPrimaryId = parameters["primaryNodeId"];            
                    component.set("v.panelPrimaryId", panelPrimaryId);   
                    
                    // publish event - configuration loaded

                    configEventParameters = { 
                        "datajson" : datajson, 
                        "currentMeasure" : panelCurrentMeasure,
                        "primaryId" : panelPrimaryId, 
                        "showFilters" : panelShowFilters,
                        "componentReference" : componentReference        // be aware this is the receiving component's reference        
                    }
                }
                else {
                    configEventParameters = { 
                        "datajson" : datajson, 
                        "currentMeasure" : panelCurrentMeasure,
                        "primaryId" : panelPrimaryId, 
                        "showFilters" : panelShowFilters
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
        var _this = this;
        var searchTermId = component.get("v.searchTermId");
        var searchAction = component.get("v.searchAction");
        var showLevels = component.get("v.maxlevels");

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

        // we have a different aura:id for the more button for when levels increase only or can decrease also.
        var moreButtonId = _this.getMoreButtonId(component);
 
        var levelsIncreaseDecrease = component.get("v.levelsIncreaseDecrease");
        // if levels cannot decrease then nothing to do here as there is no Fewer Button to press
        if (levelsIncreaseDecrease) {
            var currentLevels = component.get("v.currentLevels");
            // "more" button should be enabled, "less" button should be disabled if we've reached lowest level
            var cmpTargetMore = component.find(moreButtonId);
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

        // we have a different aura:id for the more button for when levels increase only or can decrease also.
        var moreButtonId = _this.getMoreButtonId(component);
        
        // refresh buttons : "less" button should be enabled, "more" button should be disabled if we've reached max level
        // if levels cannot decrease then no action for the "less" button as there is no button to press

        var levelsIncreaseDecrease = component.get("v.levelsIncreaseDecrease");
        if (levelsIncreaseDecrease) {
            var cmpTargetLess = component.find("less");
            cmpTargetLess.set("v.disabled", "false");
        }
        if (currentLevels >= maxlevels) {
            var cmpTargetMore = component.find(moreButtonId);
            cmpTargetMore.set("v.disabled", "true");
        }
    },

    setConnectionLevelMaxButtons: function(component) {
        var _this = this;
        var maxlevels = component.get("v.maxlevels");
        component.set("v.currentLevels", maxlevels);

        // we have a different aura:id for the more button for when levels increase only or can decrease also.
        var moreButtonId = _this.getMoreButtonId(component);
        
        // if levels cannot decrease then no action for the "less" button as there is no button to press
        var levelsIncreaseDecrease = component.get("v.levelsIncreaseDecrease");
        if (levelsIncreaseDecrease) {
            var cmpTargetLess = component.find("less");
            cmpTargetLess.set("v.disabled", "false");
        }
        var cmpTargetMore = component.find(moreButtonId);
        cmpTargetMore.set("v.disabled", "true");
    },
    
    setMeasure: function(component, measureIndex) {
        var configjson = component.get("v.configjson");
        var thisMeasure = configjson.measures[measureIndex - 1];
        component.set("v.panelCurrentMeasure", thisMeasure);
        return thisMeasure;
    },

    setFilter: function(component, indexer) {
        var _this = this;
        var cmpTarget = component.find('b' + indexer);
        var controllerId = component.get("v.UserComponentId");

        // check existence of filter_show class to determine what state to publish
        var beforeClickedState = $A.util.hasClass(cmpTarget, 'filter_show');
        var filterState = beforeClickedState ? "Hide" : "Show"; // if before it was show then now it is hide

        var configjson = component.get("v.configjson");
        var thisType = configjson.filtertypes[indexer - 1];
        var preppedEvent = _this.prepareEvent("SetFilter", {"index" : indexer, "state" : filterState, "filterType" : thisType }, controllerId);
        _this.publishPreppedEvent(component,preppedEvent);

        this.saveFilterVisibility(component, thisType, (filterState == "Show"));
    },

    saveFilterVisibility: function(component, thisType, isClicked) {
        var _this = this;
        var showFilters = component.get("v.panelShowFilters");
        if (isClicked) {
            showFilters.push(thisType);
        } else {
            var index = showFilters.indexOf(thisType);
            if (index > -1) {
                showFilters.splice(index, 1);
            }
        }
        component.set("v.panelShowFilters", showFilters);
    },

    formatButtons: function(component, arrayNames, idprefix, maxbuttons) {
        var _this = this;
        var arrayNamesLength = arrayNames.length;
        var index = 0;

        arrayNames.forEach(function(filtertype) {
            if (index < arrayNamesLength) {
                index++;
                var cmpTarget = component.find(idprefix + index);
                cmpTarget.set("v.label", filtertype);
            }
        });
        // clean up unused buttons
        for (; index < maxbuttons;) {
            index++;
            var cmpTarget = component.find(idprefix + index);
            cmpTarget.set("v.show", "false");
        }
    },

    updateButtonStyles: function(cmp, prefix, selectedIndex, numberOfButtons) {
        var selectedButtonLabel = prefix + selectedIndex;

        for (var i = 1; i <= numberOfButtons; i++) { 
            var iteratedButtonLabel = prefix + i;
            var cmpTarget = cmp.find(iteratedButtonLabel);
            if (selectedButtonLabel != iteratedButtonLabel) {
                $A.util.addClass(cmpTarget, 'slds-button_neutral');
                $A.util.removeClass(cmpTarget, 'slds-button_brand');
            }
            else {
                $A.util.addClass(cmpTarget, 'slds-button_brand');
                $A.util.removeClass(cmpTarget, 'slds-button_neutral');
            }
        }
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

    getMoreButtonId : function(component) {
        var _this = this;    
        var moreButtonId = 'more';
        
        var levelsIncreaseOnly = component.get("v.levelsIncreaseOnly");
        if (levelsIncreaseOnly) {
            moreButtonId = 'moreIncreaseOnly';
        }
        return moreButtonId;
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
            // Note - there is no Cache for controllers
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
    }
    

    

})