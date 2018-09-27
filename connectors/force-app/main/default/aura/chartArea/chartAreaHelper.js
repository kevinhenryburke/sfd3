({
    areaInit: function (component) {
        var _this = this;
        console.log("areaInit enter");

        var masterConfigObject = JSON.parse(component.get("v.masterConfig"));
        component.set("v.masterConfigObject", masterConfigObject);


        console.log("areaInit exit");
        
        
    },

    // first method called after all resources are ready
    doneRenderLoad: function (component) {
        var _this = this;
        console.log("chartArea: doneRenderLoad enter");
        var componentReference = component.get("v.componentReference");
        console.log("chartArea: doneRenderLoad: componentReference:" + componentReference);

        _this.initializeCache (component) ;

        _this.setCache (component, "component", component) ;
        _this.setCache (component, "componentReference", component.get("v.componentReference") ) ;
        _this.setCache (component, "componentType", component.get("v.componentType") ) ;
        _this.setCache (component, "componentCategory", component.get("v.componentCategory") ) ;
        _this.setCache (component, "componentEvent", component.getEvent("evt_bzc")) ;        
        _this.setCache (component, "defaultEventType", component.getEvent("defaultEventType")) ;        
        _this.setCache (component, "appEvents",  []) ;

        _this.setCache (component, "UserComponentId", component.get("v.UserComponentId") ) ;
        _this.setCache (component, "UserControllerComponentId", component.get("v.UserControllerComponentId") ) ;
        _this.setCache (component, "hasPrimaryNode", component.get("v.hasPrimaryNode") ) ;
        _this.setCache (component, "showLevels", component.get("v.showLevelsInitial")) ;

        _this.setCache (component, "lastTouch", new Date().getTime()) ;
        _this.setCache (component, "width", Math.min(screen.width, screen.height)) ; // review this
        _this.setCache (component, "height", Math.min(screen.width, screen.height)) ; // review this

		var margin = {top: 20, right: 90, bottom: 30, left: 50}; // this should probably be flexi-ed too
        _this.setCache (component, "margin", margin) ;  
        
        // Differing strategies for computing Width and Height
        // Width depends on width of the container

        var divComponent = component.find("container1"); // this should be ok as it's an internal search, need to prefix with a unique id is required outside of lightning context
        var divElement = divComponent.getElement();
        var clientWidth = divElement.clientWidth;        
        console.log("chartArea: set width: " + clientWidth);
        _this.setCache (component, "width", clientWidth) ; 

        // Height we hard code depending on the flexible page width 
        var flexiWidth = component.get("v.flexiWidth");
        console.log("flexiWidth: " + flexiWidth);

        if (flexiWidth == null) {
            // this is the case when not embedded in a Lightning Page - e.g. in aura preview
            flexiWidth = "MEDIUM";
            console.log("defaulting flexiWidth: " + flexiWidth);
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
        
        d3.select(bzutils.getDivId("chartArea", componentReference, true))
            .append("svg")
            .attr("id", bzutils.getDivId("svg", componentReference, false)) // If putting more than one chart on a page we need to provide unique ids for the svg elements   
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
        var appEvents = [];
        for (var i = 0; i < 100; i++) {
            appEvents.push($A.get("e.c:evt_sfd3"));
        }
        _this.setCache (component, "appEvents",  appEvents) ;

        console.log("chartArea: doneRenderLoad exit");

    },

    // unsophisticated version is to remove everything and re-initialize
    refreshData: function (component, datajsonRefresh, currentMeasure, primaryNodeId, showFilters) {
        var _this = this;
        var componentReference = component.get("v.componentReference");
        console.log("chartArea: enter refreshData with primaryNodeId: " + primaryNodeId);

        // delete the paths and the groups
        // this is not the preferred option - would have preferred to use d3 joins.
        _this.clearChart(componentReference);
        
        // retrieve the existing underlying data
        var datajson = _this.getCache (component, "datajson") ;

        // initialize the new raw data, setting component references
        bzutils.initializeAddComponentRef(componentReference, datajsonRefresh);

        var nodeIds = [];
        datajson.nodes.forEach(function(node) {
            nodeIds.push(node["id"]);
        });        

        datajsonRefresh.nodes.forEach(function(node) {
            var indexer = nodeIds.indexOf(node["id"]);       
            if (indexer == -1) {     
                datajson["nodes"].push(node); // this adds new nodes into datajson
            }
        });

        var linkIds = [];
        datajson.links.forEach(function(link) {
            linkIds.push(link["id"]);
        });        
        
        datajsonRefresh.links.forEach(function(link) {
            datajson["links"].push(link);
        });

        var cc = component.getConcreteComponent();

// cOME BACK
        // merge the old and the new data
        console.log("PreProcess data - not right yet - need to update this method to return nothing");
//        bzutils.xfcr("dataPreProcess", componentReference, datajson, datajsonRefresh); // preprocessing of data (if any)
        cc.dataPreprocess(datajson, datajsonRefresh);

        datajson = _this.getCache (component, "datajson") ;
        
        // re-initialize the chart
        var isInit = false;
        _this.initializeGroups(component, datajson, currentMeasure, primaryNodeId, showFilters, isInit);                 

        cc.initializeVisuals();

        console.log("chartArea: exit refreshData");
    },    

	initializeGroups: function (component, datajson, currentMeasure, primaryNodeId, showFilters, isInit) {

        var _this = this;
        var componentReference = component.get("v.componentReference");
        var componentType = _this.getCache (component, "componentType");

        console.log("init:initializing initializeGroups with primaryNodeId: " + primaryNodeId);
        
        if (isInit) {
            bzutils.initializeAddComponentRef(componentReference, datajson);
        }

        _this.setCache (component, "datajson", datajson ) ;

        var hasPrimaryNode = _this.getCache (component, "hasPrimaryNode") ;
        // var hasPrimaryNode = component.get("v.hasPrimaryNode") ;
        if (hasPrimaryNode == true) {
            console.log("hasPrimaryNode true");
            console.log("hasPrimaryNode id: " + primaryNodeId);
            primaryNodeId = bzutils.addComponentRef(componentReference, primaryNodeId);
            _this.setCache (component, "primaryNodeId", primaryNodeId ) ;
        }
        else {
            console.log("hasPrimaryNode false");
        }

        _this.setStore(component, "currentMeasure", currentMeasure);
        _this.setCache (component, "currentMeasure", currentMeasure ) ;
        _this.setCache (component, "showFilters", showFilters ) ;

		var svg = d3.select(bzutils.getDivId("svg", componentReference, true));
		
		console.log("svg is defined ... "); 
        
        // Styling of tooltips - see GitHub prior to Feb 24, 2018
        var pathToolTipDivId = bzutils.addComponentRef(componentReference, "pathToolTip");
        var pathToolTipDiv = d3.select("#" + pathToolTipDivId);
        _this.setCache (component, "pathToolTipDiv", pathToolTipDiv ) ;

        console.log("create some groups inside the svg element to store the raw data");

        var pathGroupId = bzutils.getDivId("pathGroup", componentReference, false);
        _this.setCache (component, "pathGroupId", pathGroupId ) ;
        var pathGroup = d3.select("#" + pathGroupId);
        if (pathGroup.empty()) {
            console.log("create pathGroup");
            pathGroup = svg.append("g").attr("id",pathGroupId);
        }
        _this.setCache (component, "pathGroup", pathGroup ) ;

        var nodeGroupId = bzutils.getDivId("nodeGroup", componentReference, false);
        var nodeGroup = d3.select("#" + nodeGroupId);
        if (nodeGroup.empty()) {
            console.log("create nodeGroup");
            nodeGroup = svg.append("g").attr("id",nodeGroupId);
        }
        _this.setCache (component, "nodeGroup", nodeGroup ) ;

        var textGroupId = bzutils.getDivId("textGroup", componentReference, false);        
        var textGroup = d3.select("#" + textGroupId);
        if (textGroup.empty()) {
            console.log("create textGroup");
            textGroup = svg.append("svg:g").attr("id",textGroupId);
        }
        _this.setCache (component, "textGroup", textGroup ) ;

        var allowPopover = component.get("v.allowPopover");

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
                var cardFields = component.get("v.cardFields");
                var objectIcons = component.get("v.objectIcons");

                $A.createComponent(
                    "c:panelDisplay",
                    {
                        "Controller" : "Top", // TODO is this really ok to hardcode? Should it be same as hosting component's controller?
                        "cardFields" : cardFields,
                        "objectIcons" : objectIcons,
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
        bzutils.log("helper: handleScaleChange enter");
        component.set("v.ChartScaleFactor", csf);
        var cc = component.getConcreteComponent();
        cc.reScale(csf);                 
    },

    // TODO function appears in many places, try to consolidate
    publishPreppedEvent : function(component,preppedEvent){
        var _this = this;
        if (preppedEvent != null) {
            var event;
            console.log("publishPreppedEvent: enter "+ preppedEvent.topic + " and " + preppedEvent.eventType);

            if (preppedEvent.eventType != null) {
                // go with preset value
                console.log("publishPreppedEvent: override eventType: " + preppedEvent.eventType);
            }
            else {
                preppedEvent.eventType = component.get("v.defaultEventType");
                console.log("publishPreppedEvent: use default eventType: " + preppedEvent.eventType);
            }

            if (preppedEvent.eventType == "Component"){
                console.log("publishPreppedEvent: eventType used will be: " +  preppedEvent.eventType);
                event = component.getEvent("evt_bzc");
            }
            if (preppedEvent.eventType == "Application"){
                console.log("publishPreppedEvent: eventType used will be: " +  preppedEvent.eventType);
                event = $A.get("e.c:evt_sfd3");
            }
            if (preppedEvent.eventType == "Cache"){
                console.log("publishPreppedEvent: eventType used will be: " +  preppedEvent.eventType);
                var componentReference = component.get("v.componentReference");
                var appEvents = _this.getCache (component, "appEvents") ;
                event = appEvents.pop();
            }    
            bzutils.publishEventHelper(event, preppedEvent.topic, preppedEvent.parameters, preppedEvent.controllerId);     
        }
    },

    restockCache : function(component) {
        var _this = this;
        console.log("chartArea: restockCache enter:");
        var componentReference = component.get("v.componentReference");

        // reset cache of events for mouseover events to publish - may be a better way to do this!
        // the issue is that only the top orginally created nodes have lightning context, not sure why
        // alternative would be to pass in a parameter for these nodes and push events only when the attribute is set

        var appEvents = _this.getCache (component, "appEvents") ;
        console.log("chartArea: push a new cache event length = " + appEvents.length);

        if (appEvents.length < 200) { // keep a cap on number of cached events
            for (var i = 0; i < 100; i++) {

                var defaultEventType = component.get("v.defaultEventType");
                var appEvent;
            
                if (defaultEventType == "Application") {
                    console.log("chartArea: push a new cache event Application");
                    appEvent = $A.get("e.c:evt_sfd3");
                } 
                else {
                    console.log("chartArea: push a new cache event Component");
                    appEvent = component.getEvent("evt_bzc");
//                    appEvent = $A.get("e.c:evt_sfd3");
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

        var allowPopover = component.get("v.allowPopover");

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
        console.log("store: " + store);
        store[key] = value;
    },
    
    getStore : function (component, key) {
        var store = component.get("v.storeObject");
        return store[key];
    },

    getMasterParam : function (component /*, args */) {
        console.log("getMasterParam enter");
        var args = Array.prototype.slice.call(arguments, 1);
        var retValue = null;
        var loopJson = component.get("v.masterConfigObject");
        for (var i=0; i<args.length;i++) {
            if (loopJson.hasOwnProperty([args[i]])) {
                console.log("loopJson: " + args[i]);
                retValue = loopJson[args[i]];
                loopJson = loopJson[args[i]];
            }
            else {
                return;
            }    
        }
        console.log("getMasterParam exit: " + retValue);
        return retValue;
    },
    
    hasMasterParam : function (component /*, args */) {
        var args = Array.prototype.slice.call(arguments, 1);
        var loopJson = component.get("v.masterConfigObject");
        var lastQueriedItem = "";
        for (var i=0; i<args.length;i++) {
            if (loopJson.hasOwnProperty([args[i]])) {
                console.log("loopJson: " + args[i]);
                loopJson = loopJson[args[i]];
                lastQueriedItem = args[i];
            }
            else {
                console.log("hasMasterParam exit: false");
                return false;
            }    
        }
        console.log("hasMasterParam exit: true: " + lastQueriedItem);
        return true;
    },

    prepareEvent : function (component, topic, parameters) {
        console.log("chartAreaHelper.prepareEvent enter");
        var _this = this;
        var componentReference = component.get("v.componentReference");
        var controllerId = _this.getCache (component, "UserControllerComponentId") ;
        var eventType = bzutils.getEventTypeByTopic(topic);
        return {
            "eventType" : eventType ,
            "topic" : topic,
            "parameters" : parameters,
            "controllerId" : controllerId
        }
    },

    setFilterVisibility : function (component, filterType, isShown) {
        console.log("chartAreaHelper.setFilterVisibility enter");
        var _this = this;
        var componentReference = component.get("v.componentReference");
        var showFilters = _this.getCache (component, "showFilters") ;
        if (isShown) {
            console.log("setFilterVisibility: adding " + filterType);
            showFilters.push(filterType);
        } else {
            console.log("setFilterVisibility: removing " + filterType);
            var index = showFilters.indexOf(filterType);
            if (index > -1) {
                showFilters.splice(index, 1);
            }
        }
        _this.setCache (component, "showFilters", showFilters ) ;
        console.log("chartAreaHelper.setFilterVisibility exit");
    },
    
    clearChart : function (componentReference) {
        console.log("chartAreaHelper.clearChart enter "); 
        var svg = d3.select(bzutils.getDivId("svg", componentReference, true));
        var path = svg.selectAll("path").remove();
        var node = svg.selectAll("circle").remove();
        var text = svg.selectAll(".nodeText").remove();
        d3.select(bzutils.getDivId("pathGroup", componentReference, true)).remove();
        d3.select(bzutils.getDivId("nodeGroup", componentReference, true)).remove();
        d3.select(bzutils.getDivId("textGroup", componentReference, true)).remove();
        console.log("chartAreaHelper.clearChart exit "); 
    },

    initializeCache : function (component) {
        component.set("v.TESTCACHE", {});        
    },    

    setCache : function (component, key, value) {
        component.get("v.TESTCACHE")[key] = value;        
    },
    
    getCache : function (component, key) {
        return component.get("v.TESTCACHE")[key];        
    },
    
    hasCache : function (component, key) {
        console.log("chartAreaHelper.hasCache");
        var allkeys = component.get("v.TESTCACHE");
        return Object.keys(allkeys).includes(key);
    },
        
        

})


    
