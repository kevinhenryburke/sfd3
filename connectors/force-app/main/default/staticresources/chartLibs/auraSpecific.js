(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.bzaura = global.bzaura || {})));
}(this, (function (exports) { 'use strict';

console.log("loading: bzaura IIFE");


function publishPreppedEvent (storeObject, preppedEvent, auraApplicationEvent){
    let pubTypeObject = bzaura.createStoreObjectForPublication(
        bzchart.getStore (storeObject,"defaultEventType"),
        bzchart.getStore (storeObject, "componentEvent"),
        bzchart.getStore (storeObject, "appEvents")
    );
    bzaura.publishPreppedEventBase (pubTypeObject, preppedEvent, auraApplicationEvent);
}

function createStoreObjectForPublication (defaultEventType, componentEvent, appEvents){
    return {
        "defaultEventType" : defaultEventType ,
        "componentEvent" : componentEvent,
        "appEvents" : appEvents
    };
}

function publishPreppedEventBase (pubTypeObject, preppedEvent, auraApplicationEvent){
    console.log("publishPreppedEventBase: enter topic "+ preppedEvent.topic + " and eventType " + preppedEvent.eventType);
    if (preppedEvent != null) {
        var event;

        if (preppedEvent.eventType == null) {
            preppedEvent.eventType = pubTypeObject["defaultEventType"];
            console.log("publishPreppedEventBase: use default eventType: " + preppedEvent.eventType);
        }

        if (preppedEvent.eventType == "Component"){
            event = pubTypeObject["componentEvent"] ;
        }
        if (preppedEvent.eventType == "Application"){
            event = auraApplicationEvent;            
        }
        if (preppedEvent.eventType == "Cache"){
            var appEvents = pubTypeObject["appEvents"];
            event = appEvents.pop();
        } 
        bzutils.publishEventHelper(event, preppedEvent.topic, preppedEvent.parameters, preppedEvent.controllerId);     
    }
}

exports.publishPreppedEvent = publishPreppedEvent;
exports.createStoreObjectForPublication = createStoreObjectForPublication;
exports.publishPreppedEventBase = publishPreppedEventBase;


Object.defineProperty(exports, '__esModule', { value: true });

console.log("loaded: bzaura  IIFE");

})));

/* FRAMEWORK MIXINS */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.auraFrameworkMixin = global.auraFrameworkMixin || {})));
}(this, (function (exports) { 'use strict';

console.log("loading: auraFrameworkMixin IIFE");

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

console.log("loaded: auraFrameworkMixin  IIFE");


})));
