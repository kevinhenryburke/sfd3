({

    initializeVisuals: function(component,event,helper){
        console.log("calling the aura:method initializeVisuals in subcomponent");
        // Delegates to helper
        // Note this is the way that we would pass parameters if there were any
        // var args = event.getParam("arguments");
        // var datajson = args.datajson;

        var componentReference = component.get("v.componentReference");        
        bzutils.setCache (componentReference, "primaryNodeHighlightingOn", component.get("v.primaryNodeHighlightingOn") ) ;
        bzutils.setCache (componentReference, "primaryNodeHighlightingColour", component.get("v.primaryNodeHighlightingColour") ) ;
        bzutils.setCache (componentReference, "primaryNodeHighlightingRadius", component.get("v.primaryNodeHighlightingRadius") ) ;
        bzutils.setCache (componentReference, "retainNodeDetailsMouseOut", component.get("v.retainNodeDetailsMouseOut") ) ;

        helper.initializeVisuals(component);                         
    },

    searchChart: function(component,event,helper){
        console.log("aura:method searchChart in subcomponent enter");
        var args = event.getParam("arguments");

        var searchTermId = args.searchTermId;
        var searchAction = args.searchAction;
        var showLevels = args.showLevels;

        var componentReference = component.get("v.componentReference");        
        var primaryNodeId = bzutils.addComponentRef(componentReference, searchTermId);
        bzutils.setCache (componentReference, "primaryNodeId", primaryNodeId ) ;
        bzutils.setCache (componentReference, "showLevels", showLevels) ;

        bzutils.xfcr("refreshVisibility", componentReference);
        bzutils.xfcr("styleNodes", componentReference); 
        console.log("aura:method searchChart in subcomponent exit");
    },

    reScale: function(component,event,helper){
        console.log("aura:method reScale in subcomponent enter");
        console.log("aura:method reScale in subcomponent exit");
    }

})