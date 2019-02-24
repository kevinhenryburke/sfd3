({
    styleNodes: function(component,event,helper){
        let _this = this;

        console.log("aura:method styleNodes in chartHierarchyPack enter");

        let latestSizeOrColor = helper.getStore(component, "latestSizeOrColor");

        var componentReference = component.get("v.componentReference");
        helper.clearElements(componentReference);

        let datajson = helper.getCache (component, "datajson") ;  
        let datajsonRefresh = helper.getCache (component, "datajson") ;  

        if (latestSizeOrColor == "size") {
            var cc = component.getConcreteComponent();
            cc.dataPreprocess(datajson, datajsonRefresh);    
        }

        helper.initializeVisuals(component);
    },

    dataPreprocess: function(component,event,helper){
        console.log("calling the aura:method chartHierarchyPack in chart");

        var args = event.getParam("arguments");
        var datajsonBefore = args.datajson;

        helper.recursiveMap(component,datajsonBefore, true);




    },


    getDefaultSize: function(component,event,helper){
        // console.log("aura:method getDefaultSize in chartHierarchyPack enter");
        // console.log("aura:method getDefaultSize in chartHierarchyPack exit");
        return 10;
    },

    getDefaultColor: function(component,event,helper){
        // console.log("aura:method getDefaultColor in chartHierarchyPack enter");
        // console.log("aura:method getDefaultColor in chartHierarchyPack exit");
        return "lightsteelblue";
    }
})
