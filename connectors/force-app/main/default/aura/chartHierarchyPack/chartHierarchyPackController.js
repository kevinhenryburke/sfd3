({
    styleNodes: function(component,event,helper){
        let storeObject = component.get("v.storeObject");
        let variantsMixin = bzchart.getStore (storeObject, "chartMixin") ;
        variantsMixin.styleNodes(storeObject);
        console.log("aura:method styleNodes in chartHierarchyPack enter");
    }
    
})
