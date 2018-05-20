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

    abc: function(component,event,helper){
        console.log("calling the aura:method abc in subcomponent");
        var args = event.getParam("arguments");

        var datajson = args.datajson;
        var nodeGroup = args.nodeGroup;
        var pathGroup = args.pathGroup;
        var textGroup = args.textGroup;
        var pathToolTipDiv = args.pathToolTipDiv;
        var pathGroupId = args.pathGroupId;

        helper.abc(component, datajson, nodeGroup, pathGroup, textGroup, pathToolTipDiv, pathGroupId);                         
    },

    

})