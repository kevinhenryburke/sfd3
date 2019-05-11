({

    initializeVisuals: function(component,event,helper){
        console.log("calling the aura:method initializeVisuals in subcomponent");
        let storeObject = component.get("v.storeObject");

        bzchart.setStore (storeObject, "primaryNodeHighlightingOn", component.get("v.primaryNodeHighlightingOn") ) ;
        bzchart.setStore (storeObject, "primaryNodeHighlightingColour", component.get("v.primaryNodeHighlightingColour") ) ;
        bzchart.setStore (storeObject, "primaryNodeHighlightingRadius", component.get("v.primaryNodeHighlightingRadius") ) ;
        bzchart.setStore (storeObject, "retainNodeDetailsMouseOut", component.get("v.retainNodeDetailsMouseOut") ) ;
        bzchart.setStore (storeObject, "nodestrokewidth", component.get("v.nodestrokewidth") ) ;

        bznetwork.initializeVisualsHelper (storeObject);
    },

    refreshDataController: function(component,event,helper){
        bzutils.log("calling the aura:method refreshDataController in chartNetwork");
        let storeObject = component.get("v.storeObject");
        var args = event.getParam("arguments");
        var parameters = args.parameters;

        var datajson = parameters.datajson;
        var primaryId = parameters.primaryId;
        var showFilters = parameters.showFilters;

        bznetwork.refreshDataHelper(storeObject, datajson, primaryId, showFilters);                         
    },

    styleNodes: function(component,event,helper){
        console.log("aura:method styleNodes in chartNetwork enter");
        let storeObject = component.get("v.storeObject");
        bznetwork.styleNodes(storeObject);
    }

})