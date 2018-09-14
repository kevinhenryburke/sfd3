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
        bzutils.setCache (componentReference, "nodestrokewidth", component.get("v.nodestrokewidth") ) ;

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

        var cc = component.getConcreteComponent();
        cc.refreshVisibility();                 

        bzutils.xfcr("styleNodes", componentReference); 
        console.log("aura:method searchChart in subcomponent exit");
    },

    reScale: function(component,event,helper){
        console.log("aura:method reScale in subcomponent enter");
        console.log("aura:method reScale in subcomponent exit");
    },

    refreshVisibility: function(component,event,helper){
        console.log("aura:method refreshVisibility in subcomponent enter - implementation");

        var componentType = component.get("v.componentType");

        if (componentType ==  "chart.connections") {

            var componentReference = component.get("v.componentReference");        
            console.log("refreshVisibility enter "); 
        
            var levels = bzutils.getCache(componentReference, "showLevels") ;
            
            var showFilters = bzutils.getCache (componentReference, "showFilters") ;
            var primaryNodeId = bzutils.getCache (componentReference, "primaryNodeId") ;        
            // not needed until reinstate measure level visibility
            var currentMeasure = bzutils.getCache (componentReference, "currentMeasure") ;
        
            var relatedNodes = bzchart.getRelatedNodes(primaryNodeId, componentReference, levels);
        
            var path = d3.select(bzutils.getDivId("pathGroup", componentReference, true))
                .selectAll("path")  ;
        
            var node = d3.select(bzutils.getDivId("nodeGroup", componentReference, true))
                .selectAll("circle")  
            
            var shownodeids = [];
        
            path.style("visibility", function(p) {
        
                var retval = "hidden";
        
                //TODO temporarily removing the measure level visibility functionaliy, reinstate later if useful
                // var sourcevis = p.source.measures[currentMeasure].visible;
                // var targetvis = p.target.measures[currentMeasure].visible;
                var sourcevis = 1;
                var targetvis = 1;
        
                var sourceindex = relatedNodes.indexOf(p.sourceid);
                var targetindex = relatedNodes.indexOf(p.targetid);
        
                var primaryrelated = (sourceindex > -1 && targetindex > -1);
        
                if ((sourcevis === 1) && (targetvis === 1) && primaryrelated) {
        
                    var index = showFilters.indexOf(p.type);
        
                    if (index > -1) {
                        bzutils.log(p.sourceid + '/' + p.targetid + " will be visible");
        
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
    }


})