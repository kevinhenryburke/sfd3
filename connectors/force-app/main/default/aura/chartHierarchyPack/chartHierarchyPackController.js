({
    styleNodes: function(component,event,helper){
        let _this = this;

        console.log("aura:method styleNodes in chartHierarchyPack enter");

        let latestSizeOrColor = helper.getStore(component, "latestSizeOrColor");
        console.log("xxxxxx:" , latestSizeOrColor);

        if (latestSizeOrColor == "color") {

            let nodeGroup = helper.getCache (component, "nodeGroup") ;  

            let datajson = helper.getCache (component, "datajson") ;  
            console.log("xxxxxx:" , JSON.stringify(datajson));



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
                
        }

        if (latestSizeOrColor == "size") {
            var componentReference = component.get("v.componentReference");
            helper.clearElements(componentReference);
            helper.initializeVisuals(component);
        }


        // helper.stylePack(component, node);
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
