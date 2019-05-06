({

    // bear in mind that doInit can't reference anything in an external library as it may lose a race condition.
    doInit: function(component, event, helper) {
        console.log('chartArea: doInit enter');   

        let recordId = component.get("v.recordId");
        if (recordId == null) {
            recordId = "";
        }

        // calculate compref from random generator   
        let comprefNumber = Math.floor((Math.random() * 10000000000) + 1); 
        let componentReference = "compref" + comprefNumber + recordId;
        let chartAreaDivId = componentReference + 'chartArea';

        /* Constants and Defaults */
        let storeObject = {
            "rendered": false, 
            "showMeasureValues": false,
            "componentReference": componentReference,
            "chartAreaDivId": chartAreaDivId,
            "ChartScaleFactor": 1,
            "ChartScalePercentage": 100,
            "showZoomSlider": false,
            "showLevelsInitial": 1
        };
        component.set("v.storeObject", storeObject);

        console.log('chartArea: doInit exit for componentReference: ' + componentReference);   
    },

    // we need to avoid race condition between chart rendering and scripts loading, hence the checks in this method
    doneRendering: function(component, event, helper) {
        let storeObject = component.get("v.storeObject");
        let rendered = storeObject["rendered"];
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
            storeObject["rendered"] = true;
        }
    },

    // we need to avoid race condition between chart rendering and scripts loading, hence the checks in this method
    afterScriptsLoaded: function(component, event, helper) {
        bzutils.log('chartArea: afterScriptsLoaded enter');
        let storeObject = component.get("v.storeObject");
        component.set("v.scriptsLoaded", true);

        var rendered = bzchart.getStore (storeObject, "rendered");
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
        let storeObject = component.get("v.storeObject");
        let componentReference = bzchart.getStore (storeObject, "componentReference") ;  

        let csfp = bzchart.getStore (storeObject, "ChartScalePercentage") ;  

        let csf = parseFloat(csfp / 100); // ensure js knows it's a decimal

        var eventParameters = { 
            "componentReference" : componentReference,
            "ChartScaleFactor" : csf
        }    

        var preppedEvent = bzchart.prepareEvent(storeObject, "ReScale", eventParameters);
        bzaura.publishPreppedEvent(storeObject,preppedEvent,$A.get("e.c:evt_sfd3"));
    },

    handleCustomEvent  : function(component, event, helper) {
        var topic, parameters, controller;
        var cc = component.getConcreteComponent();
        let storeObject = cc.get("v.storeObject");
        let componentReference = bzchart.getStore (storeObject, "componentReference") ;  
        let componentType = bzchart.getStore (storeObject, "componentType") ;

        helper.restockCache(cc);

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

       if (topic == "InitializeData")
       {
           bzutils.log("InitializeData received by Chart: " + componentReference + "/" + parameters["componentReference"]);

           if (componentReference == parameters["componentReference"]) {
               bzutils.log("InitializeData with reference: " + componentReference);
               let isInit = true;


               /* Set Mixins for bespoke functionality per component type */
               let masterConfigObject = parameters["masterConfigObject"];
               component.set("v.masterConfigObject", masterConfigObject);

               bzchart.setStore (storeObject, "componentReference", componentReference ) ;

// ON BIG REFACTOR - for InitializeData this should be read from  masterConfigObject object not attribute. Can't do this in aura with dynamic rendering              
                let componentType = bzchart.getStore (storeObject, "componentType") ;

               if (componentType == 'hierarchy.ctree') {
                   const chartMixin = Object.assign({}, chartDefaultMixin.DefaultMixin, chartHierarchyMixin.OverrideMixin, chartHierarchyCtreeMixin.OverrideMixin);
                   bzchart.setStore (storeObject, "chartMixin", chartMixin) ;                    
               }
               if (componentType == 'hierarchy.pack') {
                   const chartMixin = Object.assign({}, chartDefaultMixin.DefaultMixin, chartHierarchyMixin.OverrideMixin, chartHierarchyPackMixin.OverrideMixin);        
                   bzchart.setStore (storeObject, "chartMixin", chartMixin) ;                  
               }
               if (componentType == 'hierarchy.treemapzoom') {
                   const chartMixin = Object.assign({}, chartDefaultMixin.DefaultMixin, chartHierarchyMixin.OverrideMixin, chartHierarchyTreemapzoomMixin.OverrideMixin);        
                   bzchart.setStore (storeObject, "chartMixin", chartMixin) ;                                    
               }
               if (componentType == 'hierarchy.treemap') {
                   const chartMixin = Object.assign({}, chartDefaultMixin.DefaultMixin, chartHierarchyMixin.OverrideMixin, chartHierarchyTreemapMixin.OverrideMixin);        
                   bzchart.setStore (storeObject, "chartMixin", chartMixin) ;                                    
               }
               if (componentType == 'network.connections') {
                   const chartMixin = Object.assign({}, chartDefaultMixin.DefaultMixin, chartNetworkMixin.OverrideMixin);        
                   bzchart.setStore (storeObject, "chartMixin", chartMixin) ;                                    
               }
               if (componentType == 'network.timeline') {
                   const chartMixin = Object.assign({}, chartDefaultMixin.DefaultMixin, chartNetworkMixin.OverrideMixin, chartNetworkTimelineMixin.OverrideMixin);        
                   bzchart.setStore (storeObject, "chartMixin", chartMixin) ;                                    
               }
       
               bzchart.buildMeasureSchemeMap(masterConfigObject, storeObject);

               var showZoomSlider = bzutils.getMasterParam(masterConfigObject,"panels","ChartPanel","Hierarchy","showZoomSlider");         
               if (showZoomSlider != null) {
                   component.set("v.showZoomSlider" , showZoomSlider); // required for now but not in LWC
                   bzchart.setStore (storeObject, "showZoomSlider", showZoomSlider) ;                                    
               }
               else {
                   component.set("v.showZoomSlider" , false); // required for now but not in LWC
                   bzchart.setStore (storeObject, "showZoomSlider", false) ;                                    
               }      
               
               var showEmbeddedPanel = bzutils.getMasterParam(masterConfigObject,"panels","InfoPanel","showEmbeddedPanel");         
               if (showEmbeddedPanel == null) {showEmbeddedPanel = false;}
               bzchart.setStore (storeObject, "showEmbeddedPanel", showEmbeddedPanel ) ;
               component.set("v.showEmbeddedPanel", showEmbeddedPanel);

               var showLevelsInitial = bzutils.getMasterParam(masterConfigObject,"panels","ChartPanel","showLevelsInitial");         
               if (showLevelsInitial != null) {
                   bzchart.setStore (storeObject, "showLevels", showLevelsInitial) ;
               }

               // set latest values for color and size

               bzchart.setStore (storeObject, "currentColorLabel", 
                   parameters["currentColorLabel"] != null ? parameters["currentColorLabel"] : "bzDefault");
               bzchart.setStore (storeObject, "currentSizeLabel", 
                   parameters["currentSizeLabel"] != null ? parameters["currentSizeLabel"] : "bzDefault");
               
               // set relevantMeasure
               if (parameters["currentColorLabel"] != null) {
                   bzchart.setStore (storeObject, "relevantMeasure", parameters["currentColorLabel"]);
               }                
               else if (parameters["currentSizeLabel"] != null) {
                   bzchart.setStore (storeObject, "relevantMeasure", parameters["currentSizeLabel"]);
               }                
               else { // if there are no colors or sizes then mark this as bzDefault
                   bzchart.setStore (storeObject, "relevantMeasure", "bzDefault");
               }

               let variantsMixin = bzchart.getStore (storeObject, "chartMixin") ;
               bzchart.setStore (storeObject, "defaultColor", variantsMixin.getDefaultColor());
               bzchart.setStore (storeObject, "defaultSize", variantsMixin.getDefaultSize());
               bzchart.setStore (storeObject, "updateColor", true);
               bzchart.setStore (storeObject, "updateSize", true);
               bzchart.setStore (storeObject, "latestSizeOrColor",  "none");

               helper.initializeGroups(component, parameters["datajson"], parameters["primaryId"], parameters["showFilters"], isInit);                 

                var cc = component.getConcreteComponent();
                cc.initializeVisuals();
                variantsMixin.refreshVisibility(storeObject);                
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
               let variantsMixin = bzchart.getStore (storeObject, "chartMixin") ;
               variantsMixin.refreshVisibility(storeObject);
            }
           else {
               bzutils.log("Chart with reference: " + componentReference + " / ignores this event with chart reference: " + parameters["componentReference"]);
           }
       }

        if (topic == "ShowLevelsMore")
        {
            // get the new number of levels and refresh
            bzchart.setStore (storeObject, "showLevels", parameters["levels"] ) ;
            let variantsMixin = bzchart.getStore (storeObject, "chartMixin") ;
            variantsMixin.refreshVisibility(storeObject);
      }
        if (topic == "ShowLevelsFewer")
        {
            // get the new number of levels and refresh
            bzchart.setStore (storeObject, "showLevels", parameters["levels"] ) ;
            let variantsMixin = bzchart.getStore (storeObject, "chartMixin") ;
            variantsMixin.refreshVisibility(storeObject);
    }
        if (topic == "SetColor")
        {
            // get the measure

            //TODO - should I just set the measure scheme here, once, in one place???
            // could improve performance a lot?            

            bzchart.setStore (storeObject, "currentColorLabel",  parameters["measure"]);
            bzchart.setStore (storeObject, "relevantMeasure",  parameters["measure"]);
            bzchart.setStore (storeObject, "latestSizeOrColor",  "color");
            bzchart.setStore (storeObject, "updateColor", true);
            bzchart.setStore (storeObject, "updateSize", false);

            // Repetition of code 20 lines down, needs to refactored into mixin when got rid of "component" from code

            if (componentType != "hierarchy.treemap" && componentType != "hierarchy.treemapzoom") {
                bzchart.showColorSchemeLegend(storeObject);            
                bzchart.setStore (storeObject, "showMeasureValues", true);
            }
            else {
                bzchart.setStore (storeObject, "showMeasureValues", false);
            }

            // refresh node styles
            cc.styleNodes();                 
        }
        if (topic == "SetSize")
        {
            // get the measure
            bzchart.setStore (storeObject, "currentSizeLabel",  parameters["size"]);
            bzchart.setStore (storeObject, "relevantMeasure",  parameters["size"]);
            bzchart.setStore (storeObject, "latestSizeOrColor",  "size");

            bzchart.setStore (storeObject, "updateColor", false);
            bzchart.setStore (storeObject, "updateSize", true);

            if (componentType != "hierarchy.treemap" && componentType != "hierarchy.treemapzoom") {
                bzchart.showColorSchemeLegend(storeObject);            
                bzchart.setStore (storeObject, "showMeasureValues", true);
            }
            else {
                bzchart.setStore (storeObject, "showMeasureValues", false);
            }
            
            // refresh node styles
            cc.styleNodes();                 
        }
        if (topic == "SetFilter")
        {

            bzchart.setStore (storeObject, "filtersConfigured", true);

            // get the type of filter (essentially which field (group)) and whether we are no Show or Hide
            // filter and set visibility of nodes
            var filterState = parameters["filterState"];
            var filterType = parameters["filterType"];
            bzchart.setFilterVisibility(storeObject, filterType, filterState);

            let variantsMixin = bzchart.getStore (storeObject, "chartMixin") ;
            variantsMixin.refreshVisibility(storeObject);
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
            let masterConfigObject = component.get("v.masterConfigObject");
            var allowPopover = bzutils.getMasterParam(masterConfigObject,"panels","InfoPanel","allowPopover");         
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
            var panelDisplayEmbeddedOuter = bzchart.getStore (storeObject, "panelDisplayEmbeddedOuter") ; 
            var panelDisplayEmbeddedOuterElement = panelDisplayEmbeddedOuter.getElement();
            panelDisplayEmbeddedOuterElement.style.opacity = "0";
        } 
        if (topic == "FadeDisplayPanel")
        {      
            // we toggle the opacity of the display panel
            var panelDisplayEmbedded = bzchart.getStore (storeObject, "panelDisplayEmbedded") ; 
            var showEmbeddedPanel = bzchart.getStore (storeObject, "showEmbeddedPanel" ) ;
            console.log('chartArea: FadeDisplayPanel: ', showEmbeddedPanel);

            if (showEmbeddedPanel) {

                var panelDisplayEmbeddedOuter = bzchart.getStore (storeObject, "panelDisplayEmbeddedOuter") ; 

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

            var panelDisplayEmbedded = bzchart.getStore (storeObject, "panelDisplayEmbedded") ; 
            var showEmbeddedPanel = bzchart.getStore (storeObject, "showEmbeddedPanel" ) ;
            console.log('chartArea: panelDisplayEmbedded, showEmbeddedPanel: ', showEmbeddedPanel);

            var panelDisplayEmbeddedOuter = bzchart.getStore (storeObject, "panelDisplayEmbeddedOuter") ; 

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

            let csfStored = bzchart.getStoreWithDefault (storeObject, "ChartScaleFactor", 1) ;
    
            if (csf != csfStored) {
                var csf = parameters["ChartScaleFactor"];
                // make sure the percentage parameter is in sync - required by slider to be an integer
                var csfp = csf * 100;
                bzchart.setStore (storeObject, "ChartScalePercentage", csfp) ; 

                helper.handleScaleChange(component,csf);
            }
        }
    },

    styleNodes: function(component,event,helper){
        // console.log("aura:method styleNodes in chartArea enter");
        // console.log("aura:method styleNodes in chartArea exit");
    },

})