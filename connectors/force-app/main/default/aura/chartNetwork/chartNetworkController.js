({

    initializeData: function(component,event,helper){
        console.log("calling the aura:method in subcomponent");
        var args = event.getParam("arguments");

        var datajson = args.datajson;
        var currentMeasure = args.currentMeasure;
        var primaryId = args.primaryId;
        var showFilters = args.showFilters;
        var isInit = args.isInit;

        helper.initializeData(component, datajson, currentMeasure, primaryId, showFilters, isInit);                 
    },


})