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

    // A way to get the path to an object - this is independent of the search box
    // we can search by name or id (searchBy = "Name" or "Id")
    function searchTree (obj,search,path, searchBy){
        var objFieldValue = (searchBy == "Name" ? obj.data.name : obj.data.id );
        
        if(objFieldValue === search){ //if search is found return, add the object to the path and return it
            path.push(obj);
            return path;
        }

        else if(obj.children || obj._children){ //if children are collapsed d3 object will have them instantiated as _children
            var children = (obj.children) ? obj.children : obj._children;
            for(var i=0;i<children.length;i++){
                path.push(obj);// we assume this path is the right one
                var found = bzhierarchy.searchTree(children[i],search,path, searchBy);
                if(found){// we were right, this should return the bubbled-up path from the first if statement
                    return found;
                }
                else{//we were wrong, remove this parent from the path and continue iterating
                    path.pop();
                }
            }
        }
        else{//not the right object, return false so it will continue to iterate in the loop
            return false;
        }

    }

    function getFilterOpacityPath (storeObject, d) {
        console.log("xxxxx: getFilterOpacityPath");
        var filteredParent = bzchart.isFilteredOut(storeObject, d.parent.data);
        var filteredNode = bzchart.isFilteredOut(storeObject, d.data);

        if (filteredParent && filteredNode) {
            return 0.1;
        }
        if (filteredParent || filteredNode) {
            return 0.3;
        }
        return 1;
    }

    exports.nestChildren = nestChildren;
    exports.picklistNest = picklistNest;
    exports.searchTree = searchTree;
    exports.getFilterOpacityPath = getFilterOpacityPath;
    
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
