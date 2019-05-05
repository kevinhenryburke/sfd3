({
    styleNodes: function(component,event,helper){
        let storeObject = component.get("v.storeObject");

        console.log("aura:method styleNodes in chartHierarchyPack enter");

        let latestSizeOrColor = bzchart.getStore (storeObject, "latestSizeOrColor");

        let componentReference = bzchart.getStore (storeObject, "componentReference") ;  
        helper.clearElements(componentReference);

        let datajson = bzchart.getStore (storeObject, "datajson") ;  
        let datajsonRefresh = bzchart.getStore (storeObject, "datajson") ;  

        if (latestSizeOrColor == "size") {
            let variantsMixin = bzchart.getStore (storeObject, "chartMixin") ;
            variantsMixin.dataPreprocess(storeObject, datajson, datajsonRefresh);
        }

        helper.initializeVisuals(component);
    }
    
})
