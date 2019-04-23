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

function getStoreWithDefault (store, key, defaultValue) {
  let returnValue = store[key];
  if (returnValue == null) {
    return defaultValue;
  }
  return returnValue;
}

function isFilteredOut (storeObject, d) {
  console.log("xxxxx: isFilteredOut");
  // if there are no filters configured then we're good to go.

  var filtersConfigured = bzchart.getStore (storeObject, "filtersConfigured");
  if (filtersConfigured == false) {
      return false;
  } 

  var filterAPIField = bzchart.getStore (storeObject, "filterAPIField");     
  var recordValue;

  for (var i = 0; i < d.fields.length; i++) {
      if (d.fields[i].api == filterAPIField) {
          recordValue = d.fields[i].retrievedValue;
          break;
      }
  }

  var filterValues = bzchart.getStore (storeObject, "filterValues");    
  
  if (!filterValues.includes(recordValue)) {
      return true;
  }
  return false;
}

function getFilterOpacity (storeObject, d) {
  if (bzchart.isFilteredOut(storeObject,d)) {
      return 0.1;
  }
  return 1;
}

var isiOS = false;

exports.isiOS = isiOS;
exports.setStore = setStore;
exports.getStore = getStore;
exports.getStoreWithDefault = getStoreWithDefault;
exports.isFilteredOut = isFilteredOut;
exports.getFilterOpacity = getFilterOpacity;

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
