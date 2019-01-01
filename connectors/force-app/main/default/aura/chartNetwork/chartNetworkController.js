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

        var componentType = component.get("v.componentType");
        console.log("dataPreprocess componentType = " + componentType);

        if (componentType ==  "network.timeline") {
            console.log("dataPreprocess subcomponent network.timeline");

            var args = event.getParam("arguments");
            var datajsonBefore = args.datajson;
            var datajsonRefresh = args.datajsonRefresh;

            for (var i = 0; i < datajsonBefore.nodes.length; i++){
                var djnodeBefore = datajsonBefore.nodes[i];
                var fieldsBefore = djnodeBefore.fields;
                var djnodeAfter = datajsonRefresh.nodes[i];
                var fieldsAfter = djnodeAfter.fields;
                for (var j = 0; j < fieldsBefore.length; j++) {
                    if (fieldsBefore[j].retrievedDecimal != null) {
                        fieldsBefore[j].retrievedDecimal = fieldsAfter[j].retrievedDecimal;
                    }
                    if (fieldsBefore[j].retrievedInteger != null) {
                        fieldsBefore[j].retrievedInteger = fieldsAfter[j].retrievedInteger;
                    }
                }
            }    
            helper.setCache (component, "datajson", datajsonBefore ) ;
        }

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
        
                //TODO temporarily removing the measure level visibility functionaliy, reinstate later if useful
                // var sourcevis = p.source.measures[currentMeasure].visible;
                // var targetvis = p.target.measures[currentMeasure].visible;
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
            var currentMeasure = helper.getStore(component, "currentMeasure");

            console.log("styleNodes enter: " + currentMeasure + " primaryid: " + primaryid);
        
            var node = d3.select(helper.getDivId("nodeGroup", componentReference, true))
                .selectAll("circle")  ;
        
            bzutils.log("styleNodes:" + JSON.stringify(node));
        
            node.attr("r", function(o, i) {
                for (var i = 0; o.fields.length; i++) {
                    if (o.fields[i].api == currentMeasure) {
                        var numericalValue = o.fields[i].retrievedDecimal;
                        if (numericalValue != null) {
                            return numericalValue;
                        }
                        return o.fields[i].retrievedInteger;
                    }
                }
            });
        
            node.style("fill", function(o, i) {
                var returnedColor = helper.getFromMeasureScheme(component, o, currentMeasure, "Color");
                return returnedColor;
            });
        
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
    }


})