({

    doInit: function(component, event, helper) {
		console.log('chartArea: doInit started');    
        var componentReference = "compref" + Math.floor((Math.random() * 10000000000) + 1);
		console.log('chartArea: componentReference: ' + componentReference);    
        component.set("v.componentReference", componentReference);
    },

    doneRendering: function(component, event, helper) {
        var initialized = component.get("v.initialized");
        if (initialized == false) {
            var componentReference = component.get("v.componentReference");
            console.log('chartArea: doneRendering first call: componentReference: ' + componentReference);
            
            var eventParameters = { 
                "componentReference" : componentReference
            }
    
            helper.publishEvent("ChartRendered", eventParameters);   
            component.set("v.initialized", true);
        }
    },


    afterScriptsLoaded: function(component, event, helper) {
		console.log('chartArea: afterScriptsLoaded started');
        var width = Math.min(screen.width, screen.height);
        var height = Math.min(screen.width, screen.height);


        var flexiWidth = component.get("v.flexiWidth");
        console.log("flexiWidth: " + flexiWidth);

        if (flexiWidth == null) {
            // this is the case when not embedded in a Lightning Page - e.g. in aura preview
            flexiWidth = "MEDIUM";
            console.log("defaulting flexiWidth: " + flexiWidth);
        }

        if (flexiWidth == "SMALL")
        {
            // TEMP
            width = 420;
            height = 800;
        }

        if (flexiWidth == "MEDIUM")
        {
            // TEMP
            width = 600;
            height = 800;
        }


        if (flexiWidth == "LARGE")
        {
            // TEMP
            width = 1000;
            height = 800;
        }

        component.set("v.width", width);
        component.set("v.height", height);

        var chartAreaDivId = "#" + component.get("v.chartAreaDivId");

        var svg1 = d3.select(chartAreaDivId).append("svg")
            .attr("width", width)
            .attr("height", height);
        component.set("v.svg", svg1);

        var lastTouch1 = new Date().getTime();
        component.set("v.lastTouch", lastTouch1);

        var agent = navigator.userAgent.toLowerCase();
        if(agent.indexOf('iphone') >= 0 || agent.indexOf('ipad') >= 0){
               isiOS = true;
               component.set("v.isiOS", true);
               console.log("IOS environment");
        }
        else {
            console.log("non-IOS environment");
        }
        console.log('chartArea: afterScriptsLoaded finished');
    },

    /* handlers */

    handle_evt_sfd3  : function(component, event, helper) {
        var topic = event.getParam("topic");
        console.log("topic: " + topic);

        // Chart Display handers
        
        if (topic == "ShowLevelsMore")
        {
            var parameters = event.getParam("parameters");
            var levels = parameters["levels"];
            component.set("v.chartShowLevels", levels);
            helper.refreshVisibility(component);
        }
        if (topic == "ShowLevelsFewer")
        {
            var parameters = event.getParam("parameters");
            var levels = parameters["levels"];
            component.set("v.chartShowLevels", levels);
            helper.refreshVisibility(component);
        }
        if (topic == "SetMeasure")
        {
            var parameters = event.getParam("parameters");
            var measureIndex = parameters["index"];
            var currentMeasure = parameters["measure"];

            component.set("v.chartCurrentMeasure", currentMeasure);
            
            // refresh Chart - measure changes but primaryid does not
            helper.styleNodes(component, currentMeasure, null);
        }
        if (topic == "ConfigInitialized")
        {
            var parameters = event.getParam("parameters");
            var componentReference = component.get("v.componentReference");

            if (componentReference == parameters["componentReference"]) {
                console.log("Initialize Chart with reference: " + componentReference);
                console.log(parameters["datajson"]);
                console.log(parameters["configjson"]);
                console.log(parameters["currentMeasure"]);
                console.log(parameters["primaryId"]);
                console.log(parameters["clickedFilters"]);
                helper.initializeDataV4(component, parameters["datajson"], parameters["configjson"], parameters["currentMeasure"], parameters["primaryId"], parameters["clickedFilters"]);                 
            }
            else {
                console.log("Chart with reference: " + componentReference + " / ignores this event with chart reference: " + parameters["componentReference"]);
            }

        }
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