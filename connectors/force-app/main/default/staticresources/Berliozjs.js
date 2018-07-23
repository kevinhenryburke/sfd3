console.log("loading: Berlioz external libraries");

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.bzutils = global.bzutils || {})));
}(this, (function (exports) { 'use strict';

console.log("loading: bzutils IIFE");

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
    bzutils.log(componentCache[componentReference]);
}

function showCacheAll () {
    bzutils.log(componentCache);
}

function log (logItem) {
    if (debugMode == true) {
        console.log(logItem);
    } 
}

function doNothing () {
}

// replace ids with component specific versions - this will allow multiple charts on a page without conflict
function initializeAddComponentRef(componentReference, datajson) {
    if (datajson.nodes != null) {
    datajson.nodes.forEach(function(node) {
        node["id"] = bzutils.addComponentRef(componentReference, node["id"]);
        node["recordid"] = bzutils.removeComponentRef(componentReference, node["id"]);
    })};
        
    if (datajson.links != null) {
    datajson.links.forEach(function(link) {
        link["id"] = bzutils.addComponentRef(componentReference, link["id"]);
        link["sourceid"] = bzutils.addComponentRef(componentReference, link["sourceid"]);
        link["targetid"] = bzutils.addComponentRef(componentReference, link["targetid"]);
    })};
}    

function addComponentRef(componentReference, recordid) {
    if (recordid.indexOf("compref") > -1) { // don't double index  
        console.log("avoiding a double compref for recordid " + recordid);
        return recordid;
    }
    return componentReference + recordid;
}

// remove component specific prefix from id - this will allow original references to be retrieved
function removeComponentRef(componentReference, recordidEnriched) {
    if (recordidEnriched.indexOf("compref") > -1) { // compref present
        var indexer = componentReference.length;
        return recordidEnriched.substring(indexer);
    }
    return recordidEnriched;
}    

function getDivId (idType, componentReference, forSelect) {
    return (forSelect ? "#" : "") + componentReference + idType;
}

// handy function to retrieve a D3 Node from a DOM id
function getNodeFromId (id) {
    return d3.select("#" + id).data()[0];
}



/* This is how to list all the properties and all functions in a module

console.log(Object.getOwnPropertyNames(bzutils));

console.log(Object.getOwnPropertyNames(bzutils).filter(function (p) {
    return typeof bzutils[p] === 'function';
}));        
*/

/* 
Delegates to an appropriate function based on componentReference. This includes deriving the componentType and picking up the correct delegate based on that attribute.
Note: The delegated function is assumed to have componentReference as its first argument 
*/

function xfcr(functionType, componentReference /*, args */) {
    console.log("xfcr: functionType: " + functionType);
    var componentType = bzutils.getCache (componentReference, "componentType");
    console.log("xfcr: componentType: " + componentType);
    var functionName = bzconfig.fns[componentType][functionType];
    console.log("xfcr: functionName: " + functionName);

    var context = context == undefined? window:context;
    var args = Array.prototype.slice.call(arguments, 1);
    var namespaces = functionName.split(".");
    var func = namespaces.pop();
    for(var i = 0; i < namespaces.length; i++) {
      context = context[namespaces[i]];
    }
    return context[func].apply(context, args);
}

/* 
Delegates to an appropriate function based on componentType.
Note: The delegated function is NOT assumed to have componentType as its first argument 
If componentType is needed then supply it twice in the calling parameters
*/

function xfct(functionType, componentType /*, args */) {
    var functionName = bzconfig.fns[componentType][functionType];

    var context = context == undefined? window:context;
    var args = Array.prototype.slice.call(arguments, 2);
    var namespaces = functionName.split(".");
    var func = namespaces.pop();
    for(var i = 0; i < namespaces.length; i++) {
      context = context[namespaces[i]];
    }
    return context[func].apply(context, args);
}

function getParam(componentType /*, args */) {
    console.log("getParam enter");
    var args = Array.prototype.slice.call(arguments, 1);
    var retValue = null;
    var loopJson = bzconfig.params[componentType];
    for (var i=0; i<args.length;i++) {
        if (loopJson.hasOwnProperty([args[i]])) {
            console.log("loopJson: " + args[i]);
            retValue = loopJson[args[i]];
            loopJson = loopJson[args[i]];
        }
        else {
            return;
        }    
    }
    console.log("getParam exit: " + retValue);
    return retValue;
}

function hasParam(componentType /*, args */) {
    var args = Array.prototype.slice.call(arguments, 1);
    var retValue = true;
    var loopJson = bzconfig.params[componentType];
    for (var i=0; i<args.length;i++) {
        if (loopJson.hasOwnProperty([args[i]])) {
            console.log("loopJson: " + args[i]);
            loopJson = loopJson[args[i]];
        }
        else {
            return false;
        }    
    }
    return true;
}


/*
// not used at present
function simpleHash(s) {
    bzutils.log("bzutils.simpleHash enter for: " + s);
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

function publishEvent(topic, publisher, publisherCategory, publisherType, parameters, controller) {
    console.log("bzutils.publishEvent: " + topic + " " + JSON.stringify(parameters));

    console.log("publisherCategory: " + publisherCategory );
    console.log("publisherType: " + publisherType );
    console.log("controller: " + controller );

    var appEvent = $A.get("e.c:evt_sfd3");
    appEvent.setParams({
        "topic" : topic,
        "publisher" : publisher,
        "publisherCategory" : publisherCategory,
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
exports.doNothing = doNothing;
exports.xfcr = xfcr;
exports.xfct = xfct;
exports.getParam = getParam;
exports.hasParam = hasParam;

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
exports.getNodeFromId = getNodeFromId;
exports.nodeDataSetFunctionNodes = nodeDataSetFunctionNodes;
exports.nodeDataKeyFunctionId = nodeDataKeyFunctionId;

Object.defineProperty(exports, '__esModule', { value: true });

console.log("loaded: bzutils  IIFE");

})));


(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.bzconfig = global.bzconfig || {})));
}(this, (function (exports) { 'use strict';

console.log("loading: bzconfig IIFE");

// Represents the functions to call for each of the configured display areas


var fns = 
{
    "ctree" : {
        "nodeDataSetFunction" : "bzpack.nodeDataSetFunctionNodes",
        "nodeDataKeyFunction" : "bzutils.nodeDataKeyFunctionId",
        "refreshVisibility" : "bzutils.doNothing",
        "styleNodes" : "bzutils.doNothing",
        "pathMouseover" : "bzchart.pathMouseover",
        "pathMouseout" : "bzchart.pathMouseout",
        "nodeMouseout" : "bzutils.doNothing",
        "nodeMouseover" : "bzctree.nodeMouseover",
        "nodeDoubleClick" : "bzutils.doNothing",     
        "runSimulation" : "bzutils.doNothing",      
        "nodeAdditionalAttribute" : "bzpack.nodeAdditionalAttribute", 
        "textAdditionalAttribute" : "bzutils.doNothing", 
        "dataPreProcess" : "bzutils.doNothing", 
    },
    "pack" : {
        "nodeDataSetFunction" : "bzpack.nodeDataSetFunctionNodes",
        "nodeDataKeyFunction" : "bzutils.nodeDataKeyFunctionId",
        "refreshVisibility" : "bzutils.doNothing",
        "styleNodes" : "bzutils.doNothing",
        "pathMouseover" : "bzchart.pathMouseover",
        "pathMouseout" : "bzchart.pathMouseout",
        "nodeMouseout" : "bzutils.doNothing",
        "nodeMouseover" : "bzpack.nodeMouseover",
        "nodeDoubleClick" : "bzutils.doNothing",     
        "runSimulation" : "bzutils.doNothing",      
        "nodeAdditionalAttribute" : "bzpack.nodeAdditionalAttribute", 
        "textAdditionalAttribute" : "bzutils.doNothing", 
        "dataPreProcess" : "bzutils.doNothing", 
    },
    "chart.connections" : { 
        "nodeDataSetFunction" : "bzutils.nodeDataSetFunctionNodes",
        "nodeDataKeyFunction" : "bzutils.nodeDataKeyFunctionId",
        "refreshVisibility" : "bzchart.refreshVisibility",
        "styleNodes" : "bzchart.styleNodes",
        "pathMouseover" : "bzchart.pathMouseover",
        "pathMouseout" : "bzchart.pathMouseout",
        "nodeMouseout" : "bzchart.nodeMouseout",
        "nodeMouseover" : "bzchart.nodeMouseover",
        "nodeDoubleClick" : "bzchart.nodeDoubleClick",        
        "runSimulation" : "bzsimulation.runSimulation",        
        "nodeAdditionalAttribute" : "bzutils.doNothing", 
        "textAdditionalAttribute" : "bzchart.textAdditionalAttribute", 
        "dataPreProcess" : "bzutils.doNothing", 
    },    
    "chart.influence" : {
        "nodeDataSetFunction" : "bzutils.nodeDataSetFunctionNodes",
        "nodeDataKeyFunction" : "bzutils.nodeDataKeyFunctionId",
        "refreshVisibility" : "bzutils.doNothing",
        "styleNodes" : "bzchart.styleNodes",
        "pathMouseover" : "bzchart.pathMouseover",
        "pathMouseout" : "bzchart.pathMouseout",
        "nodeMouseout" : "bzchart.nodeMouseout",
        "nodeMouseover" : "bzchart.nodeMouseover",
        "nodeDoubleClick" : "bzchart.nodeDoubleClick",        
        "runSimulation" : "bzinfluence.runSimulation",        
        "nodeAdditionalAttribute" : "bzutils.doNothing", 
        "textAdditionalAttribute" : "bzchart.textAdditionalAttribute", 
        "dataPreProcess" : "bzinfluence.tempPreProcess", 
    },    
} 

var params = 
{
    "ctree" : {
        "node" : {
            "selector" : ".node",            
            "appendType" : "g",            
            "styleclassText" : "chartText",
            "styleclassTextShadow" : "chartTextShadow",
        },
    },
    "pack" : {
        "node" : {
            "selector" : ".node",            
            "appendType" : "g",            
            "styleclassText" : "chartText",
            "styleclassTextShadow" : "chartTextShadow",
        },
    },
    "chart.connections" : { // real
        "node" : {  
            "selector" : "circle",            
            "appendType" : "circle",            
            "styleclassText" : "chartText",
            "styleclassTextShadow" : "chartTextShadow",
        },
        "path" : {},
        "text" : {},
    },    
    "chart.influence" : {
        "node" : {
            "selector" : "circle",            
            "appendType" : "circle",            
            "styleclassText" : "chartText",
            "styleclassTextShadow" : "chartTextShadow",
        },
        "path" : {},
        "text" : {},
    },    
} 


exports.fns = fns;
exports.params = params;

Object.defineProperty(exports, '__esModule', { value: true });

console.log("loaded: bzconfig  IIFE");

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
	(factory((global.bzchart = global.bzchart || {})));
}(this, (function (exports) { 'use strict';

console.log("loading: bzchart IIFE");

var version = "0.0.1";

var isiOS = false;

function pathMouseover (componentReference, d,path,pathToolTipDiv) {
    console.log("bzchart.pathMouseover enter");

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

    console.log("bzchart.pathMouseover exit");
    
}

function pathMouseout (componentReference, pathToolTipDiv) {
    console.log("bzchart.pathMouseout enter");

    pathToolTipDiv.transition()
        .delay(1000)
        .duration(2000)
        .style("opacity", 0);

    console.log("bzchart.pathMouseout exit");
}

function nodeMouseover (componentReference, d) {
    console.log("bzchart.nodeMouseover enter");
    // styling svg text content: http://tutorials.jenkov.com/svg/tspan-element.html
    var textcontent = '<tspan x="10" y="0" style="font-weight: bold;">' + d.name ;
    textcontent += '</tspan>'; 
    textcontent += '<tspan x="10" dy="15">' + d.position;
    textcontent += ' (' + d.account + ')</tspan>';

    var tselect =  "t" + d.id;
    var sselect =  "s" + d.id;

    var t = d3.select("#" + tselect);
    bzutils.log("mouseover: " + textcontent);
    bzutils.log(t);
    t.html(textcontent);
    var s = d3.select("#" + sselect);
    s.html(textcontent);

    bzchart.publishEvent(componentReference, "ChartMouseOver", d);

    console.log("bzchart.nodeMouseover exit");
}

function nodeMouseout (componentReference, d) {
    console.log("bzchart.nodeMouseout enter.");
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
    console.log("bzchart.nodeMouseout exit.");
}

function nodeDoubleClick (componentReference, primaryNodeId) {
    console.log("bzchart.nodeDoubleClick enter");
    // TODO this will need substantial enriching - e.g. pass current measure and whether to add nodes or to refresh etc.
    var cleanId = bzutils.removeComponentRef(componentReference, primaryNodeId);
    var eventParameters = {"primaryNodeId" : cleanId, "componentReference" : componentReference};
    bzchart.publishEvent(componentReference, "InitiateRefreshChart", eventParameters);
    console.log("bzchart.nodeDoubleClick exit.");
}
    
function textAdditionalAttribute (componentReference, text) {
    console.log("bzchart.textAdditionalAttribute enter");    
    // push over to right and up a smidge
    text
        .attr("x", 8)
        .attr("y", ".31em")
    console.log("bzchart.textAdditionalAttribute exit");    
}



function getRelatedNodes (chartPrimaryId, componentReference, level) {

    var looplevel = 0;

    var linkednodes = [chartPrimaryId];

    while (looplevel < level) {
        var newnodes = [];
        looplevel++;

        var path = d3.select(bzutils.getDivId("pathGroup", componentReference, true))
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

    var primaryid = bzutils.getCache (componentReference, "primaryNodeId") ;
    var currentMeasure = bzutils.getCache (componentReference, "currentMeasure") ;

    console.log("styleNodes enter: " + currentMeasure + " primaryid: " + primaryid);

    var node = d3.select(bzutils.getDivId("nodeGroup", componentReference, true))
        .selectAll("circle")  ;

    bzutils.log("styleNodes:" + JSON.stringify(node));

    node.attr("r", function(o, i) {
        return o.measures[currentMeasure].radius;
    });

    node.style("fill", function(o, i) {
        bzutils.log("styleNodes: fill: " + o.measures[currentMeasure].color);
        return o.measures[currentMeasure].color;
    });

    node.style("stroke", function(o, i) {
        var stroke = o.stroke;
        var oid = o.id;
        if (oid == primaryid) {
            var primaryNodeHighlightingOn = bzutils.getCache (componentReference, "primaryNodeHighlightingOn") ;
            if (primaryNodeHighlightingOn == true) {
                stroke = bzutils.getCache (componentReference, "primaryNodeHighlightingColour") ;
            }                
        }
        return stroke;
    });

    node.style("stroke-width", function(o, i) {
        var nodestrokewidth = bzutils.getCache (componentReference, "nodestrokewidth") ;
        var oid = o.id;
        if (oid == primaryid) {
            nodestrokewidth = bzutils.getCache (componentReference, "primaryNodeHighlightingRadius") ;
        }
        return nodestrokewidth;
    });

    console.log("styleNodes exit");
    
}

function setFilterVisibility (component, filterType, isShown) {
    console.log("setFilterVisibility enter");
    var componentReference = component.get("v.componentReference");
    var showFilters = bzutils.getCache (componentReference, "showFilters") ;
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
    bzutils.setCache (componentReference, "showFilters", showFilters ) ;
    console.log("setFilterVisibility exit");
}

function refreshVisibility(componentReference) {

    console.log("refreshVisibility enter "); 

    var levels = bzutils.getCache(componentReference, "showLevels") ;
    
    var showFilters = bzutils.getCache (componentReference, "showFilters") ;
    var primaryNodeId = bzutils.getCache (componentReference, "primaryNodeId") ;        
    // not needed until reinstate measure level visibility
    var currentMeasure = bzutils.getCache (componentReference, "currentMeasure") ;

    var relatedNodes = bzchart.getRelatedNodes(primaryNodeId, componentReference, levels);

    var path = d3.select(bzutils.getDivId("pathGroup", componentReference, true))
        .selectAll("path")  ;

    var node = d3.select(bzutils.getDivId("nodeGroup", componentReference, true))
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
                bzutils.log(p.sourceid + '/' + p.targetid + " will be visible");

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
    var svg = d3.select(bzutils.getDivId("svg", componentReference, true));
    var path = svg.selectAll("path").remove();
    var node = svg.selectAll("circle").remove();
    var text = svg.selectAll(".nodeText").remove();
    d3.select(bzutils.getDivId("pathGroup", componentReference, true)).remove();
    d3.select(bzutils.getDivId("nodeGroup", componentReference, true)).remove();
    d3.select(bzutils.getDivId("textGroup", componentReference, true)).remove();
    console.log("clearChart exit "); 
}

function publishEvent(componentReference, topic, parameters) {
//    var publisherType = bzutils.getCache (componentReference, "componentType") ;
//    var publisherType = "Chart"; // think about changing this..
    var publisherCategory = bzutils.getCache (componentReference, "componentCategory") ;
    var publisherType = bzutils.getCache (componentReference, "componentType") ;
    
    var controller = bzutils.getCache (componentReference, "UserControllerComponentId") ;
    bzutils.publishEvent(topic, componentReference, publisherCategory, publisherType, parameters, controller);
}


exports.pathMouseover = pathMouseover;
exports.pathMouseout = pathMouseout;
exports.nodeMouseover = nodeMouseover;
exports.nodeMouseout = nodeMouseout;
exports.nodeDoubleClick = nodeDoubleClick;
exports.textAdditionalAttribute = textAdditionalAttribute;
exports.getRelatedNodes = getRelatedNodes;
exports.refreshVisibility = refreshVisibility;
exports.setFilterVisibility = setFilterVisibility;
exports.clearChart = clearChart;
exports.publishEvent = publishEvent;
exports.styleNodes = styleNodes;

exports.isiOS = isiOS;

Object.defineProperty(exports, '__esModule', { value: true });

console.log("loaded: bzchart  IIFE");

})));


/* Split this into new file */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.bzsimulation = global.bzsimulation || {})));
}(this, (function (exports) { 'use strict';

console.log("loading: bzsimulation IIFE");

var version = "0.0.1";

function initializeSimulation (componentReference, nodes) {
    console.log("bzsimulation.initializeSimulation enter");
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
    
    console.log("bzsimulation.initializeSimulation exit");
    return simulation;
}

function dragHandler (node, simulation) {
    console.log("bzsimulation.dragHandler enter");
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
    console.log("bzsimulation.dragHandler exit");
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
    var width = bzutils.getCache (componentReference, "width") ;  
    var height = bzutils.getCache (componentReference, "height") ; 
//    if (bzutils.getCache (componentReference, "hasPaths") == true) {
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
//    }
    node.attr("transform", function(d) {
        return transform (d, width, height);
    });
    if (bzutils.getCache (componentReference, "hasText") == true) {
        text.attr("transform", function(d) {
            return transform (d, width, height);
        });
    }
}

function buildForceLinks(path) {
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
}

function runSimulation(componentReference, path, node, text ) {
    console.log("runSimulation enter"); 

    var datajson = bzutils.getCache (componentReference, "datajson") ;
    var simulation = bzsimulation.initializeSimulation(componentReference, datajson.nodes);            
    bzutils.setCache (componentReference, "simulation", simulation ) ;

    var forceLinks = bzsimulation.buildForceLinks(path);
    var link_force =  d3.forceLink(forceLinks.links)
        .id(function(d) { return d.id; });

    simulation.force("links",link_force);

    bzsimulation.dragHandler(node, simulation);

    simulation.on("tick", function() {
        bzsimulation.onTick (componentReference, path, node, text);
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


console.log("loaded: bzsimulation  IIFE");

})));

/* Split this into new file */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.bzinfluence = global.bzinfluence || {})));
}(this, (function (exports) { 'use strict';

console.log("loading: bzinfluence IIFE");

var version = "0.0.1";

function runSimulation(componentReference, path, node, text ) {
    console.log("runSimulation enter"); 

    var datajson = bzutils.getCache (componentReference, "datajson") ;
    var simulation = bzinfluence.initializeSimulation(componentReference, datajson.nodes);            
    bzutils.setCache (componentReference, "simulation", simulation ) ;

    var forceLinks = bzsimulation.buildForceLinks(path);
    var link_force =  d3.forceLink(forceLinks.links)
        .id(function(d) { return d.id; });

    simulation.force("links",link_force);

    bzsimulation.dragHandler(node, simulation);

    simulation.on("tick", function() {
        bzsimulation.onTick (componentReference, path, node, text);
    });             
    console.log("runSimulation exit"); 
}

function initializeSimulation (componentReference, nodes) {
    console.log("bzinfluence.initializeSimulation enter");
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
    
    console.log("bzinfluence.initializeSimulation exit");
    return simulation;
}

function tempPreProcess(componentReference, datajsonBefore, datajsonRefresh ) {
    var all1 = 0;
    for (var i = 0; i < datajsonBefore.nodes.length; i++){
//        datajson.nodes[i].measures["Posts"].radius = Math.floor((Math.random() * 60) + 10); 
        all1 += datajsonRefresh.nodes[i].measures["Posts"].radius;
        datajsonBefore.nodes[i].measures["Posts"].radius = datajsonRefresh.nodes[i].measures["Posts"].radius;
    }    
    console.log("all1: " + all1);
    bzutils.setCache (componentReference, "datajson", datajsonBefore ) ;
}    

exports.tempPreProcess = tempPreProcess;


exports.runSimulation = runSimulation;
exports.initializeSimulation = initializeSimulation;


console.log("loaded: bzinfluence  IIFE");

})));


/* Split this into new file */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.bzpack = global.bzpack || {})));
}(this, (function (exports) { 'use strict';

console.log("loading: bzpack IIFE");

function nodeDataSetFunctionNodes (componentReference) { 
    console.log("nodeDataSetFunctionNodes enter: componentReference " + componentReference); 
    return function(datajson) { 
        console.log("nodeDataSetFunctionNodes computing callback " + componentReference);
        var root = d3.hierarchy(datajson)
        .sum(function(d) { return d.size; })
        .sort(function(a, b) { return b.value - a.value; });

        var diameter = bzutils.getCache (componentReference, "width") ;  
        console.log("nodeDataSetFunctionNodes diameter: " + diameter);
        
        var pack = d3.pack()
        .size([diameter - 4, diameter - 4]);
        return pack(root).descendants();
    };
}


function nodeMouseover (componentReference, d) {
    console.log("bzpack.nodeMouseover enter");
    console.log(d);
    // // styling svg text content: http://tutorials.jenkov.com/svg/tspan-element.html
    // var textcontent = '<tspan x="10" y="0" style="font-weight: bold;">' + d.name ;
    // textcontent += '</tspan>'; 
    // textcontent += '<tspan x="10" dy="15">' + d.position;
    // textcontent += ' (' + d.account + ')</tspan>';

    // var tselect =  "t" + d.id;
    // var sselect =  "s" + d.id;

    // var t = d3.select("#" + tselect);
    // bzutils.log("mouseover: " + textcontent);
    // bzutils.log(t);
    // t.html(textcontent);
    // var s = d3.select("#" + sselect);
    // s.html(textcontent);

    // TODO this is not the best .... needs a new mechanism
    var pubme = {"name" : d.data.name, "account" : d.value, "position" : d.children?  d.children.length : 0};

    bzchart.publishEvent(componentReference, "ChartMouseOver", pubme);

    console.log("bzpack.nodeMouseover exit");
}

function nodeAdditionalAttribute (componentReference, node) {
    console.log("bzpack.nodeAdditionalAttribute enter");    

    node.attr("transform", "translate(2,2)") // new
        .attr("class", function(d) { return d.children ? "packbranch node" : "packleaf node"; })
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })

    node.append("title")
        .text(function(d) { return d.data.name + "\n" + d3.format(",d")(d.value); }); // this is the d3 value accessor which handles sum in hierarchy layout 

    node.append("circle")
        .attr("r", function(d) { return d.r; });

    node.filter(function(d) { return !d.children; }).append("text")
        .attr("dy", "0.3em")
        .text(function(d) { return d.data.name.substring(0, d.r / 3); });

    console.log("bzpack.nodeAdditionalAttribute exit");
}


// TODO for zoomable pack


function update() {
    var nodes = bzpack.flatten(root),
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
    bzpack.update();
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

  console.log("loaded: bzpack  IIFE");

  exports.nodeDataSetFunctionNodes = nodeDataSetFunctionNodes;  
  exports.nodeMouseover = nodeMouseover;
  exports.nodeAdditionalAttribute = nodeAdditionalAttribute;
  
  // zoomable
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



/* Split this into new file */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.bzctree = global.bzctree || {})));
}(this, (function (exports) { 'use strict';

    console.log("loading: bzctree IIFE");

    // Note that x and y are seemingly the wrong way round - x is vertical, y is horizontal

    var canExpandColor = "lightsteelblue";
    var expandedColor = "white";

//    var treemap;
//    var root;
    

    function getCanExpandColor (componentReference, d) {
        var color = canExpandColor;

        var ParentColorsValues = bzutils.getCache (componentReference, "ParentColorsValues") ;
        var ParentColorsNames = bzutils.getCache (componentReference, "ParentColorsNames") ;

        for (var i = 0; i < ParentColorsValues.length; i++) {
            if (d.data.size != null && d.data.size >= ParentColorsValues[i]) {
                color = ParentColorsNames[i];
            } else {
                break;
            }
        }
        return color;
    }

    function getExpandedColor (componentReference, d) { // TODO demo stuff only
        // the logic for this should be set by configuration
        var color = expandedColor;

        var LeafColorsValues = bzutils.getCache (componentReference, "LeafColorsValues") ;
        var LeafColorsNames = bzutils.getCache (componentReference, "LeafColorsNames") ;

        for (var i = 0; i < LeafColorsValues.length; i++) {
            if (d.data.size != null && d.data.size >= LeafColorsValues[i]) {
                color = LeafColorsNames[i];
            } else {
                break;
            }
        }
        return color;
    }

    // Collapse the node and all it's children
    function collapse(d) {
        if(d.children) {
            d._children = d.children
            d._children.forEach(collapse)
            d.children = null
        }
    }
      
    /* TODO: this is pretty bad - builds up a huge list of events as context gets lost when we create new nodes
    Need to find a better way!!!!!!
    */
    
    function nodeMouseover (componentReference, d) {
        console.log("bzctree.nodeMouseover enter");
        console.log(d);
    
        // TODO this is not the best .... needs a new mechanism
        var pubme = {"name" : d.data.name, "account" : d.parent ? d.parent.data.name : "Top Level", "position" : d.depth};
        
        if (d.depth == 1) {
            bzchart.publishEvent(componentReference, "ChartMouseOver", pubme);

            // reset cache of events for mouseover events to publish - may be a better way to do this!
            // the issue is that only the top orginally created nodes have lightning context, not sure why
            // alternative would be to pass in a parameter for these nodes and push events only when the attribute is set
            var appEvents = [];
            for (var i = 0; i < 100; i++) {
                appEvents.push($A.get("e.c:evt_sfd3"));
            }
            bzutils.setCache (componentReference, "appEvents",  appEvents) ;
        } 
        else {
            var appEvents = bzutils.getCache (componentReference, "appEvents") ;
            var appEvent = appEvents.pop();

            console.log("appEvents: " + appEvents.length);
            
            bzctree.publishEvent(componentReference, "ChartMouseOver", pubme, appEvent);    
        }
        console.log("bzctree.nodeMouseover exit");
    }

    
    function publishEvent(componentReference, topic, parameters, appEvent) {
        var publisherCategory = bzutils.getCache (componentReference, "componentCategory") ;
        var publisherType = bzutils.getCache (componentReference, "componentType") ;
        
        var controller = bzutils.getCache (componentReference, "UserControllerComponentId") ;
        console.log("bzutils.publishEvent: " + topic + " " + JSON.stringify(parameters));
    
        console.log("publisherCategory: " + publisherCategory );
        console.log("publisherType: " + publisherType );
        console.log("controller: " + controller );
    
        appEvent.setParams({
            "topic" : topic,
            "publisher" : componentReference,
            "publisherCategory" : publisherCategory,
            "publisherType" : publisherType,
            "controller" : controller,
            "parameters" : parameters
        });
        appEvent.fire();
    }
            
    exports.getCanExpandColor = getCanExpandColor;  
    exports.getExpandedColor = getExpandedColor;  
    exports.collapse = collapse;  
//    exports.update = update;  
    exports.nodeMouseover = nodeMouseover;
    exports.publishEvent = publishEvent;

    console.log("loaded: bzctree  IIFE");


})));

