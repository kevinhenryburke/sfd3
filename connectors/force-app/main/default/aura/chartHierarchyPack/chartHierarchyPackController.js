({
    styleNodes: function(component,event,helper){
        console.log("aura:method styleNodes in chartHierarchyPack enter");

        let nodeGroup = helper.getCache (component, "nodeGroup") ;  

        let datajson = helper.getCache (component, "datajson") ;  

        let nodeSelector = "circle";
        let nodeDataSetFunction = helper.getRootStructurePack (component); 

        let node = nodeGroup
            .selectAll(nodeSelector)
            .data(nodeDataSetFunction(datajson), function(d, i) { return d.id;})
            .enter()
            .selectAll('g')
            .select('circle')

        node.style("fill", function(d) { 
            let colorme = helper.getFromMeasureScheme(component, d.data, "Color");
            return colorme;
        });

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
