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


  exports.getRelatedNodes = getRelatedNodes;
  exports.nodeDataSetFunctionNodes = nodeDataSetFunctionNodes;
  exports.refreshVisibilityHelper = refreshVisibilityHelper;

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

  nodeMouseout : function (storeObject, d) {
    console.log("nodeMouseout network mixin enter");

    let componentType = bzchart.getStore (storeObject, "componentType") ;
    console.log("nodeMouseout componentType = " + componentType);

    if ((componentType == "network.connections") || (componentType == "network.timeline")) {
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


}

exports.OverrideMixin = OverrideMixin;

Object.defineProperty(exports, '__esModule', { value: true });

console.log("loaded: chartNetworkMixin IIFE");


})));

