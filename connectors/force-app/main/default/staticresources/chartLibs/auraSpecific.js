(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.bzaura = global.bzaura || {})));
}(this, (function (exports) { 'use strict';

console.log("loading: bzaura IIFE");


function publishPreppedEvent (storeObject, preppedEvent){
    if (preppedEvent != null) {
        var event;

        if (preppedEvent.eventType != null) {
            // go with provided eventType
        }
        else {
            // use the default eventType
//                preppedEvent.eventType = component.get("v.defaultEventType");
            preppedEvent.eventType = bzchart.getStore (storeObject,"defaultEventType");
        }

        if (preppedEvent.eventType == "Component"){
//                event = component.getEvent("evt_bzc");
            event = bzchart.getStore (storeObject, "componentEvent") ;
        }
        if (preppedEvent.eventType == "Application"){
            event = $A.get("e.c:evt_sfd3");
        }
        if (preppedEvent.eventType == "Cache"){
            var appEvents = bzchart.getStore (storeObject, "appEvents") ;
            event = appEvents.pop();
        } 
        bzutils.publishEventHelper(event, preppedEvent.topic, preppedEvent.parameters, preppedEvent.controllerId);     
    }
}

exports.publishPreppedEvent = publishPreppedEvent;


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
