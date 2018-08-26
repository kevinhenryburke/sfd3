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
    
    // This function is called when the User Selects any record from the result list in the Embedded List component   
    handleEmbeddedComponentEvent : function(component, event, helper) {
        // get the selected Account record from the COMPONETN event 	 
        var selectedAccountGetFromEvent = event.getParam("recordByEvent");

        // validate that we want to process this - i.e. it is for us?
        var parentUserComponentIdFromEvent = event.getParam("parentUserComponentId");
        var parentUserComponentId = component.get("v.parentUserComponentId");
        if (parentUserComponentId != parentUserComponentIdFromEvent) {
            console.log("customLookup: ignoring event: " + parentUserComponentId + "/" + parentUserComponentIdFromEvent);
        } 
        else {
            console.log("customLookup: event received");

            component.set("v.selectedRecord" , selectedAccountGetFromEvent); 
            
            var forclose = component.find("lookup-pill");
            $A.util.addClass(forclose, 'slds-show');
            $A.util.removeClass(forclose, 'slds-hide');

            var forclose = component.find("searchRes");
            $A.util.addClass(forclose, 'slds-is-close');
            $A.util.removeClass(forclose, 'slds-is-open');

            var lookUpTarget = component.find("lookupField");
            $A.util.addClass(lookUpTarget, 'slds-hide');
            $A.util.removeClass(lookUpTarget, 'slds-show'); 
        }

     },

     handle_evt_sfd3  : function(component, event, helper) {
        console.log('customLookup: handle_evt_sfd3 enter');

        var _this = this;
        var topic, parameters, controller; // TODO - for application events this needs to consider controller

        // if there is an arguments parameter this has been triggered by a method call
        // in which case we need to source our information from a level down in the event
        var argumentsParameter = event.getParam("arguments");

        if (argumentsParameter != null) {
            bzutils.log('controller: invoked from method');
            var tpc = argumentsParameter.tpc;
            topic = tpc.topic;
            parameters = tpc.parameters;
            controller = tpc.controller;
        }
        else {
            bzutils.log('chartArea: invoked from event');
            topic = event.getParam("topic");
            parameters = event.getParam("parameters");
            controller = event.getParam("controller");    
        }

        if (topic == "InitializeData" || topic == "RefreshData")
        {
            var datajson = parameters["datajson"];
            var datajsonFlat = component.get("v.datajsonFlat") || [];
            var datajsonSet = component.get("v.datajsonSet") || new Set();

            helper.flattenJson(component, datajson,datajsonFlat, datajsonSet, true);
        }

        console.log('customLookup: handle_evt_sfd3 exit');
    },
     

})