({

    initializeVisuals: function (component) {
        console.log("subhelper: enter initializeVisuals proper!");
        var _this = this;
        let storeObject = component.get("v.storeObject");
        let variantsMixin = bzchart.getStore (storeObject, "chartMixin") ;

		var datajson = bzchart.getStore (storeObject, "datajson") ;  
		var nodeGroup = bzchart.getStore (storeObject, "nodeGroup") ;  
		var pathGroup = bzchart.getStore (storeObject, "pathGroup") ;  
		var textGroup = bzchart.getStore (storeObject, "textGroup") ;  
		var pathToolTipDiv = bzchart.getStore (storeObject, "pathToolTipDiv") ;  
		var pathGroupId = bzchart.getStore (storeObject, "pathGroupId") ;  

        var node = {};     
        var text = {};     
        var path = {};     

        console.log("chartNetworkHelper: calling nodes");

        let nodeSelector = ".node";
        var nodeDataSetFunction = bznetwork.nodeDataSetFunctionNodes (); 

        var nodeEnterSelection = nodeGroup
            .selectAll(nodeSelector)
            .data(nodeDataSetFunction(datajson), function(d, i) { return d.id;})
            .enter();

//        nodeSelection.exit().remove();    

        node = nodeEnterSelection
            .append("circle")
            .attr("id", d => d.id)            
            .attr("recordid", function(d) {
                return d.recordid;
            })
            // symbols...           .attr("d", d3.symbol().type( function(d) { return d3.symbols[4];}))
            .on('mouseout', function(d) { // hide the div
                var retainNodeDetailsMouseOut = bzchart.getStore (storeObject, "retainNodeDetailsMouseOut" ) ;
                if (!retainNodeDetailsMouseOut)
                {
                    let preppedEvent = variantsMixin.nodeMouseout(storeObject, d);
                    bzaura.publishPreppedEvent(storeObject,preppedEvent,$A.get("e.c:evt_sfd3"));
                }
            })
            .on('mouseover', $A.getCallback(function(d) { // need getCallback to retain context - https://salesforce.stackexchange.com/questions/158422/a-get-for-application-event-is-undefined-or-can-only-fire-once
                bzchart.setStore (storeObject, "mouseoverRecordId", d.id ) ;
                let preppedEvent = variantsMixin.nodeMouseover(storeObject, d);
                bzaura.publishPreppedEvent(storeObject,preppedEvent,$A.get("e.c:evt_sfd3"));
            }))
            .on('click', function(d) {
                console.log("retrieve info on whether isiOS");
                if (bzchart.getStore (storeObject, "isiOS")) {
                    var now = new Date().getTime();
                    var lastTouch = bzchart.getStore (storeObject, "lastTouch");
                    var delta = now - lastTouch;
                    if (delta < 350 && delta > 0) {
                        // the second touchend event happened within half a second. Here is where we invoke the double tap code
                        //TODO implement - e.g. var win = window.open("http://news.bbc.co.uk"); win.focus();
                    }
                    bzchart.setStore (storeObject, "lastTouch", lastTouch) ;
                } else {
                    console.log("not iOS");
                }
                // reset the clicked node to be the primary
                // TODO This will need to be passed in the refreshVisibility call.
                var primaryNodeId = d.id;
                bzchart.setStore (storeObject, "primaryNodeId", primaryNodeId ) ;

                variantsMixin.refreshVisibility(storeObject);
                var cc = component.getConcreteComponent();
                cc.styleNodes();                 
            })
            .on('dblclick', $A.getCallback(function(d) {
                console.log("dblclick");
                // Two options - complete refresh OR keep and get data from this point?
                // send a message identifying the node in question
                var primaryNodeId = d.id;
                bzchart.setStore (storeObject, "primaryNodeId", primaryNodeId ) ;

                var preppedEvent = bznetwork.nodeDoubleClick(storeObject,primaryNodeId);

                bzaura.publishPreppedEvent(storeObject,preppedEvent,$A.get("e.c:evt_sfd3"));
            }))
            ;


        console.log("calling text");    
    
        var textEnterSelection = textGroup
            .selectAll("g")
            .data(datajson.nodes,  function(d, i) { return d.id;} )
            .enter();
        
        text = textEnterSelection
            .append("svg:g")
            .attr("class", "nodeText"); 

        // A copy of the text with a thick white stroke for legibility ("s" for shadow, "t" for text).
        var svgText = text.append("svg:text");
        svgText
            .attr("id", d => "s" + d.id)            
            .text(function(d) {
                return d.name;
            })
            .attr("class", "chartTextShadow") // shadow class
            // .attr("x", 8)
            // .attr("y", ".31em");

        bznetwork.textAdditionalAttribute (storeObject, svgText);


        var svgText = text.append("svg:text");
        svgText
            .attr("id", d => "t" + d.id)            
            .text(function(d) {
                return d.name;
            })
            .attr("class", "chartText") 
            // .attr("x", 8)
            // .attr("y", ".31em");

        bznetwork.textAdditionalAttribute (storeObject, svgText);
    
       // calling paths

        if (datajson.links == null) {
            datajson.links = []; 
        }

        datajson.links.forEach(function(link) {
                var sourceElement = d3.select("#" + link.sourceid);
                var targetElement = d3.select("#" + link.targetid);
                link.source = sourceElement.datum();
                link.target = targetElement.datum();
            });
            
            var pathSelection = pathGroup
                .selectAll("path")
                .data(datajson.links,  function(d, i) { return d.id;} );

            path = pathSelection    
                .enter().append("path")
                .attr("class", function(d) {
                    return "link " + d.type;
                })
                .attr("stroke", function(d) {
                    return d.stroke;
                })
                .attr("id", d => d.id)            
                .attr("sourceid", function(d) {
                    return d.sourceid;
                })
                .attr("targetid", function(d) {
                    return d.targetid;
                })
                .attr("marker-end", function(d) {
                    return "url(#" + d.type + ")";
                })
                .on('mouseout', function(d) { // hide the div
                    var showPathToolTip = component.get("v.showPathToolTip"); 
                    if (showPathToolTip) {
                        bznetwork.pathMouseout(pathToolTipDiv);
                    }
                })
                .on('mouseover', $A.getCallback(function(d) { 
                    var showPathToolTip = component.get("v.showPathToolTip"); 
                    console.log("showPathToolTip: " + showPathToolTip);
                    if (showPathToolTip) {
                        bznetwork.pathMouseover(d, path, pathToolTipDiv);
                    }
                }));

            // overwrite path with the updated version.
            path = d3.select("#" + pathGroupId).selectAll("path");
//        }
                
        console.log("apply node styling");
        var cc = component.getConcreteComponent();
        cc.styleNodes();                 

        console.log("apply node visibility");
        variantsMixin.refreshVisibility(storeObject);

        /* Above should be common to some degree - Below is forceSimulation specific */

        console.log("calling layout / simulation");

        // var forceNodes = {"nodes": [] };
        // var nodey4 = d3.select("#" + nodeGroupId).selectAll("circle")  
        // .each(function(d) {
        // // your update code here as it was in your example
        //     var d3this = d3.select(this) // Transform to d3 Object - THIS COULD BE MY ANSWER TO EVERYTHING
        //     forceNodes["nodes"].push(d3this);
        // });

        bznetwork.runSimulation(storeObject, path, node, text);                 
        
// GARBAGE AFTER HERE - experiments

/*
        //var nodeGroupId = chartSVGId + "nodeGroup";
        var nodey4 = d3.select("#" + nodeGroupId).selectAll("circle")  
        .each(function(d) {
        // your update code here as it was in your example
            var d3this = d3.select(this) // Transform to d3 Object - THIS COULD BE MY ANSWER TO EVERYTHING
            console.log("ThisNode");
            console.log(d);
            d3this.attr("testAttribute" , "yay");
        });

        var pathy4 = d3.select("#" + pathGroupId).selectAll("path")  
        .each(function(d) {
        // your update code here as it was in your example
            var d3this = d3.select(this) // Transform to d3 Object - THIS COULD BE MY ANSWER TO EVERYTHING
            console.log("ThisPath");
            console.log(d);
            d3this.attr("testAttribute" , "yay");
        });
*/        
    },

    // unsophisticated version is to remove everything and re-initialize
    refreshDataHelper: function (component, datajsonRefresh, primaryNodeId, showFilters) {
        var _this = this;
        let storeObject = component.get("v.storeObject");
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
        _this.initializeGroups(component, datajson, primaryNodeId, showFilters, isInit);                 

        var cc = component.getConcreteComponent();
        cc.initializeVisuals();
    }
        
})