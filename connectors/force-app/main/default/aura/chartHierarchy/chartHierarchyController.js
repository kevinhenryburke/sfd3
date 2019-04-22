({

    initializeVisuals: function(component,event,helper){
        console.log("calling the aura:method initializeVisuals in subcomponent");
        helper.areaInit(component);

        helper.initializeVisuals(component);                         
    },

    // dataPreprocess works by resetting datajson value in Cache
    dataPreprocess: function(component,event,helper){
        console.log("calling the aura:method dataPreprocess in chartHierarchyController");
        let args = event.getParam("arguments");
        let datajson = args.datajson; 
        let groupingFields = helper.getStore(component, "groupingFields");

        if (groupingFields.length > 0) {
            let groupingFields = helper.getStore(component, "groupingFields");
            datajson = bzhierarchy.picklistNest(groupingFields, datajson);
            helper.setStore (component, "datajson", datajson ) ;    
        }
    },

    refreshDataController: function(component,event,helper){
        console.log("calling the aura:method refreshDataController in subcomponent");
        var args = event.getParam("arguments");
        var parameters = args.parameters;

        var updatejson = parameters.datajson;

        var componentReference = component.get("v.componentReference");
        var nodeGroup = helper.getStore (component, "nodeGroup") ;  
        var pathGroup = helper.getStore (component, "pathGroup") ;  
        var root = helper.getStore (component, "root") ;

        helper.merge(component, updatejson);
        helper.update(component, nodeGroup, pathGroup, componentReference, root, false);

    },

    reScale: function(component,event,helper){
        console.log("reScale: enter");
        var args = event.getParam("arguments");
        console.log("reScale: ChartScaleFactor: " + args.ChartScaleFactor);
        component.set("v.ChartScaleFactor", args.ChartScaleFactor);

        var componentReference = component.get("v.componentReference");
        var nodeGroup = helper.getStore (component, "nodeGroup") ;  
        var pathGroup = helper.getStore (component, "pathGroup") ;  
        var root = helper.getStore (component, "root") ;

        helper.update(component, nodeGroup, pathGroup, componentReference, root, false);

        console.log("reScale: exit");
    },
        

    searchChart: function(component,event,helper){
        console.log("calling the aura:method searchChart in subcomponent");
        var args = event.getParam("arguments");
        let masterConfigObject = component.get("v.masterConfigObject");

        var searchTermId = args.searchTermId;
        var searchAction = args.searchAction;

        var clearHighlightedPaths = bzutils.getMasterParam(masterConfigObject,"panels","ChartPanel","Hierarchy","clearHighlightedPaths");         

        var componentReference = component.get("v.componentReference");
        var nodeGroup = helper.getStore (component, "nodeGroup") ;  
        var pathGroup = helper.getStore (component, "pathGroup") ;  
        var root = helper.getStore (component, "root") ;

        if (searchAction == "HighlightOpenPath" || searchAction == "OpenPath" ) {
                helper.openPathsBy(component, searchTermId, "Id");
                helper.update(component, nodeGroup, pathGroup, componentReference, root, false);
        }

        if (searchAction == "HighlightOpenPath" || searchAction == "HighlightPath" ) {
            var highlightedPaths = helper.getStore (component, "highlightedPaths") ;
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

        let componentType = component.get("v.componentType");

        var args = event.getParam("arguments");

        var componentReference = component.get("v.componentReference");
        var nodeGroup = helper.getStore (component, "nodeGroup") ;  
        var pathGroup = helper.getStore (component, "pathGroup") ;  
        var root = helper.getStore (component, "root") ;

        helper.update(component, nodeGroup, pathGroup, componentReference, root, false);
        console.log("aura:method styleNodes in chartHierarchy exit");
    }

})