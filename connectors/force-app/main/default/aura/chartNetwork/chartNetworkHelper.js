({

    // unsophisticated version is to remove everything and re-initialize
    refreshDataHelper: function (storeObject, datajsonRefresh, primaryNodeId, showFilters) {
        let componentReference = bzchart.getStore (storeObject, "componentReference") ;  

        // delete the paths and the groups
        // this is not the preferred option - would have preferred to use d3 joins.
        bzchart.clearChart(componentReference);
        
        // retrieve the existing underlying data
        var datajson = bzchart.getStore (storeObject, "datajson") ;

        // initialize the new raw data, setting component references
        bzutils.initializeAddComponentRef(componentReference, datajsonRefresh);

        var nodeIds = [];
        datajson.nodes.forEach(function(node) {
            nodeIds.push(node["id"]);
        });        

        datajsonRefresh.nodes.forEach(function(node) {
            var indexer = nodeIds.indexOf(node["id"]);       
            if (indexer == -1) {     
                datajson["nodes"].push(node); // this adds new nodes into datajson
            }
        });

        var linkIds = [];
        datajson.links.forEach(function(link) {
            linkIds.push(link["id"]);
        });        
        
        datajsonRefresh.links.forEach(function(link) {
            datajson["links"].push(link);
        });

        // merge the old and the new data
        let variantsMixin = bzchart.getStore (storeObject, "chartMixin") ;
        variantsMixin.dataPreprocess(storeObject, datajson, datajsonRefresh);

        datajson = bzchart.getStore (storeObject, "datajson") ;
        
        // re-initialize the chart
        var isInit = false;
        bzchart.initializeGroups(storeObject, datajson, primaryNodeId, showFilters, isInit);                 

        bznetwork.initializeVisualsHelper (storeObject);
    }
        
})