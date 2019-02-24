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
            let groupingFields = helper.getStore(component, "groupingFields");
            let numberOfGroupings = groupingFields.length; // TODO SUPER TEMPORARY

            // we use d3.nest to produce the levels and utilize to create a new version of datajson
            let nestData = d3.nest()
            .key(function(d){  
                return d.fields[groupingFields[0].fieldIndex].retrievedValue;
            }) 
            if (numberOfGroupings >= 2) {
                nestData = nestData.key(d => d.fields[groupingFields[1].fieldIndex].retrievedValue);
            }
            if (numberOfGroupings >= 3) {
                nestData = nestData.key(d => d.fields[groupingFields[2].fieldIndex].retrievedValue);
            }

            nestData = nestData.entries(datajsonBefore);

            // Top (Total) level
            let djSetup = {"name" : "Total", "children" : []};

            let datajsonAfter = helper.nestChildren(djSetup, nestData, numberOfGroupings);

            rootAfter = d3.hierarchy(datajsonAfter)
                .eachBefore(function (d) {
                    d.id = d.data.id;
                })
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
        helper.setCache (component, "d3root", rootAfter ) ;    

    }

})
