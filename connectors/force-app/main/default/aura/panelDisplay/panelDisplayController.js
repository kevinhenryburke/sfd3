({

    onInit: function(component, event, helper) {
        console.log('panelDisplay: onInit enter');
    },


    /* handle_evt_sfd3
    Logic for accepting messages:

    1. If it was created by a controller then reject, this is for responding to chart events
    2. If it is a separate component on an App Builder page we ensure that the message was created by a component 
    (potentially another chart) which has the same controller as this chart
    3. If the panel is embedded in a chart then check that the message was published by the self-same chart

    */

    handle_evt_sfd3  : function(component, event, helper) {
        var topic, parameters, controller;

        // if there is an arguments parameter this has been triggered by a method call
        // in which case we need to source our information from a level down in the event
        var argumentsParameter = event.getParam("arguments");

        if (argumentsParameter != null) {
            bzutils.log('panelDisplay: controller: invoked from method');
            var tpc = argumentsParameter.tpc;
            topic = tpc.topic;
            parameters = tpc.parameters;
            controller = tpc.controller;
        }
        else {
            bzutils.log('panelDisplay: invoked from event');
            topic = event.getParam("topic");
            parameters = event.getParam("parameters");
            controller = event.getParam("controller");    
        }

        var RelatedControllerId = component.get("v.Controller");

        var isHosted = component.get("v.isHosted");

        // if the component is named and the event propagated from a chart controlled by a controller with another name then we ignore it.
        if (isHosted == false && RelatedControllerId != controller) {
            bzutils.log("panelDisplay: controller: ignoring message for card related to " + RelatedControllerId + " intended for component " + controller);
            return;
        }

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

        if (topic == "ChartMouseOver")
        {

            var displayData = parameters["data"];

            // TODO - this needs to be refactored
            // newStyleREFACTOR is just a switch between the old and new ways of passing display fields
            // fields

            var newStyleREFACTOR = false;

            if (displayData.fields != null) {
                newStyleREFACTOR = true;
            }

            if (newStyleREFACTOR == false)
            {
    
                // Hiding and showing fields on mouseover, whilst a nice idea, calls all the nodes to bounce
                // $A.util.removeClass(component.find("detailcardfields"), "slds-hide");

                var displayParent = parameters["parent"];

                var cardFieldsString = component.get("v.cardFields");
                var objectIconsString = component.get("v.objectIcons");

                console.log("cardFieldsString old style:" + cardFieldsString);
                console.log(displayData);

                var cardFields = JSON.parse(cardFieldsString);
                var objectIcons = JSON.parse(objectIconsString);
                // set a default display fields list
                var cardFieldsArray; // = ["data.name", "data.size", "parent.name"];

                // check if there is an objectType specific display fields list and icons list
                if (cardFields[displayData["objectType"]] != null) {
                    var objectType = displayData["objectType"];
                    component.set("v.objectType", objectType);
                    cardFieldsArray = cardFields[objectType];

                    component.set("v.iconName", "standard:account");

                    if (objectType != null && objectIcons[objectType] != null) {
                        component.set("v.iconName", objectIcons[objectType]);
                    }
                    else {
                        component.set("v.iconName", "standard:account");
                    }
                }
                else {
                    if (cardFields["default"] != null) {
                        cardFieldsArray = cardFields["default"];
                    }
                }

                console.log("parseCardParam:");
                component.set("v.recordId", helper.parseCardParam(displayData, displayParent, "data.id" ));

                var parsedCardFields = [];
                for(var i=0;i<cardFieldsArray.length;i++){

                    var string = cardFieldsArray[i];
                    var substring = "data.name";
                    string.includes(substring);                
                    if (string.includes(substring)) {
                        // data.name comes first and will also have a link to the record
                        component.set("v.card1", helper.parseCardParam(displayData, displayParent, cardFieldsArray[i] ));  
                    }
                    else {
                        parsedCardFields.push(helper.parseCardParam(displayData, displayParent, cardFieldsArray[i]));
                    }
                }
                component.set("v.parsedCardFields", parsedCardFields);  
            }
            if (newStyleREFACTOR == true)
            {

                var extractedDisplayValues = helper.extractDisplayValues (displayData);
    
                var cardFieldsString = component.get("v.cardFields");
                var objectIconsString = component.get("v.objectIcons");
    
                console.log("cardFieldsString new style:" + cardFieldsString);
                console.log(JSON.stringify(displayData));
    
                var cardFields = JSON.parse(cardFieldsString);
                var objectIcons = JSON.parse(objectIconsString);
                // set a default display fields list
                var cardFieldsArray; // = ["data.name", "data.size", "parent.name"];
    
                // check if there is an objectType specific display fields list and icons list
                if (cardFields[displayData["objectType"]] != null) {
                    var objectType = displayData["objectType"];
                    component.set("v.objectType", objectType);
                    cardFieldsArray = cardFields[objectType];
    
                    component.set("v.iconName", "standard:account");
    
                    if (objectType != null && objectIcons[objectType] != null) {
                        component.set("v.iconName", objectIcons[objectType]);
                    }
                    else {
                        component.set("v.iconName", "standard:account");
                    }
                }
                else {
                    if (cardFields["default"] != null) {
                        cardFieldsArray = cardFields["default"];
                    }
                }
    
                component.set("v.recordId", helper.extractRecordRoleField(displayData, "id"));
                component.set("v.card1", helper.extractRecordRoleField(displayData, "name"));
    
                console.log(extractedDisplayValues);
                component.set("v.parsedCardFields", extractedDisplayValues);  
    
    
            }

        }

        if (topic == "ChartMouseOut")
        {
            bzutils.log("panelDisplay: ChartMouseOut");
            // Hiding fields, whilst a nice idea, calls all the nodes to bounce
            // setTimeout(function(){ 
            //     console.log("details: hide " );
            //     $A.util.addClass(component.find("detailcardfields"), "slds-hide");
            // }, 3000);

        }
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
        console.log("handleClose: enter");
        var appEvent = $A.get("e.c:evt_sfd3");
        appEvent.setParams({
            "topic" : "CloseDisplayPanel",
            "controller" : component.get("v.hostUserControllerComponentId"), // pass the host component name back for an embedded component 
        });
        appEvent.fire();

        // destroy this component
        component.destroy();
    },

    handleExpandA : function(component, event, helper) {
        console.log("handleExpandA: enter");
        helper.sectionExpandCollapseMaster(component, "A");
    },

    handleExpandB : function(component, event, helper) {
        console.log("handleExpandB: enter");
        helper.sectionExpandCollapseMaster(component, "B");
    },

    handleExpandC : function(component, event, helper) {
        console.log("handleExpandC: enter");
        helper.sectionExpandCollapseMaster(component, "C");
    },

    handleShowModalView : function (component, event, helper) {
        var mode = "view";
        var layoutType = "Compact";
        helper.showModal(component, mode, layoutType);
    },

    // handleShowModalReadOnly : function (component, event, helper) {
    //     var mode = "readonly";
    //     var layoutType = "Compact";
    //     helper.showModal(component, mode, layoutType);
    // },

    handleShowModalEdit : function (component, event, helper) {
        var mode = "edit";
        var layoutType = "Compact";
        helper.showModal(component, mode, layoutType);
    },

})
