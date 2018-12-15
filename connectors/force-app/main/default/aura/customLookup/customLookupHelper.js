({
	searchListFilter : function(component,event,getInputkeyWord) {
       
        $A.util.removeClass(component.find("mySpinner"), "slds-show");

        var datajsonFlat = component.get("v.datajsonFlat");
        
        var storeResponse = [];

        var inputKeywordLowerCase = getInputkeyWord.toLowerCase();

        for (var i = 0; i < datajsonFlat.length; i++) { 
            if ( datajsonFlat[i].name != null) {
                if ( datajsonFlat[i].name && datajsonFlat[i].name.toLowerCase().indexOf(inputKeywordLowerCase) !== -1) {
                    storeResponse.push(datajsonFlat[i]);
                }
            }
        } ;       

        if (storeResponse.length == 0) {
            component.set("v.Message", 'No Result Found...');
        } else {
            component.set("v.Message", '');
        }

        component.set("v.listOfSearchRecords", storeResponse);

/*
        // call the apex class method 
        // Add this component attribute

    <aura:attribute name="objectAPIName" type="string" default=""/>

    // And this controller code


     var action = component.get("c.fetchLookUpValues");
      // set param to method  
        action.setParams({
            'searchKeyWord': getInputkeyWord,
            'ObjectName' : component.get("v.objectAPIName")
          });
      // set a callBack    
        action.setCallback(this, function(response) {
          $A.util.removeClass(component.find("mySpinner"), "slds-show");
            var state = response.getState();
            if (state === "SUCCESS") {
                var storeResponse = response.getReturnValue();

                storeResponse = [{"Name":"s1","Id":"100000000000000004"},{"Name":"s2","Id":"000000000000000082"}];

                console.log("storeResponse");
                console.log(storeResponse);
              // if storeResponse size is equal 0 ,display No Result Found... message on screen.                }
                if (storeResponse.length == 0) {
                    component.set("v.Message", 'No Result Found...');
                } else {
                    component.set("v.Message", '');
                }
                // set searchResult list with return value from server.
                component.set("v.listOfSearchRecords", storeResponse);
            }
 
        });
      // enqueue the Action  
        $A.enqueueAction(action);
*/
    },


    /* This may need to change but at present it attempts to parse both hierarchy and node formats
    More control could be had by informing what the format to expect is of course */

    flattenJson : function(component, topnode, datajsonFlat, datajsonSet, isTop) {
        var _this = this;

        // this is intended to cope with updated nodes...
        if (Array.isArray(topnode) == true) {
            for (var i=0; i < topnode.length; i++ ) {
                _this.flattenJson(component, topnode[i], datajsonFlat, datajsonSet, false);
            }
        }

        if (!datajsonSet.has(topnode.id)) {
            datajsonFlat.push({"name":topnode.name,"id":topnode.id});
            datajsonSet.add(topnode.id);
        }

        // parse the hierarchy - using children node
        if (topnode.children) {
            for (var i=0; i < topnode.children.length; i++ ) {
                _this.flattenJson(component, topnode.children[i], datajsonFlat, datajsonSet, false);
            }
        }

        // parse the node structure - using nodes
        if (topnode.nodes) {
            for (var i=0; i < topnode.nodes.length; i++ ) {
                _this.flattenJson(component, topnode.nodes[i], datajsonFlat, datajsonSet, false);
            }
        }        

        // we've navigated the whole structure so set the outputs 
        if (isTop == true) {
            component.set("v.datajsonFlat", datajsonFlat);
            component.set("v.datajsonSet", datajsonSet);
        }
    },

    // This function is called when the User Selects any record from the result list in the Embedded List component   
    processSearchRecordSelected : function(component, parameters) {
        var selectedRecord = parameters["recordByEvent"];    
        component.set("v.selectedRecord" , selectedRecord); 

        var lookupPill = component.find("lookup-pill");
        $A.util.addClass(lookupPill, 'slds-show');
        $A.util.removeClass(lookupPill, 'slds-hide');

        var searchResults = component.find("searchRes");
        $A.util.addClass(searchResults, 'slds-is-close');
        $A.util.removeClass(searchResults, 'slds-is-open');

        var lookUpTarget = component.find("lookupField");
        $A.util.addClass(lookUpTarget, 'slds-hide');
        $A.util.removeClass(lookUpTarget, 'slds-show'); 
    }

})