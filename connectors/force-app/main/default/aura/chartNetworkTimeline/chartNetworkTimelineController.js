({
    refreshDataController: function(component,event,helper){
        bzutils.log("calling the aura:method refreshDataController in chartNetworkTimeline");
        let storeObject = component.get("v.storeObject");

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

        helper.refreshDataHelper(storeObject, datajson, primaryId, showFilters);                         
    }

})
