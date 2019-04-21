(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.bznetwork = global.bznetwork || {})));
}(this, (function (exports) { 'use strict';

    console.log("loading: bznetwork IIFE");


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
  }
}

exports.OverrideMixin = OverrideMixin;

Object.defineProperty(exports, '__esModule', { value: true });

console.log("loaded: chartNetworkMixin IIFE");


})));

