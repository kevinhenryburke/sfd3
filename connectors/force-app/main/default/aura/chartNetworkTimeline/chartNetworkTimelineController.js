({
    refreshData: function(component,event,helper){
        bzutils.log("calling the aura:method refreshData in chartNetworkTimeline");
        var args = event.getParam("arguments");

        var datajson = args.datajson;
        var currentMeasure = args.currentMeasure;
        var currentMeasureScheme = args.currentMeasureScheme;
        var primaryId = args.primaryId;
        var showFilters = args.showFilters;

        helper.setStore(cc, "currentMeasure", currentMeasure);
        helper.setStore(cc, "currentMeasureScheme", currentMeasureScheme);

        helper.refreshDataHelper(component, datajson, primaryId, showFilters);                         
    },
})
