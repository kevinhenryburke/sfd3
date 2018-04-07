console.log("loading: Berlioz external libraries");

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.berlioz.utils = global.berlioz.utils || {})));
}(this, (function (exports) { 'use strict';

console.log("loading: Berlioz.utils IIFE");

var version = "0.0.1";
var debugMode = true;

// Data Cache
// It it handy to have some data stored outside lightning as lightning loses context.
// These are Data Caches and can exist in both general and context specific forms. They can hold data derived from configuration, from data or data supporting processing.
// Each store is indexed by a component reference, hence the name componentCache.

// Data Store to hold data derived from configuration
var componentCache = {};

function initializeCache (componentReference) {
    componentCache[componentReference] = {};
}

function setCache (componentReference, key, value) {
    componentCache[componentReference][key] = value;
}

function getCache (componentReference, key) {
    var referenceParameters = componentCache[componentReference];
    return referenceParameters[key];
}

function showCache (componentReference) {
    berlioz.utils.log(componentCache[componentReference]);
}

function showCacheAll () {
    berlioz.utils.log(componentCache);
}

function log (logItem) {
    if (debugMode == true) {
        console.log(logItem);
    } 
}

// replace ids with component specific versions - this will allow multiple charts on a page without conflict
function initializeAddComponentRef(componentReference, datajson) {
    if (datajson.nodes != null) {
    datajson.nodes.forEach(function(node) {
        node["id"] = berlioz.utils.addComponentRef(componentReference, node["id"]);
    })};
        
    if (datajson.links != null) {
    datajson.links.forEach(function(link) {
        link["id"] = berlioz.utils.addComponentRef(componentReference, link["id"]);
        link["sourceid"] = berlioz.utils.addComponentRef(componentReference, link["sourceid"]);
        link["targetid"] = berlioz.utils.addComponentRef(componentReference, link["targetid"]);
    })};
}    

function addComponentRef(componentReference, dataItem) {
    if (dataItem.indexOf("compref") > -1) { // don't double index  
        console.log("avoiding a double compref for item " + dataItem);
        return dataItem;
    }
    return componentReference + dataItem;
}

// remove component specific prefix from id - this will allow original references to be retrieved
function removeComponentRef(componentReference, dataItem) {
    var indexer = componentReference.length;
    return dataItem.substring(indexer);
}    

function getDivId (idType, componentReference, forSelect) {
    return (forSelect ? "#" : "") + componentReference + idType;
}



/* This is how to list all the properties and all functions in a module

console.log(Object.getOwnPropertyNames(berlioz.utils));

console.log(Object.getOwnPropertyNames(berlioz.utils).filter(function (p) {
    return typeof berlioz.utils[p] === 'function';
}));        
*/

function r0 (fname) {
}

function r1 (fname, arg0) {
    if (fname == "refreshVisibility") {
        var componentReference = arg0;
        var componentType = berlioz.utils.getCache (componentReference, "componentType") ;
        if (componentType == "chart.connections") {
            return berlioz.chart.refreshVisibility(arg0); 
        }
        else {
            return berlioz.chart.influence.refreshVisibility(arg0); 
        }
    }
    if (fname == "styleNodes") {
        var componentReference = arg0;
        var componentType = berlioz.utils.getCache (componentReference, "componentType") ;
        berlioz.chart.styleNodes(componentReference);
    }
    if (fname == "pathMouseout") {
        var pathToolTipDiv = arg0;
        berlioz.chart.pathMouseout(pathToolTipDiv);
    }
    if (fname == "nodeMouseout") {
        var d = arg0;
        berlioz.chart.nodeMouseout(d);
    }
    if (fname == "nodeSelector") {
        var componentReference = arg0;
        var componentType = berlioz.utils.getCache (componentReference, "componentType") ;
        if (componentType == "Pack") {
            return berlioz.pack.nodeSelector();
        }
        else {
            return berlioz.chart.nodeSelector();
        }
    }
    if (fname == "nodeDataSetFunction") {
        var componentReference = arg0;
        var componentType = berlioz.utils.getCache (componentReference, "componentType") ;
        if (componentType == "Pack") {
            return berlioz.pack.nodeDataSetFunctionNodes(componentReference);
        }
        else {
            return berlioz.utils.nodeDataSetFunctionNodes();
        }
    }
    if (fname == "nodeDataKeyFunction") {
        var componentReference = arg0;
        var componentType = berlioz.utils.getCache (componentReference, "componentType") ;
        if (componentType == "Pack") {
            return berlioz.utils.nodeDataKeyFunctionId ();
        }
        else {
            return berlioz.utils.nodeDataKeyFunctionId ();
        }
    }

}

function r2 (fname, arg0, arg1) {
    if (fname == "nodeMouseover") {
        var componentReference = arg0;
        var d = arg1;
        berlioz.chart.nodeMouseover(d);
        // send out a notification that we've moused over this node
        berlioz.chart.publishEvent(componentReference, "ChartMouseOver", d);
    }
    if (fname == "nodeDoubleClick") {
        var componentReference = arg0;
        var primaryNodeId = arg1;
        // TODO this will need substantial enriching - e.g. pass current measure and whether to add nodes or to refresh etc.
        var cleanId = berlioz.utils.removeComponentRef(componentReference, primaryNodeId);
        var eventParameters = {"primaryNodeId" : cleanId, "componentReference" : componentReference};
        berlioz.chart.publishEvent(componentReference, "InitiateRefreshChart", eventParameters);
    }
}

function r3 (fname, arg0, arg1, arg2) {
    if (fname == "pathMouseover") {
        var d = arg0;
        var path = arg1;
        var pathToolTipDiv = arg2;
        berlioz.chart.pathMouseover(d, path, pathToolTipDiv);
    }
}

function r4 (fname, arg0, arg1, arg2, arg3) {
    if (fname == "runSimulation") {
        var componentReference = arg0;
        var componentType = berlioz.utils.getCache (componentReference, "componentType") ;
        if (componentType == "chart.connections") {
            return berlioz.simulation.runSimulation(arg0, arg1, arg2, arg3); 
        }
        else {
            return berlioz.chart.influence.runSimulation(arg0, arg1, arg2, arg3); 
        }
    }
}

/*
// not used at present
function simpleHash(s) {
    berlioz.utils.log("berlioz.utils.simpleHash enter for: " + s);
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
*/


function publishEvent(topic, publisher, publisherType, parameters, controller) {
    console.log("berlioz.utils.publishEvent: " + topic + " " + JSON.stringify(parameters));

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
}

function nodeDataSetFunctionNodes () { 
    console.log("nodeDataSetFunctionNodes enter"); 
    return function(datajson) { return datajson.nodes;};
}

function nodeDataKeyFunctionId (d, i) { 
    return function(d, i) { return d.id;};
}

exports.log = log;
exports.initializeAddComponentRef = initializeAddComponentRef;
exports.addComponentRef = addComponentRef;
exports.removeComponentRef = removeComponentRef;
exports.publishEvent = publishEvent;
exports.initializeCache = initializeCache;
exports.setCache = setCache;
exports.getCache = getCache;
exports.showCache = showCache;
exports.showCacheAll = showCacheAll;
exports.getDivId = getDivId;
exports.r0 = r0;
exports.r1 = r1;
exports.r2 = r2;
exports.r3 = r3;
exports.r4 = r4;
exports.nodeDataSetFunctionNodes = nodeDataSetFunctionNodes;
exports.nodeDataKeyFunctionId = nodeDataKeyFunctionId;


Object.defineProperty(exports, '__esModule', { value: true });

console.log("loaded: Berlioz.utils  IIFE");

})));


/* TODO Split this to new file */

// The idea is that d3 complexities are placed in this file and we can have different files for different chart types
// If not then things may start to get extremely complex insight the lightning components and we would not have code reusabilty
// So should include things like mouseover controls, things relating to particular node types.

// Things that are common to all charts should remain in Lightning, e.g. set up of SVG area
// Also all Salesforce connectivity should remain there 
// Still to decide on criteria to determine variable storage
// Other worry is around singleton usage on multiple charts on one page - how will these variables react??

// PROBLEM - Different Charts access the same variables here, so setting one will set in another, so can only hold immutable variables (or build complex key / values)
// Will have to store in Lightning Attributes (which is probably right anyway)

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.berlioz.chart = global.berlioz.chart || {})));
}(this, (function (exports) { 'use strict';

console.log("loading: Berlioz.chart IIFE");

var version = "0.0.1";

var isiOS = false;

function pathMouseover (d,path,pathToolTipDiv) {
    console.log("Berlioz.chart.pathMouseover enter");

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

    console.log("Berlioz.chart.pathMouseover exit");
    
}

function pathMouseout (pathToolTipDiv) {
    console.log("Berlioz.chart.pathMouseout enter");

    pathToolTipDiv.transition()
        .delay(1000)
        .duration(2000)
        .style("opacity", 0);

    console.log("Berlioz.chart.pathMouseout exit");
}

function nodeMouseover (d) {
    console.log("Berlioz.chart.nodeMouseover enter");
    // styling svg text content: http://tutorials.jenkov.com/svg/tspan-element.html
    var textcontent = '<tspan x="10" y="0" style="font-weight: bold;">' + d.name ;
    textcontent += '</tspan>'; 
    textcontent += '<tspan x="10" dy="15">' + d.position;
    textcontent += ' (' + d.account + ')</tspan>';

    var tselect =  "t" + d.id;
    var sselect =  "s" + d.id;

    var t = d3.select("#" + tselect);
    berlioz.utils.log("mouseover: " + textcontent);
    berlioz.utils.log(t);
    t.html(textcontent);
    var s = d3.select("#" + sselect);
    s.html(textcontent);

    console.log("Berlioz.chart.nodeMouseover exit");
}

function nodeMouseout (d) {
    console.log("Berlioz.chart.nodeMouseout enter");
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
    console.log("Berlioz.chart.nodeMouseout exit");
}

function getRelatedNodes (chartPrimaryId, componentReference, level) {

    var looplevel = 0;

    var linkednodes = [chartPrimaryId];

    while (looplevel < level) {
        var newnodes = [];
        looplevel++;

        var path = d3.select(berlioz.utils.getDivId("pathGroup", componentReference, true))
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

        var arrayLength = newnodes.length;

        for (var i = 0; i < newnodes.length; i++) {
        var index = linkednodes.indexOf(newnodes[i]);
            if (index === -1) {
                linkednodes.push(newnodes[i]);
            }
        }

    }
    return linkednodes;
}

// Method to re-style nodes
function styleNodes (componentReference) {

    var primaryid = berlioz.utils.getCache (componentReference, "primaryNodeId") ;
    var currentMeasure = berlioz.utils.getCache (componentReference, "currentMeasure") ;

    console.log("styleNodes enter: " + currentMeasure + " primaryid: " + primaryid);

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

    console.log("styleNodes exit");
    
}

function setFilterVisibility (component, filterType, isShown) {
    console.log("setFilterVisibility enter");
    var componentReference = component.get("v.componentReference");
    var showFilters = berlioz.utils.getCache (componentReference, "showFilters") ;
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
    berlioz.utils.setCache (componentReference, "showFilters", showFilters ) ;
    console.log("setFilterVisibility exit");
}

function refreshVisibility(componentReference) {

    console.log("refreshVisibility enter "); 

    var levels = berlioz.utils.getCache(componentReference, "showLevels") ;
    
    var showFilters = berlioz.utils.getCache (componentReference, "showFilters") ;
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

            var index = showFilters.indexOf(p.type);

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

    console.log("refreshVisibility exit "); 
}

// clear out the paths and the groups
function clearChart(componentReference) {
    console.log("clearChart enter "); 
    var svg = d3.select(berlioz.utils.getDivId("svg", componentReference, true));
    var path = svg.selectAll("path").remove();
    var node = svg.selectAll("circle").remove();
    var text = svg.selectAll(".nodeText").remove();
    d3.select(berlioz.utils.getDivId("pathGroup", componentReference, true)).remove();
    d3.select(berlioz.utils.getDivId("nodeGroup", componentReference, true)).remove();
    d3.select(berlioz.utils.getDivId("textGroup", componentReference, true)).remove();
    console.log("clearChart exit "); 
}

function publishEvent(componentReference, topic, parameters) {
//    var publisherType = berlioz.utils.getCache (componentReference, "componentType") ;
    var publisherType = "Chart"; // think about changing this..
    
    var controller = berlioz.utils.getCache (componentReference, "UserControllerComponentId") ;
    berlioz.utils.publishEvent(topic, componentReference, publisherType, parameters, controller);
}

function nodeSelector () {
    return "circle";
}


exports.pathMouseover = pathMouseover;
exports.pathMouseout = pathMouseout;
exports.nodeMouseover = nodeMouseover;
exports.nodeMouseout = nodeMouseout;
exports.getRelatedNodes = getRelatedNodes;
exports.refreshVisibility = refreshVisibility;
exports.setFilterVisibility = setFilterVisibility;
exports.clearChart = clearChart;
exports.publishEvent = publishEvent;
exports.styleNodes = styleNodes;
exports.nodeSelector = nodeSelector;

exports.isiOS = isiOS;

Object.defineProperty(exports, '__esModule', { value: true });

console.log("loaded: Berlioz.chart  IIFE");

})));


/* Split this into new file */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.berlioz.simulation = global.berlioz.simulation || {})));
}(this, (function (exports) { 'use strict';

console.log("loading: Berlioz.simulation IIFE");

var version = "0.0.1";

function initializeSimulation (componentReference, nodes) {
    console.log("Berlioz.simulation.initializeSimulation enter");
    var width = berlioz.utils.getCache (componentReference, "width") ;  
    var height = berlioz.utils.getCache (componentReference, "height") ; 

    // force example - https://bl.ocks.org/rsk2327/23622500eb512b5de90f6a916c836a40
    var attractForce = d3.forceManyBody().strength(5).distanceMax(400).distanceMin(60);
    var repelForce = d3.forceManyBody().strength(-800).distanceMax(200).distanceMin(30);

    var simulation = d3.forceSimulation()
        //add nodes
        .nodes(nodes) 
        .force("center_force", d3.forceCenter(width / 2, height / 2))
        .alphaDecay(0.03).force("attractForce",attractForce).force("repelForce",repelForce);
    
    console.log("Berlioz.simulation.initializeSimulation exit");
    return simulation;
}

function dragHandler (node, simulation) {
    console.log("Berlioz.simulation.dragHandler enter");
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
    console.log("Berlioz.simulation.dragHandler exit");
}
    
function transform (d, width, height) {
    var dx = limitborderx(d.x, width);
    var dy = limitbordery(d.y, height);
    return "translate(" + dx + "," + dy + ")";
}

function limitborderx(x, width) {
    return Math.max(Math.min(x, width) -30, 20);
}

function limitbordery(y, height) {
    return Math.max(Math.min(y, height - 50), 20 );
}    

function onTick (componentReference, path, node, text) {
    var width = berlioz.utils.getCache (componentReference, "width") ;  
    var height = berlioz.utils.getCache (componentReference, "height") ; 
    path.attr("d", function(d) {
        var sx = limitborderx(d.source.x, width);
        var sy = limitbordery(d.source.y, height);
        var tx = limitborderx(d.target.x, width);
        var ty = limitbordery(d.target.y, height);
        var dx = tx - sx;
        var dy = ty - sy;
        var dr = Math.sqrt(dx * dx + dy * dy);
        return "M" + sx + "," + sy + "A" + dr + "," + dr + " 0 0,1 " + tx + "," + ty;
    });
    node.attr("transform", function(d) {
        return transform (d, width, height);
    });
    text.attr("transform", function(d) {
        return transform (d, width, height);
    });
}

function buildForceLinks(path) {
    console.log("buildForceLinks enter"); 
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
}

function runSimulation(componentReference, path, node, text ) {
    console.log("runSimulation enter"); 

    var datajson = berlioz.utils.getCache (componentReference, "datajson") ;
    var simulation = berlioz.simulation.initializeSimulation(componentReference, datajson.nodes);            
    berlioz.utils.setCache (componentReference, "simulation", simulation ) ;

    var forceLinks = berlioz.simulation.buildForceLinks(path);
    var link_force =  d3.forceLink(forceLinks.links)
        .id(function(d) { return d.id; });

    simulation.force("links",link_force);

    berlioz.simulation.dragHandler(node, simulation);

    simulation.on("tick", function() {
        berlioz.simulation.onTick (componentReference, path, node, text);
    });             
    console.log("runSimulation exit"); 
}


Object.defineProperty(exports, '__esModule', { value: true });

exports.initializeSimulation = initializeSimulation;
exports.dragHandler = dragHandler;
exports.onTick = onTick;
exports.buildForceLinks = buildForceLinks;
exports.runSimulation = runSimulation;
// temporary
exports.transform = transform;
exports.limitborderx = limitborderx;
exports.limitbordery = limitbordery;


console.log("loaded: Berlioz.simulation  IIFE");

})));

/* Split this into new file */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.berlioz.chart.influence = global.berlioz.chart.influence || {})));
}(this, (function (exports) { 'use strict';

console.log("loading: berlioz.chart.influence IIFE");

var version = "0.0.1";

function refreshVisibility(componentReference) {
}

function runSimulation(componentReference, path, node, text ) {
    console.log("runSimulation enter"); 

    var datajson = berlioz.utils.getCache (componentReference, "datajson") ;
    var simulation = berlioz.chart.influence.initializeSimulation(componentReference, datajson.nodes);            
    berlioz.utils.setCache (componentReference, "simulation", simulation ) ;

    var forceLinks = berlioz.simulation.buildForceLinks(path);
    var link_force =  d3.forceLink(forceLinks.links)
        .id(function(d) { return d.id; });

    simulation.force("links",link_force);

    berlioz.simulation.dragHandler(node, simulation);

    simulation.on("tick", function() {
        berlioz.simulation.onTick (componentReference, path, node, text);
    });             
    console.log("runSimulation exit"); 
}

function initializeSimulation (componentReference, nodes) {
    console.log("berlioz.chart.influence.initializeSimulation enter");
    var width = berlioz.utils.getCache (componentReference, "width") ;  
    var height = berlioz.utils.getCache (componentReference, "height") ; 
    var sizeDivisor = 100;
    var nodePadding = 2.5;
    var currentMeasure = berlioz.utils.getCache (componentReference, "currentMeasure") ; 

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
    
    console.log("berlioz.chart.influence.initializeSimulation exit");
    return simulation;
}


exports.refreshVisibility = refreshVisibility;
exports.runSimulation = runSimulation;
exports.initializeSimulation = initializeSimulation;


console.log("loaded: berlioz.chart.influence  IIFE");

})));

/* Split this into new file */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.berlioz.chart.connections = global.berlioz.chart.connections || {})));
}(this, (function (exports) { 'use strict';

console.log("loading: berlioz.chart.connections IIFE");

var version = "0.0.1";

console.log("loaded: berlioz.chart.connections  IIFE");

})));




/* Split this into new file */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.berlioz.pack = global.berlioz.pack || {})));
}(this, (function (exports) { 'use strict';

console.log("loading: berlioz.pack IIFE");

function nodeSelector () {
    return ".node";
}

function nodeDataSetFunctionNodes (componentReference) { 
    console.log("nodeDataSetFunctionNodes enter"); 
    return function(datajson) { 
        console.log("nodeDataSetFunctionNodes computing callback");
        var root = d3.hierarchy(datajson)
        .sum(function(d) { return d.size; })
        .sort(function(a, b) { return b.value - a.value; });

        var diameter = berlioz.utils.getCache (componentReference, "width") ;  
        console.log("nodeDataSetFunctionNodes diameter: " + diameter);
        
//        var diameter = svg.attr("width");
        
        var pack = d3.pack()
        .size([diameter - 4, diameter - 4]);
        return pack(root).descendants();
    };
}


// TODO for zoomable pack

function update() {
    var nodes = berlioz.pack.flatten(root),
        links = d3.layout.tree().links(nodes);
  
    // Restart the force layout.
    force
        .nodes(nodes)
        .links(links)
        .start();
  
    // Update the links…
    link = vis.selectAll("line.link")
        .data(links, function(d) { return d.target.id; });
  
    // Enter any new links.
    link.enter().insert("svg:line", ".node")
        .attr("class", "link")
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
  
    // Exit any old links.
    link.exit().remove();
  
    // Update the nodes…
    node = vis.selectAll("circle.node")
        .data(nodes, function(d) { return d.id; })
        .style("fill", color);
  
    node.transition()
        .attr("r", function(d) { return d.children ? 4.5 : Math.sqrt(d.size) / 10; });
  
    // Enter any new nodes.
    node.enter().append("svg:circle")
        .attr("class", "node")
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; })
        .attr("r", function(d) { return d.children ? 4.5 : Math.sqrt(d.size) / 10; })
        .style("fill", color)
        .on("click", click)
        .call(force.drag);
  
    // Exit any old nodes.
    node.exit().remove();
  }
  
  function tick() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
  
    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  }
  
  // Color leaf nodes orange, and packages white or blue.
  function color(d) {
    return d._children ? "#3182bd" : d.children ? "#c6dbef" : "#fd8d3c";
  }
  
  // Toggle children on click.
  function click(d) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
    berlioz.pack.update();
  }
  
  // Returns a list of all nodes under the root.
  function flatten(root) {
    var nodes = [], i = 0;
  
    function recurse(node) {
      if (node.children) node.size = node.children.reduce(function(p, v) { return p + recurse(v); }, 0);
      if (!node.id) node.id = ++i;
      nodes.push(node);
      return node.size;
    }
  
    root.size = recurse(root);
    return nodes;
  }

  console.log("loaded: berlioz.pack  IIFE");

  exports.nodeSelector = nodeSelector;
  exports.nodeDataSetFunctionNodes = nodeDataSetFunctionNodes;  
  
  exports.update = update;
  exports.tick = tick;
  exports.color = color;
  exports.click = click;
  exports.flatten = flatten;


})));




// var root = d3.hierarchy(datajson)
// .sum(function(d) { return d.size; })
// .sort(function(a, b) { return b.value - a.value; });

// var diameter = svg.attr("width");

// var pack = d3.pack()
// .size([diameter - 4, diameter - 4]);

// .data(pack(root).descendants()) // different data
