({

    onfocus : function(component,event,helper){
        $A.util.addClass(component.find("mySpinner"), "slds-show");
        var forOpen = component.find("searchRes");
            $A.util.addClass(forOpen, 'slds-is-open');
            $A.util.removeClass(forOpen, 'slds-is-close');
        // Get Default 5 Records order by createdDate DESC  
        var getInputkeyWord = '';
        helper.searchListFilter(component,event,getInputkeyWord);
    },

    onblur : function(component,event,helper){       
        component.set("v.listOfSearchRecords", null );
        var forclose = component.find("searchRes");
        $A.util.addClass(forclose, 'slds-is-close');
        $A.util.removeClass(forclose, 'slds-is-open');
    },

    keyPressController : function(component, event, helper) {
        // get the search Input keyword   
        var getInputkeyWord = component.get("v.SearchKeyWord");
        // check if getInputKeyWord size id more then 0 then open the lookup result List and 
        // call the helper 
        // else close the lookup result List part.   
        if( getInputkeyWord.length > 0 ){
            var forOpen = component.find("searchRes");
            $A.util.addClass(forOpen, 'slds-is-open');
            $A.util.removeClass(forOpen, 'slds-is-close');
            helper.searchListFilter(component,event,getInputkeyWord);
        }
        else{  
            component.set("v.listOfSearchRecords", null ); 
            var forclose = component.find("searchRes");
            $A.util.addClass(forclose, 'slds-is-close');
            $A.util.removeClass(forclose, 'slds-is-open');
        }
    },
     
    // function to clear the Record Selaction 
    clear :function(component,event,heplper){
        var pillTarget = component.find("lookup-pill");
        var lookUpTarget = component.find("lookupField"); 
        
        $A.util.addClass(pillTarget, 'slds-hide');
        $A.util.removeClass(pillTarget, 'slds-show');
        
        $A.util.addClass(lookUpTarget, 'slds-show');
        $A.util.removeClass(lookUpTarget, 'slds-hide');
    
        component.set("v.SearchKeyWord",null);
        component.set("v.listOfSearchRecords", null );
        component.set("v.selectedRecord", {} );   
    },
    
    handleCustomEvent  : function(component, event, helper) {
        var topic, parameters, controller; 

        // if there is an arguments parameter this has been triggered by a method call
        // in which case we need to source our information from a level down in the event
        var argumentsParameter = event.getParam("arguments");

        if (argumentsParameter != null) {
            bzutils.log('customLookup: invoked from method');
            var tpc = argumentsParameter.tpc;
            topic = tpc.topic;
            parameters = tpc.parameters;
            controller = tpc.controller;
            // console.log('customLookup: handleCustomEvent enter from method, topic: ' + topic);
        }
        else {
            console.log('customLookup: invoked from event');
            topic = event.getParam("topic");
            parameters = event.getParam("parameters");
            controller = event.getParam("controller");    
            // console.log('customLookup: handleCustomEvent enter from event, topic: ' + topic);
        }

        var UserComponentId = component.get("v.parentUserComponentId");

        console.log("customLookup.handleCustomEvent: topic: " + topic + " component: " + UserComponentId);

        // If the event propagated from a component related to another controller then we ignore it.
        if (UserComponentId != controller) {
            console.log("customLookup.handleCustomEvent: controller: ignoring message in " + UserComponentId + " intended for component " + controller);
            return;
        }        


        if (topic == "InitializeData" || topic == "RefreshData")
        {
            var datajson = parameters["datajson"];
            var datajsonFlat = component.get("v.datajsonFlat") || [];
            var datajsonSet = component.get("v.datajsonSet") || new Set();

            helper.flattenJson(component, datajson,datajsonFlat, datajsonSet, true);
        }

        if (topic == "SearchRecordSelected")
        {
            // when a search item is selected we change styling related to the box
            console.log("process customLookup.SearchRecordSelected");
            helper.processSearchRecordSelected(component, event);
        }

    }
     

})