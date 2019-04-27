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


    dataPreprocess: function(component,event,helper){
        console.log("calling the aura:method dataPreprocess in subcomponent");
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

        var cc = component.getConcreteComponent();
        cc.refreshVisibility();                 
        cc.styleNodes();                 
        console.log("aura:method searchChart in subcomponent exit");
    },

    reScale: function(component,event,helper){
        console.log("aura:method reScale in subcomponent enter");
        console.log("aura:method reScale in subcomponent exit");
    },

    refreshVisibility: function(component,event,helper){
        console.log("aura:method refreshVisibility in subcomponent enter - implementation");
        let storeObject = component.get("v.storeObject");
        let componentReference = bzchart.getStore (storeObject, "componentReference") ;  
        let componentType = bzchart.getStore (storeObject, "componentType") ;

        if (componentType ==  "network.connections") {

            console.log("refreshVisibility enter "); 
        
            var levels = bzchart.getStore (storeObject, "showLevels") ;

            var filterValues = bzchart.getStore (storeObject, "filterValues") ;
            var primaryNodeId = bzchart.getStore (storeObject, "primaryNodeId") ;        
            // not needed until reinstate measure level visibility
        
            var relatedNodes = helper.getRelatedNodes(primaryNodeId, componentReference, levels);
        
            var path = d3.select(bzutils.getDivId("pathGroup", componentReference, true))
                .selectAll("path")  ;
        
            var node = d3.select(bzutils.getDivId("nodeGroup", componentReference, true))
                .selectAll("circle")  
            
            var shownodeids = [];
        
            path.style("visibility", function(p) {
        
                var retval = "hidden";
        
                var sourcevis = 1;
                var targetvis = 1;
        
                var sourceindex = relatedNodes.indexOf(p.sourceid);
                var targetindex = relatedNodes.indexOf(p.targetid);
        
                var primaryrelated = (sourceindex > -1 && targetindex > -1);
        
                if ((sourcevis === 1) && (targetvis === 1) && primaryrelated) {
        
                    var index = filterValues.indexOf(p.type);
        
                    if (index > -1) {
                        var indexsource = shownodeids.indexOf(p.sourceid);
                        if (indexsource == -1) {
                            shownodeids.push(p.sourceid);
                        }
        
                        var indextarget = shownodeids.indexOf(p.targetid);
                        if (indextarget == -1) {
                            shownodeids.push(p.targetid);
                        }
                    }
                }
        
                return (index > -1) ? "visible" : "hidden";
            });
        
            // change the visibility of the node
            // if all the links with that node are invisibile, the node should also be invisible
            // otherwise if any link related to that node is visibile, the node should be visible
            node.style("visibility", function(o, i) {
                var oid = o.id;
                var index = shownodeids.indexOf(oid);
                if (index > -1) {
                    d3.select("#t" + oid).style("visibility", "visible");
                    d3.select("#s" + oid).style("visibility", "visible");
                    return "visible";
                } else {
                    d3.select("#t" + oid).style("visibility", "hidden");
                    d3.select("#s" + oid).style("visibility", "hidden");
                    return "hidden";
                }
            });
        }
        console.log("aura:method refreshVisibility in subcomponent exit");
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
                    return helper.getFromMeasureScheme(component, o, "Size");
                });
            }

            if (bzchart.getStore (storeObject, "updateColor")) {            
                node.style("fill", function(o, i) {
                    return helper.getFromMeasureScheme(component, o, "Color");
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