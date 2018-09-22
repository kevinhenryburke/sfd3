console.log("loading: Berlioz external libraries");

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.bzutils = global.bzutils || {})));
}(this, (function (exports) { 'use strict';

console.log("loading: bzutils IIFE");

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

function hasCache (componentReference, key) {
    var referenceParameters = componentCache[componentReference];
    return Object.keys(referenceParameters).includes(key);
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

// function xfcr(functionType, componentReference /*, args */) {
//     console.log("xfcr: functionType: " + functionType);
//     var componentType = bzutils.getCache (componentReference, "componentType");
//     console.log("xfcr: componentType: " + componentType);
//     var functionName = bzconfig.fns[componentType][functionType];
//     console.log("xfcr: functionName: " + functionName);

//     var context = context == undefined? window:context;
//     var args = Array.prototype.slice.call(arguments, 1);
//     var namespaces = functionName.split(".");
//     var func = namespaces.pop();
//     for(var i = 0; i < namespaces.length; i++) {
//       context = context[namespaces[i]];
//     }
//     return context[func].apply(context, args);
// }

/* 
Delegates to an appropriate function based on componentType.
Note: The delegated function is NOT assumed to have componentType as its first argument 
If componentType is needed then supply it twice in the calling parameters
*/

// function xfct(functionType, componentType /*, args */) {
//     var functionName = bzconfig.fns[componentType][functionType];

//     var context = context == undefined? window:context;
//     var args = Array.prototype.slice.call(arguments, 2);
//     var namespaces = functionName.split(".");
//     var func = namespaces.pop();
//     for(var i = 0; i < namespaces.length; i++) {
//       context = context[namespaces[i]];
//     }
//     return context[func].apply(context, args);
// }

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

// new signatures .... 
// (topic, publisher, publisherCategory, publisherType, parameters, controller)
// becomes
// (componentReference, topic, parameters)

// Simpler model
// Everything is associated with a controller
// Everything associated with the same controller receives the same messages
// These can then be filtered out in the handlers

// so don't need publisher, publisherCategory, publisherType

function prepareEvent(topic, parameters, controllerId) {
    var eventType = bzutils.getEventTypeByTopic(topic);
    return {
        "eventType" : eventType ,
        "topic" : topic,
        "parameters" : parameters,
        "controllerId" : controllerId
    }
}

function publishEventHelper(event, topic, parameters, controller) {
    console.log("publishEventHelper: controller: " + controller );

    event.setParams({
        "topic" : topic,
        "controller" : controller,
        "parameters" : parameters
    });
    event.fire();
}

/* Different topics may use different event types, implement in this method */
/* eventType is one of "Component" or "Application" or "Cache" */

function getEventTypeByTopic(topic) {
    return null;
}

exports.log = log;
exports.doNothing = doNothing;
// exports.xfcr = xfcr;
// exports.xfct = xfct;
exports.getParam = getParam;
exports.hasParam = hasParam;
exports.initializeAddComponentRef = initializeAddComponentRef;
exports.addComponentRef = addComponentRef;
exports.removeComponentRef = removeComponentRef;
exports.prepareEvent = prepareEvent;
exports.publishEventHelper = publishEventHelper;
exports.getEventTypeByTopic = getEventTypeByTopic;
exports.initializeCache = initializeCache;
exports.setCache = setCache;
exports.getCache = getCache;
exports.hasCache = hasCache;
exports.showCache = showCache;
exports.showCacheAll = showCacheAll;
exports.getDivId = getDivId;
exports.getNodeFromId = getNodeFromId;

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


// var fns = 
// { 
//     "ctree" : {
//     },
//     "pack" : {
//     },
//     "chart.connections" : { 
//     },    
//     "chart.influence" : {
//     },    
// } 

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

// exports.fns = fns;
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

var isiOS = false;
    
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

        for (var i = 0; i < newnodes.length; i++) {
        var index = linkednodes.indexOf(newnodes[i]);
            if (index === -1) {
                linkednodes.push(newnodes[i]);
            }
        }

    }
    return linkednodes;
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

/* Potential way out of the conundrum of firing component events
 have each call to bzchart.publishEvent[FromCache] return an object made up of the parameters for a bzutils.publishEventHelper call
 - except that the event would be eventType
 - then call the event from the calling location via bzutils.publishEventHelper */

function prepareEvent(componentReference, topic, parameters) {
    var controllerId = bzutils.getCache (componentReference, "UserControllerComponentId") ;
    var eventType = bzutils.getEventTypeByTopic(topic);
    return {
        "eventType" : eventType ,
        "topic" : topic,
        "parameters" : parameters,
        "controllerId" : controllerId
    }
}

exports.getRelatedNodes = getRelatedNodes;
exports.setFilterVisibility = setFilterVisibility;
exports.clearChart = clearChart;
exports.prepareEvent = prepareEvent;

exports.isiOS = isiOS;

Object.defineProperty(exports, '__esModule', { value: true });

console.log("loaded: bzchart  IIFE");

})));


/* Split this into new file */

// (function (global, factory) {
// 	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
// 	typeof define === 'function' && define.amd ? define(['exports'], factory) :
// 	(factory((global.bzsimulation = global.bzsimulation || {})));
// }(this, (function (exports) { 'use strict';

// console.log("loading: bzsimulation IIFE");

// Object.defineProperty(exports, '__esModule', { value: true });

// console.log("loaded: bzsimulation  IIFE");

// })));



/* Split this into new file */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.bzpack = global.bzpack || {})));
}(this, (function (exports) { 'use strict';

console.log("loading: bzpack IIFE");


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

    console.log("loaded: bzctree  IIFE");
    
})));

