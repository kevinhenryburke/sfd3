({
    styleNodes: function(component,event,helper){
        console.log("aura:method styleNodes in chartHierarchyTreeMapZoom enter");
        var componentReference = component.get("v.componentReference");
        helper.clearElements(componentReference);

        helper.initializeVisuals(component);
    }    

})
