({
    selectRecord : function(component, event, helper){      

        var getSelectRecord = component.get("v.oRecord");

        var SearchRecordSelectedEvent = component.getEvent("evt_bzc");

        var topic = "SearchRecordSelected";   
        var parameters = {"recordByEvent" : getSelectRecord}; 
        var controller = parentUserComponentId; 

        SearchRecordSelectedEvent.setParams({
            "topic" : topic,
            "parameters" : parameters,
            "controller" : controller
        });
        SearchRecordSelectedEvent.fire();    

        console.log("SearchRecordSelected fired");

    },
 })
