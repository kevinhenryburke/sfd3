({
    styleNodes: function(component,event,helper){
        console.log("aura:method styleNodes in chartHierarchyTreeMap enter");
        let storeObject = component.get("v.storeObject");

        let nodeGroup = bzchart.getStore (storeObject, "nodeGroup") ;  
        let datajson = bzchart.getStore (storeObject, "datajson") ;  
        let nodeDataSetFunction = helper.getRootStructureTreeMap (storeObject); 

        nodeDataSetFunction(datajson);

        let root = bzchart.getStore (storeObject, "root") ;  

        let cells = nodeGroup
            .selectAll("g")
            .data(root.leaves())

        helper.renderCells(storeObject, cells);
    }
})
