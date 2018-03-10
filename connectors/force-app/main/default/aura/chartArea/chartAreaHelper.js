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


    initializeDataV3: function (component, datajson, configjson, chartCurrentMeasure, chartPrimaryId, chartClickedFilters) {

        var _this = this;
        component.set("v.chartCurrentMeasure", chartCurrentMeasure);
        component.set("v.chartPrimaryId", chartPrimaryId);            
        component.set("v.chartClickedFilters", chartClickedFilters);            
                
        console.log("init:initializing chart ");
        var svg = component.get("v.svg");
        console.log(svg);
        var node = component.get("v.node");
        var path = component.get("v.path");
        var simulation = component.get("v.simulation");

        var chartArea = d3.select("#chartarea");
        var width = component.get("v.width") / 2;
        var height = component.get("v.height") / 2;

        // Styling of tooltips - see GitHub prior to Feb 24, 2018
        var nodeToolTipDiv = d3.select("#nodeToolTip");
        var pathToolTipDiv = d3.select("#pathToolTip");
        
        // Compute the distinct nodes from the links.
        datajson.links.forEach(function(link) {
            link.source = datajson.nodes[link.source];
            link.target = datajson.nodes[link.target];
        });

        var chartClickedFilters = component.get("v.chartClickedFilters");

        console.log("calling force");

        simulation = d3.layout.force()
            .nodes(d3.values(datajson.nodes))
            .links(datajson.links)
            .size([width, height])
            .linkDistance(200)
            .charge(-800)
            .on("tick", function() {
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
                });

                var text = component.get("v.text");
                text.attr("transform", function(d) {
                    return _this.transform(component, d);
                });
                component.set("v.text", text);
            })
            .start();

        console.log("called force");
            
        path = svg.append("g").selectAll("path")
            .data(simulation.links())
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
            // This is the previous implementation of tooltip
            //            .on('mouseover', pathtip.show)
            //            .on('mouseout', pathtip.hide);
            .on('mouseout', function(d) { // hide the div
                var showPathToolTip = component.get("v.showPathToolTip");
                if (showPathToolTip) {
                    pathToolTipDiv.transition()
                        .delay(3000)
                        .duration(2000)
                        .style("opacity", 0);
                }
            })
            .on('mouseover', function(d) { 
                var showPathToolTip = component.get("v.showPathToolTip");
                console.log("showPathToolTip: " + showPathToolTip);
                if (showPathToolTip) {
                    // "this" here is a path DOM element so use its id to match up with a d3 path
                    if (component.get("v.showPathToolTip"))
                    {
                        var mouseoverpathid = this.id;

                        path.style("stroke", function(o, i) {
                            if (o.id === mouseoverpathid) {
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
                    }
                }
            })

        node = svg.append("g").selectAll("circle")
            .data(simulation.nodes())
            .enter().append("circle")
            // set data related attributes - visual styling is applied later
            .attr("id", function(d) {
                return d.id;
            })
            .on('mouseout', function(d) { // hide the div
                // TODO - add an attribute if want to remove details.
                // Need to be abstracted - so card vars are provided to this visualization

                if (!component.get("v.retainNodeDetalsMouseOut"))
                {
                    component.set("v.card1", d.name);
                    // styling svg text content: http://tutorials.jenkov.com/svg/tspan-element.html
                    var textcontent = '<tspan x="10" y="0" style="font-weight: bold;">' + component.get("v.card1") ;
                    textcontent += '</tspan>'; 

                    var t = d3.select("#t" + d.id);
                    t.html(textcontent);
                    var s = d3.select("#s" + d.id);
                    s.html(textcontent);
                }
            })
            .on('mouseover', $A.getCallback(function(d) { // need getCallback to retain context - https://salesforce.stackexchange.com/questions/158422/a-get-for-application-event-is-undefined-or-can-only-fire-once
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

                var t = d3.select("#t" + d.id);
                t.html(textcontent);
                var s = d3.select("#s" + d.id);
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
                component.set("v.chartPrimaryId", d.id);
                _this.refreshVisibility(component);
                _this.styleNodes(component, null, d.id);
            })
            .on('dblclick', function(d) {
                var win = window.open("/" + d.id, '_blank');
                win.focus();

            })
            .call(simulation.drag);

            
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


        component.set("v.text", text);

        component.set("v.node", node);
        component.set("v.path", path);
        component.set("v.simulation", simulation);

        console.log("apply node styling");
        _this.styleNodes(component, chartCurrentMeasure, chartPrimaryId);

        console.log("apply node visibility");
        _this.refreshVisibility(component);

        component.set("v.initialized", true);
        
    },


    initializeDataV4: function (component, datajson, configjson, chartCurrentMeasure, chartPrimaryId, chartClickedFilters) {

        var _this = this;
        component.set("v.chartCurrentMeasure", chartCurrentMeasure);
        component.set("v.chartPrimaryId", chartPrimaryId);            
        component.set("v.chartClickedFilters", chartClickedFilters);            
                
        console.log("init:initializing chart ");
        var svg = component.get("v.svg");
        console.log(svg);
        // use the name convention from d3 tutorials (e.g. http://www.puzzlr.org/force-directed-graph-minimal-working-example/)
        // variables called simulation, node, path
        var simulation = component.get("v.simulation");
        var node = component.get("v.node");
        var path = component.get("v.path");

        var chartArea = d3.select("#chartarea");
        var width = component.get("v.width") / 2;
        var height = component.get("v.height") / 2;

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
            
        simulation.force("links",link_force)    ;

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
                        .delay(6000)
                        .duration(2000)
                        .style("opacity", 0);
                }
            })
            .on('mouseover', function(d) { 
                var showPathToolTip = component.get("v.showPathToolTip");
                console.log("showPathToolTip: " + showPathToolTip);
                if (showPathToolTip) {
                    // "this" here is a path DOM element so use its id to match up with a d3 path
                    if (component.get("v.showPathToolTip"))
                    {
                        var mouseoverpathid = this.id;

                        path.style("stroke", function(o, i) {
                            if (o.id === mouseoverpathid) {
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
                
                    }
                }
            });

        console.log("calling nodes");
        
        node = svg.append("g").selectAll("circle")
            .data(simulation.nodes())
            .enter().append("circle")
            // set data related attributes - visual styling is applied later
            .attr("id", function(d) {
                return d.id;
            })
            .on('mouseout', function(d) { // hide the div
                // TODO - add an attribute if want to remove details.
                // Need to be abstracted - so card vars are provided to this visualization

                if (!component.get("v.retainNodeDetalsMouseOut"))
                {
                    component.set("v.card1", d.name);
                    // styling svg text content: http://tutorials.jenkov.com/svg/tspan-element.html
                    var textcontent = '<tspan x="10" y="0" style="font-weight: bold;">' + component.get("v.card1") ;
                    textcontent += '</tspan>'; 

                    var t = d3.select("#t" + d.id);
                    t.html(textcontent);
                    var s = d3.select("#s" + d.id);
                    s.html(textcontent);
                }
            })
            .on('mouseover', $A.getCallback(function(d) { // need getCallback to retain context - https://salesforce.stackexchange.com/questions/158422/a-get-for-application-event-is-undefined-or-can-only-fire-once
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

                var t = d3.select("#t" + d.id);
                t.html(textcontent);
                var s = d3.select("#s" + d.id);
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
                component.set("v.chartPrimaryId", d.id);
                _this.refreshVisibility(component);
                _this.styleNodes(component, null, d.id);
            })
            .on('dblclick', function(d) {
                var win = window.open("/" + d.id, '_blank');
                win.focus();

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

        component.set("v.text", text);

        component.set("v.node", node);
        component.set("v.path", path);
        component.set("v.simulation", simulation);

        console.log("apply node styling");
        _this.styleNodes(component, chartCurrentMeasure, chartPrimaryId);

        console.log("apply node visibility");
        _this.refreshVisibility(component);

        component.set("v.initialized", true);
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

            var sourceindex = relatedNodes.indexOf(o.source.id);
            var targetindex = relatedNodes.indexOf(o.target.id);

            var primaryrelated = (sourceindex > -1 && targetindex > -1);

            if ((sourcevis === 1) && (targetvis === 1) && primaryrelated) {

                var index = clickedfilters.indexOf(o.type);

                if (index > -1) {
                    console.log('for: ' + o.source.name + '/' + o.target.name + " return TRUE");

                    var indexsource = shownodeids.indexOf(o.source.id);
                    if (indexsource == -1) {
                        shownodeids.push(o.source.id);
                    }

                    var indextarget = shownodeids.indexOf(o.target.id);
                    if (indextarget == -1) {
                        shownodeids.push(o.target.id);
                    }
                }
            }

            return (index > -1) ? "visible" : "hidden";
        });

        // change the visibility of the node
        // if all the links with that node are invisibile, the node should also be invisible
        // otherwise if any link related to that node is visibile, the node should be visible
        node.style("visibility", function(o, i) {
            var index = shownodeids.indexOf(o.id);
            if (index > -1) {
                d3.select("#t" + o.id).style("visibility", "visible");
                d3.select("#s" + o.id).style("visibility", "visible");
                return "visible";
            } else {
                d3.select("#t" + o.id).style("visibility", "hidden");
                d3.select("#s" + o.id).style("visibility", "hidden");
                return "hidden";
            }
        });
    },


    getRelatedNodes: function(component, level) {

        var looplevel = 0;

        var chartPrimaryId = component.get("v.chartPrimaryId");

        var linkednodes = [chartPrimaryId];

        while (looplevel < level) {
            var newnodes = [];
            looplevel++;

            var path = component.get("v.path");

            path.each(function(p) {
                    // if the source node is 
                var sourceindex = linkednodes.indexOf(p.source.id);
                var targetindex = linkednodes.indexOf(p.target.id);
                    if (sourceindex === -1 && targetindex > -1) {
                        newnodes.push(p.source.id);
                    }
                    if (targetindex === -1 && sourceindex > -1) {
                        newnodes.push(p.target.id);
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
            if (o.id == primaryid) {
                var primaryNodeHighlightingOn = component.get("v.primaryNodeHighlightingOn");
                if (primaryNodeHighlightingOn == true) {
                    stroke = component.get("v.primaryNodeHighlightingColour");
                }                
            }
            return stroke;
        });

        node.style("stroke-width", function(o, i) {
            var nodestrokewidth = component.get("v.nodestrokewidth");
            if (o.id == primaryid) {
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