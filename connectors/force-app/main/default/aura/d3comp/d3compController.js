({
	
    afterScriptsLoaded: function(component, event, helper) {
		console.log('afterScriptsLoaded started v24');

        //TODO check this is right
        var width = Math.min(screen.width, screen.height);
        component.set("v.width", width);

        //TODO check this is right
        var height = Math.min(screen.width, screen.height);
        component.set("v.height", height);

        var svg1 = d3.select("body").append("svg")
            .attr("width", width)
            .attr("height", height);
        component.set("v.svg", svg1);

        var lastTouch1 = new Date().getTime();
        component.set("v.lastTouch", lastTouch1);

        var agent = navigator.userAgent.toLowerCase();
        if(agent.indexOf('iphone') >= 0 || agent.indexOf('ipad') >= 0){
               isiOS = true;
               component.set("v.isiOS", true);
               console.log("IOS environment");
        }
        else {
            console.log("non-IOS environment");
        }

        var action = component.get("c.returnData");

        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
				console.log('data returned from apex');

                helper.initializeData(component, response.getReturnValue());

                var datajson = component.get("v.datajson");
                var configjson = component.get("v.configjson");
                
                var arrayNames = configjson.filtertypes;
                var idprefix = "b";
                var maxbuttons = 5;
                
                helper.formatButtons (component, arrayNames, idprefix, maxbuttons);

                arrayNames = configjson.measures;
                idprefix = "v";
                maxbuttons = 5;

                helper.formatButtons (component, arrayNames, idprefix, maxbuttons);
                
            }
            else if (state === "ERROR") {
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        console.log("Error message: " + errors[0].message);
                    }
                } else {
                    console.log("Unknown error");
                }
            }
        });

        $A.enqueueAction(action);        
        console.log('afterScriptsLoaded finished');
    },

    
    handle_evt_ShowLevelsChange  : function(component, event, helper) {
        var direction = event.getParam("direction");
        console.log("direction: " + direction);
        if (direction == "Up")
        {
            helper.setConnectionLevelMore(component);
        }
        if (direction == "Down")
        {
            helper.setConnectionLevelLess(component);
        }
    },

    handleClickLevelMore : function(component, event, helper) {
        var appEvent = $A.get("e.c:evt_ShowLevelsChange");
        appEvent.setParams({
            "direction" : "Up"});
        appEvent.fire();
    },
 
    handleClickLevelLess : function(component, event, helper) {
        var appEvent = $A.get("e.c:evt_ShowLevelsChange");
        appEvent.setParams({
            "direction" : "Down"});
        appEvent.fire();
    },

    handleMeasureV1 : function(component, event, helper) {
        helper.setMeasure(component,1);
    },
    handleMeasureV2 : function(component, event, helper) {
        helper.setMeasure(component,2);
    },
    handleMeasureV3 : function(component, event, helper) {
        helper.setMeasure(component,3);
    },
    handleMeasureV4 : function(component, event, helper) {
        helper.setMeasure(component,4);
    },
    handleMeasureV5 : function(component, event, helper) {
        helper.setMeasure(component,5);
    },
    
    handleRelationshipTypeB1 : function(component, event, helper) {
		helper.setThisRelationshipType(component, 1);
    },
    handleRelationshipTypeB2 : function(component, event, helper) {
		helper.setThisRelationshipType(component, 2);
    },
    handleRelationshipTypeB3 : function(component, event, helper) {
		helper.setThisRelationshipType(component, 3);
    },
    handleRelationshipTypeB4 : function(component, event, helper) {
		helper.setThisRelationshipType(component, 4);
    },
    handleRelationshipTypeB5 : function(component, event, helper) {
		helper.setThisRelationshipType(component, 5);
    },

    navigateToRecord : function(component){
        var evtNav = $A.get("e.force:navigateToSObject");
        evtNav.setParams({
        "recordId": component.get("v.card4"),
        "slideDevName": "detail"
        });
        sObectEvent.fire(); 
     },

    
})