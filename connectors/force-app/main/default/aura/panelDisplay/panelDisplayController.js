({

    onInit: function(component, event, helper) {
        console.log('panelDisplay: onInit enter');

        console.log('panelDisplay: onInit exit');
    },


    handle_evt_sfd3  : function(component, event, helper) {
        var _this = this;
        var topic = event.getParam("topic");
        console.log("topic: " + topic);

        var publisher = event.getParam("publisher");
        console.log("publisher: " + publisher);
        var publisherCategory = event.getParam("publisherCategory");
        var publisherType = event.getParam("publisherType");
        var UserComponentId = component.get("v.UserComponentId");
        var controller = event.getParam("controller");

        console.log("handling publisherCategory: " + publisherCategory + " from publisher " + publisher + " in " + UserComponentId);
                
        // if the event is propagated from a controller then we ignore it.
        if (publisherCategory == "Controller") {
            console.log("controller: ignoring message from " + publisher + " in component " + UserComponentId);
            return;
        }

        // if the component is named and the event propagated from a chart controlled by a controller with another name then we ignore it.
        // TODO this needs to be implemented properly
        // will need to add in a connection between this card and the display panel it relates to

        if (publisherCategory == "Display" && UserComponentId != null && UserComponentId != ""  && controller != null && controller != "") {
            if (UserComponentId != controller) {
                console.log("controller: ignoring message in " + UserComponentId + " intended for component " + controller);
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
