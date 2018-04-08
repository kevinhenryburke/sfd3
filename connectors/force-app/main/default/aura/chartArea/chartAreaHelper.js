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

        // merge the old and the new data
        var nodeIds = [];
        datajson.nodes.forEach(function(node) {
            nodeIds.push(node["id"]);
        });        

        datajsonRefresh.nodes.forEach(function(node) {
            var indexer = nodeIds.indexOf(node["id"]);       
            if (indexer == -1) {     
                datajson["nodes"].push(node);
            }
        });

        var linkIds = [];
        datajson.links.forEach(function(link) {
            linkIds.push(link["id"]);
        });        
        
        datajsonRefresh.links.forEach(function(link) {
            datajson["links"].push(link);
        });

        // re-initialize the chart
        var isInit = false;
        _this.initializeData(component, datajson, currentMeasure, primaryNodeId, showFilters, isInit);                 
        
        console.log("chartArea: exit refreshData");
    },    
    
    initializeData: function (component, datajson, currentMeasure, primaryNodeId, showFilters, isInit) {

        var _this = this;
        var componentReference = component.get("v.componentReference");

        console.log("init:initializing initializeData with primaryNodeId: " + primaryNodeId);
        
        if (isInit) {
            bzutils.initializeAddComponentRef(componentReference, datajson);
        }

        bzutils.setCache (componentReference, "datajson", datajson ) ;

        primaryNodeId = bzutils.addComponentRef(componentReference, primaryNodeId);

        bzutils.setCache (componentReference, "currentMeasure", currentMeasure ) ;
        bzutils.setCache (componentReference, "primaryNodeId", primaryNodeId ) ;
        bzutils.setCache (componentReference, "showFilters", showFilters ) ;

        var svg = d3.select(bzutils.getDivId("svg", componentReference, true));
        
        // Styling of tooltips - see GitHub prior to Feb 24, 2018
        var nodeToolTipDiv = d3.select("#nodeToolTip");
        var pathToolTipDivId = bzutils.addComponentRef(componentReference, "pathToolTip");
        var pathToolTipDiv = d3.select("#" + pathToolTipDivId);

        var isRefresh = false;
        
        console.log("create some groups inside the svg element to store the raw data");


        var pathGroupId = bzutils.getDivId("pathGroup", componentReference, false);
        var nodeGroupId = bzutils.getDivId("nodeGroup", componentReference, false);
        var textGroupId = bzutils.getDivId("textGroup", componentReference, false);
        
        var pathGroup = d3.select("#" + pathGroupId);
        if (pathGroup.empty()) {
            console.log("create pathGroup");
            pathGroup = svg.append("g").attr("id",pathGroupId);
        }

        var nodeGroup = d3.select("#" + nodeGroupId);
        if (nodeGroup.empty()) {
            console.log("create nodeGroup");
            nodeGroup = svg.append("g").attr("id",nodeGroupId);
        }

        var textGroup = d3.select("#" + textGroupId);
        if (textGroup.empty()) {
            console.log("create textGroup");
            textGroup = svg.append("svg:g").attr("id",textGroupId);
        }

        // if (datajson.nodes == null) {
        //     datajson["nodes"] = []; // if nodes is not populated we create with an empty array to standardize processing
        // }

        // if (datajson.links == null) {
        //     datajson["links"] = []; // if links is not populated we create with an empty array to standardize processing
        // }
        
        // Generic up to this point - variation starts to come in here ....

        // use the name convention from d3 tutorials (e.g. http://www.puzzlr.org/force-directed-graph-minimal-working-example/)
        // variables called simulation, node, path

// Not used but an alternative way to get node / path values
        // var node = d3.select("#" + nodeGroupId).selectAll("circle")  ;
        // var path = d3.select("#" + pathGroupId).selectAll("path")  ;
        
        console.log("calling nodes: nodeDataSetFunction");

        var componentType = bzutils.getCache (componentReference, "componentType");

        var nodeSelector = bzutils.xfct("nodeSelector", componentType); // an html selector for a class or element ids
        var nodeDataSetFunction = bzutils.xfcr("nodeDataSetFunction", componentReference); // an html selector for a class or element ids
        var nodeDataKeyFunction = bzutils.xfcr("nodeDataKeyFunction", componentReference); // an html selector for a class or element ids
        
        var nodeEnterSelection = nodeGroup
            .selectAll(nodeSelector)
            .data(nodeDataSetFunction(datajson), nodeDataKeyFunction)
            .enter();

//        nodeSelection.exit().remove();    

        var node = nodeEnterSelection     
            .append("circle")
            .attr("id", function(d) {
                return d.id;
            })
            // symbols...           .attr("d", d3.symbol().type( function(d) { return d3.symbols[4];}))
            .on('mouseout', function(d) { // hide the div
                var retainNodeDetailsMouseOut = bzutils.getCache (componentReference, "retainNodeDetailsMouseOut" ) ;
                if (!retainNodeDetailsMouseOut)
                {
                    bzutils.xfcr("nodeMouseout", componentReference, d); // an html selector for a class or element ids
                }
            })
            .on('mouseover', $A.getCallback(function(d) { // need getCallback to retain context - https://salesforce.stackexchange.com/questions/158422/a-get-for-application-event-is-undefined-or-can-only-fire-once
                bzutils.setCache (componentReference, "mouseoverRecordId", d.id ) ;
                bzutils.xfcr("nodeMouseover", componentReference, d); 
            }))
            .on('click', function(d) {
                console.log("retrieve info on whether isiOS");
                var isiOS = bzchart.isiOS;
                if (isiOS) {
                    var now = new Date().getTime();
                    var lastTouch = bzutils.getCache (componentReference, "lastTouch");
                    var delta = now - lastTouch;
                    if (delta < 350 && delta > 0) {
                        // the second touchend event happened within half a second. Here is where we invoke the double tap code
                        //TODO implement - e.g. var win = window.open("http://news.bbc.co.uk"); win.focus();
                    }
                    bzutils.setCache (componentReference, "lastTouch", lastTouch) ;
                } else {
                    console.log("not iOS");
                }
                // reset the clicked node to be the primary
                // TODO This will need to be passed in the refreshVisibility call.
                var primaryNodeId = d.id;
                bzutils.setCache (componentReference, "primaryNodeId", primaryNodeId ) ;

                bzutils.xfcr("refreshVisibility", componentReference); 
                bzutils.xfcr("styleNodes", componentReference); 
            })
            .on('dblclick', $A.getCallback(function(d) {
                console.log("dblclick");
                // Two options - complete refresh OR keep and get data from this point?
                // send a message identifying the node in question
                var componentReference = component.get("v.componentReference");
                var primaryNodeId = d.id;
                bzutils.setCache (componentReference, "primaryNodeId", primaryNodeId ) ;
                bzutils.xfcr("nodeDoubleClick", componentReference, primaryNodeId); 
            }));

        console.log("calling text");    
    
        var text = textGroup
            .selectAll("g")
            .data(datajson.nodes,  function(d, i) { return d.id;} )
            .enter().append("svg:g")
            .attr("class", "nodeText");

        // A copy of the text with a thick white stroke for legibility ("s" for shadow, "t" for text).
        text.append("svg:text")
            .attr("x", 8)
            .attr("y", ".31em")
            .attr("class", "shadow") // shadow class
            .attr("id", function(d) {
                return "s" + d.id;
            })
            .text(function(d) {
                return d.name;
            });

        text.append("svg:text")
            .attr("x", 8)
            .attr("y", ".31em")
            .attr("id", function(d) {
                return "t" + d.id;
            })
            .text(function(d) {
                return d.name;
            });

        console.log("calling paths");

        datajson.links.forEach(function(link) {
            var sourceElement = d3.select("#" + link.sourceid);
            var targetElement = d3.select("#" + link.targetid);
            link.source = sourceElement.datum();
            link.target = targetElement.datum();
        });
        
        var pathSelection = pathGroup
            .selectAll("path")
            .data(datajson.links,  function(d, i) { return d.id;} );

        var path = pathSelection    
            .enter().append("path")
            .attr("class", function(d) {
                return "link " + d.type;
            })
            .attr("stroke", function(d) {
                return d.stroke;
            })
            .attr("id", function(d) {
                return d.id;
            })
            .attr("sourceid", function(d) {
                return d.sourceid;
            })
            .attr("targetid", function(d) {
                return d.targetid;
            })
            .attr("marker-end", function(d) {
                return "url(#" + d.type + ")";
            })
            .on('mouseout', function(d) { // hide the div
                var showPathToolTip = bzutils.getCache (componentReference, "showPathToolTip"); 
                if (showPathToolTip) {
                    bzutils.xfcr("pathMouseout", componentReference, pathToolTipDiv); 
                }
            })
            .on('mouseover', $A.getCallback(function(d) { 
                var showPathToolTip = bzutils.getCache (componentReference, "showPathToolTip") ;
                console.log("showPathToolTip: " + showPathToolTip);
                if (showPathToolTip) {
                    bzutils.xfcr("pathMouseover", componentReference, d, path, pathToolTipDiv); 
                }
            }));

        // overwrite path with the updated version.
        path = d3.select("#" + pathGroupId).selectAll("path");
                
        console.log("apply node styling");
        bzutils.xfcr("styleNodes", componentReference); 

        console.log("apply node visibility");
        bzutils.xfcr("refreshVisibility", componentReference); 
    
        /* Above should be common to some degree - Below is forceSimulation specific */

        console.log("calling layout / simulation");

        // var forceNodes = {"nodes": [] };
        // var nodey4 = d3.select("#" + nodeGroupId).selectAll("circle")  
        // .each(function(d) {
        // // your update code here as it was in your example
        //     var d3this = d3.select(this) // Transform to d3 Object - THIS COULD BE MY ANSWER TO EVERYTHING
        //     forceNodes["nodes"].push(d3this);
        // });

        bzutils.xfcr("runSimulation", componentReference, path, node, text ); 
        
        bzutils.showCache (componentReference) ;
        
// GARBAGE AFTER HERE - experiments

/*
        //var nodeGroupId = chartSVGId + "nodeGroup";
        var nodey4 = d3.select("#" + nodeGroupId).selectAll("circle")  
        .each(function(d) {
        // your update code here as it was in your example
            var d3this = d3.select(this) // Transform to d3 Object - THIS COULD BE MY ANSWER TO EVERYTHING
            console.log("ThisNode");
            console.log(d);
            d3this.attr("testAttribute" , "yay");
        });

        var pathy4 = d3.select("#" + pathGroupId).selectAll("path")  
        .each(function(d) {
        // your update code here as it was in your example
            var d3this = d3.select(this) // Transform to d3 Object - THIS COULD BE MY ANSWER TO EVERYTHING
            console.log("ThisPath");
            console.log(d);
            d3this.attr("testAttribute" , "yay");
        });
*/        
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
    }    

})




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
