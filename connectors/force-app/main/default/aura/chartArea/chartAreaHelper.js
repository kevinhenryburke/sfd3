({

    // first method called after all resources are ready
    doneRenderLoad: function (component) {
        var _this = this;
        console.log("chartArea: doneRenderLoad enter");
        var componentReference = component.get("v.componentReference");

        bzutils.initializeCache (componentReference) ;

        bzutils.setCache (componentReference, "componentReference", component.get("v.componentReference") ) ;
        bzutils.setCache (componentReference, "componentType", component.get("v.componentType") ) ;
        bzutils.setCache (componentReference, "componentCategory", component.get("v.componentCategory") ) ;

        bzutils.setCache (componentReference, "UserComponentId", component.get("v.UserComponentId") ) ;
        bzutils.setCache (componentReference, "UserControllerComponentId", component.get("v.UserControllerComponentId") ) ;
        bzutils.setCache (componentReference, "hasPrimaryNode", component.get("v.hasPrimaryNode") ) ;
        bzutils.setCache (componentReference, "primaryNodeHighlightingOn", component.get("v.primaryNodeHighlightingOn") ) ;
        bzutils.setCache (componentReference, "primaryNodeHighlightingColour", component.get("v.primaryNodeHighlightingColour") ) ;
        bzutils.setCache (componentReference, "primaryNodeHighlightingRadius", component.get("v.primaryNodeHighlightingRadius") ) ;
        bzutils.setCache (componentReference, "retainNodeDetailsMouseOut", component.get("v.retainNodeDetailsMouseOut") ) ;
        bzutils.setCache (componentReference, "showPathToolTip", component.get("v.showPathToolTip") ) ;
        bzutils.setCache (componentReference, "nodestrokewidth", component.get("v.nodestrokewidth") ) ;
        bzutils.setCache (componentReference, "showLevels", component.get("v.showLevelsInitial")) ;

        bzutils.setCache (componentReference, "lastTouch", new Date().getTime()) ;
        bzutils.setCache (componentReference, "width", Math.min(screen.width, screen.height)) ; // review this
        bzutils.setCache (componentReference, "height", Math.min(screen.width, screen.height)) ; // review this

		var margin = {top: 20, right: 90, bottom: 30, left: 90}; // this should probably be flexi-ed too
		bzutils.setCache (componentReference, "margin", margin) ;  

        var flexiWidth = component.get("v.flexiWidth");
        console.log("flexiWidth: " + flexiWidth);

        if (flexiWidth == null) {
            // this is the case when not embedded in a Lightning Page - e.g. in aura preview
            flexiWidth = "MEDIUM";
            console.log("defaulting flexiWidth: " + flexiWidth);
        }

        if (flexiWidth == "SMALL")
        {
            // need to check all the numbers here
            bzutils.setCache (componentReference, "width", 420) ; 
            bzutils.setCache (componentReference, "height", 800) ;                 
        }

        if (flexiWidth == "MEDIUM")
        {
            // need to check all the numbers here
            bzutils.setCache (componentReference, "width", 600) ; 
            bzutils.setCache (componentReference, "height", 800) ;                 
        }

        if (flexiWidth == "LARGE")
        {
            // need to check all the numbers here
            bzutils.setCache (componentReference, "width", 1000) ; 
            bzutils.setCache (componentReference, "height", 800) ;                 
        }
        
        d3.select(bzutils.getDivId("chartArea", componentReference, true))
            .append("svg")
            .attr("id", bzutils.getDivId("svg", componentReference, false)) // If putting more than one chart on a page we need to provide unique ids for the svg elements   
            .attr("width", bzutils.getCache (componentReference, "width") )
            .attr("height", bzutils.getCache (componentReference, "height") );

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
        bzchart.publishEvent(componentReference, "ChartRendered", eventParameters);

        console.log("chartArea: doneRenderLoad exit");

    },

    // unsophisticated version is to remove everything and re-initialize
    refreshData: function (component, datajsonRefresh, currentMeasure, primaryNodeId, showFilters) {
        var _this = this;
        var componentReference = component.get("v.componentReference");
        console.log("chartArea: enter refreshData with primaryNodeId: " + primaryNodeId);

        // delete the paths and the groups
        // this is not the preferred option - would have preferred to use d3 joins.
        bzchart.clearChart(componentReference);
        
        // retrieve the existing underlying data
        var datajson = bzutils.getCache (componentReference, "datajson") ;

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

// cOME BACK
        // merge the old and the new data
        console.log("PreProcess data - not right yet - need to update this method to return nothing");
        bzutils.xfcr("dataPreProcess", componentReference, datajson, datajsonRefresh); // preprocessing of data (if any)

        datajson = bzutils.getCache (componentReference, "datajson") ;
        

        // re-initialize the chart
        var isInit = false;
        _this.initializeGroups(component, datajson, currentMeasure, primaryNodeId, showFilters, isInit);                 

        var cc = component.getConcreteComponent();
        cc.initializeVisuals();

        console.log("chartArea: exit refreshData");
    },    

	initializeGroups: function (component, datajson, currentMeasure, primaryNodeId, showFilters, isInit) {

        var _this = this;
        var componentReference = component.get("v.componentReference");
        var componentType = bzutils.getCache (componentReference, "componentType");

        console.log("chart: componentType: " + componentType);

        bzutils.setCache (componentReference, "hasNodes", bzutils.hasParam(componentType, "node") ) ;
        bzutils.setCache (componentReference, "hasPaths", bzutils.hasParam(componentType, "path") ) ;
        bzutils.setCache (componentReference, "hasText", bzutils.hasParam(componentType, "text") ) ;

        console.log("init:initializing initializeGroups with primaryNodeId: " + primaryNodeId);
        
        if (isInit) {
            bzutils.initializeAddComponentRef(componentReference, datajson);
        }

        bzutils.setCache (componentReference, "datajson", datajson ) ;

        var hasPrimaryNode = bzutils.getCache (componentReference, "hasPrimaryNode") ;
        if (hasPrimaryNode == true) {
            primaryNodeId = bzutils.addComponentRef(componentReference, primaryNodeId);
            bzutils.setCache (componentReference, "primaryNodeId", primaryNodeId ) ;
        }

        bzutils.setCache (componentReference, "currentMeasure", currentMeasure ) ;
        bzutils.setCache (componentReference, "showFilters", showFilters ) ;

		var svg = d3.select(bzutils.getDivId("svg", componentReference, true));
		
		console.log("svg is defined ... "); 
        
        // Styling of tooltips - see GitHub prior to Feb 24, 2018
        var pathToolTipDivId = bzutils.addComponentRef(componentReference, "pathToolTip");
        var pathToolTipDiv = d3.select("#" + pathToolTipDivId);
        bzutils.setCache (componentReference, "pathToolTipDiv", pathToolTipDiv ) ;

        console.log("create some groups inside the svg element to store the raw data");

        var pathGroupId = bzutils.getDivId("pathGroup", componentReference, false);
        bzutils.setCache (componentReference, "pathGroupId", pathGroupId ) ;
        var pathGroup = d3.select("#" + pathGroupId);
        if (pathGroup.empty()) {
            console.log("create pathGroup");
            pathGroup = svg.append("g").attr("id",pathGroupId);
        }
        bzutils.setCache (componentReference, "pathGroup", pathGroup ) ;

        var nodeGroupId = bzutils.getDivId("nodeGroup", componentReference, false);
        var nodeGroup = d3.select("#" + nodeGroupId);
        if (nodeGroup.empty()) {
            console.log("create nodeGroup");
            nodeGroup = svg.append("g").attr("id",nodeGroupId);
        }
        bzutils.setCache (componentReference, "nodeGroup", nodeGroup ) ;

        var textGroupId = bzutils.getDivId("textGroup", componentReference, false);        
        var textGroup = d3.select("#" + textGroupId);
        if (textGroup.empty()) {
            console.log("create textGroup");
            textGroup = svg.append("svg:g").attr("id",textGroupId);
        }
        bzutils.setCache (componentReference, "textGroup", textGroup ) ;

        // console.log("PreProcess data");
        // datajson = bzutils.xfcr("dataPreProcess", componentReference, datajson); // preprocessing of data (if any)

        // use the name convention from d3 tutorials (e.g. http://www.puzzlr.org/force-directed-graph-minimal-working-example/)
        // variables called simulation, node, path

        // Not used but an alternative way to get node / path values
        // var node = d3.select("#" + nodeGroupId).selectAll("circle")  ;
        // var path = d3.select("#" + pathGroupId).selectAll("path")  ;
        
	},
    
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



// TODO here's the d3 nodes .... all in a line ... not proper code!
/*
var mdata = [0,1,2,3,4,5,6];

svg.selectAll('.symbol')
   .data(mdata)
   .enter()
   .append('path')
   .attr('transform',function(d,i) { return 'translate('+(i*20+20)+','+30+')';})
   .attr('d', d3.symbol().type( function(d,i) { return d3.symbols[i];}) );
*/

})


    
