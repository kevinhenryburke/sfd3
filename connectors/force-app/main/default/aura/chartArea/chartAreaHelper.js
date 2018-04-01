({

    // first method called after all resources are ready
    doneRenderLoad: function (component) {
        var _this = this;
        console.log("chartArea: doneRenderLoad enter");
        var componentReference = component.get("v.componentReference");

        berlioz.utils.initializeCache (componentReference) ;

        berlioz.utils.setCache (componentReference, "componentReference", component.get("v.componentReference") ) ;
        berlioz.utils.setCache (componentReference, "componentType", component.get("v.componentType") ) ;

        berlioz.utils.setCache (componentReference, "UserComponentId", component.get("v.UserComponentId") ) ;
        berlioz.utils.setCache (componentReference, "UserControllerComponentId", component.get("v.UserControllerComponentId") ) ;
        berlioz.utils.setCache (componentReference, "primaryNodeHighlightingOn", component.get("v.primaryNodeHighlightingOn") ) ;
        berlioz.utils.setCache (componentReference, "primaryNodeHighlightingColour", component.get("v.primaryNodeHighlightingColour") ) ;
        berlioz.utils.setCache (componentReference, "primaryNodeHighlightingRadius", component.get("v.primaryNodeHighlightingRadius") ) ;
        berlioz.utils.setCache (componentReference, "retainNodeDetailsMouseOut", component.get("v.retainNodeDetailsMouseOut") ) ;
        berlioz.utils.setCache (componentReference, "showPathToolTip", component.get("v.showPathToolTip") ) ;
        berlioz.utils.setCache (componentReference, "nodestrokewidth", component.get("v.nodestrokewidth") ) ;

        var width = Math.min(screen.width, screen.height);
        var height = Math.min(screen.width, screen.height);

        var flexiWidth = component.get("v.flexiWidth");
        console.log("flexiWidth: " + flexiWidth);

        if (flexiWidth == null) {
            // this is the case when not embedded in a Lightning Page - e.g. in aura preview
            flexiWidth = "MEDIUM";
            console.log("defaulting flexiWidth: " + flexiWidth);
        }

        if (flexiWidth == "SMALL")
        {
            // TEMP
            width = 420;
            height = 800;
        }

        if (flexiWidth == "MEDIUM")
        {
            // TEMP
            width = 600;
            height = 800;
        }


        if (flexiWidth == "LARGE")
        {
            // TEMP
            width = 1000;
            height = 800;
        }

        component.set("v.width", width);
        component.set("v.height", height);

        d3.select(berlioz.utils.getDivId("chartArea", componentReference, true))
            .append("svg")
            .attr("id", berlioz.utils.getDivId("svg", componentReference, false)) // If putting more than one chart on a page we need to provide unique ids for the svg elements   
            .attr("width", width)
            .attr("height", height);

        var lastTouch1 = new Date().getTime();
        component.set("v.lastTouch", lastTouch1);

        var agent = navigator.userAgent.toLowerCase();
        if(agent.indexOf('iphone') >= 0 || agent.indexOf('ipad') >= 0){
            console.log("IOS environment");
            berlioz.chart.isiOS = true;
            component.set("v.isiOS", true);
        }
        else {
            console.log("non-IOS environment");
            berlioz.chart.isiOS = false;
        }
        
        var eventParameters = { 
            "componentReference" : componentReference
        }    
        berlioz.chart.publishEvent(componentReference, "ChartRendered", eventParameters);

        console.log("chartArea: doneRenderLoad exit");

    },

    // unsophisticated version is to remove everything and re-initialize
    refreshData: function (component, datajsonRefresh, currentMeasure, primaryNodeId, chartClickedFilters) {
        var _this = this;
        var componentReference = component.get("v.componentReference");
        console.log("chartArea: enter refreshData with primaryNodeId: " + primaryNodeId);

        // delete the paths and the groups
        // this is not the preferred option - would have preferred to use d3 joins.
        berlioz.chart.clearChart(componentReference);
        
        // retrieve the existing underlying data
        var datajson = berlioz.utils.getCache (componentReference, "datajson") ;

        // initialize the new raw data, setting component references
        berlioz.utils.initializeAddComponentRef(componentReference, datajsonRefresh);

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
        _this.initializeData(component, datajson, currentMeasure, primaryNodeId, chartClickedFilters, isInit);                 
        
        console.log("chartArea: exit refreshData");
    },    
    
    initializeData: function (component, datajson, currentMeasure, primaryNodeId, chartClickedFilters, isInit) {

        var _this = this;
        var componentReference = component.get("v.componentReference");

        console.log("init:initializing initializeData with primaryNodeId: " + primaryNodeId);
        if (isInit) {
            berlioz.utils.initializeAddComponentRef(componentReference, datajson);
        }

        berlioz.utils.setCache (componentReference, "datajson", datajson ) ;

        primaryNodeId = berlioz.utils.addComponentRef(componentReference, primaryNodeId);

        berlioz.utils.setCache (componentReference, "currentMeasure", currentMeasure ) ;

        berlioz.utils.setCache (componentReference, "primaryNodeId", primaryNodeId ) ;


        component.set("v.chartClickedFilters", chartClickedFilters);            
        var chartClickedFilters = component.get("v.chartClickedFilters");
                
        var svg = d3.select(berlioz.utils.getDivId("svg", componentReference, true));

        var width = component.get("v.width");  
        var height = component.get("v.height");  

        // Styling of tooltips - see GitHub prior to Feb 24, 2018
        var nodeToolTipDiv = d3.select("#nodeToolTip");
        var pathToolTipDivId = berlioz.utils.addComponentRef(componentReference, "pathToolTip");
        var pathToolTipDiv = d3.select("#" + pathToolTipDivId);

        var isRefresh = false;
        
        console.log("create some groups inside the svg element to store the raw data");


        var pathGroupId = berlioz.utils.getDivId("pathGroup", componentReference, false);
        var nodeGroupId = berlioz.utils.getDivId("nodeGroup", componentReference, false);
        var textGroupId = berlioz.utils.getDivId("textGroup", componentReference, false);
        
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

        // use the name convention from d3 tutorials (e.g. http://www.puzzlr.org/force-directed-graph-minimal-working-example/)
        // variables called simulation, node, path
        var node = d3.select("#" + nodeGroupId).selectAll("circle")  ;
        var path = d3.select("#" + pathGroupId).selectAll("path")  ;
        
        console.log("calling nodes");
        
        var nodeSelection = nodeGroup
            .selectAll("circle")
            .data(datajson.nodes,  function(d, i) { return d.id;} );

//        nodeSelection.exit().remove();    

        node = nodeSelection     
            .enter().append("circle")
            // set data related attributes - visual styling is applied later
            .attr("id", function(d) {
                return d.id;
            })
            // symbols...           .attr("d", d3.symbol().type( function(d) { return d3.symbols[4];}))
            .on('mouseout', function(d) { // hide the div
                var retainNodeDetailsMouseOut = berlioz.utils.getCache (componentReference, "retainNodeDetailsMouseOut" ) ;
                if (!retainNodeDetailsMouseOut)
                {
                    berlioz.chart.nodeMouseout(d);
                }
            })
            .on('mouseover', $A.getCallback(function(d) { // need getCallback to retain context - https://salesforce.stackexchange.com/questions/158422/a-get-for-application-event-is-undefined-or-can-only-fire-once
                console.log("mouseover: " + d.name);

                var componentReference = component.get("v.componentReference");
                
                berlioz.utils.setCache (componentReference, "mouseoverRecordId", d.id ) ;
                berlioz.chart.nodeMouseover(d);
                // send out a notification that we've moused over this node
                        
                berlioz.chart.publishEvent(componentReference, "ChartMouseOver", d);
            }))
            .on('click', function(d) {
//                var isiOS = component.get("v.isiOS");
                console.log("retrieve info on whether isiOS");
                var componentReference = component.get("v.componentReference");

                var isiOS = berlioz.chart.isiOS;

                if (isiOS) {
                    var now = new Date().getTime();
                    var lastTouch = component.get("v.lastTouch");
                    var delta = now - lastTouch;
                    if (delta < 350 && delta > 0) {
                        // the second touchend event happened within half a second. Here is where we invoke the double tap code
                        //TODO implement
                        //var win = window.open("http://news.bbc.co.uk");
                        //win.focus();
                    }
                    component.set("v.lastTouch", lastTouch);
                } else {
                    console.log("not iOS");
                }
                // reset the clicked node to be the primary
                // TODO This will need to be passed in the refreshVisibility call.
                var primaryNodeId = d.id;
                berlioz.utils.setCache (componentReference, "primaryNodeId", primaryNodeId ) ;

                _this.refreshVisibility(component);
                _this.styleNodes(component);
            })
            .on('dblclick', $A.getCallback(function(d) {
                console.log("dblclick");
                // TODO re-initialize
                // Two options - complete refresh OR keep and get data from this point?
                // send a message identifying the node in question
                // TODO this will need substantial enriching - e.g. pass current measure and whether to add nodes or to refresh etc.
                var componentReference = component.get("v.componentReference");
                var primaryNodeId = d.id;
                berlioz.utils.setCache (componentReference, "primaryNodeId", primaryNodeId ) ;
                var cleanId = berlioz.utils.removeComponentRef(componentReference, primaryNodeId);

                var eventParameters = {"primaryNodeId" : cleanId, "componentReference" : componentReference};
                berlioz.chart.publishEvent(componentReference, "InitiateRefreshChart", eventParameters);

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

        path = pathSelection    
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
                var showPathToolTip = berlioz.utils.getCache (componentReference, "showPathToolTip"); 
                if (showPathToolTip) {
                    berlioz.chart.pathMouseout(pathToolTipDiv);
                }
            })
            .on('mouseover', $A.getCallback(function(d) { 
                var showPathToolTip = berlioz.utils.getCache (componentReference, "showPathToolTip") ;
                console.log("showPathToolTip: " + showPathToolTip);
                if (showPathToolTip) {
                    berlioz.chart.pathMouseover(d,path,pathToolTipDiv);
                }
            }));

        // overwrite path with the updated version.
        path = d3.select("#" + pathGroupId).selectAll("path");
        
        var forceLinks = _this.buildForceLinks(path);
        
        console.log("apply node styling");
        _this.styleNodes(component);

        console.log("apply node visibility");
        _this.refreshVisibility(component);
    
        /* Above should be common to some degree - Below is forceSimulation specific */

        console.log("calling layout / simulation");

        // var forceNodes = {"nodes": [] };
        // var nodey4 = d3.select("#" + nodeGroupId).selectAll("circle")  
        // .each(function(d) {
        // // your update code here as it was in your example
        //     var d3this = d3.select(this) // Transform to d3 Object - THIS COULD BE MY ANSWER TO EVERYTHING
        //     forceNodes["nodes"].push(d3this);
        // });

        var simulation = berlioz.simulation.initializeSimulation(datajson.nodes, width, height);

        var link_force =  d3.forceLink(forceLinks.links)
            .id(function(d) { return d.id; });
        
        simulation.force("links",link_force);

        berlioz.simulation.dragHandler(node, simulation);

        console.log("calling tick");    

        simulation.on("tick", function() {
            berlioz.simulation.onTick (width, height, path, node, text);
        });             

        berlioz.utils.showCache (componentReference) ;
        
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

    /* CHART methods - Refresh */

    buildForceLinks: function(path) {
        console.log("Enter buildForceLinks"); 
        var forceLinks = {"links": [] };

        path.data().forEach(function(p) {
            var sourceDatum = d3.select("#" + p.sourceid).datum();
            var targetDatum = d3.select("#" + p.targetid).datum();
            forceLinks["links"].push(
                {
                    "id" : p.id,
                    "sourceid" : p.sourceid, 
                    "targetid" : p.targetid,
                    "type": p.type,
                    "createdby": p.createdby,
                    "notes": p.notes,
                    "stroke": p.stroke,
                    "source" : sourceDatum,
                    "target" : targetDatum
                }
            );
        });
        return forceLinks;
    },


    refreshVisibility: function(component) {

        console.log("Enter refreshVisibility"); 

        var _this = this;
        var componentReference = component.get("v.componentReference");

        var levels = component.get("v.chartShowLevels");
        var clickedfilters = component.get("v.chartClickedFilters");

        var primaryNodeId = berlioz.utils.getCache (componentReference, "primaryNodeId") ;        
        // not needed until reinstate measure level visibility
        var currentMeasure = berlioz.utils.getCache (componentReference, "currentMeasure") ;


        var relatedNodes = berlioz.chart.getRelatedNodes(primaryNodeId, componentReference, levels);

        var path = d3.select(berlioz.utils.getDivId("pathGroup", componentReference, true))
            .selectAll("path")  ;

        var node = d3.select(berlioz.utils.getDivId("nodeGroup", componentReference, true))
            .selectAll("circle")  
        
        var shownodeids = [];

        path.style("visibility", function(p) {

            var retval = "hidden";

            //TODO temporarily removing the measure level visibility functionaliy, reinstate later if useful
            // var sourcevis = p.source.measures[currentMeasure].visible;
            // var targetvis = p.target.measures[currentMeasure].visible;
            var sourcevis = 1;
            var targetvis = 1;

            var sourceindex = relatedNodes.indexOf(p.sourceid);
            var targetindex = relatedNodes.indexOf(p.targetid);

            var primaryrelated = (sourceindex > -1 && targetindex > -1);

            if ((sourcevis === 1) && (targetvis === 1) && primaryrelated) {

                var index = clickedfilters.indexOf(p.type);

                if (index > -1) {
                    berlioz.utils.log(p.sourceid + '/' + p.targetid + " will be visible");

                    var indexsource = shownodeids.indexOf(p.sourceid);
                    if (indexsource == -1) {
                        shownodeids.push(p.sourceid);
                    }

                    var indextarget = shownodeids.indexOf(p.targetid);
                    if (indextarget == -1) {
                        shownodeids.push(p.targetid);
                    }
                }
            }

            return (index > -1) ? "visible" : "hidden";
        });


        // change the visibility of the node
        // if all the links with that node are invisibile, the node should also be invisible
        // otherwise if any link related to that node is visibile, the node should be visible
        node.style("visibility", function(o, i) {
            var oid = o.id;
            var index = shownodeids.indexOf(oid);
            if (index > -1) {
                d3.select("#t" + oid).style("visibility", "visible");
                d3.select("#s" + oid).style("visibility", "visible");
                return "visible";
            } else {
                d3.select("#t" + oid).style("visibility", "hidden");
                d3.select("#s" + oid).style("visibility", "hidden");
                return "hidden";
            }
        });
    },

    // Method to re-style nodes
    styleNodes: function(component) {
        var _this = this;
        var componentReference = component.get("v.componentReference");

        var primaryid = berlioz.utils.getCache (componentReference, "primaryNodeId") ;
        var currentMeasure = berlioz.utils.getCache (componentReference, "currentMeasure") ;

        console.log("styleNodes : " + currentMeasure + " primaryid: " + primaryid);

        var node = d3.select(berlioz.utils.getDivId("nodeGroup", componentReference, true))
            .selectAll("circle")  ;

        berlioz.utils.log("styleNodes:" + JSON.stringify(node));

        node.attr("r", function(o, i) {
            // needs to be computed using a configuration provided algorithm?
            return o.measures[currentMeasure].radius;
        });

        node.style("fill", function(o, i) {
            berlioz.utils.log("styleNodes: fill: " + o.measures[currentMeasure].color);
            return o.measures[currentMeasure].color;
        });

        node.style("stroke", function(o, i) {
            var stroke = o.stroke;
            var oid = o.id;
            if (oid == primaryid) {
                var primaryNodeHighlightingOn = berlioz.utils.getCache (componentReference, "primaryNodeHighlightingOn") ;
                if (primaryNodeHighlightingOn == true) {
                    stroke = berlioz.utils.getCache (componentReference, "primaryNodeHighlightingColour") ;
                }                
            }
            return stroke;
        });

        node.style("stroke-width", function(o, i) {
            var nodestrokewidth = berlioz.utils.getCache (componentReference, "nodestrokewidth") ;
            var oid = o.id;
            if (oid == primaryid) {
                nodestrokewidth = berlioz.utils.getCache (componentReference, "primaryNodeHighlightingRadius") ;
            }
            return nodestrokewidth;
        });
    },


    // TODO sort out relations
    setLinkType: function(component, thisType, isClicked) {
        /*
        var _this = this;
        var clickedfilters = component.get("v.chartClickedFilters");
        if (isClicked) {
            clickedfilters.push(thisType);
        } else {
            var index = clickedfilters.indexOf(thisType);
            if (index > -1) {
                clickedfilters.splice(index, 1);
            }
        }
        component.set("v.chartClickedFilters", clickedfilters);
        _this.refreshVisibility(component);
        */
    },

    // ideally would prefer to put in Berlioz library but externals can't be called in doInit
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
