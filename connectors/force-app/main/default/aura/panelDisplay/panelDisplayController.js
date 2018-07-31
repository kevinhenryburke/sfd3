({

    onInit: function(component, event, helper) {
        console.log('panelDisplay: onInit enter');

        console.log('panelDisplay: onInit exit');
    },


    handle_evt_sfd3  : function(component, event, helper) {
        var _this = this;
        var topic = event.getParam("topic");
        bzutils.log("topic: " + topic);

        var publisher = event.getParam("publisher");
        var publisherCategory = event.getParam("publisherCategory");
        var publisherType = event.getParam("publisherType");
        var RelatedControllerId = component.get("v.Controller");
        var controller = event.getParam("controller");

        // if the event is propagated from a controller then we ignore it as this displays cards for charts
        if (publisherCategory == "Controller") {
            bzutils.log("controller: ignoring message from " + publisher + " in component for controller " + RelatedControllerId);
            return;
        }

        // if the component is named and the event propagated from a chart controlled by a controller with another name then we ignore it.
        if (publisherCategory == "Display" && RelatedControllerId != null && RelatedControllerId != ""  && controller != null && controller != "") {
            if (RelatedControllerId != controller) {
                bzutils.log("controller: ignoring message for card related to " + RelatedControllerId + " intended for component " + controller);
                return;
            }
        }

        if (topic == "ChartMouseOver")
        {
            var parameters = event.getParam("parameters");

            var displayData = parameters["data"];
            var displayParent = parameters["parent"];

            var cardFields = JSON.parse(component.get("v.cardFields"));
            var objectIcons = JSON.parse(component.get("v.objectIcons"));
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
    },

    navigateToRecord : function(component){
        var evtNav = $A.get("e.force:navigateToSObject");
        evtNav.setParams({
            "recordId": component.get("v.recordId"),
            "slideDevName": "detail"
        });
        evtNav.fire(); 
     },

})
