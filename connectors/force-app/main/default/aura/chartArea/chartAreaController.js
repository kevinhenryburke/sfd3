({

    callFromContainer : function (component, event, helper) {
        console.log('tpc: callFromContainer enter');   
        var params = event.getParam("arguments");
        console.log(params);
        var tpc = params.tpc;
        var topic = tpc.topic;
        console.log(topic);
    },

    // bear in mind that doInit can't refresh anything in an external library as it may lose a race condition.
    doInit: function(component, event, helper) {
        console.log('chartArea: doInit enter');   

        var storeObject = JSON.parse("{}");
        component.set("v.storeObject", storeObject);

        var recordId = component.get("v.recordId");
        if (recordId == null) {
            recordId = "";
        }

        console.log('chartArea: doInit enter: ' + recordId);   

        // calculate compref from random generator   
        var comprefNumber = Math.floor((Math.random() * 10000000000) + 1); 
        var componentReference = "compref" + comprefNumber + recordId;
        component.set("v.componentReference", componentReference);
        component.set("v.chartAreaDivId", componentReference + 'chartArea');

        console.log('chartArea: doInit exit for componentReference: ' + componentReference);   
    },

    // we need to avoid race condition between chart rendering and scripts loading, hence the checks in this method
    doneRendering: function(component, event, helper) {
        var rendered = component.get("v.rendered");
        console.log('chartArea: doneRendering enter. Rendered: ' + rendered);   
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

    // we need to avoid race condition between chart rendering and scripts loading, hence the checks in this method
    afterScriptsLoaded: function(component, event, helper) {
        bzutils.log('chartArea: afterScriptsLoaded enter');
        component.set("v.scriptsLoaded", true);

        var rendered = component.get("v.rendered");
        if (rendered == true) {
            bzutils.log('chartArea: signalling ready from afterScriptsLoaded');   
            helper.doneRenderLoad(component);
        }        
        bzutils.log('chartArea: afterScriptsLoaded exit');
    },

    /* handlers */

    refreshData: function(component,event,helper){
        bzutils.log("calling the aura:method refreshData in base");
        var args = event.getParam("arguments");

        var datajson = args.datajson;
        var currentMeasure = args.currentMeasure;
        var primaryId = args.primaryId;
        var showFilters = args.showFilters;

        helper.refreshData(component, datajson, currentMeasure, primaryId, showFilters);                         
    },

    searchChart: function(component,event,helper){
        bzutils.log("calling the aura:method searchChart in base");        
    },

    handleScaleChange: function(component,event,helper){
        bzutils.log("handleScaleChange enter...");        
        var componentReference = component.get("v.componentReference");

        var csfp = component.get("v.ChartScaleFactorPercentage");
        var csf = parseFloat(csfp / 100); // ensure js knows it's a decimal

        var eventParameters = { 
            "componentReference" : componentReference,
            "ChartScaleFactor" : csf
        }    

        var preppedEvent = helper.prepareEvent(component, "ReScale", eventParameters);
        helper.publishPreppedEvent(component,preppedEvent);

//        helper.handleScaleChange(component,csf);
        bzutils.log("handleScaleChange exit.");        
    },

    searchChart: function(component,event,helper){
        bzutils.log("calling the aura:method searchChart in base");        
    },


    handle_evt_sfd3  : function(component, event, helper) {
        bzutils.log('chartArea: handle_evt_sfd3 enter');
        var topic, parameters, controller;
        var cc = component.getConcreteComponent();

        // if there is an arguments parameter this has been triggered by a method call
        // in which case we need to source our information from a level down in the event
        var argumentsParameter = event.getParam("arguments");

        if (argumentsParameter != null) {
            bzutils.log('chartArea: invoked from method');
            var tpc = argumentsParameter.tpc;
            topic = tpc.topic;
            parameters = tpc.parameters;
            controller = tpc.controller;
        }
        else {
            bzutils.log('chartArea: invoked from event');
            topic = event.getParam("topic");
            parameters = event.getParam("parameters");
            controller = event.getParam("controller");    
        }

        var componentReference = component.get("v.componentReference");        
        bzutils.log('chartArea: topic:' + topic + " controller " + controller + " componentReference " + componentReference);

        var UserControllerComponentId = component.get("v.UserControllerComponentId");
        
        // if the component is configured to be controlled by a specified controller then exit if it's a different one.
        if (UserControllerComponentId != null && UserControllerComponentId != "") {
            // note - component will subscribe to its own events
            if (UserControllerComponentId != controller) { 
                var UserComponentId = component.get("v.UserComponentId");
                bzutils.log("ignoring message from " + controller + " in component " + UserComponentId);
                return;
            }
        }
        
        // Chart Display handers
        
        if (topic == "ShowLevelsMore")
        {
            helper.setCache (componentReference, "showLevels", parameters["levels"] ) ;
            cc.refreshVisibility();                 
    
        }
        if (topic == "ShowLevelsFewer")
        {
            helper.setCache (componentReference, "showLevels", parameters["levels"] ) ;
            var cc = component.getConcreteComponent();
            cc.refreshVisibility();                 
        }
        if (topic == "SetMeasure")
        {
            console.log("SetMeasure new");
            var currentMeasure = parameters["measure"];
            helper.setStore(cc, "currentMeasure", currentMeasure);

            helper.setCache (componentReference, "currentMeasure", currentMeasure ) ;
            
            // refresh Chart - measure changes but primaryid does not
            cc.styleNodes();                 
        }
        if (topic == "SetFilter")
        {
            var state = parameters["state"];
            var filterType = parameters["filterType"];

            var isShown = (state == "Show");
            helper.setFilterVisibility(component, filterType, isShown);
            cc.refreshVisibility();                 
        }
        if (topic == "InitializeData")
        {
            bzutils.log("InitializeData received by Chart: " + componentReference + "/" + parameters["componentReference"]);

            if (componentReference == parameters["componentReference"]) {
                bzutils.log("InitializeData with reference: " + componentReference);
                var isInit = true;

                helper.initializeGroups(component, parameters["datajson"], parameters["currentMeasure"], parameters["primaryId"], parameters["showFilters"], isInit);                 

                var cc = component.getConcreteComponent();
                cc.initializeVisuals();
            }
            else {
                bzutils.log("Chart with reference: " + componentReference + " ignores this event with chart reference: " + parameters["componentReference"]);
            }
        }

        if (topic == "RefreshData")
        {
            bzutils.log("RefreshData topic received by Chart: " + componentReference + "/" + parameters["componentReference"]);
            // we process if the event is from it's controller and either specifies this component or does not specify any
            if (componentReference == parameters["componentReference"] || ! ("componentReference" in parameters)) {
                bzutils.log("RefreshData: Refresh Chart with reference: " + componentReference);
// THIS ALL TEMPORARY FOR TIME-BASED CHARTS
                bzutils.log("RefreshData: Data: " + parameters["valueDate"]);

                var valueDate = parameters["valueDate"];
                if (valueDate != null) {
                    component.set("v.Title", parameters["valueDate"] );
                }

                var cc = component.getConcreteComponent();
                cc.refreshData(parameters["datajson"], parameters["currentMeasure"], parameters["primaryId"], parameters["showFilters"]);                 
            }
            else {
                bzutils.log("Chart with reference: " + componentReference + " / ignores this event with chart reference: " + parameters["componentReference"]);
            }
        }
        if (topic == "SearchChart")
        {
            bzutils.log("SearchChart received by Chart: " + componentReference + "/" + parameters["componentReference"]);
            var cc = component.getConcreteComponent();
            cc.searchChart(parameters["searchTermId"], parameters["searchAction"], parameters["showLevels"]);                 

        }
        if (topic == "ChartMouseOut")
        {
            bzutils.log("chartArea: ChartMouseOut received by Chart: " + componentReference + "/" + parameters["componentReference"]);
        }
        if (topic == "CloseDisplayPanel")
        {      
            console.log("chartArea: CloseDisplayPanel received by Chart : " + componentReference );

            var allowPopover = component.get("v.allowPopover");

            if (allowPopover == true) {
                var modalPromise = component.get("v.modalPromise");

                if (modalPromise != null ) {
                    modalPromise.then(function (overlay) {
                        // overlay.hide();   
                        overlay.close();   
                    });
                }
            }
        } 
        if (topic == "ChartMouseOver")
        {
            bzutils.log("chartArea: ChartMouseOver received by Chart: " + componentReference + "/" + parameters["componentReference"]);
        }
        if (topic == "ReScale")
        {
            bzutils.log("chartArea: ReScale received by Chart: " + componentReference + "/" + parameters["componentReference"]);

            var csfStored = component.get("v.ChartScaleFactor");

            if (csf != csfStored) {
                var csf = parameters["ChartScaleFactor"];
                // make sure the percentage parameter is in sync - required by slider to be an integer
                var csfp = csf * 100;
                component.set("v.ChartScaleFactorPercentage", csfp);

                helper.handleScaleChange(component,csf);
            }
        }





        bzutils.log('chartArea: handle_evt_sfd3 exit');
    },


    navigateToRecord : function(component){
        var evtNav = $A.get("e.force:navigateToSObject");
        evtNav.setParams({
        "recordId": helper.getCache (componentReference, "mouseoverRecordId"),
        "slideDevName": "detail"
        });
        sObectEvent.fire(); 
     },

     refreshVisibility: function(component,event,helper){
        console.log("aura:method refreshVisibility in chartArea enter");
        console.log("aura:method refreshVisibility in chartArea exit");
    },

    styleNodes: function(component,event,helper){
        console.log("aura:method styleNodes in chartArea enter");
        console.log("aura:method styleNodes in chartArea exit");
    }

})