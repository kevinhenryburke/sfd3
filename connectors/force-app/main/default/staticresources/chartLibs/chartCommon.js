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

function hasStore (store, key) {
  return Object.keys(store).includes(key);
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

// create an invisible svg symbol to attach a popover to
function createInfoLocation (storeObject) {
  let componentReference = bzchart.getStore (storeObject, "componentReference") ;  

  var mdata = [0]; // random data value, not used

  var width = bzchart.getStore (storeObject, "width");
  // var popx = width - 10;
  // var popy = 200;
  var popx = width - 260;
  var popy = 110;

  var svg = d3.select(bzutils.getDivId("svg", componentReference, true));
  var infosvg = 
  svg.selectAll('.symbol')
      .data(mdata)
      .enter()
      .append('path')
      .attr('transform',function(d,i) { return 'translate(' + popx + ',' + popy + ')';})
      .attr('d', d3.symbol().type( function(d,i) { return d3.symbols[i];}) )
      .attr('id', function(d,i) { return "infolocation" + componentReference;})
      .attr('visibility', "hidden") // white background to hide
      .attr('class', function(d,i) { return "infolocation" + componentReference;});

  var referenceSelector = ".infolocation" + componentReference;

  bzchart.setStore (storeObject, "referenceSelector", referenceSelector ) ;
  bzchart.setStore (storeObject, "infosvg", infosvg ) ;
}


exports.setStore = setStore;
exports.getStore = getStore;
exports.hasStore = hasStore;
exports.getStoreWithDefault = getStoreWithDefault;
exports.isFilteredOut = isFilteredOut;
exports.getFilterOpacity = getFilterOpacity;
exports.createInfoLocation = createInfoLocation;

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
  hasPrimaryNode() {
    return false;
  },
  refreshVisibility(storeObject){
  },

}

exports.DefaultMixin = DefaultMixin;

Object.defineProperty(exports, '__esModule', { value: true });

console.log("loaded: chartDefaultMixin  IIFE");


})));
