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

    refreshData: function(component,event,helper){
        console.log("calling the aura:method refreshData in base");
        var args = event.getParam("arguments");

        var datajson = args.datajson;
        var currentMeasure = args.currentMeasure;
        var primaryId = args.primaryId;
        var showFilters = args.showFilters;

        helper.refreshData(component, datajson, currentMeasure, primaryId, showFilters);                         
    },

    searchChart: function(component,event,helper){
        console.log("calling the aura:method searchChart in base");        
    },
    
    
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
            bzutils.setCache (componentReference, "showLevels", parameters["levels"] ) ;
            bzutils.xfcr("refreshVisibility", componentReference);
        }
        if (topic == "ShowLevelsFewer")
        {
            bzutils.setCache (componentReference, "showLevels", parameters["levels"] ) ;
            bzutils.xfcr("refreshVisibility", componentReference); 
        }
        if (topic == "SetMeasure")
        {
            var measureIndex = parameters["index"];
            var currentMeasure = parameters["measure"];

            bzutils.setCache (componentReference, "currentMeasure", currentMeasure ) ;
            
            // refresh Chart - measure changes but primaryid does not
            bzutils.xfcr("styleNodes", componentReference); 
        }
        if (topic == "SetFilter")
        {
            console.log("SetFilter instruction received by Chart: " + componentReference);
            var parameters = event.getParam("parameters");
            var indexer = parameters["index"];
            var state = parameters["state"];
            var filterType = parameters["filterType"];

            var isShown = (state == "Show");
            bzchart.setFilterVisibility(component, filterType, isShown);
            bzutils.xfcr("refreshVisibility", componentReference); 
        }
        if (topic == "InitializeData")
        {
            console.log("InitializeData received by Chart: " + componentReference + "/" + parameters["componentReference"]);

            if (componentReference == parameters["componentReference"]) {
                console.log("InitializeData with reference: " + componentReference);
                var isInit = true;

                helper.initializeGroups(component, parameters["datajson"], parameters["currentMeasure"], parameters["primaryId"], parameters["showFilters"], isInit);                 

                var cc = component.getConcreteComponent();
                cc.initializeVisuals();
            }
            else {
                console.log("Chart with reference: " + componentReference + " / ignores this event with chart reference: " + parameters["componentReference"]);
            }
        }

        if (topic == "RefreshData")
        {
            console.log("RefreshData topic received by Chart: " + componentReference + "/" + parameters["componentReference"]);
            // we process if the event is from it's controller and either specifies this component or does not specify any
            if (componentReference == parameters["componentReference"] || ! ("componentReference" in parameters)) {
                console.log("RefreshData: Refresh Chart with reference: " + componentReference);
// THIS ALL TEMPORARY
                console.log("RefreshData: Data: " + parameters["valueDate"]);
                component.set("v.Title", parameters["valueDate"] );

                var cc = component.getConcreteComponent();
                cc.refreshData(parameters["datajson"], parameters["currentMeasure"], parameters["primaryId"], parameters["showFilters"]);                 


            }
            else {
                console.log("Chart with reference: " + componentReference + " / ignores this event with chart reference: " + parameters["componentReference"]);
            }
        }
        if (topic == "SearchChart")
        {
            console.log("SearchChart received by Chart: " + componentReference + "/" + parameters["componentReference"]);

            var cc = component.getConcreteComponent();
            cc.searchChart(parameters["searchTermId"], parameters["refreshOperation"]);                 

        }
        console.log('chartArea: handle_evt_sfd3 exit');
    },


    navigateToRecord : function(component){
        var evtNav = $A.get("e.force:navigateToSObject");
        evtNav.setParams({
        "recordId": bzutils.getCache (componentReference, "mouseoverRecordId"),
        "slideDevName": "detail"
        });
        sObectEvent.fire(); 
     },

    
})