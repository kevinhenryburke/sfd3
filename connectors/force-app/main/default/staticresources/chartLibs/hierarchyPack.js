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


  function recursiveMap (storeObject,datajsonBefore, topCall){
    datajsonBefore["size"] =  bzchart.getFromMeasureScheme(storeObject, datajsonBefore, "Size");

    if (datajsonBefore.children != null && datajsonBefore.children.length > 0) {
        for (var i = 0; i < datajsonBefore.children.length; i++){
          bzpack.recursiveMap(storeObject, datajsonBefore.children[i], false);
        } 
    }
    else {
        return;
    }
  }

  function getRootStructurePack (storeObject) {
    return function(datajson) { 
        var root = d3.hierarchy(datajson)
        .sum((d) => d.size)
        .sort((a, b) => b.value - a.value);

        var diameter = Math.min(bzchart.getStore (storeObject, "width"),bzchart.getStore (storeObject, "height") ) ;  
        var pack = d3.pack()
        .size([diameter - 4, diameter - 4]);
        return pack(root).descendants();
    };
}    

function stylePack (storeObject, node) {
  node.attr("transform", "translate(2,2)") // new
      .attr("class", function(d) { return d.children ? "packbranch node" : "packleaf node"; })
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })

  node.append("title")
      .text(function(d) { return d.data.name + "\n" + d3.format(",d")(d.value); }); // this is the d3 value accessor which handles sum in hierarchy layout 

  var noc = node.append("circle")
      .attr("r", function(d) { return d.r; })
      .style("fill-opacity", function(d, i) {
          return bzchart.getFilterOpacity (storeObject, d.data);
      });

    noc.style("fill", function(d) { 
        return bzchart.getFromMeasureScheme(storeObject, d.data, "Color");
    })

  node.filter(function(d) { return !d.children; }).append("text")
      .attr("dy", "0.3em")
      .text(function(d) { return d.data.name.substring(0, d.r / 3); });

  console.log("stylePack exit");
}

  // zoomable
  exports.update = update;
  exports.tick = tick;
  exports.color = color;
  exports.click = click;
  exports.flatten = flatten;
  exports.recursiveMap = recursiveMap;
  exports.getRootStructurePack = getRootStructurePack;
  exports.stylePack = stylePack;

  console.log("loaded: bzpack  IIFE");
  

})));


/* OVERRIDE MIXINS */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.chartHierarchyPackMixin = global.chartHierarchyPackMixin || {})));
}(this, (function (exports) { 'use strict';

console.log("loading: chartHierarchyPackMixin IIFE");

const OverrideMixin = {
  dataPreprocess(storeObject, datajson, datajsonRefresh) {
      console.log("xxxxxx: mixin: dataPreprocess");
      bzpack.recursiveMap(storeObject,datajson, true);
  },

  initializeVisuals(storeObject) {
    console.log("bzpack: enter initializeVisuals proper structure");
    let variantsMixin = bzchart.getStore(storeObject, "chartMixin");

    let datajson = bzchart.getStore(storeObject, "datajson");
    let nodeGroup = bzchart.getStore(storeObject, "nodeGroup");

    /* Pack specification */

    let nodeSelector = "circle";
    let nodeDataSetFunction = bzpack.getRootStructurePack(storeObject);

    let nodeEnterSelection = nodeGroup
      .selectAll(nodeSelector)
      .data(nodeDataSetFunction(datajson), function (d, i) { return d.id; })
      .enter();

    let node = nodeEnterSelection
      .append("g")
      .attr("id", d => d.id)
      .attr("recordid", d => d.recordid)
      .on('mouseover', $A.getCallback(function (d) { // need getCallback to retain context - https://salesforce.stackexchange.com/questions/158422/a-get-for-application-event-is-undefined-or-can-only-fire-once
        bzchart.setStore(storeObject, "mouseoverRecordId", d.id);
        let preppedEvent = variantsMixin.nodeMouseover(storeObject, d);
        bzaura.publishPreppedEvent(storeObject, preppedEvent, $A.get("e.c:evt_sfd3"));
      }))
      ;
    bzpack.stylePack(storeObject, node);
  },
    
  styleNodes (storeObject){
      console.log("styleNodes in hierarchyPack.js enter");
      let variantsMixin = bzchart.getStore (storeObject, "chartMixin") ;
  
      let latestSizeOrColor = bzchart.getStore (storeObject, "latestSizeOrColor");

      let componentReference = bzchart.getStore (storeObject, "componentReference") ;  
      bzchart.clearElements(componentReference);

      let datajson = bzchart.getStore (storeObject, "datajson") ;  
      let datajsonRefresh = bzchart.getStore (storeObject, "datajson") ;  

      if (latestSizeOrColor == "size") {
          variantsMixin.dataPreprocess(storeObject, datajson, datajsonRefresh);
      }

      variantsMixin.initializeVisuals(storeObject);


    }


}

exports.OverrideMixin = OverrideMixin;

Object.defineProperty(exports, '__esModule', { value: true });

console.log("loaded: chartHierarchyPackMixin IIFE");


})));
