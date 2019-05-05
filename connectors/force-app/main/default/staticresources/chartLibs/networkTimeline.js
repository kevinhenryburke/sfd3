(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.bznetworktimeline = global.bznetworktimeline || {})));
}(this, (function (exports) { 'use strict';

  console.log("loading: bznetworktimeline IIFE");


  Object.defineProperty(exports, '__esModule', { value: true });

  console.log("loaded: bznetworktimeline  IIFE");

})));

/* OVERRIDE MIXINS */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.chartNetworkTimelineMixin = global.chartNetworkTimelineMixin || {})));
}(this, (function (exports) { 'use strict';

console.log("loading: chartNetworkTimelineMixin IIFE");

const OverrideMixin = {
    dataPreprocess(storeObject, datajsonBefore, datajsonRefresh) {
        console.log("xxxxxx: mixin: dataPreprocess");
        for (var i = 0; i < datajsonBefore.nodes.length; i++){
            var djnodeBefore = datajsonBefore.nodes[i];
            var fieldsBefore = djnodeBefore.fields;
            var djnodeAfter = datajsonRefresh.nodes[i];
            var fieldsAfter = djnodeAfter.fields;
            for (var j = 0; j < fieldsBefore.length; j++) {
                if ((fieldsBefore[j].fieldType == "CURRENCY" || fieldsBefore[j].fieldType == "DECIMAL" || fieldsBefore[j].fieldType == "DOUBLE") && fieldsBefore[j].retrievedValue != null) {
                    fieldsBefore[j].retrievedValue = fieldsAfter[j].retrievedValue;
                }
                if (fieldsBefore[j].fieldType == "INTEGER" && fieldsBefore[j].retrievedValue != null) {
                    fieldsBefore[j].retrievedValue = fieldsAfter[j].retrievedValue;
                }
            }
        }    
        bzchart.setStore (storeObject, "datajson", datajsonBefore ) ;
    }
  
}

exports.OverrideMixin = OverrideMixin;

Object.defineProperty(exports, '__esModule', { value: true });

console.log("loaded: chartNetworkTimelineMixin IIFE");


})));

