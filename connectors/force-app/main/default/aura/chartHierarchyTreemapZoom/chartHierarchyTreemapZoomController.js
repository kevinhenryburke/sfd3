({
    styleNodes: function(component,event,helper){
        console.log("aura:method styleNodes in chartHierarchyTreeMapZoom enter");
        let storeObject = component.get("v.storeObject");
        let variantsMixin = bzchart.getStore (storeObject, "chartMixin") ;
        variantsMixin.styleNodes(storeObject);
    }    

})
