(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.bznetworktimeline = global.bznetworktimeline || {})));
}(this, (function (exports) { 'use strict';

  console.log("loading: bznetworktimeline IIFE");

/* Influence Methods */

function runSimulation  (storeObject, path, node, text) {
    var datajson = bzchart.getStore (storeObject, "datajson") ;

    var simulation = bznetworktimeline.initializeSimulationInfluence(storeObject, datajson.nodes);            

    bzchart.setStore (storeObject, "simulation", simulation ) ;

    var forceLinks = bznetwork.buildForceLinks(path);
    var link_force =  d3.forceLink(forceLinks.links)
        .id(function(d) { return d.id; });

    simulation.force("links",link_force);

    bznetwork.dragHandler(node, simulation);

    simulation.on("tick", function() {
        bznetwork.onTick (storeObject, path, node, text);
    });             
} 

function initializeSimulationInfluence  (storeObject, nodes) {
    console.log("bznetwork.initializeSimulationInfluence enter");
    var width = bzchart.getStore (storeObject, "width") ;  
    var height = bzchart.getStore (storeObject, "height") ; 
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

exports.runSimulation = runSimulation;
exports.initializeSimulationInfluence = initializeSimulationInfluence;

  Object.defineProperty(exports, '__esModule', { value: true });

  console.log("loaded: bznetworktimeline  IIFE");

})));

/* OVERRIDE MIXINS */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.chartNetworkTimelineMixin = global.chartNetworkTimelineMixin || {})));
}(this, (function (exports) { 'use strict';

console.log("loading: chartNetworkTimelineMixin IIFE");

const OverrideMixin = {
    dataPreprocess(storeObject, datajsonBefore, datajsonRefresh) {
        console.log("xxxxxx: mixin: dataPreprocess");
        for (var i = 0; i < datajsonBefore.nodes.length; i++){
            var djnodeBefore = datajsonBefore.nodes[i];
            var fieldsBefore = djnodeBefore.fields;
            var djnodeAfter = datajsonRefresh.nodes[i];
            var fieldsAfter = djnodeAfter.fields;
            for (var j = 0; j < fieldsBefore.length; j++) {
                if ((fieldsBefore[j].fieldType == "CURRENCY" || fieldsBefore[j].fieldType == "DECIMAL" || fieldsBefore[j].fieldType == "DOUBLE") && fieldsBefore[j].retrievedValue != null) {
                    fieldsBefore[j].retrievedValue = fieldsAfter[j].retrievedValue;
                }
                if (fieldsBefore[j].fieldType == "INTEGER" && fieldsBefore[j].retrievedValue != null) {
                    fieldsBefore[j].retrievedValue = fieldsAfter[j].retrievedValue;
                }
            }
        }    
        bzchart.setStore (storeObject, "datajson", datajsonBefore ) ;
    },

    refreshDataController  (storeObject, parameters) {
        let datajson = parameters.datajson;
        let primaryId = parameters.primaryId;
        let showFilters = parameters.showFilters;
        bznetwork.refreshDataHelper(storeObject, datajson, primaryId, showFilters);                         
    },
  
    updateTitle : function (parameters) {
        return parameters["valueDate"].toLocaleDateString();
    },
    runSimulation  (storeObject, path, node, text) {
        console.log("in timeline mixin");
        bznetworktimeline.runSimulation(storeObject, path, node, text);
    }     
  
}

exports.OverrideMixin = OverrideMixin;

Object.defineProperty(exports, '__esModule', { value: true });

console.log("loaded: chartNetworkTimelineMixin IIFE");


})));

