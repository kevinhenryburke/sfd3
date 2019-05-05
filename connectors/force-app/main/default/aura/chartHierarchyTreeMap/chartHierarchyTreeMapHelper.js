({
    initializeVisuals: function (component) {
        let storeObject = component.get("v.storeObject");

        let datajson = bzchart.getStore (storeObject, "datajson") ;  
		let nodeGroup = bzchart.getStore (storeObject, "nodeGroup") ;  

        let nodeDataSetFunction = bzhierarchytreemap.getRootStructureTreeMap (storeObject); 

        nodeDataSetFunction(datajson);

        let root = bzchart.getStore (storeObject, "root") ;  

        let cells = nodeGroup
            .selectAll("g")
            .data(root.leaves()); // <-D


        bzhierarchytreemap.renderCells(storeObject, cells);
    }

})
