({

    // bear in mind that doInit can't refresh anything in an external library as it may lose a race condition.
    doInit: function(component, event, helper) {
        console.log('chartArea: doInit enter');   
        var comprefNumber = 0;

        var UserComponentId = component.get("v.UserComponentId");

        if (UserComponentId != null && UserComponentId != '') {
            console.log('chartArea: calculate comprefNumber using seed:' + UserComponentId);   
            comprefNumber = helper.simpleHash(UserComponentId);    
        }
        else {
            console.log('chartArea: calculate compref from random generator');   
            comprefNumber = Math.floor((Math.random() * 10000000000) + 1); 
        }
        var componentReference = "compref" + comprefNumber;
		console.log('chartArea: doInit: set componentReference: ' + componentReference);    
        component.set("v.componentReference", componentReference);
        component.set("v.chartAreaDivId", componentReference + 'chartArea');
        console.log('chartArea: doInit exit');   
    },

    doneRendering: function(component, event, helper) {
        console.log('chartArea: doneRendering enter');   
        var rendered = component.get("v.rendered");
        if (rendered == false) {
            var scriptsLoaded = component.get("v.scriptsLoaded");
            if (scriptsLoaded == true) {
                console.log('chartArea: signalling ready from doneRendering');   
                helper.doneRenderLoad(component);
            }
            else {
                console.log('chartArea: doneRendering: scripts not loaded so publish RefreshEvent from afterScriptsLoaded');   
            }
        }
        component.set("v.rendered", true);
        console.log('chartArea: doneRendering exit');   
    },


    afterScriptsLoaded: function(component, event, helper) {
        console.log('chartArea: afterScriptsLoaded enter');
        component.set("v.scriptsLoaded", true);

        var rendered = component.get("v.rendered");
        if (rendered == true) {
            console.log('chartArea: signalling ready from afterScriptsLoaded');   
            helper.doneRenderLoad(component);
        }
        
        console.log('chartArea: afterScriptsLoaded exit');
    },

    /* handlers */

    handle_evt_sfd3  : function(component, event, helper) {
        console.log('chartArea: handle_evt_sfd3 enter');
        var topic = event.getParam("topic");
        var publisher = event.getParam("publisher");
        var parameters = event.getParam("parameters");

        var componentReference = component.get("v.componentReference");        

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
            var levels = parameters["levels"];
            component.set("v.chartShowLevels", levels);
            helper.refreshVisibility(component);
        }
        if (topic == "ShowLevelsFewer")
        {
            var levels = parameters["levels"];
            component.set("v.chartShowLevels", levels);
            helper.refreshVisibility(component);
        }
        if (topic == "SetMeasure")
        {
            var measureIndex = parameters["index"];
            var currentMeasure = parameters["measure"];

            berlioz.utils.setCache (componentReference, "currentMeasure", currentMeasure ) ;
            
            // refresh Chart - measure changes but primaryid does not
            helper.styleNodes(component);
        }
        if (topic == "SetFilter")
        {
            console.log("SetFilter instruction received by Chart: " + componentReference);
            var parameters = event.getParam("parameters");
            var indexer = parameters["index"];
        }

        if (topic == "InitializeData")
        {
            console.log("InitializeData received by Chart: " + componentReference + "/" + parameters["componentReference"]);

            if (componentReference == parameters["componentReference"]) {
                console.log("InitializeData with reference: " + componentReference);
                var isInit = true;
                helper.initializeData(component, parameters["datajson"], parameters["currentMeasure"], parameters["primaryId"], parameters["clickedFilters"], isInit);                 
            }
            else {
                console.log("Chart with reference: " + componentReference + " / ignores this event with chart reference: " + parameters["componentReference"]);
            }

        }

        if (topic == "RefreshData")
        {
            console.log("RefreshData topic received by Chart: " + componentReference + "/" + parameters["componentReference"]);

            if (componentReference == parameters["componentReference"]) {
                console.log("RefreshData: Refresh Chart with reference: " + componentReference);
                helper.refreshData(component, parameters["datajson"], parameters["currentMeasure"], parameters["primaryId"], parameters["clickedFilters"]);                 
            }
            else {
                console.log("Chart with reference: " + componentReference + " / ignores this event with chart reference: " + parameters["componentReference"]);
            }
        }
        console.log('chartArea: handle_evt_sfd3 exit');
    },


    navigateToRecord : function(component){
        var evtNav = $A.get("e.force:navigateToSObject");
        evtNav.setParams({
        "recordId": berlioz.utils.getCache (componentReference, "mouseoverRecordId"),
        "slideDevName": "detail"
        });
        sObectEvent.fire(); 
     },

    
})