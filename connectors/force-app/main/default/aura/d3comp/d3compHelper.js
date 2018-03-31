({

    initializeConfig: function(component, datastring) {

        var _this = this;
        var initialized = component.get("v.initialized");
        console.log("init:initialized: " + initialized);

        if (initialized != true) {
            console.log("init:initializing config ");

            /* Configuration initialization */
            // TODO - read from Design Parameter
            var configjson = 
                {"filtertypes":["Work","Social","Client"]
                ,"measures":["Posts","Hot"]
                ,"levels":4
                ,"centreonclick":true};
            
            console.log('configjson');
            console.log(configjson);
            component.set("v.configjson", configjson);

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

            // set the first measure as default
            var panelCurrentMeasure = configjson.measures[0];
            component.set("v.panelCurrentMeasure", panelCurrentMeasure);

            // set all filters as clicked by default
            var panelClickedFilters = component.get("v.panelClickedFilters");
            configjson.filtertypes.forEach(function(filtertype) {
                panelClickedFilters.push(filtertype);
            });
            component.set("v.panelClickedFilters", panelClickedFilters);
                

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

    // TODO sort out relations
    setThisLinkType: function(component, indexer) {
        var cmpTarget = component.find('b' + indexer);
        $A.util.toggleClass(cmpTarget, 'slds-button_neutral');
        $A.util.toggleClass(cmpTarget, 'slds-button_brand');
        var isClicked = $A.util.hasClass(cmpTarget, 'slds-button_brand');
        var configjson = component.get("v.configjson");
        var thisType = configjson.filtertypes[indexer - 1];
        this.setLinkType(component, thisType, isClicked);
    },

    // TODO sort out relations
    setLinkType: function(component, thisType, isClicked) {
        var _this = this;
        var clickedfilters = component.get("v.chartClickedFilters");
        if (isClicked) {
            clickedfilters.push(thisType);
        } else {
            var index = clickedfilters.indexOf(thisType);
            if (index > -1) {
                clickedfilters.splice(index, 1);
            }
        }
        component.set("v.chartClickedFilters", clickedfilters);
        _this.refreshVisibility(component);
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