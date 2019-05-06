({

    initializeVisuals: function(component,event,helper){
        console.log("calling the aura:method initializeVisuals in subcomponent");
        helper.areaInit(component);
        helper.initializeVisuals(component);                         
    },

    refreshDataController: function(component,event,helper){
        console.log("calling the aura:method refreshDataController in subcomponent");
        let storeObject = component.get("v.storeObject");
        var args = event.getParam("arguments");
        var parameters = args.parameters;

        var updatejson = parameters.datajson;

        var nodeGroup = bzchart.getStore (storeObject, "nodeGroup") ;  
        var pathGroup = bzchart.getStore (storeObject, "pathGroup") ;  
        var root = bzchart.getStore (storeObject, "root") ;

        bzhierarchy.merge(storeObject, updatejson);
        bzhierarchy.update(storeObject, nodeGroup, pathGroup, root, false);

    },

    reScale: function(component,event,helper){
        console.log("reScale: enter");
        let storeObject = component.get("v.storeObject");
        var args = event.getParam("arguments");
        bzchart.setStore (storeObject, "ChartScaleFactor", args.ChartScaleFactor) ;

        var nodeGroup = bzchart.getStore (storeObject, "nodeGroup") ;  
        var pathGroup = bzchart.getStore (storeObject, "pathGroup") ;  
        var root = bzchart.getStore (storeObject, "root") ;

        bzhierarchy.update(storeObject, nodeGroup, pathGroup, root, false);

        console.log("reScale: exit");
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
            bzhierarchy.update(storeObject, nodeGroup, pathGroup, root, false);
        }

        if (searchAction == "HighlightOpenPath" || searchAction == "HighlightPath" ) {
            var highlightedPaths = bzchart.getStore (storeObject, "highlightedPaths") ;
            if (highlightedPaths != null && clearHighlightedPaths == true) {
                bzctree.stylePathsStroke(highlightedPaths, false);
            }
            
            bzctree.highlightPathsBy(storeObject, searchTermId, "Id", true);
            bzhierarchy.update(storeObject, nodeGroup, pathGroup, root, false);
        }
    },

    styleNodes: function(component,event,helper){
        console.log("aura:method styleNodes in chartHierarchy enter");
        let storeObject = component.get("v.storeObject");

        var nodeGroup = bzchart.getStore (storeObject, "nodeGroup") ;  
        var pathGroup = bzchart.getStore (storeObject, "pathGroup") ;  
        var root = bzchart.getStore (storeObject, "root") ;

        bzhierarchy.update(storeObject, nodeGroup, pathGroup, root, false);
        console.log("aura:method styleNodes in chartHierarchy exit");
    }

})