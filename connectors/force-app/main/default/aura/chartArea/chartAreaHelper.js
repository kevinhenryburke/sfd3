({
    areaInit: function (component) {
        console.log("areaInit enter");
    },

    // first method called after all resources are ready
    doneRenderLoad: function (component) {
        let _this = this;
        let componentReference = component.get("v.componentReference");
        let storeObject = component.get("v.storeObject");

        bzchart.setStore (storeObject, "componentReference", component.get("v.componentReference") ) ;
        bzchart.setStore (storeObject, "componentType", component.get("v.componentType") ) ;
        bzchart.setStore (storeObject, "componentCategory", component.get("v.componentCategory") ) ;
        bzchart.setStore (storeObject, "componentEvent", component.getEvent("evt_bzc")) ;        
        bzchart.setStore (storeObject, "defaultEventType", component.getEvent("defaultEventType")) ;        
        bzchart.setStore (storeObject, "appEvents",  []) ;

        bzchart.setStore (storeObject, "UserComponentId", component.get("v.UserComponentId") ) ;
        bzchart.setStore (storeObject, "UserControllerComponentId", component.get("v.UserControllerComponentId") ) ;
        bzchart.setStore (storeObject, "hasPrimaryNode", component.get("v.hasPrimaryNode") ) ;

        bzchart.setStore (storeObject, "lastTouch", new Date().getTime()) ;
        bzchart.setStore (storeObject, "width", Math.min(screen.width, screen.height)) ; // review this
        bzchart.setStore (storeObject, "height", Math.min(screen.width, screen.height)) ; // review this

        bzchart.setStore (storeObject, "filtersConfigured", false);

		var margin = {top: 20, right: 90, bottom: 30, left: 50}; // this should probably be flexi-ed too
        bzchart.setStore (storeObject, "margin", margin) ;  
        
        // Differing strategies for computing Width and Height
        // Width depends on width of the container

        var divComponent = component.find("container1"); // this should be ok as it's an internal search, need to prefix with a unique id is required outside of lightning context
        var divElement = divComponent.getElement();
        var clientWidth = divElement.clientWidth;        
        bzchart.setStore (storeObject, "width", clientWidth) ; 

        // Height we hard code depending on the flexible page width 
        var flexiWidth = component.get("v.flexiWidth");

        if (flexiWidth == null) {
            // this is the case when not embedded in a Lightning Page - e.g. in aura preview
            flexiWidth = "MEDIUM";
        }

        if (flexiWidth == "SMALL")
        {
            bzchart.setStore (storeObject, "height", 800) ;                 
        }

        if (flexiWidth == "MEDIUM")
        {
            bzchart.setStore (storeObject, "height", 800) ;                 
        }

        if (flexiWidth == "LARGE")
        {
            bzchart.setStore (storeObject, "height", 1000) ;                 
        }
        
        d3.select(bzutils.getDivId("chartArea", componentReference, true))
            .append("svg")
            .attr("id", bzutils.getDivId("svg", componentReference, false)) // If putting more than one chart on a page we need to provide unique ids for the svg elements   
            .attr("width", bzchart.getStore (storeObject, "width") )
            .attr("height", bzchart.getStore (storeObject, "height") );

        console.log("chartArea: svg attached ");

        var agent = navigator.userAgent.toLowerCase();
        if(agent.indexOf('iphone') >= 0 || agent.indexOf('ipad') >= 0){
            bzchart.isiOS = true;
            component.set("v.isiOS", true);
        }
        else {
            bzchart.isiOS = false;
        }
        
        var eventParameters = { 
            "componentReference" : componentReference
        }    
        var preppedEvent = _this.prepareEvent(component, "ChartRendered", eventParameters);
        _this.publishPreppedEvent(component,preppedEvent);

        console.log("chartArea: ChartRendered event published ");
 
        // build up a cache for mouseover events - may be a better way to do this!
        bzchart.setStore (storeObject, "appEvents",  []) ;
        _this.restockCache(component);

        var panelDisplayEmbedded = component.find("panelDisplayEmbedded"); // this should be ok as it's an internal search, need to prefix with a unique id is required outside of lightning context
        bzchart.setStore (storeObject, "panelDisplayEmbedded", panelDisplayEmbedded) ; 

        var panelDisplayEmbeddedOuter = component.find("panelDisplayEmbeddedOuter"); // this should be ok as it's an internal search, need to prefix with a unique id is required outside of lightning context
        bzchart.setStore (storeObject, "panelDisplayEmbeddedOuter", panelDisplayEmbeddedOuter) ; 

    },

	initializeGroups: function (component, datajson, primaryNodeId, showFilters, isInit) {

        var _this = this;
        var componentReference = component.get("v.componentReference");
        let masterConfigObject = component.get("v.masterConfigObject");
        let storeObject = component.get("v.storeObject");

//        let tempo = bzchart.getStore (masterConfigObject, "componentReference" ) ;
        console.log("initializeGroups: tempo: componentReference:" + componentReference, masterConfigObject);


        console.log("init:initializing initializeGroups with primaryNodeId: " + primaryNodeId);
        
        if (isInit) {
            bzutils.initializeAddComponentRef(componentReference, datajson);
        }

        bzchart.setStore (storeObject, "datajson", datajson ) ;

        var hasPrimaryNode = bzchart.getStore (storeObject, "hasPrimaryNode") ;
        // var hasPrimaryNode = component.get("v.hasPrimaryNode") ;
        if (hasPrimaryNode == true) {
            primaryNodeId = bzutils.addComponentRef(componentReference, primaryNodeId);
            bzchart.setStore (storeObject, "primaryNodeId", primaryNodeId ) ;
        }
        else {
            console.log("hasPrimaryNode false");
        }

        if (showFilters != null) {
            bzchart.setStore (storeObject, "filterValues", showFilters.filterValues ) ;
            bzchart.setStore (storeObject, "filterAPIField", showFilters.filterAPIField ) ;
        }
        else {
            bzchart.setStore (storeObject, "filterValues", [] ) ;
        }

		var svg = d3.select(bzutils.getDivId("svg", componentReference, true));
		        
        // Styling of tooltips - see GitHub prior to Feb 24, 2018
        var pathToolTipDivId = bzutils.addComponentRef(componentReference, "pathToolTip");
        var pathToolTipDiv = d3.select("#" + pathToolTipDivId);
        bzchart.setStore (storeObject, "pathToolTipDiv", pathToolTipDiv ) ;

        // create some groups inside the svg element to store the raw data

        var pathGroupId = bzutils.getDivId("pathGroup", componentReference, false);
        bzchart.setStore (storeObject, "pathGroupId", pathGroupId ) ;
        var pathGroup = d3.select("#" + pathGroupId);
        if (pathGroup.empty()) {
            console.log("create pathGroup");
            pathGroup = svg.append("g").attr("id",pathGroupId);
        }
        bzchart.setStore (storeObject, "pathGroup", pathGroup ) ;

        var nodeGroupId = bzutils.getDivId("nodeGroup", componentReference, false);
        var nodeGroup = d3.select("#" + nodeGroupId);
        if (nodeGroup.empty()) {
            console.log("create nodeGroup");
            nodeGroup = svg.append("g").attr("id",nodeGroupId);
        }
        bzchart.setStore (storeObject, "nodeGroup", nodeGroup ) ;

        var textGroupId = bzutils.getDivId("textGroup", componentReference, false);        
        var textGroup = d3.select("#" + textGroupId);
        if (textGroup.empty()) {
            console.log("create textGroup");
            textGroup = svg.append("svg:g").attr("id",textGroupId);
        }
        bzchart.setStore (storeObject, "textGroup", textGroup ) ;

        var legendSymbolGroupId = bzutils.getDivId("legendSymbolGroup", componentReference, false);
        var legendSymbolGroup = d3.select("#" + legendSymbolGroupId);
        if (legendSymbolGroup.empty()) {
            console.log("create legendSymbolGroup");
            legendSymbolGroup = svg.append("g").attr("id",legendSymbolGroupId);
        }
        bzchart.setStore (storeObject, "legendSymbolGroup", legendSymbolGroup ) ;

        var allowPopover = bzutils.getMasterParam(masterConfigObject,"panels","InfoPanel","allowPopover");         
        if (allowPopover == null) {allowPopover = false;}

        if (allowPopover == true) {
            console.log("allowPopover set so create embedded component ... "); 
            _this.createInfoLocation(component);
            _this.createPopOverComponent(component);
        }
        else {
            console.log("allowPopover not set "); 
        }


    },

    // create an invisible svg symbol to attach a popover to
    createInfoLocation : function (component) {
        var _this = this;
        let storeObject = component.get("v.storeObject");
        var componentReference = component.get("v.componentReference");

        var mdata = [0]; // random data value, not used

        var width = bzchart.getStore (storeObject, "width");
        // var popx = width - 10;
        // var popy = 200;
        var popx = width - 260;
        var popy = 110;

        var svg = d3.select(bzutils.getDivId("svg", componentReference, true));
        var infosvg = 
        svg.selectAll('.symbol')
            .data(mdata)
            .enter()
            .append('path')
            .attr('transform',function(d,i) { return 'translate(' + popx + ',' + popy + ')';})
            .attr('d', d3.symbol().type( function(d,i) { return d3.symbols[i];}) )
            .attr('id', function(d,i) { return "infolocation" + componentReference;})
            .attr('visibility', "hidden") // white background to hide
            .attr('class', function(d,i) { return "infolocation" + componentReference;});

        var referenceSelector = ".infolocation" + componentReference;

        bzchart.setStore (storeObject, "referenceSelector", referenceSelector ) ;
        bzchart.setStore (storeObject, "infosvg", infosvg ) ;
    },



    // creates an informational popover
    createPopOverComponent : function (component) {
        var _this = this;
        let storeObject = component.get("v.storeObject");

        // create an overlayLibrary that we can attach the popover to
        $A.createComponent(
        "lightning:overlayLibrary",
        {
        },
        function(overlayLibElement, overlayStatus, overlayErrorMessage){

            console.log("createPopOverComponent: overlayLibrary creation status: " + overlayStatus );
            if (overlayStatus == "SUCCESS") {
                console.log("createPopOverComponent: overlayLib found");

                var componentReference = component.get("v.componentReference");
                var masterConfig = component.get("v.masterConfig");

                $A.createComponent(
                    "c:panelDisplay",
                    {
                        "Controller" : "Top", // TODO is this really ok to hardcode? Should it be same as hosting component's controller?
                        "masterConfig" : masterConfig,
                        "layoutStyle" : "cardTile",
                        "isHosted" : true,
                        "hostComponentReference" : componentReference,
                        "hostUserControllerComponentId" : component.get("v.UserControllerComponentId")
                    },
                    function(newComponent, status, errorMessage){

                        component.set("v.popoverPanel", newComponent);
                        
                        var referenceSelector = bzchart.getStore (storeObject, "referenceSelector");
                        console.log("createPopOverComponent: createComponent callback: " + referenceSelector);
                        if (status === "SUCCESS") {
                            console.log("xxxxx: createPopOverComponent: createComponent callback: SUCCESS: " );

                            var modalPromise = overlayLibElement.showCustomPopover({
                                body: newComponent,
                                referenceSelector: referenceSelector,
                                // cssClass: "slds-hide,popoverclass,slds-popover,slds-popover_panel,slds-nubbin_left,no-pointer,cPopoverTest"
                                cssClass: "popoverclass,slds-popover,slds-popover_panel,no-pointer,slds-popover__body_small,slds-popover_small,slds-popover__body_small,cChartArea"
                            });
                            component.set("v.modalPromise", modalPromise);  
                            modalPromise.then(function (overlay) {
                                overlay.show();  
                                bzchart.setStore (storeObject, "overlay", overlay) ; 
                            });             
                        }
                        else {
                            console.log("createPopOverComponent: create panelDisplay callback: Error: " + errorMessage);
                        }
                    }
                );
            }
            else {
                console.log("createPopOverComponent: Error: overlayLib not created: " + overlayErrorMessage);
            }
        });

    },


    handleScaleChange: function(component,csf){
        let masterConfigObject = component.get("v.masterConfigObject");
        let storeObject = component.get("v.storeObject");
        bzchart.setStore (storeObject, "ChartScaleFactor", csf) ;

        var cc = component.getConcreteComponent();
        cc.reScale(csf);                 
    },

    // TODO function appears in many places, try to consolidate
    publishPreppedEvent : function(component,preppedEvent){
        var _this = this;
        let storeObject = component.get("v.storeObject");
        if (preppedEvent != null) {
            var event;

            if (preppedEvent.eventType != null) {
                // go with provided eventType
            }
            else {
                // use the default eventType
                preppedEvent.eventType = component.get("v.defaultEventType");
            }

            if (preppedEvent.eventType == "Component"){
                event = component.getEvent("evt_bzc");
            }
            if (preppedEvent.eventType == "Application"){
                event = $A.get("e.c:evt_sfd3");
            }
            if (preppedEvent.eventType == "Cache"){
                var appEvents = bzchart.getStore (storeObject, "appEvents") ;
                event = appEvents.pop();
            } 
            bzutils.publishEventHelper(event, preppedEvent.topic, preppedEvent.parameters, preppedEvent.controllerId);     
        }
    },

    // reset cache of events for mouseover events to publish - may be a better way to do this!
    // the issue is that only the top orginally created nodes have lightning context, not sure why
    // alternative would be to pass in a parameter for these nodes and push events only when the attribute is set

    restockCache : function(component) {
        var _this = this;
        let storeObject = component.get("v.storeObject");

        var appEvents = bzchart.getStore (storeObject, "appEvents") ;

        var defaultEventType = component.get("v.defaultEventType");
        console.log("chartArea: restockCache: push new cache events: " + appEvents.length + " of event type: " + defaultEventType);

        if (appEvents.length < 200) { // keep a cap on number of cached events
            for (var i = 0; i < 100; i++) {

                var appEvent;
            
                if (defaultEventType == "Application") {
                    appEvent = $A.get("e.c:evt_sfd3");
                } 
                else {
                    appEvent = component.getEvent("evt_bzc");
                }
            
                appEvents.push(appEvent);
            }
            bzchart.setStore (storeObject, "appEvents",  appEvents) ;
        }
    }, 

    /*
     Note - popover component is not in the component hierarchy so needs to be invoked directly, 
     not via a component event which is till not recognize
    */

    updatePopoverDirectly : function(component, preppedEvent) {
        var _this = this;
        console.log("chartArea: updatePopoverDirectly enter");
        let masterConfigObject = component.get("v.masterConfigObject");

        var allowPopover = bzutils.getMasterParam(masterConfigObject,"panels","InfoPanel","allowPopover");         
        if (allowPopover == null) {allowPopover = false;}

        if (allowPopover == true) {
            var defaultEventType = component.get("v.defaultEventType");

            if (defaultEventType == "Component") {
                console.log("popover: invoking by direct method call");
                var popoverPanel = component.get("v.popoverPanel");
                var tpc = {
                    "topic" : preppedEvent.topic,
                    "parameters" : preppedEvent.parameters,
                    "controller" : preppedEvent.controllerId,
                };
                popoverPanel[0].callFromContainer(tpc);    
            }
        }
    },




    // console.log("PreProcess data");
    // datajson = bzutils.xfcr("dataPreProcess", componentReference, datajson); // preprocessing of data (if any)

    // use the name convention from d3 tutorials (e.g. http://www.puzzlr.org/force-directed-graph-minimal-working-example/)
    // variables called simulation, node, path

    // Not used but an alternative way to get node / path values
    // var node = d3.select("#" + nodeGroupId).selectAll("circle")  ;
    // var path = d3.select("#" + pathGroupId).selectAll("path")  ;
    
    // ideally would prefer to put in Berlioz library but externals can't safely be called in doInit
    simpleHash : function(s) {
        var hash = 0;
        if (s.length == 0) {
            return hash;
        }
        for (var i = 0; i < s.length; i++) {
            var char = s.charCodeAt(i);
            hash = ((hash<<5)-hash)+char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    },  
    
    hasStore : function (component, key) {
        var allkeys = component.get("v.storeObject");
        return Object.keys(allkeys).includes(key);
    },
    
    prepareEvent : function (component, topic, parameters) {
        var _this = this;
        let storeObject = component.get("v.storeObject");
        var controllerId = bzchart.getStore (storeObject, "UserControllerComponentId") ;
        var eventType = bzutils.getEventTypeByTopic(topic);
        return {
            "eventType" : eventType ,
            "topic" : topic,
            "parameters" : parameters,
            "controllerId" : controllerId
        }
    },

    setFilterVisibility : function (component, filterType, filterState) {
        var _this = this;
        let storeObject = component.get("v.storeObject");
        var filterValues = bzchart.getStore (storeObject, "filterValues") ;
        if (filterState == "Show") {
            filterValues.push(filterType);
        } else {
            var index = filterValues.indexOf(filterType);
            if (index > -1) {
                filterValues.splice(index, 1);
            }
        }
        bzchart.setStore (storeObject, "filterValues", filterValues ) ;
    },

    /* clearElements removes all paths, nodes, rects, text from the chart */
    clearElements : function (componentReference) {
        var _this = this;
        var svg = d3.select(bzutils.getDivId("svg", componentReference, true));
        svg.selectAll("path,circle,rect,text").remove(); // comma separated acts as union
    },
            
    /* clearChart removes all elements and groups from the chart */
    clearChart : function (componentReference) {
        var _this = this;
        _this.clearElements(componentReference);
        d3.select(bzutils.getDivId("pathGroup", componentReference, true)).remove();
        d3.select(bzutils.getDivId("nodeGroup", componentReference, true)).remove();
        d3.select(bzutils.getDivId("textGroup", componentReference, true)).remove();
        d3.select(bzutils.getDivId("legendSymbolGroup", componentReference, true)).remove();
    },
    
    // during initialization, build a map so we can quickly associate the correct API field to a measure
    buildMeasureSchemeMap : function (masterConfigObject, storeObject) {
        var objectLevels = bzutils.getMasterParam(masterConfigObject,"data","queryJSON","objectLevels");

        // storage optimized for node colors: object / measureName / measureSchema
        var measureObjectFieldMap = {};
        // storage optimized for legend table: measureName / measureSchema (including object type)
        var measureArrayObjectFieldMap = {};
        // storage of scale functions: object / measureName / measureSchema
        var measureObjectScaleMap = {};
        // storage of grouping fields for hierarchy zoom charts on picklists: 
        // top level only at this point, grouping is in the order of the fields in config
        var groupingFields = [];

        for (var objIndex = 0; objIndex < objectLevels.length; objIndex++) {
            var thisObjectConfig = objectLevels[objIndex];
            var objectType = thisObjectConfig.objectType;

            var fields = thisObjectConfig.fields;
            for (var fieldIndex = 0; fieldIndex < fields.length; fieldIndex++) {
                var fieldConfig = fields[fieldIndex];
                if (fieldConfig["measureName"] != null) {

                    var measureName = fieldConfig["measureName"] ;
                    var currentApiName = fieldConfig["api"]; 
                    var colorScheme = fieldConfig["measureScheme"]; 
                    var measureSchemeType = fieldConfig["measureSchemeType"]; 
                    var sizeSchemeType = fieldConfig["sizeSchemeType"]; 
                    var sizeChangesColor = fieldConfig["sizeChangesColor"]; 

                    if (measureObjectFieldMap[measureName] == null) {
                        var measureLevel = {};
                        measureLevel[objectType] = {"measureScheme" : colorScheme, "measureSchemeType" : measureSchemeType , "fieldAPI" : currentApiName, "fieldIndex" : fieldIndex, "sizeSchemeType" : sizeSchemeType, "sizeChangesColor" : sizeChangesColor};
                        measureObjectFieldMap[measureName] = measureLevel;

                        measureArrayObjectFieldMap[measureName] = [{"measureScheme" : colorScheme, "measureSchemeType" : measureSchemeType , "fieldAPI" : currentApiName, "fieldIndex" : fieldIndex, "objectType" : objectType, "sizeSchemeType" : sizeSchemeType, "sizeChangesColor" : sizeChangesColor}];

                    }
                    else {
                        var measureLevel = measureObjectFieldMap[measureName]; 
                        measureLevel[objectType] = {"measureScheme" : colorScheme, "measureSchemeType" : measureSchemeType, "fieldAPI" : currentApiName, "fieldIndex" : fieldIndex, "sizeSchemeType" : sizeSchemeType, "sizeChangesColor" : sizeChangesColor };

                        measureArrayObjectFieldMap[measureName].push({"measureScheme" : colorScheme, "measureSchemeType" : measureSchemeType , "fieldAPI" : currentApiName, "fieldIndex" : fieldIndex, "objectType" : objectType, "sizeSchemeType" : sizeSchemeType, "sizeChangesColor" : sizeChangesColor});

                    }
                    if (measureSchemeType == "Scale") {
                        var domain = colorScheme["domain"]; 
                        var range = colorScheme["range"]; 

                        if (measureObjectScaleMap[measureName] == null) {
                            var objectLevel = {};
                            objectLevel[objectType] = 
                                d3.scaleLinear().domain(domain).range(range);
                            ;
                            measureObjectScaleMap[measureName] = objectLevel;    
                        }
                        else {
                            var objectLevel = measureObjectScaleMap[measureName]; 
                            objectLevel[objectType] = 
                                d3.scaleLinear().domain(domain).range(range);
                        }
                    }
                }
                if (objIndex == 0 && fieldConfig["role"] == "group") { // top object level only at present
                    groupingFields.push( {"fieldIndex" : fieldIndex , "api" : fieldConfig["api"]});
                }
            }
        }
        bzchart.setStore (storeObject, "measureObjectFieldMap", measureObjectFieldMap);
        bzchart.setStore (storeObject, "measureArrayObjectFieldMap", measureArrayObjectFieldMap);
        bzchart.setStore (storeObject, "measureObjectScaleMap", measureObjectScaleMap);
        bzchart.setStore (storeObject, "groupingFields", groupingFields);
    },

    showColorSchemeLegend : function (component) {
        var _this = this;
        let storeObject = component.get("v.storeObject");
        var componentReference = component.get("v.componentReference");
        var currentColorLabel = bzchart.getStore (storeObject, "currentColorLabel");
        var currentSizeLabel = bzchart.getStore (storeObject, "currentSizeLabel");

        var firstMeasureScheme = _this.getFirstColorSchemeLegend(component, currentColorLabel);

        // remove existing legend symbols
        d3.select(bzutils.getDivId("legendSymbolGroup", componentReference, true)).selectAll("*").remove();

        var legendSymbolGroup = bzchart.getStore (storeObject, "legendSymbolGroup" ) ;
        
        var ms = firstMeasureScheme.measureScheme;
        var mst = firstMeasureScheme["measureSchemeType"];
        var baseDataArray;

        /*  Measure Scheme is an array in complex cases (value ranges) but is an object with name/value in others
            We need to baseline our nodes on an array, hence the below
        */

       switch (mst) {
            case "ValueBand" : baseDataArray = ms; break;
            case "Scale" : baseDataArray = ms["domain"]; break;
            case "StringValue" : baseDataArray = Object.keys(ms); break;
        }

        var currentColorLabelAsArray = [];
        var schemeTextPrefix = [];

        let xSchemeTextOffset = 20, xSymbolOffset = 30, xSymbolTextOffset = 40;
        let ySchemeTextOffset = 13, yLineDepth = 20, yFirstSymbolOffset = 30, yFirstSymbolTextOffset = 33;

        if (currentSizeLabel != "bzDefault") {
            schemeTextPrefix.push("Size Scheme: ");
            currentColorLabelAsArray.push(currentSizeLabel);
            yFirstSymbolOffset += 30;
            yFirstSymbolTextOffset += 30;    
        }

        if (currentColorLabel != "bzDefault") {
            schemeTextPrefix.push("Color Scheme: ");
            currentColorLabelAsArray.push(currentColorLabel);
        }

        var measureText = legendSymbolGroup.selectAll("textme")
            .data(currentColorLabelAsArray)
            .enter()
            .append("text")
            .attr('transform',function(d,i) { return 'translate('+xSchemeTextOffset+','+(i*yLineDepth+ySchemeTextOffset)+')';})  
            .text( function (d, i) {return schemeTextPrefix[i] + d;})
            .attr("font-size", "8px")
            .attr("fill", "black");

        if (currentColorLabel != "bzDefault") {
            var textme = legendSymbolGroup.selectAll("textme")
                .data(baseDataArray)
                .enter()
                .append("text");            

            var textLabels = textme
                .attr('transform',function(d,i) { return 'translate('+xSymbolTextOffset+','+(i*yLineDepth+yFirstSymbolTextOffset)+')';})
                .attr("font-family", "sans-serif")
                .text( function(d,i) {return getLegendItemName (ms, d, i);})
                .attr("font-size", "8px")
                .attr("fill", "gray");

            var nodeSymbol = legendSymbolGroup.selectAll('.symbol')
                .data(baseDataArray);

            nodeSymbol
                .enter()
                .append('path')
                .style("stroke" , "black")
                .style("fill" , function(d,i) {return getLegendItemColor (ms, d, i);})
                .attr('transform',function(d,i) { return 'translate('+xSymbolOffset+','+(i*yLineDepth+yFirstSymbolOffset)+')';})
                .attr('d', d3.symbol().type( function(d,i) { return d3.symbols[0];}) );
        }


        function getLegendItemColor(ms, d, i) {
            if (mst == "ValueBand") {
                return ms[i]["color"];
            }
            if (mst == "Scale") {
                return ms["range"][i];
            }
            if (mst == "StringValue") {
                return ms[d];
            }
        }

        function getLegendItemName(ms, d, i) {
            if (mst == "ValueBand") {
                if (ms[i]["below"] != null) {
                    return "below " + ms[i]["below"].toLocaleString();
                }
                if (ms[i]["above"] != null) {
                    return "above " + ms[i]["above"].toLocaleString();
                }
            }
            if (mst == "Scale") {
                return ms["domain"][i];
            }
            if (mst == "StringValue") {
                return d;
            }
        }
            
    },

    getFirstColorSchemeLegend : function (component, currentColorLabel) {
        var _this = this;
        let storeObject = component.get("v.storeObject");

        var measureArrayObjectFieldMap = bzchart.getStore (storeObject, "measureArrayObjectFieldMap");
        if (measureArrayObjectFieldMap[currentColorLabel] != null) {
            return measureArrayObjectFieldMap[currentColorLabel][0];
        }
        else {
            return null;
        }
    },

    // returnType is either "Value" or "Color" or "Size"

    getDefaultValueForReturnType : function (component, returnType) {
        var _this = this;
        let storeObject = component.get("v.storeObject");
        let retValDefault; 
        switch (returnType) {
            case "Color" : retValDefault = bzchart.getStore (storeObject, "defaultColor") ; break;
            case "Value" : retValDefault = ""; break;
            case "Size" : retValDefault = bzchart.getStore (storeObject, "defaultSize"); break;
        }
        return retValDefault;
    },

    getStringValue : function (currentMeasureScheme, retrievedField, returnType) {
        var _this = this;
        var retrievedValue = retrievedField.retrievedValue;
        if (returnType == "Value") { // for Value just return the String Value in the relevant field
            return retrievedValue;
        }
        if (returnType == "Color") { // try to match with the value with the configured list, if not found return the default color
            var valueColor = currentMeasureScheme[retrievedValue];
            if (valueColor != null) {
                return valueColor;
            }

            var valueColorDefault = currentMeasureScheme["default"];
            if (valueColorDefault != null) {
                return valueColorDefault;
            }
            return _this.getDefaultValueForReturnType (component, "Color");    
        }
    },

    getFromMeasureScheme : function (component, ddata, returnType) {
        var _this = this;
        let storeObject = component.get("v.storeObject");

        // relevantMeasure is set on initialization of data in component and changed on color or size events.
        let relevantMeasure = bzchart.getStore (storeObject, "relevantMeasure"); 
        // deal with the case when there are no colors or sizes configured
        if (relevantMeasure == null || relevantMeasure == "bzDefault") { 
            return _this.getDefaultValueForReturnType (component, returnType);    
        }

        let objectType = ddata["objectType"];

        // deal with the case when there are no colors or sizes configured for the current object
        var measureObjectFieldMap = bzchart.getStore (storeObject, "measureObjectFieldMap");
        var currentMeasureObjectConfig = measureObjectFieldMap[relevantMeasure][objectType];

        if (currentMeasureObjectConfig == null) {
            return _this.getDefaultValueForReturnType (component, returnType);    
        }

        // from here on we can assume that there is some object configuration for this measure

        let sizeChangesColor =  currentMeasureObjectConfig["sizeChangesColor"];
        let latestSizeOrColor = bzchart.getStore (storeObject, "latestSizeOrColor"); 

        if (returnType == "Color" && !sizeChangesColor && latestSizeOrColor == "size") {
            relevantMeasure = bzchart.getStore (storeObject, "currentColorLabel"); 
            currentMeasureObjectConfig = measureObjectFieldMap[relevantMeasure][objectType];

            if (currentMeasureObjectConfig == null) {
                return _this.getDefaultValueForReturnType (component, returnType);    
            }
        }

        var currentMeasureScheme = currentMeasureObjectConfig["measureScheme"];
        var currentMeasureSchemeType = currentMeasureObjectConfig["measureSchemeType"];
        var fieldIndex = currentMeasureObjectConfig["fieldIndex"];
        let retrievedField = ddata.fields[fieldIndex];

        if (returnType == "Value" || returnType == "Size") {
            // bring the Decimal and Integer options into a single variable

            if (currentMeasureSchemeType == "StringValue") {
                return _this.getStringValue (currentMeasureScheme, retrievedField,  "Value");
            }

            if ((retrievedField.fieldType == "CURRENCY" || retrievedField.fieldType == "DECIMAL" || retrievedField.fieldType == "DOUBLE") && retrievedField.retrievedValue != null) {
                return retrievedField.retrievedValue;
            }

            if (retrievedField.fieldType == "INTEGER" && retrievedField.retrievedValue != null) {
                return retrievedField.retrievedValue;
            }
        }

        if (returnType == "Color" ) {
            // case when baseing colors and values on picklists (not currently relevant for sizes)
            if (currentMeasureSchemeType == "StringValue") {
                return _this.getStringValue (currentMeasureScheme, retrievedField, returnType);
            }

            // case when baseing colors and values on numerics

            // bring the Decimal and Integer options into a single variable
            var numericValue; 

            if ((retrievedField.fieldType == "CURRENCY" || retrievedField.fieldType == "DECIMAL" || retrievedField.fieldType == "DOUBLE") && retrievedField.retrievedValue != null) {
                numericValue = retrievedField.retrievedValue;
            }

            if (retrievedField.fieldType == "INTEGER" && retrievedField.retrievedValue != null) {
                numericValue = retrievedField.retrievedValue;
            }
    

            if (currentMeasureSchemeType == "ValueBand") {
                // check out the lowest level
                var low = currentMeasureScheme[0];
                if (numericValue < low.below) {
                    return low.color;
                } 
                else {
                    // if above the lowest threshhold go to the top and work backwards
                    var measureSchemeLength = currentMeasureScheme.length;
                    for (var k = measureSchemeLength - 1; k > 0; k--) {
                        var high = currentMeasureScheme[k];
                        if (numericValue >= high.above) {
                            return high.color;
                        }         
                    }
                }
            }

            if (currentMeasureSchemeType == "Scale") {
                var measureObjectScaleMap = bzchart.getStore (storeObject, "measureObjectScaleMap");  
                var currentMeasureObjectConfig = measureObjectScaleMap[relevantMeasure][objectType];
                return currentMeasureObjectConfig(numericValue) ;     
            }
        }
    }
})


    
