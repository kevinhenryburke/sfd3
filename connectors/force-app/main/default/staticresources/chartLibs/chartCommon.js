(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.bzchart = global.bzchart || {})));
}(this, (function (exports) { 'use strict';

console.log("loading: bzchart IIFE");


function setStore (store, key, value) {
    store[key] = value;
}

function getStore (store, key) {
    return store[key];
}

var isiOS = false;

exports.isiOS = isiOS;
exports.setStore = setStore;
exports.getStore = getStore;

Object.defineProperty(exports, '__esModule', { value: true });

console.log("loaded: bzchart  IIFE");

})));

/* BASE MIXINS */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.chartDefaultMixin = global.chartDefaultMixin || {})));
}(this, (function (exports) { 'use strict';

console.log("loading: chartDefaultMixin IIFE");

const DefaultMixin = {
  getDefaultSize() {
    return 10;
  },
  getDefaultColor() {
    return "lightsteelblue";
  },
}

exports.DefaultMixin = DefaultMixin;

Object.defineProperty(exports, '__esModule', { value: true });

console.log("loaded: chartDefaultMixin  IIFE");


})));
