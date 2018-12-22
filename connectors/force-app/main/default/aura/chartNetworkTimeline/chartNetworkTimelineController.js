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
})
