({
    selectRecord : function(component, event, helper){      

        var parentUserComponentId = component.get("v.parentUserComponentId");  
        var selectedRecord = component.get("v.oRecord");

        var topic = "SearchRecordSelected";   
        var parameters = {"recordByEvent" : selectedRecord}; 
        var controller = parentUserComponentId; 

        var preppedEvent = helper.prepareEvent(topic, parameters, controller);
        helper.publishPreppedEvent(component,preppedEvent);

    },
 })
