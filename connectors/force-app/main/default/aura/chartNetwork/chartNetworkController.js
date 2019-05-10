({

    initializeVisuals: function(component,event,helper){
        console.log("calling the aura:method initializeVisuals in subcomponent");
        let storeObject = component.get("v.storeObject");

        bzchart.setStore (storeObject, "primaryNodeHighlightingOn", component.get("v.primaryNodeHighlightingOn") ) ;
        bzchart.setStore (storeObject, "primaryNodeHighlightingColour", component.get("v.primaryNodeHighlightingColour") ) ;
        bzchart.setStore (storeObject, "primaryNodeHighlightingRadius", component.get("v.primaryNodeHighlightingRadius") ) ;
        bzchart.setStore (storeObject, "retainNodeDetailsMouseOut", component.get("v.retainNodeDetailsMouseOut") ) ;
        bzchart.setStore (storeObject, "nodestrokewidth", component.get("v.nodestrokewidth") ) ;

        helper.initializeVisuals(component);                         
    },

    refreshDataController: function(component,event,helper){
        bzutils.log("calling the aura:method refreshDataController in chartNetwork");
        var args = event.getParam("arguments");
        var parameters = args.parameters;

        var datajson = parameters.datajson;
        var primaryId = parameters.primaryId;
        var showFilters = parameters.showFilters;

        helper.refreshDataHelper(component, datajson, primaryId, showFilters);                         
    },

    searchChart: function(component,event,helper){
        console.log("aura:method searchChart in subcomponent enter");
        let storeObject = component.get("v.storeObject");
        let componentReference = bzchart.getStore (storeObject, "componentReference") ;  
        var args = event.getParam("arguments");

        var searchTermId = args.searchTermId;
        var searchAction = args.searchAction;
        var showLevels = args.showLevels;

        var primaryNodeId = bzutils.addComponentRef(componentReference, searchTermId);
        bzchart.setStore (storeObject, "primaryNodeId", primaryNodeId ) ;
        bzchart.setStore (storeObject, "showLevels", showLevels) ;

        let variantsMixin = bzchart.getStore (storeObject, "chartMixin") ;
        variantsMixin.refreshVisibility(storeObject);

        var cc = component.getConcreteComponent();
        cc.styleNodes();                 
        console.log("aura:method searchChart in subcomponent exit");
    },

    styleNodes: function(component,event,helper){
        console.log("aura:method styleNodes in chartNetwork enter");
        let storeObject = component.get("v.storeObject");
        bznetwork.styleNodes(storeObject);
    }

})