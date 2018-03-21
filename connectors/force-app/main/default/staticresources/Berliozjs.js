
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.berlioz = global.berlioz || {})));
}(this, (function (exports) { 'use strict';

console.log("loading: Berlioz.js IIFE");

var version = "0.0.1";

function called() {
    console.log("Berlioz called");
}
  
exports.called = called;

Object.defineProperty(exports, '__esModule', { value: true });

console.log("loaded: Berlioz.js  IIFE");

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

function called() {
    console.log("Berlioz.chart called");
}

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


  
exports.called = called;
exports.mouseover = mouseover;
exports.mouseout = mouseout;
exports.isiOS = isiOS;

Object.defineProperty(exports, '__esModule', { value: true });

console.log("loaded: Berlioz.chart  IIFE");

})));
