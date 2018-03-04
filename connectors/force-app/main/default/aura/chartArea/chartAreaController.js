({
	
    afterScriptsLoaded: function(component, event, helper) {
		console.log('chartArea: afterScriptsLoaded started');
        
        console.log("afterScriptsLoaded: chart");
        //TODO check this is right
        var width = Math.min(screen.width, screen.height);
        component.set("v.width", width);

        //TODO check this is right
        var height = Math.min(screen.width, screen.height);
        component.set("v.height", height);

        var svg1 = d3.select("body").append("svg")
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
            var measureIndex = parameters["index"];
            var currentMeasure = parameters["measure"];

            helper.initializeData(component, parameters["datajson"], parameters["configjson"], parameters["panelCurrentMeasure"], parameters["panelPrimaryId"], parameters["panelClickedFilters"]);                 
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