({
	searchHelper : function(component,event,getInputkeyWord) {
       
        $A.util.removeClass(component.find("mySpinner"), "slds-show");

        var datajsonFlat = component.get("v.datajsonFlat");
        console.log("datajsonFlat");
        console.log(datajsonFlat);
        
        var storeResponse = [];

        for (var i = 0; i < datajsonFlat.length; i++) { 
            if ( datajsonFlat[i].name.indexOf(getInputkeyWord) !== -1) {
                storeResponse.push(datajsonFlat[i]);
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

    flattenJson : function(component, topnode, datajsonFlat, datajsonSet, isTop) {
        var _this = this;

        if (isTop == true) {
            console.log("flattenJson enter - top");
        }

        if (!datajsonSet.has(topnode.id)) {
            datajsonFlat.push({"name":topnode.name,"id":topnode.id});
            datajsonSet.add(topnode.id);
        }

        if (topnode.children) {
            for (var i=0; i < topnode.children.length; i++ ) {
                _this.flattenJson(component, topnode.children[i], datajsonFlat, datajsonSet, false);
            }
        }

        if (isTop == true) {
            component.set("v.datajsonFlat", datajsonFlat);
            component.set("v.datajsonSet", datajsonSet);
            console.log("flattenJson exit - top");
        }
    },

})