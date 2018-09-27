({

    initializeVisuals: function(component,event,helper){
        console.log("calling the aura:method initializeVisuals in subcomponent");
        helper.areaInit(component);

        helper.initializeVisuals(component);                         
    },

    dataPreprocess: function(component,event,helper){
        console.log("calling the aura:method dataPreprocess in subcomponent");
    },

    refreshData: function(component,event,helper){
        console.log("calling the aura:method refreshData in subcomponent");
        var args = event.getParam("arguments");

        var updatejson = args.datajson;
        var currentMeasure = args.currentMeasure;
        var primaryId = args.primaryId; // primaryId can be used for highlight node at end of highlighted paths
        var showFilters = args.showFilters;

        var componentReference = component.get("v.componentReference");
        var nodeGroup = helper.getCache (component, "nodeGroup") ;  
        var pathGroup = helper.getCache (component, "pathGroup") ;  
        var root = helper.getCache (component, "root") ;

        helper.merge(component, updatejson);
        helper.update(component, nodeGroup, pathGroup, componentReference, root, false);

    },

    reScale: function(component,event,helper){
        console.log("reScale: enter");
        var args = event.getParam("arguments");
        console.log("reScale: ChartScaleFactor: " + args.ChartScaleFactor);
        component.set("v.ChartScaleFactor", args.ChartScaleFactor);

        var componentReference = component.get("v.componentReference");
        var nodeGroup = helper.getCache (component, "nodeGroup") ;  
        var pathGroup = helper.getCache (component, "pathGroup") ;  
        var root = helper.getCache (component, "root") ;

        helper.update(component, nodeGroup, pathGroup, componentReference, root, false);

        console.log("reScale: exit");
    },
        

    searchChart: function(component,event,helper){
        console.log("calling the aura:method searchChart in subcomponent");
        var args = event.getParam("arguments");

        var searchTermId = args.searchTermId;
        var searchAction = args.searchAction;

        var clearHighlightedPaths = component.get("v.clearHighlightedPaths");
        var componentReference = component.get("v.componentReference");
        var nodeGroup = helper.getCache (component, "nodeGroup") ;  
        var pathGroup = helper.getCache (component, "pathGroup") ;  
        var root = helper.getCache (component, "root") ;

        if (searchAction == "HighlightOpenPath" || searchAction == "OpenPath" ) {
                helper.openPathsBy(component, searchTermId, "Id");
                helper.update(component, nodeGroup, pathGroup, componentReference, root, false);
        }

        if (searchAction == "HighlightOpenPath" || searchAction == "HighlightPath" ) {
            var highlightedPaths = helper.getCache (component, "highlightedPaths") ;
            if (highlightedPaths != null && clearHighlightedPaths == true) {
                helper.stylePathsStroke(highlightedPaths, false);
            }
            
            helper.highlightPathsBy(component, searchTermId, "Id", true);
            helper.update(component, nodeGroup, pathGroup, componentReference, root, false);
        }
    },

    refreshVisibility: function(component,event,helper){
        console.log("aura:method refreshVisibility in subcomponent enter");
        console.log("aura:method refreshVisibility in subcomponent exit");
    },

    styleNodes: function(component,event,helper){
        console.log("aura:method styleNodes in chartArea enter");
        console.log("aura:method styleNodes in chartArea exit");
    }

})