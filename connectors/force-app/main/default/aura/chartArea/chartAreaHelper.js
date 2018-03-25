({

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
        if (dataItem.indexOf("compref") > -1) { // don't double index  
            console.log("avoiding a double compref for item " + dataItem);
            return dataItem;
        }
        return component.get("v.componentReference") + dataItem;
    },    

    // remove component specific prefix from id - this will allow original references to be retrieved
    removeComponentRef: function(component, dataItem) {
        var indexer = component.get("v.componentReference").length;
        return dataItem.substring(indexer);
    },    

    // TODO - this is experimental - cut down the signature
    // removes all nodes, paths and text and resets
    refreshData: function (component, datajson, configjson, chartCurrentMeasure, chartPrimaryId, chartClickedFilters) {
        var _this = this;
        console.log("chartArea: enter refreshData");

        // unsophisticated version is to remove everything and re-initialize
        var svg = component.get("v.svg");
        var path = svg.selectAll("path").remove();
        var node = svg.selectAll("circle").remove();
        var text = svg.selectAll(".nodeText").remove();

        _this.initializeData(component, datajson, configjson, chartCurrentMeasure, chartPrimaryId, chartClickedFilters);                 
        
        console.log("chartArea: exit refreshData");

    },
    
    
    initializeData: function (component, datajson, configjson, chartCurrentMeasure, chartPrimaryId, chartClickedFilters) {

        var _this = this;

        console.log("init:initializing initializeData ");
        _this.initializeAddComponentRef(component, datajson);
        console.log(datajson);

        chartPrimaryId = _this.addComponentRef(component, chartPrimaryId);

        component.set("v.chartCurrentMeasure", chartCurrentMeasure);
        component.set("v.chartPrimaryId", chartPrimaryId);            
        component.set("v.chartClickedFilters", chartClickedFilters);            
                
        var svg = component.get("v.svg");
        // use the name convention from d3 tutorials (e.g. http://www.puzzlr.org/force-directed-graph-minimal-working-example/)
        // variables called simulation, node, path
        var node = component.get("v.node");
        var path = component.get("v.path");

        var width = component.get("v.width");  
        var height = component.get("v.height");  

        // Styling of tooltips - see GitHub prior to Feb 24, 2018

        var nodeToolTipDiv = d3.select("#nodeToolTip");

        var pathToolTipDivId = _this.addComponentRef(component, "pathToolTip");
        var pathToolTipDiv = d3.select("#" + pathToolTipDivId);
        
        // Compute the distinct nodes from the links.
        datajson.links.forEach(function(link) {
            link.source = datajson.nodes[link.source];
            link.target = datajson.nodes[link.target];
        });

        var chartClickedFilters = component.get("v.chartClickedFilters");


        //draw lines for the links 
        console.log("calling paths");

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
                    berlioz.chart.pathMouseout(pathToolTipDiv);
                }

            })
            .on('mouseover', $A.getCallback(function(d) { 
                var showPathToolTip = component.get("v.showPathToolTip");
                console.log("showPathToolTip: " + showPathToolTip);
                if (showPathToolTip) {
                    if (component.get("v.showPathToolTip"))
                    {
                        berlioz.chart.pathMouseover(d,path,pathToolTipDiv);
                   }
                }
            }));

        component.set("v.path", path);
            
        console.log("calling nodes");
        
        node = svg.append("g").selectAll("circle")
            .data(datajson.nodes)
            .enter().append("circle")
            // set data related attributes - visual styling is applied later
            .attr("id", function(d) {
                return d.id;
            })

// symbols...           .attr("d", d3.symbol().type( function(d) { return d3.symbols[4];}))

            .on('mouseout', function(d) { // hide the div
                if (!component.get("v.retainNodeDetailsMouseOut"))
                {
                    berlioz.chart.nodeMouseout(d);
                }
            })
            .on('mouseover', $A.getCallback(function(d) { // need getCallback to retain context - https://salesforce.stackexchange.com/questions/158422/a-get-for-application-event-is-undefined-or-can-only-fire-once
                console.log("mouseover: " + d.name);
                component.set("v.mouseoverRecordId", d.id);

                berlioz.chart.nodeMouseover(d);
                // send out a notification that we've moused over this node
                _this.publishEvent(component, "UpdateCard", d);
            }))
            .on('click', function(d) {

//                var isiOS = component.get("v.isiOS");
                console.log("retrieve info on whether isiOS");
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
                var chartPrimaryId = d.id;
                component.set("v.chartPrimaryId", chartPrimaryId);

                _this.refreshVisibility(component);
                _this.styleNodes(component, null, chartPrimaryId);
            })
            .on('dblclick', $A.getCallback(function(d) {
                // TODO re-initialize
                // Two options - complete refresh OR keep and get data from this point?
                // send a message identifying the node in question
                // TODO this will need substantial enriching - e.g. pass current measure and whether to add nodes or to refresh etc.
                var chartPrimaryId = d.id;
                component.set("v.chartPrimaryId", chartPrimaryId);
                var originalId = _this.removeComponentRef(component, d.id);
                _this.publishEvent(component, "InitiateRefreshChart", {"chartPrimaryId" : originalId, "componentReference" : component.get("v.componentReference")});
            }));

        component.set("v.node", node);
            
        console.log("calling text");    
    
        var text = component.get("v.text");

        text = svg.append("svg:g")
            .selectAll("g")
            .data(datajson.nodes)
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

        component.set("v.text", text);
    
        console.log("apply node styling");
        _this.styleNodes(component, chartCurrentMeasure, chartPrimaryId);

        console.log("apply node visibility");
        _this.refreshVisibility(component);
    
                
        /* Above should be common to some degree - Below is forceSimulation specific */

        console.log("calling layout / simulation");

        var simulation = berlioz.simulation.initializeSimulation(datajson.nodes, width, height);
        component.set("v.simulation", simulation);
        
        var link_force =  d3.forceLink(datajson.links)
            .id(function(d) { return d.id; });
           
        simulation.force("links",link_force);

        berlioz.simulation.dragHandler(node, simulation);

        console.log("calling tick");    

        simulation.on("tick", function() {
            berlioz.simulation.onTick (width, height, path, node, text);
        });                


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

    publishEvent : function(component, topic, parameters) {
        console.log("publishEvent: " + topic + " " + JSON.stringify(parameters));

        var publisher = component.get("v.componentReference");
        var publisherType = component.get("v.componentType");
        var controller = component.get("v.UserControllerComponentId");    

        console.log("publisherType: " + publisherType );
        console.log("controller: " + controller );
        var appEvent = $A.get("e.c:evt_sfd3");
        appEvent.setParams({
            "topic" : topic,
            "publisher" : publisher,
            "publisherType" : publisherType,
            "controller" : controller,
            "parameters" : parameters
        });
        appEvent.fire();
    },

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