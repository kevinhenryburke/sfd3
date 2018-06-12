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

        var updatejson = args.datajson;
        var currentMeasure = args.currentMeasure;
        var primaryId = args.primaryId; // primaryId can be used for highlight node at end of highlighted paths
        var showFilters = args.showFilters;

        var componentReference = component.get("v.componentReference");
        var nodeGroup = bzutils.getCache (componentReference, "nodeGroup") ;  
        var pathGroup = bzutils.getCache (componentReference, "pathGroup") ;  
        var root = bzutils.getCache (componentReference, "root") ;

        helper.merge(componentReference, updatejson);
        helper.update(nodeGroup, pathGroup, componentReference, root);

    },

    searchChart: function(component,event,helper){
        console.log("calling the aura:method searchChart in subcomponent");
        var args = event.getParam("arguments");

        var searchTermId = args.searchTermId;
        var searchAction = args.searchAction;

        var clearHighlightedPaths = component.get("v.clearHighlightedPaths");
        var componentReference = component.get("v.componentReference");
        var nodeGroup = bzutils.getCache (componentReference, "nodeGroup") ;  
        var pathGroup = bzutils.getCache (componentReference, "pathGroup") ;  
        var root = bzutils.getCache (componentReference, "root") ;

        if (searchAction == "HighlightOpenPath" || searchAction == "OpenPath" ) {
                helper.openPathsBy(componentReference, searchTermId, "Id");
                helper.update(nodeGroup, pathGroup, componentReference, root);
        }

        if (searchAction == "HighlightOpenPath" || searchAction == "HighlightPath" ) {
            var highlightedPaths = bzutils.getCache (componentReference, "highlightedPaths") ;
            if (highlightedPaths != null && clearHighlightedPaths == true) {
                helper.stylePathsStroke(highlightedPaths, false);
            }
            
            helper.highlightPathsBy(componentReference, searchTermId, "Id", true);
            helper.update(nodeGroup, pathGroup, componentReference, root);
        }

    },
    

})