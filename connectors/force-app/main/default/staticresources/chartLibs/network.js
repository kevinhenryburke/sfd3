(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
        typeof define === 'function' && define.amd ? define(['exports'], factory) :
            (factory((global.bznetwork = global.bznetwork || {})));
}(this, (function (exports) {
    'use strict';

    console.log("loading: bznetwork IIFE");

    function getRelatedNodes(chartPrimaryId, componentReference, level) {
        let looplevel = 0;
        let linkednodes = [chartPrimaryId];

        while (looplevel < level) {
            let newnodes = [];
            looplevel++;

            let path = d3.select(bzutils.getDivId("pathGroup", componentReference, true))
                .selectAll("path")
                .each(function (p) {
                    let sourceindex = linkednodes.indexOf(p.sourceid);
                    let targetindex = linkednodes.indexOf(p.targetid);
                    if (sourceindex === -1 && targetindex > -1) {
                        newnodes.push(p.sourceid);
                    }
                    if (targetindex === -1 && sourceindex > -1) {
                        newnodes.push(p.targetid);
                    }
                }
                );

            for (let i = 0; i < newnodes.length; i++) {
                let index = linkednodes.indexOf(newnodes[i]);
                if (index === -1) {
                    linkednodes.push(newnodes[i]);
                }
            }

        }
        return linkednodes;
    }

    function nodeDataSetFunctionNodes() {
        return function (datajson) { return datajson.nodes; };
    }

    function refreshVisibilityHelper(storeObject) {
        console.log("refreshVisibilityHelper enter");

        let componentReference = bzchart.getStore(storeObject, "componentReference");
        let componentType = bzchart.getStore(storeObject, "componentType");

        if (componentType == "network.connections") {
            let levels = bzchart.getStore(storeObject, "showLevels");
            let filterValues = bzchart.getStore(storeObject, "filterValues");
            let primaryNodeId = bzchart.getStore(storeObject, "primaryNodeId");
            // not needed until reinstate measure level visibility

            let relatedNodes = bznetwork.getRelatedNodes(primaryNodeId, componentReference, levels);

            let path = d3.select(bzutils.getDivId("pathGroup", componentReference, true))
                .selectAll("path");

            let node = d3.select(bzutils.getDivId("nodeGroup", componentReference, true))
                .selectAll("circle")

            let shownodeids = [];

            path.style("visibility", function (p) {

                let sourcevis = 1;
                let targetvis = 1;

                let sourceindex = relatedNodes.indexOf(p.sourceid);
                let targetindex = relatedNodes.indexOf(p.targetid);

                let primaryrelated = (sourceindex > -1 && targetindex > -1);

                if ((sourcevis === 1) && (targetvis === 1) && primaryrelated) {
                    // DO NOT CHANGE TO LET, for some reason using let instead of var breaks this, need to work out why
                    var index = filterValues.indexOf(p.type);

                    if (index > -1) {
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
            node.style("visibility", function (o, i) {
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
        }
    }

    /* Connections Methods */

    function runSimulation(storeObject, path, node, text) {
        console.log("bznetwork.runSimulation enter");
        var datajson = bzchart.getStore(storeObject, "datajson");

        var simulation = bznetwork.initializeSimulationConnections(storeObject, datajson.nodes);

        bzchart.setStore(storeObject, "simulation", simulation);

        var forceLinks = bznetwork.buildForceLinks(path);
        var link_force = d3.forceLink(forceLinks.links)
            .id(function (d) { return d.id; });

        simulation.force("links", link_force);

        bznetwork.dragHandler(node, simulation);

        simulation.on("tick", function () {
            bznetwork.onTick(storeObject, path, node, text);
        });

        console.log("bznetwork.runSimulation exit");
    }

    function initializeSimulationConnections(storeObject, nodes) {
        var width = bzchart.getStore(storeObject, "width");
        var height = bzchart.getStore(storeObject, "height");

        // force example - https://bl.ocks.org/rsk2327/23622500eb512b5de90f6a916c836a40
        var attractForce = d3.forceManyBody().strength(5).distanceMax(400).distanceMin(60);
        var repelForce = d3.forceManyBody().strength(-800).distanceMax(200).distanceMin(30);

        var simulation = d3.forceSimulation()
            //add nodes
            .nodes(nodes)
            .force("center_force", d3.forceCenter(width / 2, height / 2))
            .alphaDecay(0.03).force("attractForce", attractForce).force("repelForce", repelForce);

        console.log("bznetwork.initializeSimulationConnections exit");
        return simulation;
    }

    function dragHandler(node, simulation) {
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
    }

    function transform(d, width, height) {
        var dx = bznetwork.limitborderx(d.x, width);
        var dy = bznetwork.limitbordery(d.y, height);
        return "translate(" + dx + "," + dy + ")";
    }

    function limitborderx(x, width) {
        return Math.max(Math.min(x, width) - 30, 20);
    }

    function limitbordery(y, height) {
        return Math.max(Math.min(y, height - 50), 20);
    }

    function onTick(storeObject, path, node, text) {
        var width = bzchart.getStore(storeObject, "width");
        var height = bzchart.getStore(storeObject, "height");
        //    if (bzutils.getCache (component, "hasPaths") == true) {
        path.attr("d", function (d) {
            var sx = bznetwork.limitborderx(d.source.x, width);
            var sy = bznetwork.limitbordery(d.source.y, height);
            var tx = bznetwork.limitborderx(d.target.x, width);
            var ty = bznetwork.limitbordery(d.target.y, height);
            var dx = tx - sx;
            var dy = ty - sy;
            var dr = Math.sqrt(dx * dx + dy * dy);
            return "M" + sx + "," + sy + "A" + dr + "," + dr + " 0 0,1 " + tx + "," + ty;
        });
        //    }
        node.attr("transform", function (d) {
            return bznetwork.transform(d, width, height);
        });
        //        if (bzutils.getCache (component, "hasText") == true) {
        text.attr("transform", function (d) {
            return bznetwork.transform(d, width, height);
        });
        //        }
    }

    function buildForceLinks(path) {
        var forceLinks = { "links": [] };

        path.data().forEach(function (p) {
            var sourceDatum = d3.select("#" + p.sourceid).datum();
            var targetDatum = d3.select("#" + p.targetid).datum();
            forceLinks["links"].push(
                {
                    "id": p.id,
                    "sourceid": p.sourceid,
                    "targetid": p.targetid,
                    "type": p.type,
                    "createdby": p.createdby,
                    "notes": p.notes,
                    "stroke": p.stroke,
                    "source": sourceDatum,
                    "target": targetDatum
                }
            );
        });

        console.log("buildForceLinks exit");
        return forceLinks;
    }


    function nodeDoubleClick(storeObject, primaryNodeId) {
        let componentReference = bzchart.getStore(storeObject, "componentReference");
        let componentType = bzchart.getStore(storeObject, "componentType");
        console.log("nodeDoubleClick componentType = " + componentType);

        // TODO this will need substantial enriching - e.g. pass current measure and whether to add nodes or to refresh etc.
        var cleanId = bzutils.removeComponentRef(componentReference, primaryNodeId);
        var eventParameters = { "primaryNodeId": cleanId, "componentReference": componentReference };
        console.log("nodeDoubleClick exit.");

        var preppedEvent = bzchart.prepareEvent(storeObject, "InitiateRefreshChart", eventParameters);
        return preppedEvent;
    }

    function textAdditionalAttribute(storeObject, text) {
        text.attr("x", 8)
            .attr("y", ".31em")
    }

    function pathMouseover(d, path, pathToolTipDiv) {
        var mouseoverpathid = d.id;

        path.style("stroke", o => (o.id === mouseoverpathid) ? "red" : "grey");
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
    }

    function pathMouseout(pathToolTipDiv) {
        pathToolTipDiv.transition()
            .delay(1000)
            .duration(2000)
            .style("opacity", 0);
    }

    function styleNodes(storeObject) {
        console.log("network.styleNodes enter");
        let componentReference = bzchart.getStore(storeObject, "componentReference");

        var primaryid = bzchart.getStore(storeObject, "primaryNodeId");

        var node = d3.select(bzutils.getDivId("nodeGroup", componentReference, true))
            .selectAll("circle");

        if (bzchart.getStore(storeObject, "updateSize")) {
            node.attr("r", function (o, i) {
                return bzchart.getFromMeasureScheme(storeObject, o, "Size");
            });
        }

        if (bzchart.getStore(storeObject, "updateColor")) {
            node.style("fill", function (o, i) {
                return bzchart.getFromMeasureScheme(storeObject, o, "Color");
            });
        }

        node.style("stroke", function (o, i) {
            var stroke = o.stroke;
            var oid = o.id;
            if (oid == primaryid) {
                var primaryNodeHighlightingOn = bzchart.getStore(storeObject, "primaryNodeHighlightingOn");
                if (primaryNodeHighlightingOn == true) {
                    stroke = bzchart.getStore(storeObject, "primaryNodeHighlightingColour");
                }
            }
            return stroke;
        });

        node.style("stroke-width", function (o, i) {
            var nodestrokewidth = bzchart.getStore(storeObject, "nodestrokewidth");
            var oid = o.id;
            if (oid == primaryid) {
                nodestrokewidth = bzchart.getStore(storeObject, "primaryNodeHighlightingRadius");
            }
            return nodestrokewidth;
        });
        console.log("network.styleNodes exit");
    }

    function initializeVisualsHelper(storeObject) {
        console.log("subhelper: enter initializeVisuals proper!");
        let variantsMixin = bzchart.getStore(storeObject, "chartMixin");

        var datajson = bzchart.getStore(storeObject, "datajson");
        var nodeGroup = bzchart.getStore(storeObject, "nodeGroup");
        var pathGroup = bzchart.getStore(storeObject, "pathGroup");
        var textGroup = bzchart.getStore(storeObject, "textGroup");
        var pathToolTipDiv = bzchart.getStore(storeObject, "pathToolTipDiv");
        var pathGroupId = bzchart.getStore(storeObject, "pathGroupId");

        var node = {};
        var text = {};
        var path = {};

        console.log("chartNetworkHelper: calling nodes");

        let nodeSelector = ".node";
        var nodeDataSetFunction = bznetwork.nodeDataSetFunctionNodes();

        var nodeEnterSelection = nodeGroup
            .selectAll(nodeSelector)
            .data(nodeDataSetFunction(datajson), function (d, i) { return d.id; })
            .enter();

        //        nodeSelection.exit().remove();    

        node = nodeEnterSelection
            .append("circle")
            .attr("id", d => d.id)
            .attr("recordid", d => d.recordid)
            // symbols...           .attr("d", d3.symbol().type( function(d) { return d3.symbols[4];}))
            .on('mouseout', function (d) { // hide the div
                var retainNodeDetailsMouseOut = bzchart.getStore(storeObject, "retainNodeDetailsMouseOut");
                if (!retainNodeDetailsMouseOut) {
                    let preppedEvent = variantsMixin.nodeMouseout(storeObject, d);
                    bzaura.publishPreppedEvent(storeObject, preppedEvent, $A.get("e.c:evt_sfd3"));
                }
            })
            .on('mouseover', $A.getCallback(function (d) { // need getCallback to retain context - https://salesforce.stackexchange.com/questions/158422/a-get-for-application-event-is-undefined-or-can-only-fire-once
                bzchart.setStore(storeObject, "mouseoverRecordId", d.id);
                let preppedEvent = variantsMixin.nodeMouseover(storeObject, d);
                bzaura.publishPreppedEvent(storeObject, preppedEvent, $A.get("e.c:evt_sfd3"));
            }))
            .on('click', function (d) {
                console.log("retrieve info on whether isiOS");
                if (bzchart.getStore(storeObject, "isiOS")) {
                    var now = new Date().getTime();
                    var lastTouch = bzchart.getStore(storeObject, "lastTouch");
                    var delta = now - lastTouch;
                    if (delta < 350 && delta > 0) {
                        // the second touchend event happened within half a second. Here is where we invoke the double tap code
                        //TODO implement - e.g. var win = window.open("http://news.bbc.co.uk"); win.focus();
                    }
                    bzchart.setStore(storeObject, "lastTouch", lastTouch);
                } else {
                    console.log("not iOS");
                }
                // reset the clicked node to be the primary
                // TODO This will need to be passed in the refreshVisibility call.
                var primaryNodeId = d.id;
                bzchart.setStore(storeObject, "primaryNodeId", primaryNodeId);

                variantsMixin.refreshVisibility(storeObject);
                variantsMixin.styleNodes(storeObject);
            })
            .on('dblclick', $A.getCallback(function (d) {
                console.log("dblclick");
                // Two options - complete refresh OR keep and get data from this point?
                // send a message identifying the node in question
                var primaryNodeId = d.id;
                bzchart.setStore(storeObject, "primaryNodeId", primaryNodeId);

                var preppedEvent = bznetwork.nodeDoubleClick(storeObject, primaryNodeId);

                bzaura.publishPreppedEvent(storeObject, preppedEvent, $A.get("e.c:evt_sfd3"));
            }))
            ;


        console.log("calling text");

        var textEnterSelection = textGroup
            .selectAll("g")
            .data(datajson.nodes, function (d, i) { return d.id; })
            .enter();

        text = textEnterSelection
            .append("svg:g")
            .attr("class", "nodeText");

        // A copy of the text with a thick white stroke for legibility ("s" for shadow, "t" for text).
        var svgText = text.append("svg:text");
        svgText
            .attr("id", d => "s" + d.id)
            .text(d => d.name)
            .attr("class", "chartTextShadow") // shadow class
        // .attr("x", 8)
        // .attr("y", ".31em");

        bznetwork.textAdditionalAttribute(storeObject, svgText);

        var svgText = text.append("svg:text");
        svgText
            .attr("id", d => "t" + d.id)
            .text(d => d.name)
            .attr("class", "chartText")
        // .attr("x", 8)
        // .attr("y", ".31em");

        bznetwork.textAdditionalAttribute(storeObject, svgText);

        // calling paths

        if (datajson.links == null) {
            datajson.links = [];
        }

        datajson.links.forEach(function (link) {
            var sourceElement = d3.select("#" + link.sourceid);
            var targetElement = d3.select("#" + link.targetid);
            link.source = sourceElement.datum();
            link.target = targetElement.datum();
        });

        var pathSelection = pathGroup
            .selectAll("path")
            .data(datajson.links, function (d, i) { return d.id; });

        path = pathSelection
            .enter().append("path")
            .attr("class", function (d) {
                return "link " + d.type;
            })
            .attr("stroke", d => d.stroke)
            .attr("id", d => d.id)
            .attr("sourceid", d => d.sourceid)
            .attr("targetid", d => d.targetid)
            .attr("marker-end", function (d) {
                return "url(#" + d.type + ")";
            })
            .on('mouseout', function (d) { // hide the div
                var showPathToolTip = bzchart.getStore(storeObject, "showPathToolTip");
                if (showPathToolTip) {
                    bznetwork.pathMouseout(pathToolTipDiv);
                }
            })
            .on('mouseover', $A.getCallback(function (d) {
                var showPathToolTip = bzchart.getStore(storeObject, "showPathToolTip");
                console.log("showPathToolTip: " + showPathToolTip);
                if (showPathToolTip) {
                    bznetwork.pathMouseover(d, path, pathToolTipDiv);
                }
            }));

        // overwrite path with the updated version.
        path = d3.select("#" + pathGroupId).selectAll("path");
        //        }

        console.log("apply node styling");
        variantsMixin.styleNodes(storeObject);

        console.log("apply node visibility");
        variantsMixin.refreshVisibility(storeObject);

        console.log("calling simulation from mixin");
        variantsMixin.runSimulation(storeObject, path, node, text);

    }


    // unsophisticated version is to remove everything and re-initialize
    function refreshDataHelper(storeObject, datajsonRefresh, primaryNodeId, showFilters) {
        console.log("refreshDataHelper enter");
        let componentReference = bzchart.getStore(storeObject, "componentReference");

        // delete the paths and the groups
        // this is not the preferred option - would have preferred to use d3 joins.
        bzchart.clearChart(componentReference);

        // retrieve the existing underlying data
        var datajson = bzchart.getStore(storeObject, "datajson");

        // initialize the new raw data, setting component references
        bzutils.initializeAddComponentRef(componentReference, datajsonRefresh);

        var nodeIds = [];
        datajson.nodes.forEach(function (node) {
            nodeIds.push(node["id"]);
        });

        datajsonRefresh.nodes.forEach(function (node) {
            var indexer = nodeIds.indexOf(node["id"]);
            if (indexer == -1) {
                datajson["nodes"].push(node); // this adds new nodes into datajson
            }
        });

        var linkIds = [];
        datajson.links.forEach(function (link) {
            linkIds.push(link["id"]);
        });

        datajsonRefresh.links.forEach(function (link) {
            datajson["links"].push(link);
        });

        // merge the old and the new data
        let variantsMixin = bzchart.getStore(storeObject, "chartMixin");
        variantsMixin.dataPreprocess(storeObject, datajson, datajsonRefresh);

        datajson = bzchart.getStore(storeObject, "datajson");

        // re-initialize the chart
        var isInit = false;
        bzchart.initializeGroups(storeObject, datajson, primaryNodeId, showFilters, isInit);

        bznetwork.initializeVisualsHelper(storeObject);
    }


    exports.getRelatedNodes = getRelatedNodes;
    exports.nodeDataSetFunctionNodes = nodeDataSetFunctionNodes;
    exports.refreshVisibilityHelper = refreshVisibilityHelper;
    exports.runSimulation = runSimulation;
    exports.initializeSimulationConnections = initializeSimulationConnections;
    exports.dragHandler = dragHandler;
    exports.transform = transform;
    exports.limitborderx = limitborderx;
    exports.limitbordery = limitbordery;
    exports.onTick = onTick;
    exports.buildForceLinks = buildForceLinks;
    exports.nodeDoubleClick = nodeDoubleClick;
    exports.textAdditionalAttribute = textAdditionalAttribute;
    exports.pathMouseover = pathMouseover;
    exports.pathMouseout = pathMouseout;
    exports.styleNodes = styleNodes;
    exports.initializeVisualsHelper = initializeVisualsHelper;
    exports.refreshDataHelper = refreshDataHelper;

    Object.defineProperty(exports, '__esModule', { value: true });

    console.log("loaded: bznetwork  IIFE");

})));

/* OVERRIDE MIXINS */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
        typeof define === 'function' && define.amd ? define(['exports'], factory) :
            (factory((global.chartNetworkMixin = global.chartNetworkMixin || {})));
}(this, (function (exports) {
    'use strict';

    console.log("loading: chartNetworkMixin IIFE");

    const OverrideMixin = {
        getDefaultSize() {
            return 20;
        },
        hasPrimaryNode() {
            return true;
        },
        refreshVisibility(storeObject) {
            bznetwork.refreshVisibilityHelper(storeObject);
        },

        nodeMouseover(storeObject, d) {
            let componentType = bzchart.getStore(storeObject, "componentType");
            console.log("nodeMouseover network mixin enter", componentType);

            // styling svg text content: http://tutorials.jenkov.com/svg/tspan-element.html
            var fields = d.fields;
            var fieldsLength = fields.length;

            var displayArray = [d.name];
            for (var i = 0; i < fieldsLength; i++) {
                if (fields[i].fieldType == "STRING" && fields[i].role != "name") {
                    displayArray.push(fields[i].retrievedValue);
                }
            }

            var textcontent = '<tspan x="10" y="0" style="font-weight: bold;">' + displayArray[0];
            textcontent += '</tspan>';
            textcontent += '<tspan x="10" dy="15">' + displayArray[1];
            if (displayArray.length > 2) {
                textcontent += ' (' + displayArray[2] + ')';
            }
            textcontent += '</tspan>';

            var tselect = "t" + d.id;
            var t = d3.select("#" + tselect);
            t.html(textcontent);

            var sselect = "s" + d.id;
            var s = d3.select("#" + sselect);
            s.html(textcontent);

            var publishParameters = { "data": d, "parent": null };
            console.log("nodeMouseover network mixin publishParameters", publishParameters);
            var preppedEvent = bzchart.prepareEvent(storeObject, "ChartMouseOver", publishParameters);
            preppedEvent.eventType = "Cache";
            return preppedEvent;
        },

        nodeMouseout(storeObject, d) {
            // revert back to just the name
            // styling svg text content: http://tutorials.jenkov.com/svg/tspan-element.html
            var textcontent = '<tspan x="10" y="0" style="font-weight: bold;">' + d.name;
            textcontent += '</tspan>';

            var tselect = "t" + d.id;
            var sselect = "s" + d.id;

            var t = d3.select("#" + tselect);
            t.html(textcontent);

            var s = d3.select("#" + sselect);
            s.html(textcontent);
        },

        styleNodes(storeObject) {
            bznetwork.styleNodes(storeObject);
        },

        searchChart(storeObject, searchTermId, searchAction, showLevels) {
            let componentReference = bzchart.getStore(storeObject, "componentReference");
            let primaryNodeId = bzutils.addComponentRef(componentReference, searchTermId);
            bzchart.setStore(storeObject, "primaryNodeId", primaryNodeId);
            bzchart.setStore(storeObject, "showLevels", showLevels);

            let variantsMixin = bzchart.getStore(storeObject, "chartMixin");
            variantsMixin.refreshVisibility(storeObject);
            variantsMixin.styleNodes(storeObject);
        },

        runSimulation(storeObject, path, node, text) {
            bznetwork.runSimulation(storeObject, path, node, text);
        }

    }

    exports.OverrideMixin = OverrideMixin;

    Object.defineProperty(exports, '__esModule', { value: true });

    console.log("loaded: chartNetworkMixin IIFE");


})));

