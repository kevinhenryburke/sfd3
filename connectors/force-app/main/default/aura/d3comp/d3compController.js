({
	
    afterScriptsLoaded: function(component, event, helper) {
		console.log('afterScriptsLoaded started v24');

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

                helper.init(component, response.getReturnValue());

                var datajson = component.get("v.datajson");
                
                var arrayNames = datajson.filtertypes;
                var idprefix = "b";
                var maxbuttons = 5;
                
                helper.formatButtons (component, arrayNames, idprefix, maxbuttons);

                arrayNames = datajson.measures;
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
    
    handleClickLevel1 : function(component, event, helper) {
		helper.setConnectionLevel(component, 1);
	},
    handleClickLevel2 : function(component, event, helper) {
		helper.setConnectionLevel(component, 2);
    },
    handleClickLevel3 : function(component, event, helper) {
		helper.setConnectionLevel(component, 3);
    },
    handleClickLevel4 : function(component, event, helper) {
		helper.setConnectionLevel(component, 4);
    },

    handleClickLevelLess : function(component, event, helper) {
		helper.setConnectionLevelLess(component);
    },
    handleClickLevelMore : function(component, event, helper) {
		helper.setConnectionLevelMore(component);
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
    
})