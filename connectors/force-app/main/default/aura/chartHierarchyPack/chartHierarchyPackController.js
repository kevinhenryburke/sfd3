({
    styleNodes: function(component,event,helper){
        console.log("aura:method styleNodes in chartHierarchyPack enter");


        let currentMeasure = helper.getStore(component, "currentMeasure");

        let nodeGroup = helper.getCache (component, "nodeGroup") ;  

        let datajson = helper.getCache (component, "datajson") ;  

        let nodeSelector = helper.getMasterParam(component, "panels", "ChartPanel", "Selectors", "node", "selector"); // an html selector for a class or element ids
        let nodeDataSetFunction = helper.getRootStructurePack (component); 

        let node = nodeGroup
            .selectAll(nodeSelector)
            .data(nodeDataSetFunction(datajson), function(d, i) { return d.id;})
            .enter()
            .selectAll('g')
            .select('circle')

        node.style("fill", function(d) { 
            let colorme = helper.getFromMeasureScheme(component, d.data, currentMeasure, "Color");
            return colorme;
        });

    },
})
