({

    onInit: function(component, event, helper) {
        var masterConfig = component.get("v.masterConfig");
        if (typeof masterConfig === 'string' || masterConfig instanceof String) {
            console.log("masterConfig is a string: " + masterConfig);
            JSON.parse(masterConfig);
            console.log("masterConfig parsed to object");
            component.set("v.masterConfigObject", JSON.parse(masterConfig));
        }
        else {
            console.log("masterConfig is an object?");
            component.set("v.masterConfigObject", masterConfig);
        }
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
            // There are currently two formats for mouseover
            // a SIMPLE style (not currently linked to any real Apex implementation) and a FIELDS style (real implementations and the ultimate long-term format)

            var masterConfigObject = component.get("v.masterConfigObject");
            var objectIcons;

            if (masterConfigObject["panels"] != null) {
                console.log("panels: configured from master");
                objectIcons = masterConfigObject["panels"]["InfoPanel"]["objectIcons"];
            }
            else {
                objectIcons = {};  
            }

            var displayData = parameters["data"];

            var mouseoverMessageFormat = "SIMPLE";

            if (displayData.fields != null) {
                mouseoverMessageFormat = "FIELDS";
            }

            if (mouseoverMessageFormat == "SIMPLE")
            {
                console.log(mouseoverMessageFormat);
    
                // Hiding and showing fields on mouseover, whilst a nice idea, calls all the nodes to bounce
                // $A.util.removeClass(component.find("detailcardfields"), "slds-hide");

                var displayParent = parameters["parent"];

                var cardFieldsString = component.get("v.cardFields");

                console.log("cardFieldsString old style:" + cardFieldsString);
                console.log(displayData);

                var cardFields = JSON.parse(cardFieldsString);
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

            if (mouseoverMessageFormat == "FIELDS")
            {

                console.log(mouseoverMessageFormat);

                var extractedDisplayApiAndValues = helper.extractDisplayValues (displayData);

                var extractedApiNames = extractedDisplayApiAndValues[0]; // List of API names, not currently implemented
                var extractedDisplayValues = extractedDisplayApiAndValues[1];
    
                var objectType = displayData["objectType"];
                component.set("v.objectType", objectType);

                component.set("v.iconName", "standard:account");

                if (objectType != null && objectIcons[objectType] != null) {
                    component.set("v.iconName", objectIcons[objectType]);
                }
                else {
                    component.set("v.iconName", "standard:account");
                }
    
                component.set("v.recordId", helper.extractRecordRoleField(displayData, "id"));
                component.set("v.card1", helper.extractRecordRoleField(displayData, "name"));
                component.set("v.parsedCardFields", extractedDisplayValues);  
            }

        }

        if (topic == "ChartMouseOut")
        {
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
