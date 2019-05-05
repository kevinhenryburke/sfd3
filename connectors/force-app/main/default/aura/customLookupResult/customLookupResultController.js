({
    selectRecord : function(component, event, helper){      

        var parentUserComponentId = component.get("v.parentUserComponentId");  
        var selectedRecord = component.get("v.oRecord");

        var topic = "SearchRecordSelected";   
        var parameters = {"recordByEvent" : selectedRecord}; 
        var controller = parentUserComponentId; 

        var preppedEvent = helper.prepareEvent(topic, parameters, controller);

        let pubTypeObject = bzaura.createStoreObjectForPublication(
            component.get("v.defaultEventType"),
            component.getEvent("evt_bzc"),
            null
        );

        bzaura.publishPreppedEventBase (pubTypeObject, preppedEvent, $A.get("e.c:evt_sfd3"));

    },
 })
