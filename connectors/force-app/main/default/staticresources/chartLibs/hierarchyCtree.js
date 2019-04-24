(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.bzctree = global.bzctree || {})));
}(this, (function (exports) { 'use strict';

    console.log("loading: bzctree IIFE");

    /* Configuration number functions */

    function getFixedDepth (masterConfigObject) {
        let csfStored = bzchart.getStoreWithDefault (masterConfigObject, "ChartScaleFactor", 1) ;
        return Math.ceil(180 * csfStored);
    }

    function getTextOffset (masterConfigObject) {
        let csfStored = bzchart.getStoreWithDefault (masterConfigObject, "ChartScaleFactor", 1) ;
        return Math.ceil(13 * csfStored);
    }

    function getFontSizePX (masterConfigObject) {
        let csfStored = bzchart.getStoreWithDefault (masterConfigObject, "ChartScaleFactor", 1) ;
        return Math.ceil(12 * csfStored);
    }     

    function getRadius (masterConfigObject) {
        let csfStored = bzchart.getStoreWithDefault (masterConfigObject, "ChartScaleFactor", 1) ;
        return Math.ceil(10 * csfStored);
    }   

    // Collapse the node and all its children
    function collapse (d) {
        console.log("bzctree.collapse");
        var recursor = function (e) {
            if(e.children) {
                e._children = e.children
                e._children.forEach(recursor)
                e.children = null
            }
        };

        if(d.children) {
            d._children = d.children
            d._children.forEach(recursor)
            d.children = null
        }
    }


    // highlight the input paths in the graph, note that need to call update afterwards
    // searchBy is "name" or "id" depending on what searchTerm we are using
    // highlightOn is boolean - if true we switch highlighting on, otherwise we switch it off

    function highlightPathsBy (storeObject, searchTerm, searchBy, highlightOn){
        var ultimateRoot = bzchart.getStore (storeObject, "root");

        // try to find target node down from the root node
        var paths = bzhierarchy.searchTree(ultimateRoot,searchTerm,[],searchBy);
        bzctree.stylePathsStroke(paths, highlightOn);
        bzchart.setStore (storeObject, "highlightedPaths", paths ) ;
    }

    // open the input paths in the graph, note that need to call update afterwards
    function openPathsBy (storeObject, searchTerm, searchBy){
        let ultimateRoot = bzchart.getStore (storeObject, "root");

        // try to find target node down from the root node
        let paths = bzhierarchy.searchTree(ultimateRoot,searchTerm,[],searchBy);
        for(let i =0;i<paths.length;i++){
            if(paths[i].id !== "1"){//i.e. not root
                paths[i].class = 'found';
                if(paths[i]._children){ //if children are hidden: open them, otherwise: don't do anything
                    paths[i].children = paths[i]._children;
                    paths[i]._children = null;
                }
            }
        }
    }

    function stylePathsStroke (paths, highlightOn) {
        let stroke = (highlightOn == true ? "#f00" : "#ccc");
        for(let i =0;i<paths.length;i++){
            if(paths[i].id !== "1"){//i.e. not root - TODO check value not equal to root
                let relatedPathId = "path" + paths[i]["id"];
                d3.select("#" + relatedPathId).style("stroke", stroke); 
            }
        }
    }

    exports.getFixedDepth = getFixedDepth;
    exports.getTextOffset = getTextOffset;
    exports.getFontSizePX = getFontSizePX;
    exports.getRadius = getRadius;
    exports.highlightPathsBy = highlightPathsBy;
    exports.openPathsBy = openPathsBy;
    exports.collapse = collapse;
    exports.stylePathsStroke = stylePathsStroke;

	Object.defineProperty(exports, '__esModule', { value: true });
    console.log("loaded: bzctree  IIFE");

})));

