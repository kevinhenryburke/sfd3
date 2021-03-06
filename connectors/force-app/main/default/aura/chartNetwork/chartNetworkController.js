({

    initializeVisuals: function(component,event,helper){
        console.log("calling the aura:method initializeVisuals in subcomponent");
        helper.areaInit(component);

        helper.setCache (component, "primaryNodeHighlightingOn", component.get("v.primaryNodeHighlightingOn") ) ;
        helper.setCache (component, "primaryNodeHighlightingColour", component.get("v.primaryNodeHighlightingColour") ) ;
        helper.setCache (component, "primaryNodeHighlightingRadius", component.get("v.primaryNodeHighlightingRadius") ) ;
        helper.setCache (component, "retainNodeDetailsMouseOut", component.get("v.retainNodeDetailsMouseOut") ) ;
        helper.setCache (component, "nodestrokewidth", component.get("v.nodestrokewidth") ) ;

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
        var args = event.getParam("arguments");

        var searchTermId = args.searchTermId;
        var searchAction = args.searchAction;
        var showLevels = args.showLevels;

        var componentReference = component.get("v.componentReference");        
        var primaryNodeId = helper.addComponentRef(componentReference, searchTermId);
        helper.setCache (component, "primaryNodeId", primaryNodeId ) ;
        helper.setCache (component, "showLevels", showLevels) ;

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

        var componentType = component.get("v.componentType");

        if (componentType ==  "network.connections") {

            var componentReference = component.get("v.componentReference");        
            console.log("refreshVisibility enter "); 
        
            var levels = helper.getCache(component, "showLevels") ;

            var filterValues = helper.getCache (component, "filterValues") ;
            var primaryNodeId = helper.getCache (component, "primaryNodeId") ;        
            // not needed until reinstate measure level visibility
        
            var relatedNodes = helper.getRelatedNodes(primaryNodeId, componentReference, levels);
        
            var path = d3.select(helper.getDivId("pathGroup", componentReference, true))
                .selectAll("path")  ;
        
            var node = d3.select(helper.getDivId("nodeGroup", componentReference, true))
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

        var componentType = component.get("v.componentType");

        if ((componentType ==  "network.connections") || (componentType ==  "network.timeline")) {

            var componentReference = component.get("v.componentReference");        

            var primaryid = helper.getCache (component, "primaryNodeId") ;

            var node = d3.select(helper.getDivId("nodeGroup", componentReference, true))
                .selectAll("circle")  ;

            if (helper.getStore(component, "updateSize")) {            
                node.attr("r", function(o, i) {
                    return helper.getFromMeasureScheme(component, o, "Size");
                });
            }

            if (helper.getStore(component, "updateColor")) {            
                node.style("fill", function(o, i) {
                    return helper.getFromMeasureScheme(component, o, "Color");
                });
            }
        
            node.style("stroke", function(o, i) {
                var stroke = o.stroke;
                var oid = o.id;
                if (oid == primaryid) {
                    var primaryNodeHighlightingOn = helper.getCache (component, "primaryNodeHighlightingOn") ;
                    if (primaryNodeHighlightingOn == true) {
                        stroke = helper.getCache (component, "primaryNodeHighlightingColour") ;
                    }                
                }
                return stroke;
            });
        
            node.style("stroke-width", function(o, i) {
                var nodestrokewidth = helper.getCache (component, "nodestrokewidth") ;
                var oid = o.id;
                if (oid == primaryid) {
                    nodestrokewidth = helper.getCache (component, "primaryNodeHighlightingRadius") ;
                }
                return nodestrokewidth;
            });
        
            console.log("styleNodes exit");
        
        }

        console.log("aura:method styleNodes in chartNetwork exit");
    },

    getDefaultSize: function(component,event,helper){
        // console.log("aura:method getDefaultSize in chartNetwork enter");
        // console.log("aura:method getDefaultSize in chartNetwork exit");
        return 20;
    },

    getDefaultColor: function(component,event,helper){
        // console.log("aura:method getDefaultColor in chartNetwork enter");
        // console.log("aura:method getDefaultColor in chartNetwork exit");
        return "lightsteelblue";
    }


})