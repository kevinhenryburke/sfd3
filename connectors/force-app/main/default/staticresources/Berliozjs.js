
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.berlioz.utils = global.berlioz.utils || {})));
}(this, (function (exports) { 'use strict';

console.log("loading: Berlioz.utils IIFE");

var version = "0.0.1";
var debugMode = true;

function log (logItem) {
    if (debugMode == true) {
        console.log(logItem);
    } 
}

// replace ids with component specific versions - this will allow multiple charts on a page without conflict
function initializeAddComponentRef(componentReference, datajson) {
    var _this = this;
    datajson.nodes.forEach(function(node) {
        node["id"] = berlioz.utils.addComponentRef(componentReference, node["id"]);
    });
        
    datajson.links.forEach(function(link) {
        link["id"] = berlioz.utils.addComponentRef(componentReference, link["id"]);
        link["sourceid"] = berlioz.utils.addComponentRef(componentReference, link["sourceid"]);
        link["targetid"] = berlioz.utils.addComponentRef(componentReference, link["targetid"]);
    });
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

exports.log = log;
exports.initializeAddComponentRef = initializeAddComponentRef;
exports.addComponentRef = addComponentRef;
exports.removeComponentRef = removeComponentRef;

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
    console.log("mouseover: " + t);
    console.log("mouseover: " + textcontent);
    console.log(t);
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

function getRelatedNodes (chartPrimaryId, chartSVGId, level) {
    var _this = this;

    var looplevel = 0;

    var linkednodes = [chartPrimaryId];

    while (looplevel < level) {
        var newnodes = [];
        looplevel++;

        var pathGroupId = chartSVGId + "pathGroup";
        var path = d3.select("#" + pathGroupId).selectAll("path")  ;

        path.each(function(p) {

            var sourceindex = linkednodes.indexOf(p.sourceid);
            var targetindex = linkednodes.indexOf(p.targetid);
            if (sourceindex === -1 && targetindex > -1) {
                    newnodes.push(p.sourceid);
                }
                if (targetindex === -1 && sourceindex > -1) {
                    newnodes.push(p.targetid);
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
}



exports.pathMouseover = pathMouseover;
exports.pathMouseout = pathMouseout;
exports.nodeMouseover = nodeMouseover;
exports.nodeMouseout = nodeMouseout;
exports.getRelatedNodes = getRelatedNodes;

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

function initializeSimulation (nodes, width, height) {
    console.log("Berlioz.simulation.initializeSimulation enter");

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

function onTick (width, height, path, node, text) {
    path.attr("d", function(d) {
//        console.log("d.source.x: " + d.source.x);
//        console.log(JSON.stringify(d));
//        console.log(d);
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


Object.defineProperty(exports, '__esModule', { value: true });

exports.initializeSimulation = initializeSimulation;
exports.dragHandler = dragHandler;
exports.onTick = onTick;

// temporary
exports.transform = transform;
exports.limitborderx = limitborderx;
exports.limitbordery = limitbordery;


console.log("loaded: Berlioz.simulation  IIFE");

})));

