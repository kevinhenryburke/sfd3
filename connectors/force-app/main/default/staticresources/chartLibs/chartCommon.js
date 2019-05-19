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

function initializeStore (recordId) {

    if (recordId == null) {
        recordId = "";
    }

    // calculate compref from random generator   
    let comprefNumber = Math.floor((Math.random() * 10000000000) + 1); 
    let componentReference = "compref" + comprefNumber + recordId;
    let chartAreaDivId = componentReference + 'chartArea';

    let storeObject = {
        "recordId": recordId,
        "rendered": false, 
        "showMeasureValues": false,
        "componentReference": componentReference,
        "chartAreaDivId": chartAreaDivId,
        "ChartScaleFactor": 1,
        "ChartScalePercentage": 100,
        "showZoomSlider": false,
        "showLevelsInitial": 1
    }
    return storeObject;
};


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

/* clearElements removes all paths, nodes, rects, text from the chart */
function clearElements (componentReference) {
    var svg = d3.select(bzutils.getDivId("svg", componentReference, true));
    svg.selectAll("path,circle,rect,text").remove(); // comma separated acts as union
}
            
/* clearChart removes all elements and groups from the chart */
function clearChart(componentReference) {
    console.log("xxxxx: clearChart 3");
    bzchart.clearElements(componentReference);
    d3.select(bzutils.getDivId("pathGroup", componentReference, true)).remove();
    d3.select(bzutils.getDivId("nodeGroup", componentReference, true)).remove();
    d3.select(bzutils.getDivId("textGroup", componentReference, true)).remove();
    d3.select(bzutils.getDivId("legendSymbolGroup", componentReference, true)).remove();
}

// during initialization, build a map so we can quickly associate the correct API field to a measure
function mapMasterConfigToStore(masterConfigObject, storeObject) {

    let showPathToolTip = bzutils.getMasterParamWithDefault(masterConfigObject, false, "panels", "ChartPanel", "Network", "showPathToolTip");
    bzchart.setStore(storeObject, "showPathToolTip", showPathToolTip);

    let showZoomSlider = bzutils.getMasterParamWithDefault(masterConfigObject, false, "panels", "ChartPanel", "Hierarchy", "showZoomSlider");
    bzchart.setStore(storeObject, "showZoomSlider", showZoomSlider);

    var showEmbeddedPanel = bzutils.getMasterParamWithDefault(masterConfigObject, null, "panels", "InfoPanel", "showEmbeddedPanel");
    bzchart.setStore(storeObject, "showEmbeddedPanel", showEmbeddedPanel);

    var showLevelsInitial = bzutils.getMasterParamWithDefault(masterConfigObject, 1, "panels", "ChartPanel", "showLevelsInitial");
    bzchart.setStore(storeObject, "showLevels", showLevelsInitial);

    let allowPopover = bzutils.getMasterParamWithDefault(masterConfigObject, false, "panels", "InfoPanel", "allowPopover");
    bzchart.setStore(storeObject, "allowPopover", allowPopover);

    let clearHighlightedPaths = bzutils.getMasterParamWithDefault(masterConfigObject, false, "panels", "ChartPanel", "Hierarchy", "clearHighlightedPaths");
    bzchart.setStore(storeObject, "clearHighlightedPaths", clearHighlightedPaths);

    // Following are Network specific at present

    bzchart.setStore(storeObject, "primaryNodeHighlightingOn",
        bzutils.getMasterParamWithDefault(masterConfigObject, true, "panels", "ChartPanel", "Network", "primaryNodeHighlightingOn"));
    bzchart.setStore(storeObject, "primaryNodeHighlightingColour",
        bzutils.getMasterParamWithDefault(masterConfigObject, "gold", "panels", "ChartPanel", "Network", "primaryNodeHighlightingColour"));
    bzchart.setStore(storeObject, "primaryNodeHighlightingRadius",
        bzutils.getMasterParamWithDefault(masterConfigObject, "10px", "panels", "ChartPanel", "Network", "primaryNodeHighlightingRadius"));
    bzchart.setStore(storeObject, "retainNodeDetailsMouseOut",
        bzutils.getMasterParamWithDefault(masterConfigObject, true, "panels", "ChartPanel", "Network", "retainNodeDetailsMouseOut"));
    bzchart.setStore(storeObject, "nodestrokewidth",
        bzutils.getMasterParamWithDefault(masterConfigObject, "5px", "panels", "ChartPanel", "Network", "nodestrokewidth"));

}

// during initialization, build a map so we can quickly associate the correct API field to a measure
function buildMeasureSchemeMap (masterConfigObject, storeObject) {
    var objectLevels = bzutils.getMasterParamWithDefault(masterConfigObject,1,"data","queryJSON","objectLevels");

    // storage optimized for node colors: object / measureName / measureSchema
    var measureObjectFieldMap = {};
    // storage optimized for legend table: measureName / measureSchema (including object type)
    var measureArrayObjectFieldMap = {};
    // storage of scale functions: object / measureName / measureSchema
    var measureObjectScaleMap = {};
    // storage of grouping fields for hierarchy zoom charts on picklists: 
    // top level only at this point, grouping is in the order of the fields in config
    var groupingFields = [];

    for (var objIndex = 0; objIndex < objectLevels.length; objIndex++) {
        var thisObjectConfig = objectLevels[objIndex];
        var objectType = thisObjectConfig.objectType;

        var fields = thisObjectConfig.fields;
        for (var fieldIndex = 0; fieldIndex < fields.length; fieldIndex++) {
            var fieldConfig = fields[fieldIndex];
            if (fieldConfig["measureName"] != null) {

                var measureName = fieldConfig["measureName"] ;
                var currentApiName = fieldConfig["api"]; 
                var colorScheme = fieldConfig["measureScheme"]; 
                var measureSchemeType = fieldConfig["measureSchemeType"]; 
                var sizeSchemeType = fieldConfig["sizeSchemeType"]; 
                var sizeChangesColor = fieldConfig["sizeChangesColor"]; 

                if (measureObjectFieldMap[measureName] == null) {
                    var measureLevel = {};
                    measureLevel[objectType] = {"measureScheme" : colorScheme, "measureSchemeType" : measureSchemeType , "fieldAPI" : currentApiName, "fieldIndex" : fieldIndex, "sizeSchemeType" : sizeSchemeType, "sizeChangesColor" : sizeChangesColor};
                    measureObjectFieldMap[measureName] = measureLevel;

                    measureArrayObjectFieldMap[measureName] = [{"measureScheme" : colorScheme, "measureSchemeType" : measureSchemeType , "fieldAPI" : currentApiName, "fieldIndex" : fieldIndex, "objectType" : objectType, "sizeSchemeType" : sizeSchemeType, "sizeChangesColor" : sizeChangesColor}];

                }
                else {
                    var measureLevel = measureObjectFieldMap[measureName]; 
                    measureLevel[objectType] = {"measureScheme" : colorScheme, "measureSchemeType" : measureSchemeType, "fieldAPI" : currentApiName, "fieldIndex" : fieldIndex, "sizeSchemeType" : sizeSchemeType, "sizeChangesColor" : sizeChangesColor };

                    measureArrayObjectFieldMap[measureName].push({"measureScheme" : colorScheme, "measureSchemeType" : measureSchemeType , "fieldAPI" : currentApiName, "fieldIndex" : fieldIndex, "objectType" : objectType, "sizeSchemeType" : sizeSchemeType, "sizeChangesColor" : sizeChangesColor});

                }
                if (measureSchemeType == "Scale") {
                    var domain = colorScheme["domain"]; 
                    var range = colorScheme["range"]; 

                    if (measureObjectScaleMap[measureName] == null) {
                        var objectLevel = {};
                        objectLevel[objectType] = 
                            d3.scaleLinear().domain(domain).range(range);
                        ;
                        measureObjectScaleMap[measureName] = objectLevel;    
                    }
                    else {
                        var objectLevel = measureObjectScaleMap[measureName]; 
                        objectLevel[objectType] = 
                            d3.scaleLinear().domain(domain).range(range);
                    }
                }
            }
            if (objIndex == 0 && fieldConfig["role"] == "group") { // top object level only at present
                groupingFields.push( {"fieldIndex" : fieldIndex , "api" : fieldConfig["api"]});
            }
        }
    }
    bzchart.setStore (storeObject, "measureObjectFieldMap", measureObjectFieldMap);
    bzchart.setStore (storeObject, "measureArrayObjectFieldMap", measureArrayObjectFieldMap);
    bzchart.setStore (storeObject, "measureObjectScaleMap", measureObjectScaleMap);
    bzchart.setStore (storeObject, "groupingFields", groupingFields);
}

function showColorSchemeLegend (storeObject) {
    let componentReference = bzchart.getStore (storeObject, "componentReference") ;  
    let currentColorLabel = bzchart.getStore (storeObject, "currentColorLabel");
    let currentSizeLabel = bzchart.getStore (storeObject, "currentSizeLabel");

    let firstMeasureScheme = bzchart.getFirstColorSchemeLegend(storeObject, currentColorLabel);

    // remove existing legend symbols
    d3.select(bzutils.getDivId("legendSymbolGroup", componentReference, true)).selectAll("*").remove();

    let legendSymbolGroup = bzchart.getStore (storeObject, "legendSymbolGroup" ) ;
    
    let ms = firstMeasureScheme.measureScheme;
    let mst = firstMeasureScheme["measureSchemeType"];
    let baseDataArray;

    /*  Measure Scheme is an array in complex cases (value ranges) but is an object with name/value in others
        We need to baseline our nodes on an array, hence the below
    */

   switch (mst) {
        case "ValueBand" : baseDataArray = ms; break;
        case "Scale" : baseDataArray = ms["domain"]; break;
        case "StringValue" : baseDataArray = Object.keys(ms); break;
    }

    var currentColorLabelAsArray = [];
    var schemeTextPrefix = [];

    let xSchemeTextOffset = 20, xSymbolOffset = 30, xSymbolTextOffset = 40;
    let ySchemeTextOffset = 13, yLineDepth = 20, yFirstSymbolOffset = 30, yFirstSymbolTextOffset = 33;

    if (currentSizeLabel != "bzDefault") {
        schemeTextPrefix.push("Size Scheme: ");
        currentColorLabelAsArray.push(currentSizeLabel);
        yFirstSymbolOffset += 30;
        yFirstSymbolTextOffset += 30;    
    }

    if (currentColorLabel != "bzDefault") {
        schemeTextPrefix.push("Color Scheme: ");
        currentColorLabelAsArray.push(currentColorLabel);
    }

    var measureText = legendSymbolGroup.selectAll("textme")
        .data(currentColorLabelAsArray)
        .enter()
        .append("text")
        .attr('transform',function(d,i) { return 'translate('+xSchemeTextOffset+','+(i*yLineDepth+ySchemeTextOffset)+')';})  
        .text( function (d, i) {return schemeTextPrefix[i] + d;})
        .attr("font-size", "8px")
        .attr("fill", "black");

    if (currentColorLabel != "bzDefault") {
        var textme = legendSymbolGroup.selectAll("textme")
            .data(baseDataArray)
            .enter()
            .append("text");            

        var textLabels = textme
            .attr('transform',function(d,i) { return 'translate('+xSymbolTextOffset+','+(i*yLineDepth+yFirstSymbolTextOffset)+')';})
            .attr("font-family", "sans-serif")
            .text( function(d,i) {return getLegendItemName (ms, d, i);})
            .attr("font-size", "8px")
            .attr("fill", "gray");

        var nodeSymbol = legendSymbolGroup.selectAll('.symbol')
            .data(baseDataArray);

        nodeSymbol
            .enter()
            .append('path')
            .style("stroke" , "black")
            .style("fill" , function(d,i) {return getLegendItemColor (ms, d, i);})
            .attr('transform',function(d,i) { return 'translate('+xSymbolOffset+','+(i*yLineDepth+yFirstSymbolOffset)+')';})
            .attr('d', d3.symbol().type( function(d,i) { return d3.symbols[0];}) );
    }


    function getLegendItemColor(ms, d, i) {
        if (mst == "ValueBand") {
            return ms[i]["color"];
        }
        if (mst == "Scale") {
            return ms["range"][i];
        }
        if (mst == "StringValue") {
            return ms[d];
        }
    }

    function getLegendItemName(ms, d, i) {
        if (mst == "ValueBand") {
            if (ms[i]["below"] != null) {
                return "below " + ms[i]["below"].toLocaleString();
            }
            if (ms[i]["above"] != null) {
                return "above " + ms[i]["above"].toLocaleString();
            }
        }
        if (mst == "Scale") {
            return ms["domain"][i];
        }
        if (mst == "StringValue") {
            return d;
        }
    }            
}

function setFilterVisibility (storeObject, filterType, filterState) {
    var filterValues = bzchart.getStore (storeObject, "filterValues") ;
    if (filterState == "Show") {
        filterValues.push(filterType);
    } else {
        var index = filterValues.indexOf(filterType);
        if (index > -1) {
            filterValues.splice(index, 1);
        }
    }
    bzchart.setStore (storeObject, "filterValues", filterValues ) ;
}

function initializeGroups (storeObject, datajson, primaryNodeId, showFilters, isInit) {
    let componentReference = bzchart.getStore (storeObject, "componentReference") ;  
    
    if (isInit) {
        bzutils.initializeAddComponentRef(componentReference, datajson);
    }

    bzchart.setStore (storeObject, "datajson", datajson ) ;

    let variantsMixin = bzchart.getStore (storeObject, "chartMixin") ;
    let hasPrimaryNode = variantsMixin.hasPrimaryNode();

    if (hasPrimaryNode == true) {
        console.log("hasPrimaryNode true");
        primaryNodeId = bzutils.addComponentRef(componentReference, primaryNodeId);
        bzchart.setStore (storeObject, "primaryNodeId", primaryNodeId ) ;
    }
    else {
        console.log("hasPrimaryNode false");
    }

    if (showFilters != null) {
        bzchart.setStore (storeObject, "filterValues", showFilters.filterValues ) ;
        bzchart.setStore (storeObject, "filterAPIField", showFilters.filterAPIField ) ;
    }
    else {
        bzchart.setStore (storeObject, "filterValues", [] ) ;
    }

    var svg = d3.select(bzutils.getDivId("svg", componentReference, true));
            
    // Styling of tooltips - see GitHub prior to Feb 24, 2018
    var pathToolTipDivId = bzutils.addComponentRef(componentReference, "pathToolTip");
    var pathToolTipDiv = d3.select("#" + pathToolTipDivId);
    bzchart.setStore (storeObject, "pathToolTipDiv", pathToolTipDiv ) ;

    // create some groups inside the svg element to store the raw data

    var pathGroupId = bzutils.getDivId("pathGroup", componentReference, false);
    bzchart.setStore (storeObject, "pathGroupId", pathGroupId ) ;
    var pathGroup = d3.select("#" + pathGroupId);
    if (pathGroup.empty()) {
        console.log("create pathGroup");
        pathGroup = svg.append("g").attr("id",pathGroupId);
    }
    bzchart.setStore (storeObject, "pathGroup", pathGroup ) ;

    var nodeGroupId = bzutils.getDivId("nodeGroup", componentReference, false);
    var nodeGroup = d3.select("#" + nodeGroupId);
    if (nodeGroup.empty()) {
        console.log("create nodeGroup");
        nodeGroup = svg.append("g").attr("id",nodeGroupId);
    }
    bzchart.setStore (storeObject, "nodeGroup", nodeGroup ) ;

    var textGroupId = bzutils.getDivId("textGroup", componentReference, false);        
    var textGroup = d3.select("#" + textGroupId);
    if (textGroup.empty()) {
        console.log("create textGroup");
        textGroup = svg.append("svg:g").attr("id",textGroupId);
    }
    bzchart.setStore (storeObject, "textGroup", textGroup ) ;

    var legendSymbolGroupId = bzutils.getDivId("legendSymbolGroup", componentReference, false);
    var legendSymbolGroup = d3.select("#" + legendSymbolGroupId);
    if (legendSymbolGroup.empty()) {
        console.log("create legendSymbolGroup");
        legendSymbolGroup = svg.append("g").attr("id",legendSymbolGroupId);
    }
    bzchart.setStore (storeObject, "legendSymbolGroup", legendSymbolGroup ) ;

}



exports.setStore = setStore;
exports.getStore = getStore;
exports.hasStore = hasStore;
exports.getStoreWithDefault = getStoreWithDefault;
exports.initializeStore = initializeStore;
exports.isFilteredOut = isFilteredOut;
exports.getFilterOpacity = getFilterOpacity;
exports.createInfoLocation = createInfoLocation;
exports.getDefaultValueForReturnType = getDefaultValueForReturnType;
exports.getStringValue = getStringValue;
exports.getFromMeasureScheme = getFromMeasureScheme;
exports.getFirstColorSchemeLegend = getFirstColorSchemeLegend;
exports.prepareEvent = prepareEvent;
exports.clearElements = clearElements;
exports.clearChart = clearChart;
exports.mapMasterConfigToStore = mapMasterConfigToStore;
exports.buildMeasureSchemeMap = buildMeasureSchemeMap;
exports.showColorSchemeLegend = showColorSchemeLegend;
exports.setFilterVisibility = setFilterVisibility;
exports.initializeGroups = initializeGroups;

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
  },
  initializeVisuals (storeObject) {
  },
  styleNodes (storeObject) {
  },
  searchChart: function(storeObject,searchTermId,searchAction,showLevels){
  },
  updateTitle : function (parameters) {
      return null;
  },
  refreshDataController  (storeObject, parameters) {
  }

}

exports.DefaultMixin = DefaultMixin;

Object.defineProperty(exports, '__esModule', { value: true });

console.log("loaded: chartDefaultMixin  IIFE");


})));
