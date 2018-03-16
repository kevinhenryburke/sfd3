({

    doInit: function(component, event, helper) {
		console.log('chartArea: doInit started');    
        console.log('chartArea: reading user input Component Id');   
        
        var comprefNumber = 0;

        var UserComponentId = component.get("v.UserComponentId");

        if (UserComponentId != null && UserComponentId != '') {
            console.log('chartArea: calculate compref from configuration');   
            console.log('chartArea: calculate using seed:' + UserComponentId);   
            comprefNumber = helper.simpleHash(UserComponentId);    
        }
        else {
            console.log('chartArea: calculate compref from random generator');   
            comprefNumber = Math.floor((Math.random() * 10000000000) + 1); 
        }
        var componentReference = "compref" + comprefNumber;
		console.log('chartArea: componentReference: ' + componentReference);    
        component.set("v.componentReference", componentReference);
        component.set("v.chartAreaDivId", componentReference + 'div');
    },

    doneRendering: function(component, event, helper) {
        var initialized = component.get("v.initialized");
        if (initialized == false) {
            var componentReference = component.get("v.componentReference");
            console.log('chartArea: doneRendering first call: componentReference: ' + componentReference);
            
            var eventParameters = { 
                "componentReference" : componentReference
            }
    
            var publisher = component.get("v.componentReference");
            var componentType = component.get("v.componentType");
            var controller = component.get("v.UserControllerComponentId");    

            helper.publishEvent("ChartRendered", publisher, componentType, controller, eventParameters);   
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
        var publisher = event.getParam("publisher");

        console.log("topic/publisher: " + topic + "/" + publisher);

        var UserControllerComponentId = component.get("v.UserControllerComponentId");

        // if the component is configured to be controlled by a specified controller then exit if it's a different one.
        if (UserControllerComponentId != null && UserControllerComponentId != "") {
            if (UserControllerComponentId != publisher) {
                var UserComponentId = component.get("v.UserComponentId");
                console.log("ignoring message from " + publisher + " in component " + UserComponentId);
                return;
            }
        }
        
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