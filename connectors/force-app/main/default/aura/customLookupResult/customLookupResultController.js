({
    selectRecord : function(component, event, helper){      
        // get the selected record from list  
        var getSelectRecord = component.get("v.oRecord");
        // call the event   
        var compEvent = component.getEvent("oSelectedRecordEvent");
        // set the Selected sObject Record to the event attribute.  
//        compEvent.setParams({"recordByEvent" : getSelectRecord });
        var parentUserComponentId = component.get("v.parentUserComponentId");  
        compEvent.setParams({"recordByEvent" : getSelectRecord, "parentUserComponentId" : parentUserComponentId }); 
        // fire the event  

        console.log("compEvent to fire");
        console.log(JSON.stringify(getSelectRecord));
        console.log(parentUserComponentId);

        compEvent.fire();
     },
 })
