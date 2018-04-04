
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
}

function r2 (fname, arg0, arg1) {
}

function r3 (fname, arg0, arg1, arg2) {
}

function r4 (fname, arg0, arg1, arg2, arg3) {
    if (fname == "runSimulation") {
        var componentReference = arg0;
        var componentType = berlioz.utils.getCache (componentReference, "componentType") ;
        if (componentType == "chart.influence") {
            return berlioz.simulation.runSimulation1(arg0, arg1, arg2, arg3); 
        }
        else {
            return berlioz.simulation.runSimulation2(arg0, arg1, arg2, arg3); 
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
exports.r1 = r1;
exports.r2 = r2;
exports.r3 = r3;
exports.r4 = r4;


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

    console.log("styleNodes : " + currentMeasure + " primaryid: " + primaryid);

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
}

function setFilterVisibility (component, filterType, isShown) {
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
    console.log("showFilters:" + JSON.stringify(showFilters));
}

function refreshVisibility(componentReference) {

    console.log("Enter refreshVisibility"); 

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
}

// clear out the paths and the groups
function clearChart(componentReference) {
    var svg = d3.select(berlioz.utils.getDivId("svg", componentReference, true));
    var path = svg.selectAll("path").remove();
    var node = svg.selectAll("circle").remove();
    var text = svg.selectAll(".nodeText").remove();
    d3.select(berlioz.utils.getDivId("pathGroup", componentReference, true)).remove();
    d3.select(berlioz.utils.getDivId("nodeGroup", componentReference, true)).remove();
    d3.select(berlioz.utils.getDivId("textGroup", componentReference, true)).remove();
}

function publishEvent(componentReference, topic, parameters) {
    var publisherType = berlioz.utils.getCache (componentReference, "componentType") ;
    var controller = berlioz.utils.getCache (componentReference, "UserControllerComponentId") ;
    berlioz.utils.publishEvent(topic, componentReference, publisherType, parameters, controller);
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

function initializeSimulation2 (componentReference, nodes) {
    console.log("Berlioz.simulation.initializeSimulation2 enter");
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
            console.log("collide");
            console.log(d); 
            return d.measures[currentMeasure].radius + nodePadding; }).iterations(1))
//        .force("collide", d3.forceCollide().strength(.5).radius(function(d){ return d.radius + nodePadding; }).iterations(1))
        .on("tick", function(d){
          node
              .attr("cx", function(d){ return d.x; })
              .attr("cy", function(d){ return d.y; })
        });        
    
    console.log("Berlioz.simulation.initializeSimulation2 exit");
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
    console.log("Enter buildForceLinks"); 
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
    return forceLinks;
}

function runSimulation1(componentReference, path, node, text ) {
    console.log("Enter runSimulation1"); 

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
    console.log("Exit runSimulation1"); 
}

function runSimulation2(componentReference, path, node, text ) {
    console.log("Enter runSimulation2"); 

    var datajson = berlioz.utils.getCache (componentReference, "datajson") ;
    var simulation = berlioz.simulation.initializeSimulation2(componentReference, datajson.nodes);            
    berlioz.utils.setCache (componentReference, "simulation", simulation ) ;

    var forceLinks = berlioz.simulation.buildForceLinks(path);
    var link_force =  d3.forceLink(forceLinks.links)
        .id(function(d) { return d.id; });

    simulation.force("links",link_force);

    berlioz.simulation.dragHandler(node, simulation);

    simulation.on("tick", function() {
        berlioz.simulation.onTick (componentReference, path, node, text);
    });             
    console.log("Exit runSimulation2"); 
}

Object.defineProperty(exports, '__esModule', { value: true });

exports.initializeSimulation = initializeSimulation;
exports.initializeSimulation2 = initializeSimulation2;
exports.dragHandler = dragHandler;
exports.onTick = onTick;
exports.buildForceLinks = buildForceLinks;
exports.runSimulation1 = runSimulation1;
exports.runSimulation2 = runSimulation2;
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

exports.refreshVisibility = refreshVisibility;

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

