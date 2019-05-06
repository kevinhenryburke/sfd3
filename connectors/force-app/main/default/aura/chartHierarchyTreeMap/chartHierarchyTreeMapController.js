({
    styleNodes: function(component,event,helper){
        console.log("aura:method styleNodes in chartHierarchyTreeMap enter");
        let storeObject = component.get("v.storeObject");
        let variantsMixin = bzchart.getStore (storeObject, "chartMixin") ;
        variantsMixin.initializeVisuals(storeObject);
    }
})
