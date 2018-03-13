({

    /* CHART methods - Initialize */

    // called by initializeData
    transform: function(component, d) {
        var _this = this;
        var dx = _this.limitborderx(component, d.x);
        var dy = _this.limitbordery(component, d.y);
        var retVal = "translate(" + dx + "," + dy + ")";
        return retVal;
    },

    // called by initializeData -> transform
    limitborderx: function(component, x) {
        var width = component.get("v.width");
        return Math.max(Math.min(x, width) -30, 20);
    },

    // called by initializeData -> transform
    limitbordery: function(component, y) {
        var height = component.get("v.height");
        return Math.max(Math.min(y, height - 50), 20 );
    },    

    // replace ids with component specific versions - this will allow multiple charts on a page without conflict
    initializeAddComponentRef: function(component, datajson) {
        var _this = this;
        datajson.nodes.forEach(function(node) {
            node["id"] = _this.addComponentRef(component, node["id"]);
        });
            
        datajson.links.forEach(function(link) {
            link["id"] = _this.addComponentRef(component, link["id"]);
        });
    },    

    addComponentRef: function(component, dataItem) {
        return component.get("v.componentReference") + dataItem;
    },    

    // remove component specific prefix from id - this will allow original references to be retrieved
    removeComponentRef: function(component, dataItem) {
        var indexer = component.get("v.componentReference").length;
        return dataItem.substring(indexer);
    },    
        
    initializeDataV4: function (component, datajson, configjson, chartCurrentMeasure, chartPrimaryId, chartClickedFilters) {

        var _this = this;

        console.log("init:initializing initializeDataV4 ");
        _this.initializeAddComponentRef(component, datajson);
        console.log(datajson);

        chartPrimaryId = _this.addComponentRef(component, chartPrimaryId);

        var testing = _this.removeComponentRef(component, chartPrimaryId);
        console.log("testing: " + testing);

        component.set("v.chartCurrentMeasure", chartCurrentMeasure);
        component.set("v.chartPrimaryId", chartPrimaryId);            
        component.set("v.chartClickedFilters", chartClickedFilters);            
                
        var svg = component.get("v.svg");
        console.log(svg);
        // use the name convention from d3 tutorials (e.g. http://www.puzzlr.org/force-directed-graph-minimal-working-example/)
        // variables called simulation, node, path
        var simulation = component.get("v.simulation");
        var node = component.get("v.node");
        var path = component.get("v.path");

        var width = component.get("v.width");  
        var height = component.get("v.height");  

        // Styling of tooltips - see GitHub prior to Feb 24, 2018
        var nodeToolTipDiv = d3.select("#nodeToolTip");
        var pathToolTipDiv = d3.select("#pathToolTip");
        
        // Compute the distinct nodes from the links.
        datajson.links.forEach(function(link) {
            link.source = datajson.nodes[link.source];
            link.target = datajson.nodes[link.target];
        });

        var chartClickedFilters = component.get("v.chartClickedFilters");

        console.log("calling layout / simulation");
        // force example - https://bl.ocks.org/rsk2327/23622500eb512b5de90f6a916c836a40
        var attractForce = d3.forceManyBody().strength(5).distanceMax(400).distanceMin(60);
        var repelForce = d3.forceManyBody().strength(-800).distanceMax(200).distanceMin(30);

        simulation = d3.forceSimulation()
        //add nodes
        .nodes(datajson.nodes) 
//        .size([width, height])
        .force("center_force", d3.forceCenter(width / 2, height / 2))
        .alphaDecay(0.03).force("attractForce",attractForce).force("repelForce",repelForce);

        console.log("simulation");
        console.log(simulation);

        console.log("calling paths");

        var link_force =  d3.forceLink(datajson.links)
            .id(function(d) { return d.name; });     

        console.log("setting force links");
            
        simulation.force("links",link_force)    ;

        console.log("append class vectors");
        
        //draw lines for the links 
        var path = svg.append("g")
            .selectAll("path")
            .data(datajson.links)
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
            .attr("marker-end", function(d) {
                return "url(#" + d.type + ")";
            })
            .on('mouseout', function(d) { // hide the div
                var showPathToolTip = component.get("v.showPathToolTip");
                if (showPathToolTip) {
                    pathToolTipDiv.transition()
                        .delay(1000)
                        .duration(2000)
                        .style("opacity", 0);
/*
                        console.log("pathtext clear");
                        var textcontent = ''; 
                        var pt = d3.select("#pt" + d.id);
                        console.log(pt);
                        pt.html(textcontent);
*/
                    }


            })
            .on('mouseover', $A.getCallback(function(d) { 
                var showPathToolTip = component.get("v.showPathToolTip");
                console.log("showPathToolTip: " + showPathToolTip);
                if (showPathToolTip) {
                    // "this" here is a path DOM element so use its id to match up with a d3 path
                    if (component.get("v.showPathToolTip"))
                    {
                        var mouseoverpathid = this.id;

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

                        console.log("tooltip: midx / midy: " + midx + " / " + midy);

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

/*
                        console.log("pathtext set the html");
                        var textcontent = '<tspan x="-20" y="0" style="text-align:left; font-weight: bold; opacity: 0.5;">' + d.name;
                        textcontent += '</tspan>'; 
                        var pt = d3.select("#pt" + d.id);
                        console.log(pt);
                        pt.html(textcontent);
*/                
                
                    }
                }
            }));

        console.log("calling nodes");
        
        node = svg.append("g").selectAll("circle")
            .data(simulation.nodes())
            .enter().append("circle")
            // set data related attributes - visual styling is applied later
            .attr("id", function(d) {
                return d.id;
            })

//            .attr("d", d3.symbol().type( function(d) { return d3.symbols[4];}))

            .on('mouseout', function(d) { // hide the div
                // TODO - add an attribute if want to remove details.
                // Need to be abstracted - so card vars are provided to this visualization

                if (!component.get("v.retainNodeDetailsMouseOut"))
                {
                    component.set("v.card1", d.name);
                    // styling svg text content: http://tutorials.jenkov.com/svg/tspan-element.html
                    var textcontent = '<tspan x="10" y="0" style="font-weight: bold;">' + component.get("v.card1") ;
                    textcontent += '</tspan>'; 

                    var tselect =  "t" + d.id;
                    var sselect =  "s" + d.id;
                        
                    var t = d3.select("#" + tselect);                    
                    t.html(textcontent);

                    var s = d3.select("#" + sselect);
                    s.html(textcontent);
                }
            })
            .on('mouseover', $A.getCallback(function(d) { // need getCallback to retain context - https://salesforce.stackexchange.com/questions/158422/a-get-for-application-event-is-undefined-or-can-only-fire-once
                console.log("mouseover: " + d.name);
                // card populate
                // TODO Need to be abstracted - so card vars are provided to this visualization
                component.set("v.card1", d.name);
                component.set("v.card2", d.position);
                component.set("v.card3", d.account);
                component.set("v.card4", d.id);
                component.set("v.cardSelected", true);

                // styling svg text content: http://tutorials.jenkov.com/svg/tspan-element.html
                var textcontent = '<tspan x="10" y="0" style="font-weight: bold;">' + component.get("v.card1") ;
                textcontent += '</tspan>'; 
                textcontent += '<tspan x="10" dy="15">' + component.get("v.card2");
                textcontent += ' (' + component.get("v.card3") + ')</tspan>';

                var tselect =  "t" + d.id;
                var sselect =  "s" + d.id;

                var t = d3.select("#" + tselect);
                console.log("mouseover: " + t);
                console.log("mouseover: " + textcontent);
                console.log(t);
                t.html(textcontent);
                var s = d3.select("#" + sselect);
                s.html(textcontent);

                _this.publishEvent("UpdateCard", {"card1" : d.name, "card2" : d.position, "card3" : d.account});
            }))
            .on('click', function(d) {

                var isiOS = component.get("v.isiOS");

                if (isiOS) {
                    var now = new Date().getTime();
                    var lastTouch = component.get("v.lastTouch");

                    var delta = now - lastTouch;

                    if (delta < 350 && delta > 0) {
                        // the second touchend event happened within half a second. Here is where we invoke the double tap code
                        var win = window.open("http://news.bbc.co.uk");
                        win.focus();
                    }
                    component.set("v.lastTouch", lastTouch);
                } else {
                    console.log("not iOS");
                }
                // reset the clicked node to be the primary
                // TODO This will need to be passed in the refreshVisibility call.
                var chartPrimaryId = d.id;
                component.set("v.chartPrimaryId", chartPrimaryId);

                _this.refreshVisibility(component);
                _this.styleNodes(component, null, chartPrimaryId);
            })
            .on('dblclick', function(d) {
                //TODO implement
//                var win = window.open("/" + d.id, '_blank');
//                win.focus();

            });

            var drag_handler = d3.drag()
            .on("start", function (d) {
                var simulation = component.get("v.simulation");
                simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
              })
            .on("drag", function (d) {
                d.fx = d3.event.x;
                d.fy = d3.event.y;
              })
            .on("end", function (d) {
                var simulation = component.get("v.simulation");
                simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
              });

            drag_handler(node);

        console.log("calling tick");    

        simulation.on("tick", function() {
            path.attr("d", function(d) {
                var sx = _this.limitborderx(component, d.source.x);
                var sy = _this.limitbordery(component, d.source.y);
                var tx = _this.limitborderx(component, d.target.x);
                var ty = _this.limitbordery(component, d.target.y);
                var dx = tx - sx;
                var dy = ty - sy;
                var dr = Math.sqrt(dx * dx + dy * dy);
                return "M" + sx + "," + sy + "A" + dr + "," + dr + " 0 0,1 " + tx + "," + ty;
            });
            node.attr("transform", function(d) {
                return _this.transform(component, d);
            })

            var text = component.get("v.text");
            text.attr("transform", function(d) {
                return _this.transform(component, d);
            });
            component.set("v.text", text);

/*            
            var pathtext = component.get("v.pathtext");
            pathtext.attr("transform", function(d) {
                console.log("pathtext translate");

                var midx = (d.source.x + d.target.x) / 2
                var midy = (d.source.y + d.target.y) / 2
        
                var ret = "translate(" + midx + "," + midy + ")";
                console.log(ret);
                return ret;
            });
            component.set("v.pathtext", pathtext);
*/        
        
        });                

        console.log("calling text");    
        
        var text = component.get("v.text");

        text = svg.append("svg:g")
            .selectAll("g")
            .data(simulation.nodes())
            .enter().append("svg:g")
            .attr("class", "nodeText");

        // A copy of the text with a thick white stroke for legibility.
        text.append("svg:text")
            .attr("x", 8)
            .attr("y", ".31em")
            .attr("class", "shadow")
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

/*            
        var pathtext = component.get("v.pathtext");
        pathtext = svg.append("svg:g")
            .selectAll("g")
            .data(datajson.links)
            .enter().append("svg:g")
            .attr("class", "nodeText");

        pathtext.append("svg:text")
            .attr("x", 8)
            .attr("y", ".31em")
            .attr("id", function(d) {
                return "pt" + d.id;
            })
            .text(function(d) {
                return d.name;
            });

        component.set("v.pathtext", pathtext);
            
*/


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
        component.set("v.text", text);

        component.set("v.node", node);
        component.set("v.path", path);
        component.set("v.simulation", simulation);

        console.log("apply node styling");
        _this.styleNodes(component, chartCurrentMeasure, chartPrimaryId);

        console.log("apply node visibility");
        _this.refreshVisibility(component);

    },

    /* CHART methods - Refresh */

    refreshVisibility: function(component) {

        console.log("Enter refreshVisibility");

        var _this = this;

        // change the visibility of the connection path

        // "v.chartCurrentMeasure", "v.chartShowLevels", "v.clickedfilters" - belong to control panel - should be fed in
        var node = component.get("v.node");
        var path = component.get("v.path");

        // "v.node" / "v.path" - belong to the chart
        var levels = component.get("v.chartShowLevels");
        var clickedfilters = component.get("v.chartClickedFilters");
        var chartCurrentMeasure = component.get("v.chartCurrentMeasure");
        var chartPrimaryId = component.get("v.chartPrimaryId");
        console.log("primary node id: " + chartPrimaryId);

        var shownodeids = [];
        var relatedNodes = _this.getRelatedNodes(component, levels);

        path.style("visibility", function(o) {

            var retval = "hidden";
            var sourcevis = o.source.measures[chartCurrentMeasure].visible;
            var targetvis = o.target.measures[chartCurrentMeasure].visible;

            var osourceid = o.source.id;
            var otargetid = o.target.id;

            var sourceindex = relatedNodes.indexOf(osourceid);
            var targetindex = relatedNodes.indexOf(otargetid);

            var primaryrelated = (sourceindex > -1 && targetindex > -1);

            if ((sourcevis === 1) && (targetvis === 1) && primaryrelated) {

                var index = clickedfilters.indexOf(o.type);

                if (index > -1) {
                    console.log('for: ' + o.source.name + '/' + o.target.name + " return TRUE");

                    var indexsource = shownodeids.indexOf(osourceid);
                    if (indexsource == -1) {
                        shownodeids.push(osourceid);
                    }

                    var indextarget = shownodeids.indexOf(otargetid);
                    if (indextarget == -1) {
                        shownodeids.push(otargetid);
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
                // TODO remove this line of debug
                if (oid == "000000000000000011") {console.log("seed distribution visible")};
                d3.select("#t" + oid).style("visibility", "visible");
                d3.select("#s" + oid).style("visibility", "visible");
                return "visible";
            } else {
                // TODO remove this line of debug
                if (oid == "000000000000000011") {console.log("seed distribution hidden")};
                d3.select("#t" + oid).style("visibility", "hidden");
                d3.select("#s" + oid).style("visibility", "hidden");
                return "hidden";
            }
        });
    },


    getRelatedNodes: function(component, level) {
        var _this = this;

        var looplevel = 0;

        var chartPrimaryId = component.get("v.chartPrimaryId");

        var linkednodes = [chartPrimaryId];

        while (looplevel < level) {
            var newnodes = [];
            looplevel++;

            var path = component.get("v.path");

            path.each(function(p) {

                var psourceid = p.source.id;
                var ptargetid = p.target.id;
                    
                var sourceindex = linkednodes.indexOf(psourceid);
                var targetindex = linkednodes.indexOf(ptargetid);
                if (sourceindex === -1 && targetindex > -1) {
                        newnodes.push(psourceid);
                    }
                    if (targetindex === -1 && sourceindex > -1) {
                        newnodes.push(ptargetid);
                    }
            });

            var arrayLength = newnodes.length;

            for (var i = 0; i < newnodes.length; i++) {
            var index = linkednodes.indexOf(newnodes[i]);
                if (index === -1) {
                    linkednodes.push(newnodes[i]);
                }
            }

        }
        return linkednodes;
    },

    // Method to resize nodes
    styleNodes: function(component, chartCurrentMeasure, primaryid) {
        var _this = this;
        // change the visibility of the connection path
        console.log("styleNodes : " + chartCurrentMeasure);
        console.log("primaryid : " + primaryid);

        if (primaryid != null)
        {
            component.set("v.chartPrimaryId", primaryid);        
        }
        else {
            primaryid = component.get("v.chartPrimaryId"); 
        }

        if (chartCurrentMeasure == null)
        {
            chartCurrentMeasure = component.get("v.chartCurrentMeasure"); 
        }
        
        var node = component.get("v.node");

        node.attr("r", function(o, i) {
            // needs to be computed using a configuration provided algorithm?
            return o.measures[chartCurrentMeasure].radius;
        });

        node.style("fill", function(o, i) {
            // needs to be computed using a configuration provided algorithm?
            return o.measures[chartCurrentMeasure].color;
        });

        node.style("stroke", function(o, i) {
            var stroke = o.stroke;
            var oid = o.id;
            if (oid == primaryid) {
                var primaryNodeHighlightingOn = component.get("v.primaryNodeHighlightingOn");
                if (primaryNodeHighlightingOn == true) {
                    stroke = component.get("v.primaryNodeHighlightingColour");
                }                
            }
            return stroke;
        });

        node.style("stroke-width", function(o, i) {
            var nodestrokewidth = component.get("v.nodestrokewidth");
            var oid = o.id;
            if (oid == primaryid) {
                nodestrokewidth = component.get("v.primaryNodeHighlightingRadius");
            }
            return nodestrokewidth;
        });
    },

    // TODO sort out relations
    setThisLinkType: function(component, indexer) {
        var cmpTarget = component.find('b' + indexer);
        $A.util.toggleClass(cmpTarget, 'slds-button_neutral');
        $A.util.toggleClass(cmpTarget, 'slds-button_brand');
        var isClicked = $A.util.hasClass(cmpTarget, 'slds-button_brand');
        var configjson = component.get("v.configjson");
        var thisType = configjson.filtertypes[indexer - 1];
        this.setLinkType(component, thisType, isClicked);
    },

    // TODO sort out relations
    setLinkType: function(component, thisType, isClicked) {
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
    },


    publishEvent : function(topic, parameters) {
        console.log("publishEvent: " + topic + " " + JSON.stringify(parameters));
        var appEvent = $A.get("e.c:evt_sfd3");
        appEvent.setParams({
            "topic" : topic,
            "parameters" : parameters
        });
        appEvent.fire();
    }


})