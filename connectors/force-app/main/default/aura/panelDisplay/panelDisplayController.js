({

    onInit: function(component, event, helper) {
        var masterConfig = component.get("v.masterConfig");
        if (typeof masterConfig === 'string' || masterConfig instanceof String) {
            component.set("v.masterConfigObject", JSON.parse(masterConfig));
        }
        else {
            component.set("v.masterConfigObject", masterConfig);
        }
        component.set("v.displayData", {});

    },


    /* handleCustomEvent
    Logic for accepting messages:

    1. If it was created by a controller then reject, this is for responding to chart events
    2. If it is a separate component on an App Builder page we ensure that the message was created by a component 
    (potentially another chart) which has the same controller as this chart
    3. If the panel is embedded in a chart then check that the message was published by the self-same chart

    */

    handleCustomEvent  : function(component, event, helper) {
        // var topic, parameters, controller;

        // // if there is an arguments parameter this has been triggered by a method call
        // // in which case we need to source our information from a level down in the event
        // var argumentsParameter = event.getParam("arguments");

        // if (argumentsParameter != null) {
        //     bzutils.log('panelDisplay: controller: invoked from method');
        //     var tpc = argumentsParameter.tpc;
        //     topic = tpc.topic;
        //     parameters = tpc.parameters;
        //     controller = tpc.controller;
        //     // console.log('panelDisplay: handleCustomEvent enter from method, topic: ' + topic);
        // }
        // else {
        //     bzutils.log('panelDisplay: invoked from event');
        //     topic = event.getParam("topic");
        //     parameters = event.getParam("parameters");
        //     controller = event.getParam("controller");    
        //     // console.log('panelDisplay: handleCustomEvent enter from event, topic: ' + topic);
        // }

        // var RelatedControllerId = component.get("v.Controller");

        // var isHosted = component.get("v.isHosted");

        // // if the component is named and the event propagated from a chart controlled by a controller with another name then we ignore it.
        // if (isHosted == false && RelatedControllerId != controller) {
        //     bzutils.log("panelDisplay: controller: ignoring message for card related to " + RelatedControllerId + " intended for component " + controller);
        //     return;
        // }

        // if the component is hosted then we check that the incoming message was published by the same component that created the component
        // IF we want to reinstigate this functionality we will need to re-introduce a publisher parameters
        // if (isHosted == true) {
        //     bzutils.log("hosted clause: topic: " + topic + " received. layoutStyle: " + component.get("v.layoutStyle") + " hostUserControllerComponentId: " + component.get("v.hostUserControllerComponentId"));
        //     var hostComponentReference = component.get("v.hostComponentReference");
        //     if (hostComponentReference != controller) {
        //         bzutils.log("hosted: ignoring message for card created by " + hostComponentReference + " related to controller " + controller);
        //         return;
        //     } 
        //     else {
        //         bzutils.log("hosted: accepted message for card created by " + hostComponentReference + " related to controller " + controller);
        //     }
        // }

    },
   
    navigateToRecord : function(component){
        var evtNav = $A.get("e.force:navigateToSObject");
        evtNav.setParams({
            "recordId": component.get("v.recordId"),
            "slideDevName": "detail"
        });
        evtNav.fire(); 
     },

    handleClose : function(component, event, helper) {
        var appEvent = $A.get("e.c:evt_sfd3");
        appEvent.setParams({
            "topic" : "CloseDisplayPanel",
            "controller" : component.get("v.hostUserControllerComponentId"), // pass the host component name back for an embedded component 
        });
        appEvent.fire();

        // destroy this component
        component.destroy();
    },

    handleFade : function(component, event, helper) {
        var appEvent = $A.get("e.c:evt_sfd3");
        appEvent.setParams({
            "topic" : "FadeDisplayPanel",
            "controller" : component.get("v.hostUserControllerComponentId"), // pass the host component name back for an embedded component 
        });
        appEvent.fire();
    },

    handleExpandA : function(component, event, helper) {
        helper.sectionExpandCollapseMaster(component, "A");
    },

    handleExpandB : function(component, event, helper) {
        helper.sectionExpandCollapseMaster(component, "B");
    },

    handleExpandC : function(component, event, helper) {
        helper.sectionExpandCollapseMaster(component, "C");
    },

    handleShowModalView : function (component, event, helper) {
        var mode = "view";
        var layoutType = "Compact";
        helper.showModal(component, mode, layoutType);
    },

    handleShowModalEdit : function (component, event, helper) {
        var mode = "edit"; // "readonly" is alternative
        var layoutType = "Compact";
        helper.showModal(component, mode, layoutType);
    },

})
