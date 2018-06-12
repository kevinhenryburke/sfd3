({
    selectRecord : function(component, event, helper){      
        // call the event   
        var compEvent = component.getEvent("oSelectedRecordEvent");

        var parentUserComponentId = component.get("v.parentUserComponentId");  
        // get the selected record from list  
        var getSelectRecord = component.get("v.oRecord");

        compEvent.setParams({"recordByEvent" : getSelectRecord, "parentUserComponentId" : parentUserComponentId }); 
        // fire the event  
        compEvent.fire();
     },
 })
