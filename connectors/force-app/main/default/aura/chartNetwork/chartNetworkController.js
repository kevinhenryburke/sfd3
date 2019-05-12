({

    refreshDataController: function(component,event,helper){
        bzutils.log("calling the aura:method refreshDataController in chartNetwork");
        let storeObject = component.get("v.storeObject");
        var args = event.getParam("arguments");
        var parameters = args.parameters;

        var datajson = parameters.datajson;
        var primaryId = parameters.primaryId;
        var showFilters = parameters.showFilters;

        bznetwork.refreshDataHelper(storeObject, datajson, primaryId, showFilters);                         
    }

})