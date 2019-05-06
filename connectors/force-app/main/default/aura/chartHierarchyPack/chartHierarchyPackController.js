({
    styleNodes: function(component,event,helper){
        let storeObject = component.get("v.storeObject");
        let variantsMixin = bzchart.getStore (storeObject, "chartMixin") ;

        console.log("aura:method styleNodes in chartHierarchyPack enter");

        let latestSizeOrColor = bzchart.getStore (storeObject, "latestSizeOrColor");

        let componentReference = bzchart.getStore (storeObject, "componentReference") ;  
        bzchart.clearElements(componentReference);

        let datajson = bzchart.getStore (storeObject, "datajson") ;  
        let datajsonRefresh = bzchart.getStore (storeObject, "datajson") ;  

        if (latestSizeOrColor == "size") {
            variantsMixin.dataPreprocess(storeObject, datajson, datajsonRefresh);
        }

        variantsMixin.initializeVisuals(storeObject);
    }
    
})
