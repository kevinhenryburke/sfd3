({

    // bear in mind that doInit can't reference anything in an external library as it may lose a race condition.
    doInit: function(component, event, helper) {
        console.log('chartArea: doInit enter');   

        let storeObject = {"rendered": false};
        component.set("v.storeObject", storeObject);

        helper.setStore(component, "showMeasureValues", false);

        var recordId = component.get("v.recordId");
        if (recordId == null) {
            recordId = "";
        }

        // calculate compref from random generator   
        var comprefNumber = Math.floor((Math.random() * 10000000000) + 1); 
        var componentReference = "compref" + comprefNumber + recordId;
        component.set("v.componentReference", componentReference);
        component.set("v.chartAreaDivId", componentReference + 'chartArea');

        console.log('chartArea: doInit exit for componentReference: ' + componentReference);   
    },

    // we need to avoid race condition between chart rendering and scripts loading, hence the checks in this method
    doneRendering: function(component, event, helper) {
        var rendered = helper.getStore(component, "rendered");
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
            helper.setStore(component, "rendered", true);
        }
    },

    // we need to avoid race condition between chart rendering and scripts loading, hence the checks in this method
    afterScriptsLoaded: function(component, event, helper) {
        bzutils.log('chartArea: afterScriptsLoaded enter');
        component.set("v.scriptsLoaded", true);

        var rendered = helper.getStore(component, "rendered");
        if (rendered == true) {
            bzutils.log('chartArea: signalling ready from afterScriptsLoaded');   
            helper.doneRenderLoad(component);
        }        
    },

    /* handlers */

    refreshDataController: function(component,event,helper){
        bzutils.log("calling the aura:method refreshDataController in base");
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
        }
        else {
            topic = event.getParam("topic");
            parameters = event.getParam("parameters");
            controller = event.getParam("controller");    
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
        
        /* Code format should be
        1. store changed values
        2. run specific code for specified action
        3. call any refresh methods
        */


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
        if (topic == "SetColor")
        {
            // get the measure

            //TODO - should I just set the measure scheme here, once, in one place???
            // could improve performance a lot?            

            helper.setStore(component, "currentColorLabel",  parameters["measure"]);
            helper.setStore(component, "relevantMeasure",  parameters["measure"]);
            helper.setStore(component, "latestSizeOrColor",  "color");
            helper.setStore(component, "updateColor", true);
            helper.setStore(component, "updateSize", false);

            var componentType = component.get("v.componentType");
            if (componentType != "hierarchy.treemap" && componentType != "hierarchy.treemapzoom") {
                helper.showColorSchemeLegend(component);            
                helper.setStore(component, "showMeasureValues", true);
            }
            else {
                helper.setStore(component, "showMeasureValues", false);
            }

            // refresh node styles
            cc.styleNodes();                 
        }
        if (topic == "SetSize")
        {
            // get the measure
            helper.setStore(component, "currentSizeLabel",  parameters["size"]);
            helper.setStore(component, "relevantMeasure",  parameters["size"]);
            helper.setStore(component, "latestSizeOrColor",  "size");

            helper.setStore(component, "updateColor", false);
            helper.setStore(component, "updateSize", true);

            var componentType = component.get("v.componentType");
            if (componentType != "hierarchy.treemap" && componentType != "hierarchy.treemapzoom") {
                helper.showColorSchemeLegend(component);            
                helper.setStore(component, "showMeasureValues", true);
            }
            else {
                helper.setStore(component, "showMeasureValues", false);
            }
            
            // refresh node styles
            cc.styleNodes();                 
        }
        if (topic == "SetFilter")
        {

            helper.setCache(component, "filtersConfigured", true);

            // get the type of filter (essentially which field (group)) and whether we are no Show or Hide
            // filter and set visibility of nodes
            var filterState = parameters["filterState"];
            var filterType = parameters["filterType"];
            helper.setFilterVisibility(component, filterType, filterState);

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
                
                var showEmbeddedPanel = helper.getMasterParam(component,"panels","InfoPanel","showEmbeddedPanel");         
                if (showEmbeddedPanel == null) {showEmbeddedPanel = false;}
                helper.setCache (component, "showEmbeddedPanel", showEmbeddedPanel ) ;
                component.set("v.showEmbeddedPanel", showEmbeddedPanel);

                var showLevelsInitial = helper.getMasterParam(component,"panels","ChartPanel","showLevelsInitial");         
                if (showLevelsInitial != null) {
                    component.set("v.showLevelsInitial" , showLevelsInitial);
                    helper.setCache (component, "showLevels", showLevelsInitial) ;
                }
                else {
                    component.set("v.showLevelsInitial" , 1);
                    helper.setCache (component, "showLevels", 1) ;
                }

                // set latest values for color and size

                helper.setStore(component, "currentColorLabel", 
                    parameters["currentColorLabel"] != null ? parameters["currentColorLabel"] : "bzDefault");
                helper.setStore(component, "currentSizeLabel", 
                    parameters["currentSizeLabel"] != null ? parameters["currentSizeLabel"] : "bzDefault");
                
                // set relevantMeasure
                if (parameters["currentColorLabel"] != null) {
                    helper.setStore(component, "relevantMeasure", parameters["currentColorLabel"]);
                }                
                else if (parameters["currentSizeLabel"] != null) {
                    helper.setStore(component, "relevantMeasure", parameters["currentSizeLabel"]);
                }                
                else { // if there are no colors or sizes then mark this as bzDefault
                    helper.setStore(component, "relevantMeasure", "bzDefault");
                }

                helper.setStore(component, "defaultColor", cc.getDefaultColor());
                helper.setStore(component, "defaultSize", cc.getDefaultSize());
                helper.setStore(component, "updateColor", true);
                helper.setStore(component, "updateSize", true);
                helper.setStore(component, "latestSizeOrColor",  "none");


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
                var cc = component.getConcreteComponent();
                cc.refreshDataController(parameters);                 
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

            // if we have destroyed the component then we need to make the panel area transparent
            var panelDisplayEmbeddedOuter = helper.getCache (component, "panelDisplayEmbeddedOuter") ; 
            var panelDisplayEmbeddedOuterElement = panelDisplayEmbeddedOuter.getElement();
            panelDisplayEmbeddedOuterElement.style.opacity = "0";
        } 
        if (topic == "FadeDisplayPanel")
        {      
            // we toggle the opacity of the display panel
            var panelDisplayEmbedded = helper.getCache (component, "panelDisplayEmbedded") ; 
            var showEmbeddedPanel = helper.getCache (component, "showEmbeddedPanel" ) ;
            console.log('chartArea: FadeDisplayPanel: ', showEmbeddedPanel);

            if (showEmbeddedPanel) {

                var panelDisplayEmbeddedOuter = helper.getCache (component, "panelDisplayEmbeddedOuter") ; 

                var panelDisplayEmbeddedOuterElement = panelDisplayEmbeddedOuter.getElement();
                var opacity = panelDisplayEmbeddedOuterElement.style["opacity"];        
                opacity = parseFloat(opacity); // as the style element is returned as a string

                if (opacity < 0.5) {
                    panelDisplayEmbeddedOuterElement.style.opacity = "1";
                }
                else {
                    panelDisplayEmbeddedOuterElement.style.opacity = "0.3";
                }                
            }

        } 
        if (topic == "ChartMouseOver")
        {
            
            bzutils.log("chartArea: ChartMouseOver received by Chart: " + componentReference + "/" + parameters["componentReference"]);

            var panelDisplayEmbedded = helper.getCache (component, "panelDisplayEmbedded") ; 
            var showEmbeddedPanel = helper.getCache (component, "showEmbeddedPanel" ) ;
            console.log('chartArea: panelDisplayEmbedded, showEmbeddedPanel: ', showEmbeddedPanel);

            var panelDisplayEmbeddedOuter = helper.getCache (component, "panelDisplayEmbeddedOuter") ; 

            var panelDisplayEmbeddedOuterElement = panelDisplayEmbeddedOuter.getElement();
            var opacity = panelDisplayEmbeddedOuterElement.style["opacity"];        
            opacity = parseFloat(opacity);
                
            var tpc = {
                "topic" : topic,
                "parameters" : parameters,
                "controller" : controller
            };
            panelDisplayEmbedded.callFromContainer(tpc);               

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
    },

    getDefaultSize: function(component,event,helper){
        // console.log("aura:method getDefaultSize in chartArea enter");
        // console.log("aura:method getDefaultSize in chartArea exit");
        return "lightsteelblue";
    },

    getDefaultColor: function(component,event,helper){
        // console.log("aura:method getDefaultColor in chartArea enter");
        // console.log("aura:method getDefaultColor in chartArea exit");
        return 10;
    }

})