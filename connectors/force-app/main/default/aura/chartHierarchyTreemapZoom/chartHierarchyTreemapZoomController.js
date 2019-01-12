({
    styleNodes: function(component,event,helper){
        console.log("aura:method styleNodes in chartHierarchyTreeMapZoom enter");


        window.onerror = function(msg, url, lineNo, columnNo, error) {
            console.error("ERROR");
            return false;
          }        

        let nodeGroup = helper.getCache (component, "nodeGroup") ;  

        // let datajson = [
        //     {
        //       "key": "Asia",
        //       "values": [
        //       {
        //         "key": "India",
        //         "value": 1236670000
        //       },
        //       {
        //         "key": "China",
        //         "value": 1361170000
        //       }]
        //     },
        //     {
        //       "key": "Africa",
        //       "values": [
        //       {
        //         "key": "Nigeria",
        //         "value": 173615000
        //       },
        //       {
        //         "key": "Egypt",
        //         "value": 83661000
        //       }]
        //     }
        //   ];

        //  _this.setCache (component, "datajson", datajson) ;  



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
