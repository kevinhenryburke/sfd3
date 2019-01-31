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
        let componentType = component.get("v.componentType");
        let args = event.getParam("arguments");
        let rootAfter;
        let datajson = args.datajson; 

        console.log("xxxxx: dataPreprocess: datajson", JSON.parse(JSON.stringify(datajson, null, 2)));

        if (componentType == "hierarchy.treemappzoom") {
            let datajsonBefore = datajson.children; 

            // TODO this must be cretaed dynamically by the role groupings
            let numberOfGroupings = 1;

            // we use d3.nest to produce the levels and utilize to create a new version of datajson
            let nestData = d3.nest()
            .key(function(d){  
                console.log("xxxxx: retrievedValue" , d.fields[2].retrievedValue);
                return d.fields[2].retrievedValue;
            }) // something like this....
            // .key(function(d){  
            //     console.log("xxxxx: retrievedValue" , d.fields[3].retrievedValue);
            //     return d.fields[3].retrievedValue;
            // }) // something like this....
            // .key(function(d){  
            //     return d.fields[3].retrievedValue;
            // }) // something like this....
            // .rollup(function(values) { // hm, rollups replace leaf nodes
            //     return d3.sum(values, function(d) {return +d.fields[0].retrievedInteger; }) 
            // })
            .entries(datajsonBefore);

            let datajsonAfter = {"name" : "Total", "objectType" : "Account", "size" : 20391};

            datajsonAfter["children"] = [];

            var arrayLength = nestData.length;
            for (var i = 0; i < arrayLength; i++) {
                console.log("xxxxx: dataPreprocess: outer array", nestData[i]);
                var innerNest = {"name" : nestData[i].key, "objectType" : "Account", "size" : 20391};
                innerNest["children"] = [];
                var innerArrayLength = nestData[i]["values"].length;

                for (var j = 0; j < innerArrayLength; j++) {
                    innerNest["children"].push(nestData[i]["values"][j]);
                }
                datajsonAfter["children"].push(innerNest) ;
            }            


            console.log("xxxxx: dataPreprocess: datajsonAfter", JSON.parse(JSON.stringify(datajsonAfter, null, 2)));

            rootAfter = d3.hierarchy(datajsonAfter)
                .eachBefore(function (d) {
                    d.id = d.data.id;
                })
//                .sum((d) =>  helper.getFromMeasureScheme(component, d, "Value"))
//                .sum((d) =>  32)
                .sum(function (d) {
                    if (d.childDepth != null && d.childDepth == 0) {
                        return helper.getFromMeasureScheme(component, d, "Value");
                    }
                    return 0;
                })

                .sort(function (a, b) {
                    return b.value - a.value;
                });
    }
        if (componentType == "hierarchy.treemapzoom") {
            rootAfter = d3.hierarchy(datajson)
                .eachBefore(function (d) {
                    d.id = d.data.id;
                })
                .sum((d) =>  helper.getFromMeasureScheme(component, d, "Value"))
                .sort(function (a, b) {
                    return b.value - a.value;
                });
        }
//        console.log("xxxxx: dataPreprocess: rootAfter", JSON.parse(JSON.stringify(rootAfter, null, 2)));
        helper.setCache (component, "d3root", rootAfter ) ;    

    }

})
