(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.bznetwork = global.bznetwork || {})));
}(this, (function (exports) { 'use strict';

  console.log("loading: bznetwork IIFE");

  function getRelatedNodes (chartPrimaryId, componentReference, level) {
      let looplevel = 0;
      let linkednodes = [chartPrimaryId];
  
      while (looplevel < level) {
          let newnodes = [];
          looplevel++;
  
          let path = d3.select(bzutils.getDivId("pathGroup", componentReference, true))
              .selectAll("path")
              .each(function(p) {
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

  function nodeDataSetFunctionNodes () { 
    return function(datajson) { return datajson.nodes;};
  }

  function refreshVisibilityHelper(storeObject){
    console.log("refreshVisibilityHelper enter");    

    let componentReference = bzchart.getStore (storeObject, "componentReference") ;  
    let componentType = bzchart.getStore (storeObject, "componentType") ;

    if (componentType ==  "network.connections") {    
        let levels = bzchart.getStore (storeObject, "showLevels") ;
        let filterValues = bzchart.getStore (storeObject, "filterValues") ;
        let primaryNodeId = bzchart.getStore (storeObject, "primaryNodeId") ;        
        // not needed until reinstate measure level visibility
    
        let relatedNodes = bznetwork.getRelatedNodes(primaryNodeId, componentReference, levels);
    
        let path = d3.select(bzutils.getDivId("pathGroup", componentReference, true))
            .selectAll("path")  ;
    
        let node = d3.select(bzutils.getDivId("nodeGroup", componentReference, true))
            .selectAll("circle")  
        
        let shownodeids = [];
    
        path.style("visibility", function(p) {
    
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
}

function runSimulation  (storeObject, path, node, text) {
    console.log("bznetwork.runSimulation enter");
    let componentType = bzchart.getStore (storeObject, "componentType") ;

    if (componentType ==  "network.connections") {
        bznetwork.runSimulationConnections(storeObject, path, node, text);
    }
    if (componentType ==  "network.timeline") {
        bznetwork.runSimulationInfluence(storeObject, path, node, text);
    }
}                 

/* Connections Methods */

function runSimulationConnections  (storeObject, path, node, text) {
    console.log("bznetwork.runSimulationConnections enter");
    var datajson = bzchart.getStore (storeObject, "datajson") ;

    var simulation = bznetwork.initializeSimulationConnections(storeObject, datajson.nodes);            

    bzchart.setStore (storeObject, "simulation", simulation ) ;

    var forceLinks = bznetwork.buildForceLinks(path);
    var link_force =  d3.forceLink(forceLinks.links)
        .id(function(d) { return d.id; });

    simulation.force("links",link_force);

    bznetwork.dragHandler(node, simulation);

    simulation.on("tick", function() {
        bznetwork.onTick (storeObject, path, node, text);
    });             

    console.log("bznetwork.runSimulationConnections exit");
}                 

function initializeSimulationConnections  (storeObject, nodes) {
    var width = bzchart.getStore (storeObject, "width") ;  
    var height = bzchart.getStore (storeObject, "height") ; 

    // force example - https://bl.ocks.org/rsk2327/23622500eb512b5de90f6a916c836a40
    var attractForce = d3.forceManyBody().strength(5).distanceMax(400).distanceMin(60);
    var repelForce = d3.forceManyBody().strength(-800).distanceMax(200).distanceMin(30);

    var simulation = d3.forceSimulation()
        //add nodes
        .nodes(nodes) 
        .force("center_force", d3.forceCenter(width / 2, height / 2))
        .alphaDecay(0.03).force("attractForce",attractForce).force("repelForce",repelForce);
    
    console.log("bznetwork.initializeSimulationConnections exit");
    return simulation;
}

function dragHandler  (node, simulation) {
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
    
function transform  (d, width, height) {
    var dx = bznetwork.limitborderx(d.x, width);
    var dy = bznetwork.limitbordery(d.y, height);
    return "translate(" + dx + "," + dy + ")";
}

function limitborderx  (x, width) {
    return Math.max(Math.min(x, width) -30, 20);
}

function limitbordery  (y, height) {
    return Math.max(Math.min(y, height - 50), 20 );
}   

function onTick   (storeObject, path, node, text) {
    var width = bzchart.getStore (storeObject, "width") ;  
    var height = bzchart.getStore (storeObject, "height") ; 
//    if (bzutils.getCache (component, "hasPaths") == true) {
        path.attr("d", function(d) {
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
    node.attr("transform", function(d) {
        return bznetwork.transform (d, width, height);
    });
//        if (bzutils.getCache (component, "hasText") == true) {
        text.attr("transform", function(d) {
            return bznetwork.transform (d, width, height);
        });
//        }
}

function buildForceLinks  (path) {
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

/* Influence Methods */

function runSimulationInfluence  (storeObject, path, node, text) {
    console.log("bznetwork.runSimulationInfluence enter");
    var datajson = bzchart.getStore (storeObject, "datajson") ;

    var simulation = bznetwork.initializeSimulationInfluence(storeObject, datajson.nodes);            

    bzchart.setStore (storeObject, "simulation", simulation ) ;

    var forceLinks = bznetwork.buildForceLinks(path);
    var link_force =  d3.forceLink(forceLinks.links)
        .id(function(d) { return d.id; });

    simulation.force("links",link_force);

    bznetwork.dragHandler(node, simulation);

    simulation.on("tick", function() {
        bznetwork.onTick (storeObject, path, node, text);
    });             


    console.log("bznetwork.runSimulationInfluence exit");
} 

function initializeSimulationInfluence  (storeObject, nodes) {
    console.log("bznetwork.initializeSimulationInfluence enter");
    var width = bzchart.getStore (storeObject, "width") ;  
    var height = bzchart.getStore (storeObject, "height") ; 
    var sizeDivisor = 100;
    var nodePadding = 2.5;
    var currentColorLabel = bzchart.getStore (storeObject, "currentColorLabel") ; 

    var simulation = d3.forceSimulation()
        .force("forceX", d3.forceX().strength(.1).x(width * .5))
        .force("forceY", d3.forceY().strength(.1).y(height * .5))
        .force("center", d3.forceCenter().x(width * .5).y(height * .5))
        .force("charge", d3.forceManyBody().strength(-150));

    simulation  
        .nodes(nodes)
        .force("collide", d3.forceCollide().strength(.5).radius(function(d){
            return d.measures[currentColorLabel].radius + nodePadding; }).iterations(1))
//        .force("collide", d3.forceCollide().strength(.5).radius(function(d){ return d.radius + nodePadding; }).iterations(1))
        .on("tick", function(d){
          node
              .attr("cx", function(d){ return d.x; })
              .attr("cy", function(d){ return d.y; })
        });        
    
    console.log("bznetwork.initializeSimulationInfluence exit");
    return simulation;
}
    
function nodeDoubleClick(storeObject,primaryNodeId){
    let componentReference = bzchart.getStore (storeObject, "componentReference") ;  
    let componentType = bzchart.getStore (storeObject, "componentType") ;
    console.log("nodeDoubleClick componentType = " + componentType);

    if ((componentType ==  "network.timeline") || (componentType ==  "network.connections")) {
        // TODO this will need substantial enriching - e.g. pass current measure and whether to add nodes or to refresh etc.
        var cleanId = bzutils.removeComponentRef(componentReference, primaryNodeId);
        var eventParameters = {"primaryNodeId" : cleanId, "componentReference" : componentReference};
        console.log("nodeDoubleClick exit.");
    
        var preppedEvent = bzchart.prepareEvent(storeObject, "InitiateRefreshChart", eventParameters);
        return preppedEvent;        
    }
}


function textAdditionalAttribute  (storeObject, text) {
    // Not sure this is called
    console.log("bznetwork.textAdditionalAttribute enter");    
    let componentType = bzchart.getStore (storeObject, "componentType") ;

    if ((componentType == "network.connections") || (componentType == "network.timeline")) {
        text
        .attr("x", 8)
        .attr("y", ".31em")            
    }

    console.log("bznetwork.textAdditionalAttribute exit");
}

function pathMouseover  (d,path,pathToolTipDiv) {
    console.log("bznetwork.pathMouseover enter");

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

    console.log("bznetwork.pathMouseover exit");
    
}

function pathMouseout  (pathToolTipDiv) {
    console.log("bznetwork.pathMouseout enter");

    pathToolTipDiv.transition()
        .delay(1000)
        .duration(2000)
        .style("opacity", 0);

    console.log("bznetwork.pathMouseout exit");
}

function styleNodes (storeObject) {
    console.log("network.styleNodes enter");
    let componentReference = bzchart.getStore (storeObject, "componentReference") ;  
    let componentType = bzchart.getStore (storeObject, "componentType") ;

    if ((componentType ==  "network.connections") || (componentType ==  "network.timeline")) {
        var primaryid = bzchart.getStore (storeObject, "primaryNodeId") ;

        var node = d3.select(bzutils.getDivId("nodeGroup", componentReference, true))
            .selectAll("circle")  ;

        if (bzchart.getStore (storeObject, "updateSize")) {            
            node.attr("r", function(o, i) {
                return bzchart.getFromMeasureScheme(storeObject, o, "Size");
            });
        }

        if (bzchart.getStore (storeObject, "updateColor")) {            
            node.style("fill", function(o, i) {
                return bzchart.getFromMeasureScheme(storeObject, o, "Color");
            });
        }
    
        node.style("stroke", function(o, i) {
            var stroke = o.stroke;
            var oid = o.id;
            if (oid == primaryid) {
                var primaryNodeHighlightingOn = bzchart.getStore (storeObject, "primaryNodeHighlightingOn") ;
                if (primaryNodeHighlightingOn == true) {
                    stroke = bzchart.getStore (storeObject, "primaryNodeHighlightingColour") ;
                }                
            }
            return stroke;
        });
    
        node.style("stroke-width", function(o, i) {
            var nodestrokewidth = bzchart.getStore (storeObject, "nodestrokewidth") ;
            var oid = o.id;
            if (oid == primaryid) {
                nodestrokewidth = bzchart.getStore (storeObject, "primaryNodeHighlightingRadius") ;
            }
            return nodestrokewidth;
        });
    }
    console.log("network.styleNodes exit");
}


  exports.getRelatedNodes = getRelatedNodes;
  exports.nodeDataSetFunctionNodes = nodeDataSetFunctionNodes;
  exports.refreshVisibilityHelper = refreshVisibilityHelper;
  exports.runSimulation = runSimulation;
  exports.runSimulationConnections = runSimulationConnections;
  exports.initializeSimulationConnections = initializeSimulationConnections;
  exports.dragHandler = dragHandler;
  exports.transform = transform;
  exports.limitborderx = limitborderx;
  exports.limitbordery = limitbordery;
  exports.onTick = onTick;
  exports.buildForceLinks = buildForceLinks;
  exports.runSimulationInfluence = runSimulationInfluence;
  exports.initializeSimulationInfluence = initializeSimulationInfluence;
  exports.nodeDoubleClick = nodeDoubleClick;
  exports.textAdditionalAttribute = textAdditionalAttribute;
  exports.pathMouseover = pathMouseover;
  exports.pathMouseout = pathMouseout;
  exports.styleNodes = styleNodes;
  
  Object.defineProperty(exports, '__esModule', { value: true });

  console.log("loaded: bznetwork  IIFE");

})));

/* OVERRIDE MIXINS */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.chartNetworkMixin = global.chartNetworkMixin || {})));
}(this, (function (exports) { 'use strict';

console.log("loading: chartNetworkMixin IIFE");

const OverrideMixin = {
  getDefaultSize() {
    return 20;
  },
  hasPrimaryNode() {
    return true;
  },
  refreshVisibility(storeObject){
    bznetwork.refreshVisibilityHelper(storeObject);
  },

  nodeMouseover (storeObject, d) {
    console.log("nodeMouseover network mixin enter");
    let componentType = bzchart.getStore (storeObject, "componentType") ;

    if ((componentType == "network.connections") || (componentType == "network.timeline")) {
        // styling svg text content: http://tutorials.jenkov.com/svg/tspan-element.html
        var fields = d.fields;
        var fieldsLength = fields.length;

        var displayArray = [d.name];
        for (var i=0; i<fieldsLength;i++) {
            if (fields[i].fieldType == "STRING" && fields[i].role != "name") {
                displayArray.push(fields[i].retrievedValue);
            }
        }

        var textcontent = '<tspan x="10" y="0" style="font-weight: bold;">' + displayArray[0] ;
        textcontent += '</tspan>'; 
        textcontent += '<tspan x="10" dy="15">' + displayArray[1];
        if (displayArray.length > 2) {
            textcontent += ' (' + displayArray[2] + ')';
        }
        textcontent += '</tspan>';

        var tselect =  "t" + d.id;
        var t = d3.select("#" + tselect);
        t.html(textcontent);

        var sselect =  "s" + d.id;
        var s = d3.select("#" + sselect);
        s.html(textcontent);

        var publishParameters = {"data" : d, "parent" : null};
        var preppedEvent = bzchart.prepareEvent(storeObject, "ChartMouseOver", publishParameters);
        return preppedEvent;
    }
  },

  nodeMouseout  (storeObject, d) {
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
  }

}

exports.OverrideMixin = OverrideMixin;

Object.defineProperty(exports, '__esModule', { value: true });

console.log("loaded: chartNetworkMixin IIFE");


})));

