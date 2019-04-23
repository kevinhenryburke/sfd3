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

    exports.getFixedDepth = getFixedDepth;
    exports.getTextOffset = getTextOffset;
    exports.getFontSizePX = getFontSizePX;
    exports.getRadius = getRadius;
    exports.collapse = collapse;


	Object.defineProperty(exports, '__esModule', { value: true });
    console.log("loaded: bzctree  IIFE");

})));

