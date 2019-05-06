({

    initializeVisuals: function(component,event,helper){
        console.log("calling the aura:method initializeVisuals in subcomponent");
        helper.initializeVisuals(component);                         
    },

    refreshDataController: function(component,event,helper){
        console.log("calling the aura:method refreshDataController in subcomponent");
        let storeObject = component.get("v.storeObject");
        let args = event.getParam("arguments");
        let parameters = args.parameters;

        let updatejson = parameters.datajson;

        let nodeGroup = bzchart.getStore (storeObject, "nodeGroup") ;  
        let pathGroup = bzchart.getStore (storeObject, "pathGroup") ;  
        let root = bzchart.getStore (storeObject, "root") ;

        bzctree.merge(storeObject, updatejson);
        bzctree.update(storeObject, nodeGroup, pathGroup, root, false);
    },

    searchChart: function(component,event,helper){
        console.log("calling the aura:method searchChart in subcomponent");
        var args = event.getParam("arguments");
        let masterConfigObject = component.get("v.masterConfigObject");
        let storeObject = component.get("v.storeObject");

        var searchTermId = args.searchTermId;
        var searchAction = args.searchAction;

        var clearHighlightedPaths = bzutils.getMasterParam(masterConfigObject,"panels","ChartPanel","Hierarchy","clearHighlightedPaths");         

        var nodeGroup = bzchart.getStore (storeObject, "nodeGroup") ;  
        var pathGroup = bzchart.getStore (storeObject, "pathGroup") ;  
        var root = bzchart.getStore (storeObject, "root") ;

        if (searchAction == "HighlightOpenPath" || searchAction == "OpenPath" ) {
            bzctree.openPathsBy(storeObject, searchTermId, "Id");
            bzctree.update(storeObject, nodeGroup, pathGroup, root, false);
        }

        if (searchAction == "HighlightOpenPath" || searchAction == "HighlightPath" ) {
            var highlightedPaths = bzchart.getStore (storeObject, "highlightedPaths") ;
            if (highlightedPaths != null && clearHighlightedPaths == true) {
                bzctree.stylePathsStroke(highlightedPaths, false);
            }
            
            bzctree.highlightPathsBy(storeObject, searchTermId, "Id", true);
            bzctree.update(storeObject, nodeGroup, pathGroup, root, false);
        }
    },

    styleNodes: function(component,event,helper){
        console.log("aura:method styleNodes in chartHierarchy enter");
        let storeObject = component.get("v.storeObject");

        var nodeGroup = bzchart.getStore (storeObject, "nodeGroup") ;  
        var pathGroup = bzchart.getStore (storeObject, "pathGroup") ;  
        var root = bzchart.getStore (storeObject, "root") ;

        bzctree.update(storeObject, nodeGroup, pathGroup, root, false);
        console.log("aura:method styleNodes in chartHierarchy exit");
    }

})