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
        "pathMouseover" : "bzchart.pathMouseover",
        "pathMouseout" : "bzchart.pathMouseout",
        "nodeMouseout" : "bzctree.nodeMouseout",
        "nodeMouseover" : "bzctree.nodeMouseover",
        "nodeDoubleClick" : "bzutils.doNothing",     
        "nodeAdditionalAttribute" : "bzpack.nodeAdditionalAttribute", 
        "textAdditionalAttribute" : "bzutils.doNothing", 
    },
    "pack" : {
        "nodeDataSetFunction" : "bzpack.nodeDataSetFunctionNodes",
        "nodeDataKeyFunction" : "bzutils.nodeDataKeyFunctionId",
        "pathMouseover" : "bzchart.pathMouseover",
        "pathMouseout" : "bzchart.pathMouseout",
        "nodeMouseout" : "bzutils.doNothing",
        "nodeMouseover" : "bzpack.nodeMouseover",
        "nodeDoubleClick" : "bzutils.doNothing",     
        "nodeAdditionalAttribute" : "bzpack.nodeAdditionalAttribute", 
        "textAdditionalAttribute" : "bzutils.doNothing", 
    },
    "chart.connections" : { 
        "nodeDataSetFunction" : "bzutils.nodeDataSetFunctionNodes",
        "nodeDataKeyFunction" : "bzutils.nodeDataKeyFunctionId",
        "pathMouseover" : "bzchart.pathMouseover",
        "pathMouseout" : "bzchart.pathMouseout",
        "nodeMouseout" : "bzchart.nodeMouseout",
        "nodeMouseover" : "bzchart.nodeMouseover",
        "nodeDoubleClick" : "bzchart.nodeDoubleClick",        
        "nodeAdditionalAttribute" : "bzutils.doNothing", 
        "textAdditionalAttribute" : "bzchart.textAdditionalAttribute", 
    },    
    "chart.influence" : {
        "nodeDataSetFunction" : "bzutils.nodeDataSetFunctionNodes",
        "nodeDataKeyFunction" : "bzutils.nodeDataKeyFunctionId",
        "pathMouseover" : "bzchart.pathMouseover",
        "pathMouseout" : "bzchart.pathMouseout",
        "nodeMouseout" : "bzchart.nodeMouseout",
        "nodeMouseover" : "bzchart.nodeMouseover",
        "nodeDoubleClick" : "bzchart.nodeDoubleClick",        
        "nodeAdditionalAttribute" : "bzutils.doNothing", 
        "textAdditionalAttribute" : "bzchart.textAdditionalAttribute", 
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

    var publishParameters = {"data" : d, "parent" : null};

    console.log("bzchart.nodeMouseover exit");

    var preppedEvent = bzchart.prepareEvent(componentReference, "ChartMouseOver", publishParameters);
    return preppedEvent;
    
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
    console.log("bzchart.nodeDoubleClick exit.");

    var preppedEvent = bzchart.prepareEvent(componentReference, "InitiateRefreshChart", eventParameters);
    return preppedEvent;

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

exports.pathMouseover = pathMouseover;
exports.pathMouseout = pathMouseout;
exports.nodeMouseover = nodeMouseover;
exports.nodeMouseout = nodeMouseout;
exports.nodeDoubleClick = nodeDoubleClick;
exports.textAdditionalAttribute = textAdditionalAttribute;
exports.getRelatedNodes = getRelatedNodes;
exports.setFilterVisibility = setFilterVisibility;
exports.clearChart = clearChart;
// exports.styleNodes = styleNodes;
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

    var publishParameters = {"data" : d.data, "parent" : d.parent ? d.parent.data : null};

    console.log("bzpack.nodeMouseover exit");

    var preppedEvent = bzchart.prepareEvent(componentReference, "ChartMouseOver", publishParameters);
    return preppedEvent;

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

    // LeafParent is either "Leaf" or "Node"
    // TODO - really should be "expanded" or "collapsed"
    function getNodeColor (componentReference, d, LeafParent) {
        var color;

        var objectType = d.data.objectType;
        var hasObjectSpecifics = bzutils.hasCache (componentReference, LeafParent + "ColorsValues" + objectType) ;
        if (!hasObjectSpecifics) {
            // if there is nothing specifc for an object then use the defaults
            objectType = "Default";
        }

        var colorBy;      
        var hasObjectSpecificColorBy = bzutils.hasCache (componentReference, LeafParent + "ColorsColorBy" + objectType) ;
        if (hasObjectSpecificColorBy) {
            colorBy = bzutils.getCache (componentReference, LeafParent + "ColorsColorBy" + objectType) ;
        }
        else {
            colorBy = bzutils.getCache (componentReference, LeafParent + "ColorsColorByDefault") ;
        }

        var ColorsValues = bzutils.getCache (componentReference, LeafParent + "ColorsValues" + objectType) ;
        var ColorsNames = bzutils.getCache (componentReference, LeafParent + "ColorsNames" + objectType) ;

        for (var i = 0; i < ColorsValues.length; i++) {
            if (colorBy == "size") {
                if (d.data.size != null && d.data.size >= ColorsValues[i]) {
                    color = ColorsNames[i];
                } else {
                    break;
                }
            }
            else { 
                // going by a textual value - default to the first color in the list
                // TODO could add in a default in the config string?
                color = ColorsNames[0];
                if (d.data.otherFields[colorBy] == ColorsValues[i]) {
                    console.log("colorBy Match: " + colorBy);
                    color = ColorsNames[i];
                    break;
                }
            }
        }
        return color;
    }

    function setColorCache (componentReference, ColorsString, ColorsObjectDefault, prefix) {
        bzutils.setCache (componentReference, prefix + "ColorsObjectDefault", ColorsObjectDefault ) ;
        bzutils.setCache (componentReference, prefix + "ColorsValuesDefault", ColorsObjectDefault.values ) ;
        bzutils.setCache (componentReference, prefix + "ColorsNamesDefault", ColorsObjectDefault.colors ) ;
        bzutils.setCache (componentReference, prefix + "ColorsColorByDefault", ColorsObjectDefault.colorBy ) ;

        var ColorsObject;
        if (ColorsString != null && ColorsString != "") {
            ColorsObject = JSON.parse(ColorsString);
        }

        var arrayObjectKeys = Object.keys(ColorsObject);

        arrayObjectKeys.forEach ( function(objectKey) {
            bzutils.setCache (componentReference, prefix + "ColorsObject" + objectKey, ColorsObject[objectKey] ) ;
            bzutils.setCache (componentReference, prefix + "ColorsValues" + objectKey, ColorsObject[objectKey].values ) ;
            bzutils.setCache (componentReference, prefix + "ColorsNames" + objectKey, ColorsObject[objectKey].colors ) ;
            bzutils.setCache (componentReference, prefix + "ColorsColorBy" + objectKey, ColorsObject[objectKey].colorBy ) ;
        });
    }

    // Collapse the node and all it's children
    function collapse(d) {
        if(d.children) {
            d._children = d.children
            d._children.forEach(collapse)
            d.children = null
        }
    }
      
    /* TODO: builds up a huge list of events as context gets lost when we create new nodes
    Would be nice to find a better way!!!!!!
    */
    
    function nodeMouseover (componentReference, d) {
        console.log("bzctree.nodeMouseover enter:");
        console.log(d);
    
        var publishParameters = {"data" : d.data, "parent" : d.parent ? d.parent.data : null};
        
        var preppedEvent = bzchart.prepareEvent(componentReference, "ChartMouseOver", publishParameters);
        preppedEvent.eventType = "Cache";

// attempt to get the lighting info panel to follow the highlight.        
var infosvg = bzutils.getCache (componentReference, "infosvg") ;
var dx = d.x;
var dy = d.y;
console.log("popover:" + dy + " / " + dx);
// infosvg.attr('transform',function(d,i) { return 'translate(' + dy + ',' + dx + ')';})

// transitions fine but the lightning component only moves on scroll???
// infosvg.transition()
// .duration(1000)
// .attr("transform", function(d) { 
// var t = "translate(" + dy  + "," + dx + ")";
//     return t;
// });

// if (dy > 500) {
// infosvg.transition()
// .duration(100)
// .attr("transform", function(d) { 
// var t = "translate(" + 50  + "," + dx + ")";
//     return t;
// });    
// }

// if (dy < 500) {
// infosvg.transition()
// .duration(100)
// .attr("transform", function(d) { 
// var t = "translate(" + 600  + "," + dx + ")";
//     return t;
// });    
// }
    
        return preppedEvent;
    }

    function nodeMouseout (componentReference, d) {
        console.log("bzctree.nodeMouseout enter");
        console.log(d);
    
        var publishParameters = {"data" : d.data, "parent" : d.parent ? d.parent.data : null};
        
        var preppedEvent = bzchart.prepareEvent(componentReference, "ChartMouseOut", publishParameters);
        if (d.depth > 1) {
            preppedEvent.eventType = "Cache";
        } 
        return preppedEvent;
    }
    

    exports.getNodeColor = getNodeColor;  
    exports.setColorCache = setColorCache;  
    exports.collapse = collapse;  
    exports.nodeMouseover = nodeMouseover;
    exports.nodeMouseout = nodeMouseout;

    console.log("loaded: bzctree  IIFE");


})));

