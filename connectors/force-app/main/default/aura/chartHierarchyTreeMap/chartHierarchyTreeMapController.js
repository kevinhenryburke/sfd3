({
    styleNodes: function(component,event,helper){
        console.log("aura:method styleNodes in chartHierarchyTreeMap enter");

        let nodeGroup = helper.getCache (component, "nodeGroup") ;  

        let datajson = helper.getCache (component, "datajson") ;  

        let nodeDataSetFunction = helper.getRootStructureTreeMap (component); 

        nodeDataSetFunction(datajson);

        let root = helper.getCache (component, "root") ;  

        let cells = nodeGroup
            .selectAll("g")
            .data(root.leaves()) // <-D

        helper.renderCells(component, cells);
    },

    getDefaultSize: function(component,event,helper){
        // console.log("aura:method getDefaultSize in chartHierarchyTreeMap enter");
        // console.log("aura:method getDefaultSize in chartHierarchyTreeMap exit");
        return 10;
    },

    getDefaultColor: function(component,event,helper){
        // console.log("aura:method getDefaultColor in chartHierarchyTreeMap enter");
        // console.log("aura:method getDefaultColor in chartHierarchyTreeMap exit");
        return "lightsteelblue";
    }
})
