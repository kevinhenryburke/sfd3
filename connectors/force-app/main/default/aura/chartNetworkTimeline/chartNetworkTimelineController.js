({
    refreshDataController: function(component,event,helper){
        bzutils.log("calling the aura:method refreshDataController in chartNetworkTimeline");
        var args = event.getParam("arguments");
        var parameters = args.parameters;

        var datajson = parameters.datajson;
        var primaryId = parameters.primaryId;
        var showFilters = parameters.showFilters;

        // THIS ALL TEMPORARY FOR TIME-BASED CHARTS

        var valueDate = parameters["valueDate"];
        if (valueDate != null) {
            component.set("v.Title", parameters["valueDate"] );
        }

        helper.refreshDataHelper(component, datajson, primaryId, showFilters);                         
    },

    dataPreprocess: function(component,event,helper){
        console.log("calling the aura:method dataPreprocess in chartNetworkTimeline");

        var args = event.getParam("arguments");
        var datajsonBefore = args.datajson;
        var datajsonRefresh = args.datajsonRefresh;

        for (var i = 0; i < datajsonBefore.nodes.length; i++){
            var djnodeBefore = datajsonBefore.nodes[i];
            var fieldsBefore = djnodeBefore.fields;
            var djnodeAfter = datajsonRefresh.nodes[i];
            var fieldsAfter = djnodeAfter.fields;
            for (var j = 0; j < fieldsBefore.length; j++) {
                if ((fieldsBefore[j].fieldType == "CURRENCY" || fieldsBefore[j].fieldType == "DECIMAL" || fieldsBefore[j].fieldType == "DOUBLE") && fieldsBefore[j].retrievedValue != null) {
                    fieldsBefore[j].retrievedValue = fieldsAfter[j].retrievedValue;
                }
                if (fieldsBefore[j].fieldType == "INTEGER" && fieldsBefore[j].retrievedValue != null) {
                    fieldsBefore[j].retrievedValue = fieldsAfter[j].retrievedValue;
                }
            }
        }    
        helper.setStore (component, "datajson", datajsonBefore ) ;
    }

})
