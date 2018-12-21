({

    callFromContainer : function (component, event, helper) {
        var params = event.getParam("arguments");
        var tpc = params.tpc;
        var topic = tpc.topic;
    },

    // bear in mind that doInit can't refresh anything in an external library as it may lose a race condition.
    doInit: function(component, event, helper) {
        console.log('chartArea: doInit enter');   

        var storeObject = JSON.parse("{}");
        component.set("v.storeObject", storeObject);

        helper.setStore(component, "showMeasureValues", false);

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
        if (rendered == false) {
            console.log('chartArea: doneRendering enter for first time');   
            var scriptsLoaded = component.get("v.scriptsLoaded");
            if (scriptsLoaded == true) {
                console.log('chartArea: signalling ready from doneRendering');   
                helper.doneRenderLoad(component);
            }
            else {
                console.log('chartArea: doneRendering: scripts not loaded so publish RefreshEvent from afterScriptsLoaded');   
            }
            component.set("v.rendered", true);
        }
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
    },

    /* handlers */

    refreshData: function(component,event,helper){
        bzutils.log("calling the aura:method refreshData in base");
        var args = event.getParam("arguments");

        var datajson = args.datajson;
        var currentMeasure = args.currentMeasure;
        var currentMeasureScheme = args.currentMeasureScheme;
        var primaryId = args.primaryId;
        var showFilters = args.showFilters;

        helper.setStore(cc, "currentMeasure", currentMeasure);
        helper.setStore(cc, "currentMeasureScheme", currentMeasureScheme);

        helper.refreshDataHelper(component, datajson, primaryId, showFilters);                         
    },

    searchChart: function(component,event,helper){
        bzutils.log("calling the aura:method searchChart in base");        
    },

    handleScaleChange: function(component,event,helper){
        var componentReference = component.get("v.componentReference");

        var csfp = component.get("v.ChartScaleFactorPercentage");
        var csf = parseFloat(csfp / 100); // ensure js knows it's a decimal

        var eventParameters = { 
            "componentReference" : componentReference,
            "ChartScaleFactor" : csf
        }    

        var preppedEvent = helper.prepareEvent(component, "ReScale", eventParameters);
        helper.publishPreppedEvent(component,preppedEvent);
    },

    searchChart: function(component,event,helper){
        // bzutils.log("calling the aura:method searchChart in base");        
    },


    handleCustomEvent  : function(component, event, helper) {
        var topic, parameters, controller;
        var cc = component.getConcreteComponent();

        // if there is an arguments parameter this has been triggered by a method call
        // in which case we need to source our information from a level down in the event
        var argumentsParameter = event.getParam("arguments");

        if (argumentsParameter != null) {
            var tpc = argumentsParameter.tpc;
            topic = tpc.topic;
            parameters = tpc.parameters;
            controller = tpc.controller;
            // console.log('chartArea: handleCustomEvent enter from method, topic: ' + topic);
        }
        else {
            topic = event.getParam("topic");
            parameters = event.getParam("parameters");
            controller = event.getParam("controller");    
            // console.log('chartArea: handleCustomEvent enter from event, topic: ' + topic);
        }


        var componentReference = component.get("v.componentReference");        
        // console.log('chartArea: topic:' + topic + " controller " + controller + " componentReference " + componentReference);

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
        
        // Chart Display handlers
        
        if (topic == "ShowLevelsMore")
        {
            // get the new number of levels and refresh
            helper.setCache (component, "showLevels", parameters["levels"] ) ;
            cc.refreshVisibility();                     
        }
        if (topic == "ShowLevelsFewer")
        {
            // get the new number of levels and refresh
            helper.setCache (component, "showLevels", parameters["levels"] ) ;
            cc.refreshVisibility();                 
        }
        if (topic == "SetMeasure")
        {
            // get the measure and measure scheme
            var currentMeasure = parameters["measure"];
            helper.setStore(cc, "currentMeasure", currentMeasure);
            var currentMeasureScheme = parameters["measureScheme"];
            helper.setStore(cc, "currentMeasureScheme", currentMeasureScheme);

            // display measure legend
            helper.setStore(component, "showMeasureValues", true);
            helper.createLegendLocation(component);            

            // refresh node styles
            cc.styleNodes();                 
        }
        if (topic == "SetFilter")
        {
            // get the type of filter (essentially which field (group)) and whether we are no Show or Hide
            var filterState = parameters["filterState"];
            var filterType = parameters["filterType"];

            var isShown = (filterState == "Show");
            // filter and set visibility of nodes
            helper.setFilterVisibility(component, filterType, isShown);
            cc.refreshVisibility();                 
        }
        if (topic == "InitializeData")
        {
            bzutils.log("InitializeData received by Chart: " + componentReference + "/" + parameters["componentReference"]);

            if (componentReference == parameters["componentReference"]) {
                bzutils.log("InitializeData with reference: " + componentReference);
                var isInit = true;

                var masterConfigObject = parameters["masterConfigObject"];
                component.set("v.masterConfigObject", masterConfigObject);

                helper.buildMeasureSchemeMap(component);


                var showZoomSlider = helper.getMasterParam(component,"panels","ChartPanel","Hierarchy","showZoomSlider");         
                if (showZoomSlider != null) {
                    component.set("v.showZoomSlider" , showZoomSlider);
                }
                else {
                    component.set("v.showZoomSlider" , false);
                }        

                var showLevelsInitial = helper.getMasterParam(component,"panels","ChartPanel","showLevelsInitial");         
                if (showLevelsInitial != null) {
                    component.set("v.showLevelsInitial" , showLevelsInitial);
                    helper.setCache (component, "showLevels", showLevelsInitial) ;
                }
                else {
                    component.set("v.showLevelsInitial" , 1);
                    helper.setCache (component, "showLevels", 1) ;
                }

                helper.setStore(cc, "currentMeasure", parameters["currentMeasure"]);
                helper.setStore(cc, "currentMeasureScheme", parameters["currentMeasureScheme"]);    

                helper.initializeGroups(component, parameters["datajson"], parameters["primaryId"], parameters["showFilters"], isInit);                 

                var cc = component.getConcreteComponent();
                cc.initializeVisuals();
                cc.refreshVisibility();                 
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

                helper.setStore(cc, "currentMeasure", parameters["currentMeasure"]);
                helper.setStore(cc, "currentMeasureScheme", parameters["currentMeasureScheme"]);

                var cc = component.getConcreteComponent();
                cc.refreshData(parameters["datajson"], parameters["primaryId"], parameters["showFilters"]);                 
                cc.refreshVisibility();                 
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
            var allowPopover = helper.getMasterParam(component,"panels","InfoPanel","allowPopover");         
            if (allowPopover == null) {allowPopover = false;}

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
    },


    navigateToRecord : function(component){
        var evtNav = $A.get("e.force:navigateToSObject");
        evtNav.setParams({
        "recordId": helper.getCache (component, "mouseoverRecordId"),
        "slideDevName": "detail"
        });
        sObectEvent.fire(); 
     },

     refreshVisibility: function(component,event,helper){
        // console.log("aura:method refreshVisibility in chartArea enter");
        // console.log("aura:method refreshVisibility in chartArea exit");
    },

    styleNodes: function(component,event,helper){
        // console.log("aura:method styleNodes in chartArea enter");
        // console.log("aura:method styleNodes in chartArea exit");
    }

})