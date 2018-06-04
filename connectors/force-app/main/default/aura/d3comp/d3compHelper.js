({

    initializeConfig: function(component, datastring) {

        var _this = this;
        var initialized = component.get("v.initialized");
        console.log("init:initialized: " + initialized);

        if (initialized != true) {
            console.log("init:initializing config ");

            /* Configuration initialization */
            // TODO - review, this may be better hard coded but design parameter allows for some flexibility for end users

            var configjson = JSON.parse(component.get("v.configjsonString"));
            
            console.log('configjson read from design parameter: ');
            console.log(configjson);
            component.set("v.configjson", configjson);

            for (var key in configjson) {  
                var subObj = configjson[key];
                console.log("here is a key layer 1: " + key);

                if (key == "levels") {
                    component.set("v.configuredLevels", true);                    
                    // set the maximum number of levels
                    var maxlevels = configjson.levels;
                    console.log("maxlevels:" + maxlevels);
                    if ((typeof maxlevels === 'number'))
                    {
                        console.log("setting maxlevels from configuration: " + maxlevels);
                        component.set("v.maxlevels", maxlevels);          
                    }  
                    else
                    {
                        console.log("using default maxlevels ");
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
                // this is a developer setting to allow some group of test buttons to display
                if (key == "showtestbuttons") {
                    component.set("v.configuredShowTestButtons", true);                    
                }

                // this may be required if we need to go down another level in the future.
                console.log("here is a subObj layer 1: " + JSON.stringify(subObj));
                for (var subKey in subObj) {
                    console.log("here is a key layer 2: " + subKey);
                    console.log("here is a subObj layer 2: " + JSON.stringify(subObj[subKey]));
                }
            }            


                

            // underlying data parsed to JSON object
            console.log("init:initializing data ");
            var datajson = JSON.parse(datastring);
            component.set("v.datajson", datajson);
            console.log('datajson');
            console.log(datajson);

            // primary node - this is interesting as could be provided by datajson or config (e.g. on a record detail page)
            var primaryNodeInitialization = component.get("v.primaryNodeInitialization");
            //TODO - need to add in when primary node is derived from recordId. In which case derive in config section
            if (primaryNodeInitialization == 'FirstInData')
            {
                var panelPrimaryId = datajson.nodes[0].id;
                component.set("v.panelPrimaryId", panelPrimaryId);            
            }

            console.log("exit initializeConfig");
        }
    },

    refreshOneTime : function(component, event) {
        var _this = this;
        // for a RefreshChart event we assume everything is initialized

        var dataUpdateMethod = component.get("v.dataUpdateMethod");

        var action = component.get(dataUpdateMethod);

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
                    console.log("Publish data upon refresh request for charts: " + componentReference);
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
                var publisher = component.get("v.UserComponentId");
                var componentCategory = component.get("v.componentCategory");
                var componentType = component.get("v.componentType");
                bzutils.publishEvent("RefreshData", publisher, componentCategory, componentType, configEventParameters, null);            
            }
        }))
        $A.enqueueAction(action);        
    },

    searchChart : function(component) {
        var _this = this;
        var searchTermId = component.get("v.searchTermId");
        var refreshOperation = component.get("v.refreshOperation");

        var configEventParameters = { 
            "searchTermId" : searchTermId,
            "refreshOperation" : refreshOperation
        }

        //publish to this component
        var publisher = component.get("v.UserComponentId");
        var componentCategory = component.get("v.componentCategory");
        var componentType = component.get("v.componentType");
        bzutils.publishEvent("SearchChart", publisher, componentCategory, componentType, configEventParameters, null);            
    },
    

    /* BUTTON methods */
    
    setConnectionLevelFewerButtons: function(component) {
        console.log("enter setConnectionLevelFewer");
        var panelShowLevels = component.get("v.panelShowLevels");
        // "more" button should be enabled, "less" button should be disabled if we've reached lowest level
        var cmpTargetMore = component.find("more");
        cmpTargetMore.set("v.disabled", "false");
        if (panelShowLevels == 1) {
            var cmpTargetLess = component.find("less");
            cmpTargetLess.set("v.disabled", "true");
        }
    },

    setConnectionLevelMoreButtons: function(component) {
        console.log("enter setConnectionLevelMoreButtons");
        var panelShowLevels = component.get("v.panelShowLevels");
        var maxlevels = component.get("v.maxlevels");
        
            // refresh buttons
        // "less" button should be enabled, "more" button should be disabled if we've reached max level
        var cmpTargetLess = component.find("less");
        cmpTargetLess.set("v.disabled", "false");
        if (panelShowLevels >= maxlevels) {
            var cmpTargetMore = component.find("more");
            cmpTargetMore.set("v.disabled", "true");
        }
    },

    setMeasure: function(component, measureIndex) {
        var configjson = component.get("v.configjson");
        var thisMeasure = configjson.measures[measureIndex - 1];
        console.log("setMeasure: Measure=" + thisMeasure);
        component.set("v.panelCurrentMeasure", thisMeasure);
        return thisMeasure;
    },

    setFilter: function(component, indexer) {
        var cmpTarget = component.find('b' + indexer);

        var publisher = component.get("v.UserComponentId");
        var componentCategory = component.get("v.componentCategory");
        var componentType = component.get("v.componentType");

        // check existence of filter_show class to determine what state to publish
        var beforeClickedState = $A.util.hasClass(cmpTarget, 'filter_show');
        var filterState = beforeClickedState ? "Hide" : "Show"; // if before it was show then now it is hide

        var configjson = component.get("v.configjson");
        var thisType = configjson.filtertypes[indexer - 1];
        bzutils.publishEvent("SetFilter", publisher, componentCategory, componentType, {"index" : indexer, "state" : filterState, "filterType" : thisType }, null);

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

        console.log("updateButtonStyles: other than " + selectedButtonLabel);
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
    }   

})