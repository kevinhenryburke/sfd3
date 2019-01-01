({
    styleNodes: function(component,event,helper){
        console.log("aura:method styleNodes in chartHierarchyTreeMap enter");


        let currentMeasure = helper.getStore(component, "currentMeasure");

        let nodeGroup = helper.getCache (component, "nodeGroup") ;  

        let datajson = helper.getCache (component, "datajson") ;  

        let nodeSelector = "circle";
        let nodeDataSetFunction = helper.getRootStructureTreeMap (component); 

        // let node = nodeGroup
        //     .selectAll(nodeSelector)
        //     .data(nodeDataSetFunction(datajson), function(d, i) { return d.id;})
        //     .enter()
        //     .selectAll('g')
        //     .select('circle')

        // node.style("fill", function(d) { 
        //     let colorme = helper.getFromMeasureScheme(component, d.data, currentMeasure, "Color");
        //     return colorme;
        // });

    },
})
