({

    initializeVisuals: function (component) {
        console.log("subhelper: enter initializeVisuals proper!");
        var _this = this;

		var datajson = _this.getCache (component, "datajson") ;  
		var nodeGroup = _this.getCache (component, "nodeGroup") ;  
		var pathGroup = _this.getCache (component, "pathGroup") ;  
		var textGroup = _this.getCache (component, "textGroup") ;  
		var pathToolTipDiv = _this.getCache (component, "pathToolTipDiv") ;  
		var pathGroupId = _this.getCache (component, "pathGroupId") ;  

        var componentType = component.get("v.componentType");
        
        var node = {};     
        var text = {};     
        var path = {};     

        console.log("chartNetworkHelper: calling nodes");

        let nodeSelector = ".node";
        var nodeDataSetFunction = _this.nodeDataSetFunctionNodes (component); 

        var nodeEnterSelection = nodeGroup
            .selectAll(nodeSelector)
            .data(nodeDataSetFunction(datajson), function(d, i) { return d.id;})
            .enter();

//        nodeSelection.exit().remove();    

        node = nodeEnterSelection
            .append("circle")
            .attr("id", d => d.id)            
            .attr("recordid", function(d) {
                return d.recordid;
            })
            // symbols...           .attr("d", d3.symbol().type( function(d) { return d3.symbols[4];}))
            .on('mouseout', function(d) { // hide the div
                var retainNodeDetailsMouseOut = _this.getCache (component, "retainNodeDetailsMouseOut" ) ;
                if (!retainNodeDetailsMouseOut)
                {
                    var preppedEvent = _this.nodeMouseout(component, d); 
                    _this.publishPreppedEvent(component,preppedEvent);
                }
            })
            .on('mouseover', $A.getCallback(function(d) { // need getCallback to retain context - https://salesforce.stackexchange.com/questions/158422/a-get-for-application-event-is-undefined-or-can-only-fire-once
                _this.setCache (component, "mouseoverRecordId", d.id ) ;
                var preppedEvent = _this.nodeMouseover(component, d); 
                _this.publishPreppedEvent(component,preppedEvent);
            }))
            .on('click', function(d) {
                console.log("retrieve info on whether isiOS");
                var isiOS = bzchart.isiOS;
                if (isiOS) {
                    var now = new Date().getTime();
                    var lastTouch = _this.getCache (component, "lastTouch");
                    var delta = now - lastTouch;
                    if (delta < 350 && delta > 0) {
                        // the second touchend event happened within half a second. Here is where we invoke the double tap code
                        //TODO implement - e.g. var win = window.open("http://news.bbc.co.uk"); win.focus();
                    }
                    _this.setCache (component, "lastTouch", lastTouch) ;
                } else {
                    console.log("not iOS");
                }
                // reset the clicked node to be the primary
                // TODO This will need to be passed in the refreshVisibility call.
                var primaryNodeId = d.id;
                _this.setCache (component, "primaryNodeId", primaryNodeId ) ;

                var cc = component.getConcreteComponent();
                cc.refreshVisibility();                 
                cc.styleNodes();                 
            })
            .on('dblclick', $A.getCallback(function(d) {
                console.log("dblclick");
                // Two options - complete refresh OR keep and get data from this point?
                // send a message identifying the node in question
                var primaryNodeId = d.id;
                _this.setCache (component, "primaryNodeId", primaryNodeId ) ;

                var preppedEvent = _this.nodeDoubleClick(component,primaryNodeId);

                _this.publishPreppedEvent(component,preppedEvent);
            }))
            ;


        console.log("calling text");    
    
        var textEnterSelection = textGroup
            .selectAll("g")
            .data(datajson.nodes,  function(d, i) { return d.id;} )
            .enter();
        
        text = textEnterSelection
            .append("svg:g")
            .attr("class", "nodeText"); 

        // A copy of the text with a thick white stroke for legibility ("s" for shadow, "t" for text).
        var svgText = text.append("svg:text");
        svgText
            .attr("id", d => "s" + d.id)            
            .text(function(d) {
                return d.name;
            })
            .attr("class", "chartTextShadow") // shadow class
            // .attr("x", 8)
            // .attr("y", ".31em");

        _this.textAdditionalAttribute (component, svgText);


        var svgText = text.append("svg:text");
        svgText
            .attr("id", d => "t" + d.id)            
            .text(function(d) {
                return d.name;
            })
            .attr("class", "chartText") 
            // .attr("x", 8)
            // .attr("y", ".31em");

        _this.textAdditionalAttribute (component, svgText);
    
       // calling paths

        if (datajson.links == null) {
            datajson.links = []; 
        }

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
                .attr("id", d => d.id)            
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
                        _this.pathMouseout(pathToolTipDiv);
                    }
                })
                .on('mouseover', $A.getCallback(function(d) { 
                    var showPathToolTip = component.get("v.showPathToolTip"); 
                    console.log("showPathToolTip: " + showPathToolTip);
                    if (showPathToolTip) {
                        _this.pathMouseover(d, path, pathToolTipDiv);
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
                var appEvents = _this.getCache (component, "appEvents") ;
                event = appEvents.pop();
            }    
            bzutils.publishEventHelper(event, preppedEvent.topic, preppedEvent.parameters, preppedEvent.controllerId);     
        }
    },

    // unsophisticated version is to remove everything and re-initialize
    refreshDataHelper: function (component, datajsonRefresh, primaryNodeId, showFilters) {
        var _this = this;
        var componentReference = component.get("v.componentReference");

        // delete the paths and the groups
        // this is not the preferred option - would have preferred to use d3 joins.
        _this.clearChart(componentReference);
        
        // retrieve the existing underlying data
        var datajson = _this.getCache (component, "datajson") ;

        // initialize the new raw data, setting component references
        _this.initializeAddComponentRef(componentReference, datajsonRefresh);

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
        // "PreProcess data - not right yet - need to update this method to return nothing"
//        bzutils.xfcr("dataPreProcess", componentReference, datajson, datajsonRefresh); // preprocessing of data (if any)

        cc.dataPreprocess(datajson, datajsonRefresh);

        datajson = _this.getCache (component, "datajson") ;
        
        // re-initialize the chart
        var isInit = false;
        _this.initializeGroups(component, datajson, primaryNodeId, showFilters, isInit);                 
        cc.initializeVisuals();

    },    

    

    runSimulation : function (component, path, node, text) {
        console.log("chartNetworkHelper.runSimulation enter");
        var _this = this;

        var componentType = component.get("v.componentType");

        if (componentType ==  "network.connections") {
            _this.runSimulationConnections(component, path, node, text);
        }
        if (componentType ==  "network.timeline") {
            _this.runSimulationInfluence(component, path, node, text);
        }
    },                 

    /* Connections Methods */

    runSimulationConnections : function (component, path, node, text) {
        console.log("chartNetworkHelper.runSimulationConnections enter");
        var _this = this;

        var datajson = _this.getCache (component, "datajson") ;

        var simulation = _this.initializeSimulationConnections(component, datajson.nodes);            

        _this.setCache (component, "simulation", simulation ) ;
    
        var forceLinks = _this.buildForceLinks(path);
        var link_force =  d3.forceLink(forceLinks.links)
            .id(function(d) { return d.id; });

        simulation.force("links",link_force);
    
        _this.dragHandler(node, simulation);
    
        simulation.on("tick", function() {
            _this.onTick (component, path, node, text);
        });             
    
        console.log("chartNetworkHelper.runSimulationConnections exit");
    },                 

    initializeSimulationConnections : function (component, nodes) {
        var _this = this;
        console.log("chartNetworkHelper.initializeSimulationConnections enter");
        var width = _this.getCache (component, "width") ;  
        var height = _this.getCache (component, "height") ; 
    
        // force example - https://bl.ocks.org/rsk2327/23622500eb512b5de90f6a916c836a40
        var attractForce = d3.forceManyBody().strength(5).distanceMax(400).distanceMin(60);
        var repelForce = d3.forceManyBody().strength(-800).distanceMax(200).distanceMin(30);
    
        var simulation = d3.forceSimulation()
            //add nodes
            .nodes(nodes) 
            .force("center_force", d3.forceCenter(width / 2, height / 2))
            .alphaDecay(0.03).force("attractForce",attractForce).force("repelForce",repelForce);
        
        console.log("chartNetworkHelper.initializeSimulationConnections exit");
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
    
    onTick : function  (component, path, node, text) {
        var _this = this;

        var width = _this.getCache (component, "width") ;  
        var height = _this.getCache (component, "height") ; 
    //    if (bzutils.getCache (component, "hasPaths") == true) {
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
//        if (bzutils.getCache (component, "hasText") == true) {
            text.attr("transform", function(d) {
                return _this.transform (d, width, height);
            });
//        }
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

        var datajson = _this.getCache (component, "datajson") ;

        var simulation = _this.initializeSimulationInfluence(component, datajson.nodes);            

        _this.setCache (component, "simulation", simulation ) ;
    
        var forceLinks = _this.buildForceLinks(path);
        var link_force =  d3.forceLink(forceLinks.links)
            .id(function(d) { return d.id; });
    
        simulation.force("links",link_force);
    
        _this.dragHandler(node, simulation);
    
        simulation.on("tick", function() {
            _this.onTick (component, path, node, text);
        });             
    

        console.log("chartNetworkHelper.runSimulationInfluence exit");
    }, 

    initializeSimulationInfluence : function (component, nodes) {
        console.log("chartNetworkHelper.initializeSimulationInfluence enter");

        var _this = this;
        var width = _this.getCache (component, "width") ;  
        var height = _this.getCache (component, "height") ; 
        var sizeDivisor = 100;
        var nodePadding = 2.5;
        var currentColorLabel = _this.getStore (component, "currentColorLabel") ; 
    
        var simulation = d3.forceSimulation()
            .force("forceX", d3.forceX().strength(.1).x(width * .5))
            .force("forceY", d3.forceY().strength(.1).y(height * .5))
            .force("center", d3.forceCenter().x(width * .5).y(height * .5))
            .force("charge", d3.forceManyBody().strength(-150));
    
        simulation  
            .nodes(nodes)
            .force("collide", d3.forceCollide().strength(.5).radius(function(d){
                return d.measures[currentColorLabel].radius + nodePadding; }).iterations(1))
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
        var _this = this;
        console.log("nodeDoubleClick enter");

        var componentType = component.get("v.componentType");
        console.log("nodeDoubleClick componentType = " + componentType);

        if ((componentType ==  "network.timeline") || (componentType ==  "network.connections")) {

            var componentReference = component.get("v.componentReference");        

            // TODO this will need substantial enriching - e.g. pass current measure and whether to add nodes or to refresh etc.
            var cleanId = _this.removeComponentRef(componentReference, primaryNodeId);
            var eventParameters = {"primaryNodeId" : cleanId, "componentReference" : componentReference};
            console.log("nodeDoubleClick exit.");
        
            var preppedEvent = _this.prepareEvent(component, "InitiateRefreshChart", eventParameters);
            return preppedEvent;        

        }

    },


    textAdditionalAttribute : function (component, text) {
        // Not sure this is called
        console.log("chartNetworkHelper.textAdditionalAttribute enter");    

        var componentType = component.get("v.componentType");
        console.log("textAdditionalAttribute componentType = " + componentType);

        if ((componentType == "network.connections") || (componentType == "network.timeline")) {
            text
            .attr("x", 8)
            .attr("y", ".31em")            
        }
    
        console.log("chartNetworkHelper.textAdditionalAttribute exit");
    },

    pathMouseover : function (d,path,pathToolTipDiv) {
        console.log("chartNetworkHelper.pathMouseover enter");
    
        var mouseoverpathid = d.id;
    
        path.style("stroke", function(o, i) {
            var oid =o.id;
    
            if (oid === mouseoverpathid) {
                return "red";
            }
            else
            {
                return "gray";
            }
        });
    
        var midx = (d.source.x + d.target.x) / 2
        var midy = (d.source.y + d.target.y) / 2
    
        var content = '<div style="text-align:center;font-size:"6px";>';
        content += '<p>Type: ' + d.type + '</p>';
        content += '<p>Linked By ' + d.createdby + '</p>';
        content += '<p>Notes: ' + d.notes + '</p>';
        content += '</div>';
    
        pathToolTipDiv.transition()
            .duration(100)
            .style("opacity", .9);
        pathToolTipDiv.html(content)
            .style("left", midx + "px")
            .style("top", midy + "px");
    
        console.log("chartNetworkHelper.pathMouseover exit");
        
    },
    
    pathMouseout : function (pathToolTipDiv) {
        console.log("chartNetworkHelper.pathMouseout enter");
    
        pathToolTipDiv.transition()
            .delay(1000)
            .duration(2000)
            .style("opacity", 0);
    
        console.log("chartNetworkHelper.pathMouseout exit");
    },

    
    nodeDataSetFunctionNodes : function (component) { 
        console.log("chartNetworkHelper.nodeDataSetFunctionNodes enter");    
        return function(datajson) { return datajson.nodes;};
    },

    nodeMouseover : function (component, d) {
        var _this = this;
        console.log("chartNetworkHelper.nodeMouseover enter");

        var componentType = component.get("v.componentType");
        console.log("nodeMouseover componentType = " + componentType);

        if ((componentType == "network.connections") || (componentType == "network.timeline")) {
            // styling svg text content: http://tutorials.jenkov.com/svg/tspan-element.html
            var fields = d.fields;
            var fieldsLength = fields.length;

            var displayArray = [d.name];
            for (var i=0; i<fieldsLength;i++) {
                if (fields[i].fieldType == "STRING" && fields[i].role != "name") {
                    displayArray.push(fields[i].retrievedValue);
                }
            }

            var textcontent = '<tspan x="10" y="0" style="font-weight: bold;">' + displayArray[0] ;
            textcontent += '</tspan>'; 
            textcontent += '<tspan x="10" dy="15">' + displayArray[1];
            if (displayArray.length > 2) {
                textcontent += ' (' + displayArray[2] + ')';
            }
            textcontent += '</tspan>';

            var tselect =  "t" + d.id;
            var t = d3.select("#" + tselect);
            t.html(textcontent);

            var sselect =  "s" + d.id;
            var s = d3.select("#" + sselect);
            s.html(textcontent);

            var publishParameters = {"data" : d, "parent" : null};
            var preppedEvent = _this.prepareEvent(component, "ChartMouseOver", publishParameters);
            return preppedEvent;
        }
    },
    
    nodeMouseout : function (component, d) {
        console.log("chartNetworkHelper.nodeMouseout enter.");

        var componentType = component.get("v.componentType");
        console.log("nodeMouseover componentType = " + componentType);

        if ((componentType == "network.connections") || (componentType == "network.timeline")) {
            // revert back to just the name
            // styling svg text content: http://tutorials.jenkov.com/svg/tspan-element.html
            var textcontent = '<tspan x="10" y="0" style="font-weight: bold;">' + d.name ;
            textcontent += '</tspan>'; 

            var tselect =  "t" + d.id;
            var sselect =  "s" + d.id;
                
            var t = d3.select("#" + tselect);                    
            t.html(textcontent);

            var s = d3.select("#" + sselect);
            s.html(textcontent);
        }
    },
    
    getRelatedNodes : function (chartPrimaryId, componentReference, level) {
        console.log("chartNetworkHelper.getRelatedNodes enter.");
        var _this = this;
        var looplevel = 0;
        var linkednodes = [chartPrimaryId];
    
        while (looplevel < level) {
            var newnodes = [];
            looplevel++;
    
            var path = d3.select(_this.getDivId("pathGroup", componentReference, true))
                .selectAll("path")
                .each(function(p) {
                    var sourceindex = linkednodes.indexOf(p.sourceid);
                    var targetindex = linkednodes.indexOf(p.targetid);
                    if (sourceindex === -1 && targetindex > -1) {
                            newnodes.push(p.sourceid);
                        }
                        if (targetindex === -1 && sourceindex > -1) {
                            newnodes.push(p.targetid);
                        }
                    }
                );
    
            for (var i = 0; i < newnodes.length; i++) {
            var index = linkednodes.indexOf(newnodes[i]);
                if (index === -1) {
                    linkednodes.push(newnodes[i]);
                }
            }
    
        }
        return linkednodes;
    },


})