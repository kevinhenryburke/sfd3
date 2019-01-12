({
    styleNodes: function(component,event,helper){
        console.log("aura:method styleNodes in chartHierarchyTreeMapZoom enter");

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
    }
})
