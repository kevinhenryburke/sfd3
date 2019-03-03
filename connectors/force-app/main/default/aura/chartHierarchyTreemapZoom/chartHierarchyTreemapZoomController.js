({
    styleNodes: function(component,event,helper){
        console.log("aura:method styleNodes in chartHierarchyTreeMapZoom enter");
        var componentReference = component.get("v.componentReference");
        helper.clearElements(componentReference);

        helper.initializeVisuals(component);
    },

    getDefaultSize: function(component,event,helper){
        // console.log("aura:method getDefaultSize in chartHierarchyTreeMapZoom enter");
        // console.log("aura:method getDefaultSize in chartHierarchyTreeMapZoom exit");
        return 10;
    },

    getDefaultColor: function(component,event,helper){
        // console.log("aura:method getDefaultColor in chartHierarchyTreeMapZoom enter");
        // console.log("aura:method getDefaultColor in chartHierarchyTreeMapZoom exit");
        return "lightsteelblue";
    },    

})
