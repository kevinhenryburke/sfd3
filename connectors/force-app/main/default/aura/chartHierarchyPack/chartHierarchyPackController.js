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
            var cc = component.getConcreteComponent();
            cc.dataPreprocess(datajson, datajsonRefresh);    
        }

        helper.initializeVisuals(component);
    },

    dataPreprocess: function(component,event,helper){
        console.log("calling the aura:method chartHierarchyPack in chart");
        let storeObject = component.get("v.storeObject");

        var args = event.getParam("arguments");
        var datajsonBefore = args.datajson;

        bzpack.recursiveMap(storeObject,datajsonBefore, true);

    }
})
