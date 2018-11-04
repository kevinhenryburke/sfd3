({
    selectRecord : function(component, event, helper){      

        var parentUserComponentId = component.get("v.parentUserComponentId");  
        var selectedRecord = component.get("v.oRecord");

        var SearchRecordSelectedEvent = component.getEvent("evt_bzc");

        var topic = "SearchRecordSelected";   
        var parameters = {"recordByEvent" : selectedRecord}; 
        var controller = parentUserComponentId; 

        SearchRecordSelectedEvent.setParams({
            "topic" : topic,
            "parameters" : parameters,
            "controller" : controller
        });
        SearchRecordSelectedEvent.fire();    
    },
 })
