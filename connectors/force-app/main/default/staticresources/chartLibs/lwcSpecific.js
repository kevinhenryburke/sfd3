(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.bzlwc = global.bzlwc || {})));
}(this, (function (exports) { 'use strict';

console.log("loading: bzlwc IIFE");

function startInitialize (recordId){
    console.log("lwcSpecific: startInitialize: enter");
    let storeObject = bzchart.initializeStore (recordId);
    console.log("lwcSpecific: startInitialize: store initialized");
    return storeObject;

}

exports.startInitialize = startInitialize;


Object.defineProperty(exports, '__esModule', { value: true });

console.log("loaded: bzlwc  IIFE");

})));

/* FRAMEWORK MIXINS */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.lwcFrameworkMixin = global.lwcFrameworkMixin || {})));
}(this, (function (exports) { 'use strict';

console.log("loading: lwcFrameworkMixin IIFE");

const ContextMixin = {
//   getDefaultSize() {
//     return 10;
//   },
//   getDefaultColor() {
//     return "lightsteelblue";
//   }
}

//exports.DefaultMixin = DefaultMixin;

Object.defineProperty(exports, '__esModule', { value: true });

console.log("loaded: lwcFrameworkMixin  IIFE");


})));
