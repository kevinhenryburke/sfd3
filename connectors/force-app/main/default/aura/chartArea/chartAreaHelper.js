({
    areaInit: function (component) {
        console.log("areaInit enter");
    },

    // first method called after all resources are ready
    doneRenderLoad: function (component) {
        var _this = this;
        var componentReference = component.get("v.componentReference");
        console.log("chartArea: doneRenderLoad: componentReference:" + componentReference);

        _this.initializeCache (component) ;

        _this.setCache (component, "componentReference", component.get("v.componentReference") ) ;
        _this.setCache (component, "componentType", component.get("v.componentType") ) ;
        _this.setCache (component, "componentCategory", component.get("v.componentCategory") ) ;
        _this.setCache (component, "componentEvent", component.getEvent("evt_bzc")) ;        
        _this.setCache (component, "defaultEventType", component.getEvent("defaultEventType")) ;        
        _this.setCache (component, "appEvents",  []) ;

        _this.setCache (component, "UserComponentId", component.get("v.UserComponentId") ) ;
        _this.setCache (component, "UserControllerComponentId", component.get("v.UserControllerComponentId") ) ;
        _this.setCache (component, "hasPrimaryNode", component.get("v.hasPrimaryNode") ) ;

        _this.setCache (component, "lastTouch", new Date().getTime()) ;
        _this.setCache (component, "width", Math.min(screen.width, screen.height)) ; // review this
        _this.setCache (component, "height", Math.min(screen.width, screen.height)) ; // review this

        _this.setCache(component, "filtersConfigured", false);

		var margin = {top: 20, right: 90, bottom: 30, left: 50}; // this should probably be flexi-ed too
        _this.setCache (component, "margin", margin) ;  
        
        // Differing strategies for computing Width and Height
        // Width depends on width of the container

        var divComponent = component.find("container1"); // this should be ok as it's an internal search, need to prefix with a unique id is required outside of lightning context
        var divElement = divComponent.getElement();
        var clientWidth = divElement.clientWidth;        
        _this.setCache (component, "width", clientWidth) ; 

        // Height we hard code depending on the flexible page width 
        var flexiWidth = component.get("v.flexiWidth");

        if (flexiWidth == null) {
            // this is the case when not embedded in a Lightning Page - e.g. in aura preview
            flexiWidth = "MEDIUM";
        }

        if (flexiWidth == "SMALL")
        {
            _this.setCache (component, "height", 800) ;                 
        }

        if (flexiWidth == "MEDIUM")
        {
            _this.setCache (component, "height", 800) ;                 
        }

        if (flexiWidth == "LARGE")
        {
            _this.setCache (component, "height", 1000) ;                 
        }
        
        d3.select(_this.getDivId("chartArea", componentReference, true))
            .append("svg")
            .attr("id", _this.getDivId("svg", componentReference, false)) // If putting more than one chart on a page we need to provide unique ids for the svg elements   
            .attr("width", _this.getCache (component, "width") )
            .attr("height", _this.getCache (component, "height") );

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
        _this.setCache (component, "appEvents",  []) ;
        _this.restockCache(component);

    },

	initializeGroups: function (component, datajson, primaryNodeId, showFilters, isInit) {

        var _this = this;
        var componentReference = component.get("v.componentReference");

        console.log("init:initializing initializeGroups with primaryNodeId: " + primaryNodeId);
        
        if (isInit) {
            _this.initializeAddComponentRef(componentReference, datajson);
        }

        _this.setCache (component, "datajson", datajson ) ;

        var hasPrimaryNode = _this.getCache (component, "hasPrimaryNode") ;
        // var hasPrimaryNode = component.get("v.hasPrimaryNode") ;
        if (hasPrimaryNode == true) {
            primaryNodeId = _this.addComponentRef(componentReference, primaryNodeId);
            _this.setCache (component, "primaryNodeId", primaryNodeId ) ;
        }
        else {
            console.log("hasPrimaryNode false");
        }

        if (showFilters != null) {
            _this.setCache (component, "filterValues", showFilters.filterValues ) ;
            _this.setCache (component, "filterAPIField", showFilters.filterAPIField ) ;
        }
        else {
            _this.setCache (component, "filterValues", [] ) ;
        }

		var svg = d3.select(_this.getDivId("svg", componentReference, true));
		        
        // Styling of tooltips - see GitHub prior to Feb 24, 2018
        var pathToolTipDivId = _this.addComponentRef(componentReference, "pathToolTip");
        var pathToolTipDiv = d3.select("#" + pathToolTipDivId);
        _this.setCache (component, "pathToolTipDiv", pathToolTipDiv ) ;

        // create some groups inside the svg element to store the raw data

        var pathGroupId = _this.getDivId("pathGroup", componentReference, false);
        _this.setCache (component, "pathGroupId", pathGroupId ) ;
        var pathGroup = d3.select("#" + pathGroupId);
        if (pathGroup.empty()) {
            console.log("create pathGroup");
            pathGroup = svg.append("g").attr("id",pathGroupId);
        }
        _this.setCache (component, "pathGroup", pathGroup ) ;

        var nodeGroupId = _this.getDivId("nodeGroup", componentReference, false);
        var nodeGroup = d3.select("#" + nodeGroupId);
        if (nodeGroup.empty()) {
            console.log("create nodeGroup");
            nodeGroup = svg.append("g").attr("id",nodeGroupId);
        }
        _this.setCache (component, "nodeGroup", nodeGroup ) ;

        var textGroupId = _this.getDivId("textGroup", componentReference, false);        
        var textGroup = d3.select("#" + textGroupId);
        if (textGroup.empty()) {
            console.log("create textGroup");
            textGroup = svg.append("svg:g").attr("id",textGroupId);
        }
        _this.setCache (component, "textGroup", textGroup ) ;

        var legendSymbolGroupId = _this.getDivId("legendSymbolGroup", componentReference, false);
        var legendSymbolGroup = d3.select("#" + legendSymbolGroupId);
        if (legendSymbolGroup.empty()) {
            console.log("create legendSymbolGroup");
            legendSymbolGroup = svg.append("g").attr("id",legendSymbolGroupId);
        }
        _this.setCache (component, "legendSymbolGroup", legendSymbolGroup ) ;

        var allowPopover = _this.getMasterParam(component,"panels","InfoPanel","allowPopover");         
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
        var componentReference = component.get("v.componentReference");

        var mdata = [0]; // random data value, not used

        var width = _this.getCache (component, "width");
        var popx = width - 10;
        var popy = 200;

        var svg = d3.select(_this.getDivId("svg", componentReference, true));
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

        _this.setCache (component, "referenceSelector", referenceSelector ) ;
        _this.setCache (component, "infosvg", infosvg ) ;
    },



    // creates an informational popover
    createPopOverComponent : function (component) {
        var _this = this;

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
                        
                        var referenceSelector = _this.getCache (component, "referenceSelector");
                        console.log("createPopOverComponent: createComponent callback: " + referenceSelector);
                        if (status === "SUCCESS") {
                            console.log("createPopOverComponent: createComponent callback: SUCCESS: " );

                            var modalPromise = overlayLibElement.showCustomPopover({
                                body: newComponent,
                                referenceSelector: referenceSelector,
                                // cssClass: "slds-hide,popoverclass,slds-popover,slds-popover_panel,slds-nubbin_left,no-pointer,cPopoverTest"
                                cssClass: "popoverclass,slds-popover,slds-popover_panel,no-pointer,cChartArea"
                            });
                            component.set("v.modalPromise", modalPromise);  
                            modalPromise.then(function (overlay) {
                                overlay.show();  
                                _this.setCache (component, "overlay", overlay) ; 
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
        component.set("v.ChartScaleFactor", csf);
        var cc = component.getConcreteComponent();
        cc.reScale(csf);                 
    },

    // TODO function appears in many places, try to consolidate
    publishPreppedEvent : function(component,preppedEvent){
        var _this = this;
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
                var appEvents = _this.getCache (component, "appEvents") ;
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

        var appEvents = _this.getCache (component, "appEvents") ;

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
            _this.setCache (component, "appEvents",  appEvents) ;
        }
    }, 

    /*
     Note - popover component is not in the component hierarchy so needs to be invoked directly, 
     not via a component event which is till not recognize
    */

    updatePopoverDirectly : function(component, preppedEvent) {
        var _this = this;
        console.log("chartArea: updatePopoverDirectly enter");

        var allowPopover = _this.getMasterParam(component,"panels","InfoPanel","allowPopover");         
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
    
    setStore : function (component, key, value) {
        var store = component.get("v.storeObject");
        store[key] = value;
    },
    
    getStore : function (component, key) {
        var store = component.get("v.storeObject");
        return store[key];
    },

    getMasterParam : function (component /*, args */) {
        var args = Array.prototype.slice.call(arguments, 1);
        var retValue = null;
        var loopJson = component.get("v.masterConfigObject");
        for (var i=0; i<args.length;i++) {
            if (loopJson.hasOwnProperty([args[i]])) {
                retValue = loopJson[args[i]];
                loopJson = loopJson[args[i]];
            }
            else {
                return;
            }    
        }
        return retValue;
    },
    
    hasMasterParam : function (component /*, args */) {
        var args = Array.prototype.slice.call(arguments, 1);
        var loopJson = component.get("v.masterConfigObject");
        var lastQueriedItem = "";
        for (var i=0; i<args.length;i++) {
            if (loopJson.hasOwnProperty([args[i]])) {
                loopJson = loopJson[args[i]];
                lastQueriedItem = args[i];
            }
            else {
                return false;
            }    
        }
        return true;
    },

    prepareEvent : function (component, topic, parameters) {
        var _this = this;
        var controllerId = _this.getCache (component, "UserControllerComponentId") ;
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
        var filterValues = _this.getCache (component, "filterValues") ;
        if (filterState == "Show") {
            filterValues.push(filterType);
        } else {
            var index = filterValues.indexOf(filterType);
            if (index > -1) {
                filterValues.splice(index, 1);
            }
        }
        _this.setCache (component, "filterValues", filterValues ) ;
    },
    
    clearChart : function (componentReference) {
        var _this = this;
        var svg = d3.select(_this.getDivId("svg", componentReference, true));
        var path = svg.selectAll("path").remove();
        var node = svg.selectAll("circle").remove();
        var text = svg.selectAll(".nodeText").remove();
        d3.select(_this.getDivId("pathGroup", componentReference, true)).remove();
        d3.select(_this.getDivId("nodeGroup", componentReference, true)).remove();
        d3.select(_this.getDivId("textGroup", componentReference, true)).remove();
        d3.select(_this.getDivId("legendSymbolGroup", componentReference, true)).remove();
        
    },

    initializeCache : function (component) {
        component.set("v.cacheObject", {});        
    },    

    setCache : function (component, key, value) {
        component.get("v.cacheObject")[key] = value;        
    },
    
    getCache : function (component, key) {
        return component.get("v.cacheObject")[key];        
    },
    
    hasCache : function (component, key) {
        var allkeys = component.get("v.cacheObject");
        return Object.keys(allkeys).includes(key);
    },

    // replace ids with component specific versions - this will allow multiple charts on a page without conflict
    initializeAddComponentRef : function (componentReference, datajson) {
        var _this = this;
        if (datajson.nodes != null) {
        datajson.nodes.forEach(function(node) {
            node["id"] = _this.addComponentRef(componentReference, node["id"]);
            node["recordid"] = _this.removeComponentRef(componentReference, node["id"]);
        })};
            
        if (datajson.links != null) {
        datajson.links.forEach(function(link) {
            link["id"] = _this.addComponentRef(componentReference, link["id"]);
            link["sourceid"] = _this.addComponentRef(componentReference, link["sourceid"]);
            link["targetid"] = _this.addComponentRef(componentReference, link["targetid"]);
        })};
    },    
    
    addComponentRef : function(componentReference, recordid) {
        if (recordid.indexOf("compref") > -1) { // don't double index  
            console.log("avoiding a double compref for recordid " + recordid);
            return recordid;
        }
        return componentReference + recordid;
    },
    
    // remove component specific prefix from id - this will allow original references to be retrieved
    removeComponentRef : function(componentReference, recordidEnriched) {
        if (recordidEnriched.indexOf("compref") > -1) { // compref present
            var indexer = componentReference.length;
            return recordidEnriched.substring(indexer);
        }
        return recordidEnriched;
    },   
    
    // handy function to retrieve a D3 Node from a DOM id
    getNodeFromId : function (id) {
        return d3.select("#" + id).data()[0];
    },

    getDivId : function (idType, componentReference, forSelect) {
        return (forSelect ? "#" : "") + componentReference + idType;
    },
    

    // during initialization, build a map so we can quickly associate the correct API field to a measure
    buildMeasureSchemeMap : function (component) {
        var _this = this;
        var objectLevels = _this.getMasterParam(component,"data","queryJSON","objectLevels");

        // storage optimized for node colors
        var measureObjectFieldMap = {};
        // storage optimized for legend table
        var measureArrayObjectFieldMap = {};

        for (var objIndex = 0; objIndex < objectLevels.length; objIndex++) {
            var thisObjectConfig = objectLevels[objIndex];
            var objectType = thisObjectConfig.objectType;

            var fields = thisObjectConfig.fields;
            for (var fieldIndex = 0; fieldIndex < fields.length; fieldIndex++) {
                var fieldConfig = fields[fieldIndex];
                if (fieldConfig["measureName"] != null) {

                    var measureName = fieldConfig["measureName"] ;
                    var currentApiName = fieldConfig["api"]; 
                    var measureScheme = fieldConfig["measureScheme"]; 
                    var measureSchemeType = fieldConfig["measureSchemeType"]; 

                    if (measureObjectFieldMap[measureName] == null) {
                        var measureLevel = {};
                        measureLevel[objectType] = {"measureScheme" : measureScheme, "measureSchemeType" : measureSchemeType , "fieldAPI" : currentApiName, "fieldIndex" : fieldIndex};
                        measureObjectFieldMap[measureName] = measureLevel;

                        measureArrayObjectFieldMap[measureName] = [{"measureScheme" : measureScheme, "measureSchemeType" : measureSchemeType , "fieldAPI" : currentApiName, "fieldIndex" : fieldIndex, "objectType" : objectType}];

                    }
                    else {
                        var measureLevel = measureObjectFieldMap[measureName]; 
                        measureLevel[objectType] = {"measureScheme" : measureScheme, "measureSchemeType" : measureSchemeType, "fieldAPI" : currentApiName, "fieldIndex" : fieldIndex };

                        measureArrayObjectFieldMap[measureName].push({"measureScheme" : measureScheme, "measureSchemeType" : measureSchemeType , "fieldAPI" : currentApiName, "fieldIndex" : fieldIndex, "objectType" : objectType});

                    }
                }
            }
        }
        _this.setStore(component, "measureObjectFieldMap", measureObjectFieldMap);
        _this.setStore(component, "measureArrayObjectFieldMap", measureArrayObjectFieldMap);
    },

    showColorSchemeLegend : function (component) {
        var _this = this;
        var componentReference = component.get("v.componentReference");
        var currentMeasure = _this.getStore(component, "currentMeasure");

        var firstMeasureScheme = _this.getFirstMeasureScheme(component, currentMeasure);

        // remove existing legend symbols
        d3.select(_this.getDivId("legendSymbolGroup", componentReference, true)).selectAll("*").remove();

        var legendSymbolGroup = _this.getCache (component, "legendSymbolGroup" ) ;

        
        var ms = firstMeasureScheme.measureScheme;
        var baseDataArray;

        /*  Measure Scheme is an array in complex cases (value ranges) but is an object with name/value in others
            We need to baseline our nodes on an array, hence the below
        */

        if (firstMeasureScheme["measureSchemeType"] == "ValueBand" || firstMeasureScheme["measureSchemeType"] == "Scale") {
            baseDataArray = ms;
        }
        else {
            baseDataArray = Object.keys(ms);
        }
    
        var nodeSymbol = legendSymbolGroup.selectAll('.symbol')
            .data(baseDataArray);

        nodeSymbol
            .enter()
            .append('path')
            .style("stroke" , "black")
            .style("fill" , function(d,i) {return getLegendItemColor (ms, d, i);})
            .attr('transform',function(d,i) { return 'translate('+30+','+(i*20+30)+')';})
            .attr('d', d3.symbol().type( function(d,i) { return d3.symbols[0];}) );

        var textme = legendSymbolGroup.selectAll("textme")
            .data(baseDataArray)
            .enter()
            .append("text");            

        var textLabels = textme
            .attr('transform',function(d,i) { return 'translate('+40+','+(i*20+33)+')';})
            .attr("font-family", "sans-serif")
            .text( function(d,i) {return getLegendItemName (ms, d, i);})
            .attr("font-size", "8px")
            .attr("fill", "gray");

        var measureArray = [ currentMeasure ];

        var measureText = legendSymbolGroup.selectAll("textme")
            .data(measureArray)
            .enter()
            .append("text")
            .attr('transform',function(d,i) { return 'translate('+20+','+13+')';})
            .text( function (d, i) {return "Color Scheme: " + d;})
            .attr("font-size", "8px")
            .attr("fill", "black");


        function getLegendItemColor(ms, d, i) {
            if (Array.isArray(ms)) {
                return ms[i]["color"];
            }
            else return ms[d];
        }

        function getLegendItemName(ms, d, i) {
            if (Array.isArray(ms)) {
                if (ms[i]["below"] != null) {
                    return "below " + ms[i]["below"].toLocaleString();
                }
                if (ms[i]["above"] != null) {
                    return "above " + ms[i]["above"].toLocaleString();
                }
            }
            else return d;
        }
            

    },

    getFirstMeasureScheme : function (component, currentMeasure) {
        var _this = this;

        var measureArrayObjectFieldMap = _this.getStore(component, "measureArrayObjectFieldMap");
        if (measureArrayObjectFieldMap[currentMeasure] != null) {
            return measureArrayObjectFieldMap[currentMeasure][0];
        }
        else {
            return null;
        }
    },

    // returnType is either "Value" or "Color"
    getFromMeasureScheme : function (component, o, currentMeasure, returnType) {
        var _this = this;

        var measureObjectFieldMap = _this.getStore(component, "measureObjectFieldMap");
        var objectType = o["objectType"];

        var currentMeasureObjectConfig = measureObjectFieldMap[currentMeasure][objectType];

        if (currentMeasureObjectConfig == null) {
            return;
        }

        var currentMeasureScheme = currentMeasureObjectConfig["measureScheme"];
        var currentMeasureSchemeType = currentMeasureObjectConfig["measureSchemeType"];
        var fieldIndex = currentMeasureObjectConfig["fieldIndex"];

        var thisMeasureSchemeIndex = fieldIndex;

        // case when baseing colors and values on picklists
        if (currentMeasureSchemeType == "StringValue") {
            var retrievedValue = o.fields[thisMeasureSchemeIndex].retrievedValue;

            if (returnType == "Value") {
                return retrievedValue;
            }
            if (returnType == "Color") {
                var valueColor = currentMeasureScheme[retrievedValue];
                if (valueColor != null) {
                    return valueColor;
                }
                var valueColorDefault = currentMeasureScheme["default"];
                if (valueColorDefault != null) {
                    return valueColorDefault;
                }
                return "white";
            }
        }

        // case when baseing colors and values on numerics
        var numericValue;
        var retrievedDecimal = o.fields[thisMeasureSchemeIndex].retrievedDecimal;

        if (retrievedDecimal != null) {
            numericValue = retrievedDecimal;
        } 
        else {
            numericValue = o.fields[thisMeasureSchemeIndex].retrievedInteger;
        }

        if (returnType == "Value") {
            return numericValue;
        }

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
    },



    getFilterOpacity : function (component, d) {
        var _this = this;
        if (_this.isFilteredOut(component,d)) {
            return 0.1;
        }
        return 1;
    },

    isFilteredOut : function (component, d) {
        var _this = this;

        // if there are no filters configured then we're good to go.

        var filtersConfigured = _this.getCache(component, "filtersConfigured");
        if (filtersConfigured == false) {
            return false;
        } 

        var filterAPIField = _this.getCache (component, "filterAPIField");     
        var recordValue;

        for (var i = 0; i < d.fields.length; i++) {
            if (d.fields[i].api == filterAPIField) {
                recordValue = d.fields[i].retrievedValue;
                break;
            }
        }

        var filterValues = _this.getCache (component, "filterValues");    
        
        if (!filterValues.includes(recordValue)) {
            return true;
        }
        return false;

    }




        

})


    
