(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.bzhierarchy = global.bzhierarchy || {})));
}(this, (function (exports) { 'use strict';

    console.log("loading: bzhierarchy IIFE");

    function picklistNest (groupingFields, datajson) {
        let numberOfGroupings = groupingFields.length; 

        // we use d3.nest to produce the levels and utilize to create a new version of datajson
        let nestData = d3.nest()
            .key(function(d){  
                return d.fields[groupingFields[0].fieldIndex].retrievedValue;
            }) 
            if (numberOfGroupings >= 2) {
                nestData = nestData.key(d => d.fields[groupingFields[1].fieldIndex].retrievedValue);
            }
            if (numberOfGroupings >= 3) {
                nestData = nestData.key(d => d.fields[groupingFields[2].fieldIndex].retrievedValue);
            }

        nestData = nestData.entries(datajson.children);

        // Top (Total) level
        let djSetup = {"name" : "Total", "children" : []};

        return bzhierarchy.nestChildren(djSetup, nestData, numberOfGroupings);
    }


    function nestChildren (jsonStructure, nestData, levelsFromBottom) {
        console.log("loading: bzhierarchy nestChildren");

        for (var i = 0; i < nestData.length; i++) {
            let newJsonSegment = {"name" : nestData[i].key};
            newJsonSegment["children"] = [];

            if (levelsFromBottom > 1) {
                let nextLevelDown = levelsFromBottom - 1;
                let childStructureToAdd = bzhierarchy.nestChildren(newJsonSegment, nestData[i]["values"], nextLevelDown);
                jsonStructure["children"].push(childStructureToAdd) ;
            }

            // we have leaf nodes to add
            if (levelsFromBottom == 1) {
                for (var j = 0; j < nestData[i]["values"].length; j++) {
                    newJsonSegment["children"].push(nestData[i]["values"][j]);
                }
                jsonStructure["children"].push(newJsonSegment) ;
            }
        }           
        return jsonStructure; 
    }

    exports.nestChildren = nestChildren;
    exports.picklistNest = picklistNest;
    
    Object.defineProperty(exports, '__esModule', { value: true });

    console.log("loaded: bzhierarchy  IIFE");

})));

/* OVERRIDE MIXINS */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.chartHierarchyMixin = global.chartHierarchyMixin || {})));
}(this, (function (exports) { 'use strict';

console.log("loading: chartHierarchyMixin IIFE");

const OverrideMixin = {
  getDefaultSize() {
    return 500;
  }
}

exports.OverrideMixin = OverrideMixin;

Object.defineProperty(exports, '__esModule', { value: true });

console.log("loaded: chartHierarchyMixin IIFE");


})));
