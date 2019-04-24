({

    initializeVisuals: function(component,event,helper){
        console.log("calling the aura:method initializeVisuals in subcomponent");
        helper.areaInit(component);

        helper.initializeVisuals(component);                         
    },

    // dataPreprocess works by resetting datajson value in Cache
    dataPreprocess: function(component,event,helper){
        console.log("calling the aura:method dataPreprocess in chartHierarchyController");
        let storeObject = component.get("v.storeObject");
        let args = event.getParam("arguments");
        let datajson = args.datajson; 
        let groupingFields = bzchart.getStore (storeObject, "groupingFields");

        if (groupingFields.length > 0) {
            let groupingFields = bzchart.getStore (storeObject, "groupingFields");
            datajson = bzhierarchy.picklistNest(groupingFields, datajson);
            bzchart.setStore (storeObject, "datajson", datajson ) ;    
        }
    },

    refreshDataController: function(component,event,helper){
        console.log("calling the aura:method refreshDataController in subcomponent");
        let storeObject = component.get("v.storeObject");
        var args = event.getParam("arguments");
        var parameters = args.parameters;

        var updatejson = parameters.datajson;

        var componentReference = component.get("v.componentReference");
        var nodeGroup = bzchart.getStore (storeObject, "nodeGroup") ;  
        var pathGroup = bzchart.getStore (storeObject, "pathGroup") ;  
        var root = bzchart.getStore (storeObject, "root") ;

        helper.merge(component, updatejson);
        helper.update(component, nodeGroup, pathGroup, componentReference, root, false);

    },

    reScale: function(component,event,helper){
        console.log("reScale: enter");
        let storeObject = component.get("v.storeObject");
        var args = event.getParam("arguments");
        bzchart.setStore (storeObject, "ChartScaleFactor", args.ChartScaleFactor) ;

        var componentReference = component.get("v.componentReference");
        var nodeGroup = bzchart.getStore (storeObject, "nodeGroup") ;  
        var pathGroup = bzchart.getStore (storeObject, "pathGroup") ;  
        var root = bzchart.getStore (storeObject, "root") ;

        helper.update(component, nodeGroup, pathGroup, componentReference, root, false);

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

        var componentReference = component.get("v.componentReference");
        var nodeGroup = bzchart.getStore (storeObject, "nodeGroup") ;  
        var pathGroup = bzchart.getStore (storeObject, "pathGroup") ;  
        var root = bzchart.getStore (storeObject, "root") ;

        if (searchAction == "HighlightOpenPath" || searchAction == "OpenPath" ) {
                helper.openPathsBy(component, searchTermId, "Id");
                helper.update(component, nodeGroup, pathGroup, componentReference, root, false);
        }

        if (searchAction == "HighlightOpenPath" || searchAction == "HighlightPath" ) {
            var highlightedPaths = bzchart.getStore (storeObject, "highlightedPaths") ;
            if (highlightedPaths != null && clearHighlightedPaths == true) {
                helper.stylePathsStroke(highlightedPaths, false);
            }
            
            helper.highlightPathsBy(component, searchTermId, "Id", true);
            helper.update(component, nodeGroup, pathGroup, componentReference, root, false);
        }
    },

    refreshVisibility: function(component,event,helper){
        console.log("aura:method refreshVisibility in subcomponent enter");
        helper.refreshVisibilityHelper(component);
        console.log("aura:method refreshVisibility in subcomponent exit");
    },

    styleNodes: function(component,event,helper){
        console.log("aura:method styleNodes in chartHierarchy enter");
        let storeObject = component.get("v.storeObject");

        var componentReference = component.get("v.componentReference");
        var nodeGroup = bzchart.getStore (storeObject, "nodeGroup") ;  
        var pathGroup = bzchart.getStore (storeObject, "pathGroup") ;  
        var root = bzchart.getStore (storeObject, "root") ;

        helper.update(component, nodeGroup, pathGroup, componentReference, root, false);
        console.log("aura:method styleNodes in chartHierarchy exit");
    }

})