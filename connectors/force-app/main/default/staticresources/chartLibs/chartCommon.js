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

function getDefaultValueForReturnType(storeObject, returnType) {
  let retValDefault; 
  switch (returnType) {
      case "Color" : retValDefault = bzchart.getStore (storeObject, "defaultColor") ; break;
      case "Value" : retValDefault = ""; break;
      case "Size" : retValDefault = bzchart.getStore (storeObject, "defaultSize"); break;
  }
  return retValDefault;
}

function getStringValue (storeObject, currentMeasureScheme, retrievedField, returnType) {
  var retrievedValue = retrievedField.retrievedValue;
  if (returnType == "Value") { // for Value just return the String Value in the relevant field
      return retrievedValue;
  }
  if (returnType == "Color") { // try to match with the value with the configured list, if not found return the default color
      var valueColor = currentMeasureScheme[retrievedValue];
      if (valueColor != null) {
          return valueColor;
      }

      var valueColorDefault = currentMeasureScheme["default"];
      if (valueColorDefault != null) {
          return valueColorDefault;
      }
      return bzchart.getDefaultValueForReturnType (storeObject, "Color");    
  }
}

function getFromMeasureScheme  (storeObject, ddata, returnType) {
  // relevantMeasure is set on initialization of data in component and changed on color or size events.
  let relevantMeasure = bzchart.getStore (storeObject, "relevantMeasure"); 
  // deal with the case when there are no colors or sizes configured
  if (relevantMeasure == null || relevantMeasure == "bzDefault") { 
      return bzchart.getDefaultValueForReturnType (storeObject, returnType);    
  }

  let objectType = ddata["objectType"];

  // deal with the case when there are no colors or sizes configured for the current object
  var measureObjectFieldMap = bzchart.getStore (storeObject, "measureObjectFieldMap");
  var currentMeasureObjectConfig = measureObjectFieldMap[relevantMeasure][objectType];

  if (currentMeasureObjectConfig == null) {
      return bzchart.getDefaultValueForReturnType (storeObject, returnType);    
  }

  // from here on we can assume that there is some object configuration for this measure

  let sizeChangesColor =  currentMeasureObjectConfig["sizeChangesColor"];
  let latestSizeOrColor = bzchart.getStore (storeObject, "latestSizeOrColor"); 

  if (returnType == "Color" && !sizeChangesColor && latestSizeOrColor == "size") {
      relevantMeasure = bzchart.getStore (storeObject, "currentColorLabel"); 
      currentMeasureObjectConfig = measureObjectFieldMap[relevantMeasure][objectType];

      if (currentMeasureObjectConfig == null) {
          return bzchart.getDefaultValueForReturnType (storeObject, returnType);    
      }
  }

  var currentMeasureScheme = currentMeasureObjectConfig["measureScheme"];
  var currentMeasureSchemeType = currentMeasureObjectConfig["measureSchemeType"];
  var fieldIndex = currentMeasureObjectConfig["fieldIndex"];
  let retrievedField = ddata.fields[fieldIndex];

  if (returnType == "Value" || returnType == "Size") {
      // bring the Decimal and Integer options into a single variable

      if (currentMeasureSchemeType == "StringValue") {
          return bzchart.getStringValue (storeObject, currentMeasureScheme, retrievedField,  "Value");
      }

      if ((retrievedField.fieldType == "CURRENCY" || retrievedField.fieldType == "DECIMAL" || retrievedField.fieldType == "DOUBLE") && retrievedField.retrievedValue != null) {
          return retrievedField.retrievedValue;
      }

      if (retrievedField.fieldType == "INTEGER" && retrievedField.retrievedValue != null) {
          return retrievedField.retrievedValue;
      }
  }

  if (returnType == "Color" ) {
      // case when baseing colors and values on picklists (not currently relevant for sizes)
      if (currentMeasureSchemeType == "StringValue") {
          return bzchart.getStringValue (storeObject, currentMeasureScheme, retrievedField, returnType);
      }

      // case when baseing colors and values on numerics

      // bring the Decimal and Integer options into a single variable
      var numericValue; 

      if ((retrievedField.fieldType == "CURRENCY" || retrievedField.fieldType == "DECIMAL" || retrievedField.fieldType == "DOUBLE") && retrievedField.retrievedValue != null) {
          numericValue = retrievedField.retrievedValue;
      }

      if (retrievedField.fieldType == "INTEGER" && retrievedField.retrievedValue != null) {
          numericValue = retrievedField.retrievedValue;
      }


      if (currentMeasureSchemeType == "ValueBand") {
          // check out the lowest level
          var low = currentMeasureScheme[0];
          if (numericValue < low.below) {
              return low.color;
          } 
          else {
              // if above the lowest threshhold go to the top and work backwards
              var measureSchemeLength = currentMeasureScheme.length;
              for (var k = measureSchemeLength - 1; k > 0; k--) {
                  var high = currentMeasureScheme[k];
                  if (numericValue >= high.above) {
                      return high.color;
                  }         
              }
          }
      }

      if (currentMeasureSchemeType == "Scale") {
          var measureObjectScaleMap = bzchart.getStore (storeObject, "measureObjectScaleMap");  
          var currentMeasureObjectConfig = measureObjectScaleMap[relevantMeasure][objectType];
          return currentMeasureObjectConfig(numericValue) ;     
      }
  }
}

function getFirstColorSchemeLegend (storeObject, currentColorLabel) {
  var measureArrayObjectFieldMap = bzchart.getStore (storeObject, "measureArrayObjectFieldMap");
  if (measureArrayObjectFieldMap[currentColorLabel] != null) {
      return measureArrayObjectFieldMap[currentColorLabel][0];
  }
  else {
      return null;
  }
}

function prepareEvent (storeObject, topic, parameters) {
  var controllerId = bzchart.getStore (storeObject, "UserControllerComponentId") ;
  var eventType = bzutils.getEventTypeByTopic(topic);
  return {
      "eventType" : eventType ,
      "topic" : topic,
      "parameters" : parameters,
      "controllerId" : controllerId
  }
}

exports.setStore = setStore;
exports.getStore = getStore;
exports.hasStore = hasStore;
exports.getStoreWithDefault = getStoreWithDefault;
exports.isFilteredOut = isFilteredOut;
exports.getFilterOpacity = getFilterOpacity;
exports.createInfoLocation = createInfoLocation;
exports.getDefaultValueForReturnType = getDefaultValueForReturnType;
exports.getStringValue = getStringValue;
exports.getFromMeasureScheme = getFromMeasureScheme;
exports.getFirstColorSchemeLegend = getFirstColorSchemeLegend;
exports.prepareEvent = prepareEvent;


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
  nodeMouseover(storeObject, d) {
  },
  dataPreprocess(storeObject, datajson, datajsonRefresh) {
  },
  reScale(storeObject, csf) {
  }

}

exports.DefaultMixin = DefaultMixin;

Object.defineProperty(exports, '__esModule', { value: true });

console.log("loaded: chartDefaultMixin  IIFE");


})));
