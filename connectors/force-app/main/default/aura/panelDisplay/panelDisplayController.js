({

    onInit: function(component, event, helper) {
        console.log('panelDisplay: onInit enter');

        console.log('panelDisplay: onInit exit');
    },


    /* handle_evt_sfd3
    Logic for accepting messages:

    1. If it was created by a controller then reject, this is for responding to chart events
    2. If it is a separate component on an App Builder page we ensure that the message was created by a component 
    (potentially another chart) which has the same controller as this chart
    3. If the panel is embedded in a chart then check that the message was published by the self-same chart

    */

    handle_evt_sfd3  : function(component, event, helper) {
        var _this = this;
        var topic = event.getParam("topic");

        var publisher = event.getParam("publisher");
        var publisherCategory = event.getParam("publisherCategory");
        var publisherType = event.getParam("publisherType");
        var RelatedControllerId = component.get("v.Controller");
        var controller = event.getParam("controller");

        var isHosted = component.get("v.isHosted");


        // if the event is propagated from a controller then we ignore it as this displays cards for charts
        if (publisherCategory == "Controller") {
            bzutils.log("controller: ignoring message from " + publisher + " in component for controller " + RelatedControllerId);
            return;
        }

        // if the component is named and the event propagated from a chart controlled by a controller with another name then we ignore it.
        if (isHosted == false && publisherCategory == "Display" && RelatedControllerId != null && RelatedControllerId != ""  && controller != null && controller != "") {
            if (RelatedControllerId != controller) {
                bzutils.log("controller: ignoring message for card related to " + RelatedControllerId + " intended for component " + controller);
                return;
            }
        }

        // if the component is hosted then we check that the incoming message was published by the same component that created the component
        if (isHosted == true) {
            bzutils.log("hosted clause: topic: " + topic + " received from publisher: " + publisher + " layoutStyle: " + component.get("v.layoutStyle") + " hostUserControllerComponentId: " + component.get("v.hostUserControllerComponentId"));
            var hostComponentReference = component.get("v.hostComponentReference");
            if (hostComponentReference != publisher) {
                bzutils.log("hosted: ignoring message for card created by " + hostComponentReference + " published by " + publisher);
                return;
            } 
            else {
                bzutils.log("hosted: accepted message for card created by " + hostComponentReference + " published by " + publisher);
            }
        }

        if (topic == "ChartMouseOver")
        {

            // Hiding and showing fields on mouseover, whilst a nice idea, calls all the nodes to bounce
            // $A.util.removeClass(component.find("detailcardfields"), "slds-hide");
            var parameters = event.getParam("parameters");

            var displayData = parameters["data"];
            var displayParent = parameters["parent"];

            var cardFieldsString = component.get("v.cardFields");
            var objectIconsString = component.get("v.objectIcons");

            console.log("cardFieldsString:" + cardFieldsString);

            var cardFields = JSON.parse(cardFieldsString);
            var objectIcons = JSON.parse(objectIconsString);
            // set a default display fields list
            var cardFieldsArray = ["data.name", "data.size", "parent.name"];

            // check if there is an objectType specific display fields list and icons list
            if (cardFields[displayData["objectType"]] != null) {
                var objectType = displayData["objectType"];
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

            component.set("v.recordId", bzutils.parseCardParam(displayData, displayParent, "data.id" ));

            component.set("v.card1", bzutils.parseCardParam(displayData, displayParent, cardFieldsArray[0] ));  
            component.set("v.card2", bzutils.parseCardParam(displayData, displayParent, cardFieldsArray[1] ));  
            component.set("v.card3", bzutils.parseCardParam(displayData, displayParent, cardFieldsArray[2] ));  
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
            "publisher" : component.get("v.hostUserControllerComponentId"), // pass the host component name back for an embedded component 
        });
        appEvent.fire();
    
        // destroy this component
        component.destroy();

        console.log("handleClose: exit");
     },

})
