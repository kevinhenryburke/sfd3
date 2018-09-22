({

    initializeVisuals: function (component) {
        console.log("subhelper: enter initializeVisuals proper!");
        var _this = this;
        var componentType = component.get("v.componentType");
        var componentReference = component.get("v.componentReference");

		var datajson = bzutils.getCache (componentReference, "datajson") ;  
		var nodeGroup = bzutils.getCache (componentReference, "nodeGroup") ;  
		var pathGroup = bzutils.getCache (componentReference, "pathGroup") ;  
		var textGroup = bzutils.getCache (componentReference, "textGroup") ;  
		var pathToolTipDiv = bzutils.getCache (componentReference, "pathToolTipDiv") ;  
		var pathGroupId = bzutils.getCache (componentReference, "pathGroupId") ;  
                
        var node = {};     
        var text = {};     
        var path = {};     

        console.log("calling nodes");

        var nodeSelector = bzutils.getParam(componentType, "node", "selector"); // an html selector for a class or element ids
        var nodeDataSetFunction = bzutils.xfcr("nodeDataSetFunction", componentReference); // an html selector for a class or element ids
        var nodeDataKeyFunction = bzutils.xfcr("nodeDataKeyFunction", componentReference); // an html selector for a class or element ids
        
        var nodeEnterSelection = nodeGroup
            .selectAll(nodeSelector)
            .data(nodeDataSetFunction(datajson), nodeDataKeyFunction)
            .enter();

//        nodeSelection.exit().remove();    

        if (bzutils.hasParam(componentType, "node")) {
            node = nodeEnterSelection
                .append(bzutils.getParam(componentType, "node", "appendType"))
                .attr("id", function(d) {
                    return d.id;
                })
                .attr("recordid", function(d) {
                    return d.recordid;
                })
                // symbols...           .attr("d", d3.symbol().type( function(d) { return d3.symbols[4];}))
                .on('mouseout', function(d) { // hide the div
                    var retainNodeDetailsMouseOut = bzutils.getCache (componentReference, "retainNodeDetailsMouseOut" ) ;
                    if (!retainNodeDetailsMouseOut)
                    {
                        var preppedEvent = bzutils.xfcr("nodeMouseout", componentReference, d); // an html selector for a class or element ids
                        _this.publishPreppedEvent(component,preppedEvent);
                    }
                })
                .on('mouseover', $A.getCallback(function(d) { // need getCallback to retain context - https://salesforce.stackexchange.com/questions/158422/a-get-for-application-event-is-undefined-or-can-only-fire-once
                    bzutils.setCache (componentReference, "mouseoverRecordId", d.id ) ;
                    var preppedEvent = bzutils.xfcr("nodeMouseover", componentReference, d); 
                    _this.publishPreppedEvent(component,preppedEvent);
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

                    var cc = component.getConcreteComponent();
                    cc.refreshVisibility();                 
                    cc.styleNodes();                 
                })
                .on('dblclick', $A.getCallback(function(d) {
                    console.log("dblclick");
                    // Two options - complete refresh OR keep and get data from this point?
                    // send a message identifying the node in question
                    var componentReference = component.get("v.componentReference");
                    var primaryNodeId = d.id;
                    bzutils.setCache (componentReference, "primaryNodeId", primaryNodeId ) ;

                    var preppedEvent = _this.nodeDoubleClick(component,primaryNodeId);

                    _this.publishPreppedEvent(component,preppedEvent);
                }))
                ;

            var nodeAdditionalAttribute = bzutils.xfcr("nodeAdditionalAttribute", componentReference, node); // an html selector for a class or element ids

        }

        console.log("calling text");    
    
        if (bzutils.hasParam(componentType, "text")) {

            // pick up the text styling
            var hasShadow = bzutils.hasParam(componentType, "node", "styleclassTextShadow");
            var styleclassText = bzutils.getParam(componentType, "node", "styleclassText");
            var styleclassTextShadow = bzutils.getParam(componentType, "node", "styleclassTextShadow");

            var textEnterSelection = textGroup
                .selectAll("g")
                .data(datajson.nodes,  function(d, i) { return d.id;} )
                .enter();
            
            text = textEnterSelection
                .append("svg:g")
                .attr("class", "nodeText"); // TODO what is nodeText class

            if (hasShadow == true) {                
                // A copy of the text with a thick white stroke for legibility ("s" for shadow, "t" for text).
                var svgText = text.append("svg:text");
                svgText.attr("id", function(d) {
                        return "s" + d.id;
                    })
                    .text(function(d) {
                        return d.name;
                    })
                    .attr("class", styleclassTextShadow) // shadow class
                    // .attr("x", 8)
                    // .attr("y", ".31em");
                bzutils.xfcr("textAdditionalAttribute", componentReference, svgText); // an html selector for a class or element ids
            }

            var svgText = text.append("svg:text");
            svgText.attr("id", function(d) {
                    return "t" + d.id;
                })
                .text(function(d) {
                    return d.name;
                })
                .attr("class", styleclassText) 
                // .attr("x", 8)
                // .attr("y", ".31em");

            bzutils.xfcr("textAdditionalAttribute", componentReference, svgText); // an html selector for a class or element ids
    
        }

        console.log("calling paths");

        if (!bzutils.hasParam(componentType, "path")) {
            datajson.links = []; 
        }

//        if (hasPaths) {
//        if (bzutils.hasParam(componentType, "path")) {
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
                    var showPathToolTip = component.get("v.showPathToolTip"); 
                    if (showPathToolTip) {
                        bzutils.xfcr("pathMouseout", componentReference, pathToolTipDiv); 
                    }
                })
                .on('mouseover', $A.getCallback(function(d) { 
                    var showPathToolTip = component.get("v.showPathToolTip"); 
                    console.log("showPathToolTip: " + showPathToolTip);
                    if (showPathToolTip) {
                        bzutils.xfcr("pathMouseover", componentReference, d, path, pathToolTipDiv); 
                    }
                }));

            // overwrite path with the updated version.
            path = d3.select("#" + pathGroupId).selectAll("path");
//        }
                
        console.log("apply node styling");
        var cc = component.getConcreteComponent();
        cc.styleNodes();                 

        console.log("apply node visibility");
        cc.refreshVisibility();                 

        /* Above should be common to some degree - Below is forceSimulation specific */

        console.log("calling layout / simulation");

        // var forceNodes = {"nodes": [] };
        // var nodey4 = d3.select("#" + nodeGroupId).selectAll("circle")  
        // .each(function(d) {
        // // your update code here as it was in your example
        //     var d3this = d3.select(this) // Transform to d3 Object - THIS COULD BE MY ANSWER TO EVERYTHING
        //     forceNodes["nodes"].push(d3this);
        // });

        _this.runSimulation(component, path, node, text);                 
        
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

    // TODO function appears in many places, try to consolidate
    publishPreppedEvent : function(component,preppedEvent){
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
                var appEvents = bzutils.getCache (componentReference, "appEvents") ;
                event = appEvents.pop();
            }    
            bzutils.publishEventHelper(event, preppedEvent.topic, preppedEvent.parameters, preppedEvent.controllerId);     
        }
    },
    
    runSimulation : function (component, path, node, text) {
        console.log("chartNetworkHelper.runSimulation enter");
        var _this = this;

        var componentType = component.get("v.componentType");

        if (componentType ==  "chart.connections") {
            console.log("chartNetworkHelper.runSimulation " + componentType);
            _this.runSimulationConnections(component, path, node, text);
        }
        if (componentType ==  "chart.influence") {
            console.log("chartNetworkHelper.runSimulation " + componentType);
            _this.runSimulationInfluence(component, path, node, text);
        }

        console.log("chartNetworkHelper.runSimulation exit");
    },                 

    /* Connections Methods */

    runSimulationConnections : function (component, path, node, text) {
        console.log("chartNetworkHelper.runSimulationConnections enter");
        var _this = this;

        var componentReference = component.get("v.componentReference");

        var datajson = bzutils.getCache (componentReference, "datajson") ;

        var simulation = _this.initializeSimulationConnections(componentReference, datajson.nodes);            

        bzutils.setCache (componentReference, "simulation", simulation ) ;
    
        var forceLinks = _this.buildForceLinks(path);
        var link_force =  d3.forceLink(forceLinks.links)
            .id(function(d) { return d.id; });
    
        simulation.force("links",link_force);
    
        _this.dragHandler(node, simulation);
    
        simulation.on("tick", function() {
            _this.onTick (componentReference, path, node, text);
        });             
    
        console.log("chartNetworkHelper.runSimulationConnections exit");
    },                 

    initializeSimulationConnections : function (componentReference, nodes) {
        var _this = this;
        console.log("chartNetworkHelper.initializeSimulationConnections enter");
        var width = bzutils.getCache (componentReference, "width") ;  
        var height = bzutils.getCache (componentReference, "height") ; 
    
        // force example - https://bl.ocks.org/rsk2327/23622500eb512b5de90f6a916c836a40
        var attractForce = d3.forceManyBody().strength(5).distanceMax(400).distanceMin(60);
        var repelForce = d3.forceManyBody().strength(-800).distanceMax(200).distanceMin(30);
    
        var simulation = d3.forceSimulation()
            //add nodes
            .nodes(nodes) 
            .force("center_force", d3.forceCenter(width / 2, height / 2))
            .alphaDecay(0.03).force("attractForce",attractForce).force("repelForce",repelForce);
        
        console.log("chartNetworkHelper.initializeSimulationConnections enter");
        return simulation;
    },
    
    dragHandler : function (node, simulation) {
        var _this = this;
        console.log("dragHandler enter");
        var drag_handler = d3.drag()
        .on("start", function (d) {
            simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
            })
        .on("drag", function (d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
            })
        .on("end", function (d) {
            simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
            });
    
        drag_handler(node);
        console.log("dragHandler exit");
    },
        
    transform : function (d, width, height) {
        var _this = this;
        var dx = _this.limitborderx(d.x, width);
        var dy = _this.limitbordery(d.y, height);
        return "translate(" + dx + "," + dy + ")";
    },
    
    limitborderx : function (x, width) {
        var _this = this;
        return Math.max(Math.min(x, width) -30, 20);
    },
    
    limitbordery : function (y, height) {
        var _this = this;
        return Math.max(Math.min(y, height - 50), 20 );
    },   
    
    onTick : function  (componentReference, path, node, text) {
        var _this = this;
        var width = bzutils.getCache (componentReference, "width") ;  
        var height = bzutils.getCache (componentReference, "height") ; 
    //    if (bzutils.getCache (componentReference, "hasPaths") == true) {
            path.attr("d", function(d) {
                var sx = _this.limitborderx(d.source.x, width);
                var sy = _this.limitbordery(d.source.y, height);
                var tx = _this.limitborderx(d.target.x, width);
                var ty = _this.limitbordery(d.target.y, height);
                var dx = tx - sx;
                var dy = ty - sy;
                var dr = Math.sqrt(dx * dx + dy * dy);
                return "M" + sx + "," + sy + "A" + dr + "," + dr + " 0 0,1 " + tx + "," + ty;
            });
    //    }
        node.attr("transform", function(d) {
            return _this.transform (d, width, height);
        });
        if (bzutils.getCache (componentReference, "hasText") == true) {
            text.attr("transform", function(d) {
                return _this.transform (d, width, height);
            });
        }
    },
    
    buildForceLinks : function (path) {
        var _this = this;
        console.log("buildForceLinks enter: " + JSON.stringify(path)); 
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
        console.log("buildForceLinks exit"); 
        return forceLinks;
    },
    
    /* Influence Methods */

    runSimulationInfluence : function (component, path, node, text) {
        console.log("chartNetworkHelper.runSimulationInfluence enter");
        var _this = this;

        var componentReference = component.get("v.componentReference");

        var datajson = bzutils.getCache (componentReference, "datajson") ;

        var simulation = _this.initializeSimulationInfluence(componentReference, datajson.nodes);            

        bzutils.setCache (componentReference, "simulation", simulation ) ;
    
        var forceLinks = _this.buildForceLinks(path);
        var link_force =  d3.forceLink(forceLinks.links)
            .id(function(d) { return d.id; });
    
        simulation.force("links",link_force);
    
        _this.dragHandler(node, simulation);
    
        simulation.on("tick", function() {
            _this.onTick (componentReference, path, node, text);
        });             
    

        console.log("chartNetworkHelper.runSimulationInfluence exit");
    }, 


    initializeSimulationInfluence : function (componentReference, nodes) {
        console.log("chartNetworkHelper.initializeSimulationInfluence enter");
        var width = bzutils.getCache (componentReference, "width") ;  
        var height = bzutils.getCache (componentReference, "height") ; 
        var sizeDivisor = 100;
        var nodePadding = 2.5;
        var currentMeasure = bzutils.getCache (componentReference, "currentMeasure") ; 
    
        var simulation = d3.forceSimulation()
            .force("forceX", d3.forceX().strength(.1).x(width * .5))
            .force("forceY", d3.forceY().strength(.1).y(height * .5))
            .force("center", d3.forceCenter().x(width * .5).y(height * .5))
            .force("charge", d3.forceManyBody().strength(-150));
    
        simulation  
            .nodes(nodes)
            .force("collide", d3.forceCollide().strength(.5).radius(function(d){
                return d.measures[currentMeasure].radius + nodePadding; }).iterations(1))
    //        .force("collide", d3.forceCollide().strength(.5).radius(function(d){ return d.radius + nodePadding; }).iterations(1))
            .on("tick", function(d){
              node
                  .attr("cx", function(d){ return d.x; })
                  .attr("cy", function(d){ return d.y; })
            });        
        
        console.log("chartNetworkHelper.initializeSimulationInfluence exit");
        return simulation;
    },
        
    nodeDoubleClick: function(component,primaryNodeId){
        console.log("calling nodeDoubleClick");

        var componentType = component.get("v.componentType");
        console.log("nodeDoubleClick componentType = " + componentType);

        if ((componentType ==  "chart.influence") || (componentType ==  "chart.connections")) {

            var componentReference = component.get("v.componentReference");        

            // TODO this will need substantial enriching - e.g. pass current measure and whether to add nodes or to refresh etc.
            var cleanId = bzutils.removeComponentRef(componentReference, primaryNodeId);
            var eventParameters = {"primaryNodeId" : cleanId, "componentReference" : componentReference};
            console.log("bzchart.nodeDoubleClick exit.");
        
            var preppedEvent = bzchart.prepareEvent(componentReference, "InitiateRefreshChart", eventParameters);
            return preppedEvent;        

        }

    },

    


})