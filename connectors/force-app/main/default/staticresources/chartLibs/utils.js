(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.bzutils = global.bzutils || {})));
}(this, (function (exports) { 'use strict';

console.log("loading: bzutils IIFE");

var debugMode = true;

// Data Cache
// It it handy to have some data stored outside lightning as lightning loses context.
// These are Data Caches and can exist in both general and context specific forms. They can hold data derived from configuration, from data or data supporting processing.
// Each store is indexed by a component reference, hence the name componentCache.

// Data Store to hold data derived from configuration
// var componentCache = {};

// function initializeCache (componentReference) {
//     componentCache[componentReference] = {};
// }

// function setCache (componentReference, key, value) {
//     componentCache[componentReference][key] = value;
// }

// function getCache (componentReference, key) {
//     var referenceParameters = componentCache[componentReference];
//     return referenceParameters[key];
// }

// function hasCache (componentReference, key) {
//     var referenceParameters = componentCache[componentReference];
//     return Object.keys(referenceParameters).includes(key);
// }

// function showCache (componentReference) {
//     bzutils.log(componentCache[componentReference]);
// }

// function showCacheAll () {
//     bzutils.log(componentCache);
// }

function log (logItem) {
    if (debugMode == true) {
        console.log(logItem);
    } 
}


// replace ids with component specific versions - this will allow multiple charts on a page without conflict
// function initializeAddComponentRef(componentReference, datajson) {
//     if (datajson.nodes != null) {
//     datajson.nodes.forEach(function(node) {
//         node["id"] = bzutils.addComponentRef(componentReference, node["id"]);
//         node["recordid"] = bzutils.removeComponentRef(componentReference, node["id"]);
//     })};
        
//     if (datajson.links != null) {
//     datajson.links.forEach(function(link) {
//         link["id"] = bzutils.addComponentRef(componentReference, link["id"]);
//         link["sourceid"] = bzutils.addComponentRef(componentReference, link["sourceid"]);
//         link["targetid"] = bzutils.addComponentRef(componentReference, link["targetid"]);
//     })};
// }    

// function addComponentRef(componentReference, recordid) {
//     if (recordid.indexOf("compref") > -1) { // don't double index  
//         console.log("avoiding a double compref for recordid " + recordid);
//         return recordid;
//     }
//     return componentReference + recordid;
// }

// // remove component specific prefix from id - this will allow original references to be retrieved
// function removeComponentRef(componentReference, recordidEnriched) {
//     if (recordidEnriched.indexOf("compref") > -1) { // compref present
//         var indexer = componentReference.length;
//         return recordidEnriched.substring(indexer);
//     }
//     return recordidEnriched;
// }    

// function getDivId (idType, componentReference, forSelect) {
//     return (forSelect ? "#" : "") + componentReference + idType;
// }

// // handy function to retrieve a D3 Node from a DOM id
// function getNodeFromId (id) {
//     return d3.select("#" + id).data()[0];
// }


/* This is how to list all the properties and all functions in a module

console.log(Object.getOwnPropertyNames(bzutils));

console.log(Object.getOwnPropertyNames(bzutils).filter(function (p) {
    return typeof bzutils[p] === 'function';
}));        
*/

/* 
Delegates to an appropriate function based on componentReference. This includes deriving the componentType and picking up the correct delegate based on that attribute.
Note: The delegated function is assumed to have componentReference as its first argument 
*/

// function xfcr(functionType, componentReference /*, args */) {
//     console.log("xfcr: functionType: " + functionType);
//     var componentType = bzutils.getCache (componentReference, "componentType");
//     console.log("xfcr: componentType: " + componentType);
//     var functionName = bzconfig.fns[componentType][functionType];
//     console.log("xfcr: functionName: " + functionName);

//     var context = context == undefined? window:context;
//     var args = Array.prototype.slice.call(arguments, 1);
//     var namespaces = functionName.split(".");
//     var func = namespaces.pop();
//     for(var i = 0; i < namespaces.length; i++) {
//       context = context[namespaces[i]];
//     }
//     return context[func].apply(context, args);
// }

/* 
Delegates to an appropriate function based on componentType.
Note: The delegated function is NOT assumed to have componentType as its first argument 
If componentType is needed then supply it twice in the calling parameters
*/

// function xfct(functionType, componentType /*, args */) {
//     var functionName = bzconfig.fns[componentType][functionType];

//     var context = context == undefined? window:context;
//     var args = Array.prototype.slice.call(arguments, 2);
//     var namespaces = functionName.split(".");
//     var func = namespaces.pop();
//     for(var i = 0; i < namespaces.length; i++) {
//       context = context[namespaces[i]];
//     }
//     return context[func].apply(context, args);
// }


// function getParam2(componentType, config /*, args */) {
//     console.log("getParam2 enter");
//     var args = Array.prototype.slice.call(arguments, 2);
//     var retValue = null;
//     var loopJson = config[componentType];
//     for (var i=0; i<args.length;i++) {
//         if (loopJson.hasOwnProperty([args[i]])) {
//             console.log("loopJson: " + args[i]);
//             retValue = loopJson[args[i]];
//             loopJson = loopJson[args[i]];
//         }
//         else {
//             return;
//         }    
//     }
//     console.log("getParam2 exit: " + retValue);
//     return retValue;
// }

// function hasParam2(componentType, config /*, args */) {
//     var args = Array.prototype.slice.call(arguments, 2);
//     var loopJson = config[componentType];
//     for (var i=0; i<args.length;i++) {
//         if (loopJson.hasOwnProperty([args[i]])) {
//             console.log("loopJson: " + args[i]);
//             loopJson = loopJson[args[i]];
//         }
//         else {
//             return false;
//         }    
//     }
//     return true;
// }

// function getMasterParam(config /*, args */) {
//     console.log("getMasterParam enter");
//     var args = Array.prototype.slice.call(arguments, 1);
//     var retValue = null;
//     var loopJson = config;
//     for (var i=0; i<args.length;i++) {
//         if (loopJson.hasOwnProperty([args[i]])) {
//             console.log("loopJson: " + args[i]);
//             retValue = loopJson[args[i]];
//             loopJson = loopJson[args[i]];
//         }
//         else {
//             return;
//         }    
//     }
//     console.log("getMasterParam exit: " + retValue);
//     return retValue;
// }

// function hasMasterParam(config /*, args */) {
//     var args = Array.prototype.slice.call(arguments, 1);
//     var loopJson = config;
//     for (var i=0; i<args.length;i++) {
//         if (loopJson.hasOwnProperty([args[i]])) {
//             console.log("loopJson: " + args[i]);
//             loopJson = loopJson[args[i]];
//         }
//         else {
//             return false;
//         }    
//     }
//     return true;
// }


// new signatures .... 
// (topic, publisher, publisherCategory, publisherType, parameters, controller)
// becomes
// (componentReference, topic, parameters)

// Simpler model
// Everything is associated with a controller
// Everything associated with the same controller receives the same messages
// These can then be filtered out in the handlers

// so don't need publisher, publisherCategory, publisherType

// function prepareEvent(topic, parameters, controllerId) {
//     var eventType = bzutils.getEventTypeByTopic(topic);
//     return {
//         "eventType" : eventType ,
//         "topic" : topic,
//         "parameters" : parameters,
//         "controllerId" : controllerId
//     }
// }

function publishEventHelper(event, topic, parameters, controller) {
    console.log("publishEventHelper: controller: " + controller + " topic: " + topic + " getType: " + event.getType(), parameters );

    event.setParams({
        "topic" : topic,
        "controller" : controller,
        "parameters" : parameters
    });
    event.fire();
}

/* Different topics may use different event types, implement in this method */
/* eventType is one of "Component" or "Application" or "Cache" */

function getEventTypeByTopic(topic) {
    return null;
}

// exports.componentCache = componentCache;
exports.log = log;
// exports.xfcr = xfcr;
// exports.xfct = xfct;
// exports.getParam2 = getParam2;
// exports.hasParam2 = hasParam2;
// exports.getMasterParam = getMasterParam;
// exports.hasMasterParam = hasMasterParam;
// exports.initializeAddComponentRef = initializeAddComponentRef;
// exports.addComponentRef = addComponentRef;
// exports.removeComponentRef = removeComponentRef;
// exports.prepareEvent = prepareEvent;
exports.publishEventHelper = publishEventHelper;
exports.getEventTypeByTopic = getEventTypeByTopic;
// exports.initializeCache = initializeCache;
// exports.setCache = setCache;
// exports.getCache = getCache;
// exports.hasCache = hasCache;
// exports.showCache = showCache;
// exports.showCacheAll = showCacheAll;
// exports.getDivId = getDivId;
// exports.getNodeFromId = getNodeFromId;

Object.defineProperty(exports, '__esModule', { value: true });

console.log("loaded: bzutils  IIFE");

})));
