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

    dataPreprocess: function(component,event,helper){
        console.log("calling the aura:method dataPreprocess in chartHierarchyTreemapZoom");
        let args = event.getParam("arguments");
        let datajson = args.datajson; 

        let componentType = component.get("v.componentType");

        console.log("xxxxx: dataPreprocess: datajson", JSON.parse(JSON.stringify(datajson, null, 2)));

        if (componentType == "hierarchy.treemappicklistzoom") {
            datajson = helper.picklistNest(component, datajson);
        }
        helper.setCache (component, "datajson", datajson ) ;    
    }

})
