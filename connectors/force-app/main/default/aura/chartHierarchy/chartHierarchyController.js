({

	initializeVisuals: function(component,event,helper){
        console.log("calling the aura:method initializeVisuals in subcomponent");
        // Delegates to helper
        // Note this is the way that we would pass parameters if there were any
        // var args = event.getParam("arguments");
        // var datajson = args.datajson;

        helper.initializeVisuals(component);                         
    },

    refreshData: function(component,event,helper){
        console.log("calling the aura:method refreshData in subcomponent");
        var args = event.getParam("arguments");

        var datajson = args.datajson;
        var currentMeasure = args.currentMeasure;
        var primaryId = args.primaryId; // primaryId can be used for highlight node at end of highlighted paths
        var showFilters = args.showFilters;

//        helper.refreshData(component, datajson, currentMeasure, primaryId, showFilters);                         

        var componentReference = component.get("v.componentReference");
        var nodeGroup = bzutils.getCache (componentReference, "nodeGroup") ;  
        var pathGroup = bzutils.getCache (componentReference, "pathGroup") ;  
        var root = bzutils.getCache (componentReference, "root") ;

        helper.update(nodeGroup, pathGroup, componentReference, root);

        helper.merge(componentReference, datajson);

        helper.update(nodeGroup, pathGroup, componentReference, root);

},
    

})