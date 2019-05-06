({

    initializeVisuals: function(component,event,helper){
        console.log("calling the aura:method initializeVisuals in subcomponent");
        let storeObject = component.get("v.storeObject");
        helper.areaInit(component);

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
        let componentReference = bzchart.getStore (storeObject, "componentReference") ;  
        let componentType = bzchart.getStore (storeObject, "componentType") ;

        if ((componentType ==  "network.connections") || (componentType ==  "network.timeline")) {
            var primaryid = bzchart.getStore (storeObject, "primaryNodeId") ;

            var node = d3.select(bzutils.getDivId("nodeGroup", componentReference, true))
                .selectAll("circle")  ;

            if (bzchart.getStore (storeObject, "updateSize")) {            
                node.attr("r", function(o, i) {
                    return bzchart.getFromMeasureScheme(storeObject, o, "Size");
                });
            }

            if (bzchart.getStore (storeObject, "updateColor")) {            
                node.style("fill", function(o, i) {
                    return bzchart.getFromMeasureScheme(storeObject, o, "Color");
                });
            }
        
            node.style("stroke", function(o, i) {
                var stroke = o.stroke;
                var oid = o.id;
                if (oid == primaryid) {
                    var primaryNodeHighlightingOn = bzchart.getStore (storeObject, "primaryNodeHighlightingOn") ;
                    if (primaryNodeHighlightingOn == true) {
                        stroke = bzchart.getStore (storeObject, "primaryNodeHighlightingColour") ;
                    }                
                }
                return stroke;
            });
        
            node.style("stroke-width", function(o, i) {
                var nodestrokewidth = bzchart.getStore (storeObject, "nodestrokewidth") ;
                var oid = o.id;
                if (oid == primaryid) {
                    nodestrokewidth = bzchart.getStore (storeObject, "primaryNodeHighlightingRadius") ;
                }
                return nodestrokewidth;
            });
        
            console.log("styleNodes exit");
        
        }

        console.log("aura:method styleNodes in chartNetwork exit");
    }

})