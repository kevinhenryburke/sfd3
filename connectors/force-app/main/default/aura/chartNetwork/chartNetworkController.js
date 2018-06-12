({

    initializeVisuals: function(component,event,helper){
        console.log("calling the aura:method initializeVisuals in subcomponent");
        // Delegates to helper
        // Note this is the way that we would pass parameters if there were any
        // var args = event.getParam("arguments");
        // var datajson = args.datajson;

        helper.initializeVisuals(component);                         
    },

    searchChart: function(component,event,helper){
        console.log("aura:method searchChart in subcomponent enter");
        var args = event.getParam("arguments");

        console.log("aura:method searchChart: args: " + JSON.stringify(args));
        
        var searchTermId = args.searchTermId;
        var searchAction = args.searchAction;
        var showLevels = args.showLevels;

        console.log("aura:method searchChart: showLevels: " + showLevels);
        
        var componentReference = component.get("v.componentReference");        
        var primaryNodeId = bzutils.addComponentRef(componentReference, searchTermId);
        bzutils.setCache (componentReference, "primaryNodeId", primaryNodeId ) ;
        bzutils.setCache (componentReference, "showLevels", showLevels) ;

        bzutils.xfcr("refreshVisibility", componentReference);
        bzutils.xfcr("styleNodes", componentReference); 
    

        // var datajson = bzutils.getCache(componentReference, "datajson");
        // var currentMeasure = bzutils.getCache(componentReference, "currentMeasure");
        // var primaryId = args.primaryId;
        // var showFilters = bzutils.getCache(componentReference, "showFilters");

        // helper.refreshData(component, datajson, currentMeasure, primaryId, showFilters);                         
        

        console.log("aura:method searchChart in subcomponent exit");
    }

})