({

    initializeData: function (component, datajson, currentMeasure, primaryNodeId, showFilters, isInit) {

        var _this = this;
        var componentReference = component.get("v.componentReference");
        var componentType = bzutils.getCache (componentReference, "componentType");

        console.log("chart: componentType: " + componentType);

        var hasNodes = bzutils.hasParam(componentType, "node");
        var hasPaths = bzutils.hasParam(componentType, "path");
        var hasText = bzutils.hasParam(componentType, "text");
        bzutils.setCache (componentReference, "hasNodes", hasNodes ) ;
        bzutils.setCache (componentReference, "hasPaths", hasPaths ) ;
        bzutils.setCache (componentReference, "hasText", hasText ) ;
        var node = {};     
        var text = {};     
        var path = {};     

        console.log("hasParam: hasNodes/hasPaths/hasText =  " + hasNodes + "/"  + hasPaths + "/"  + hasText);


        console.log("init:initializing initializeData with primaryNodeId: " + primaryNodeId);
        
        if (isInit) {
            bzutils.initializeAddComponentRef(componentReference, datajson);
        }

        bzutils.setCache (componentReference, "datajson", datajson ) ;

        var hasPrimaryNode = bzutils.getCache (componentReference, "hasPrimaryNode") ;
        if (hasPrimaryNode == true) {
            primaryNodeId = bzutils.addComponentRef(componentReference, primaryNodeId);
            bzutils.setCache (componentReference, "primaryNodeId", primaryNodeId ) ;
        }

        bzutils.setCache (componentReference, "currentMeasure", currentMeasure ) ;
        bzutils.setCache (componentReference, "showFilters", showFilters ) ;

        var svg = d3.select(bzutils.getDivId("svg", componentReference, true));
        
        // Styling of tooltips - see GitHub prior to Feb 24, 2018
        var nodeToolTipDiv = d3.select("#nodeToolTip");
        var pathToolTipDivId = bzutils.addComponentRef(componentReference, "pathToolTip");
        var pathToolTipDiv = d3.select("#" + pathToolTipDivId);

        var isRefresh = false;
        
        console.log("create some groups inside the svg element to store the raw data");


        var pathGroupId = bzutils.getDivId("pathGroup", componentReference, false);
        var nodeGroupId = bzutils.getDivId("nodeGroup", componentReference, false);
        var textGroupId = bzutils.getDivId("textGroup", componentReference, false);
        
        var pathGroup = d3.select("#" + pathGroupId);
        if (pathGroup.empty()) {
            console.log("create pathGroup");
            pathGroup = svg.append("g").attr("id",pathGroupId);
        }

        var nodeGroup = d3.select("#" + nodeGroupId);
        if (nodeGroup.empty()) {
            console.log("create nodeGroup");
            nodeGroup = svg.append("g").attr("id",nodeGroupId);
        }

        var textGroup = d3.select("#" + textGroupId);
        if (textGroup.empty()) {
            console.log("create textGroup");
            textGroup = svg.append("svg:g").attr("id",textGroupId);
        }

        // console.log("PreProcess data");
        // datajson = bzutils.xfcr("dataPreProcess", componentReference, datajson); // preprocessing of data (if any)

        // use the name convention from d3 tutorials (e.g. http://www.puzzlr.org/force-directed-graph-minimal-working-example/)
        // variables called simulation, node, path

        // Not used but an alternative way to get node / path values
        // var node = d3.select("#" + nodeGroupId).selectAll("circle")  ;
        // var path = d3.select("#" + pathGroupId).selectAll("path")  ;
        
        console.log("calling nodes");

        var nodeSelector = bzutils.getParam(componentType, "node", "selector"); // an html selector for a class or element ids
        var nodeDataSetFunction = bzutils.xfcr("nodeDataSetFunction", componentReference); // an html selector for a class or element ids
        var nodeDataKeyFunction = bzutils.xfcr("nodeDataKeyFunction", componentReference); // an html selector for a class or element ids
        
        var nodeEnterSelection = nodeGroup
            .selectAll(nodeSelector)
            .data(nodeDataSetFunction(datajson), nodeDataKeyFunction)
            .enter();

//        nodeSelection.exit().remove();    


        if (hasNodes) {
            node = nodeEnterSelection
                .append(bzutils.getParam(componentType, "node", "appendType"))
                .attr("id", function(d) {
                    return d.id;
                })
                // symbols...           .attr("d", d3.symbol().type( function(d) { return d3.symbols[4];}))
                .on('mouseout', function(d) { // hide the div
                    var retainNodeDetailsMouseOut = bzutils.getCache (componentReference, "retainNodeDetailsMouseOut" ) ;
                    if (!retainNodeDetailsMouseOut)
                    {
                        bzutils.xfcr("nodeMouseout", componentReference, d); // an html selector for a class or element ids
                    }
                })
                .on('mouseover', $A.getCallback(function(d) { // need getCallback to retain context - https://salesforce.stackexchange.com/questions/158422/a-get-for-application-event-is-undefined-or-can-only-fire-once
                    bzutils.setCache (componentReference, "mouseoverRecordId", d.id ) ;
                    bzutils.xfcr("nodeMouseover", componentReference, d); 
                }))
                .on('click', function(d) {
                    console.log("retrieve info on whether isiOS");
                    var isiOS = bzchart.isiOS;
                    if (isiOS) {
                        var now = new Date().getTime();
                        var lastTouch = bzutils.getCache (componentReference, "lastTouch");
                        var delta = now - lastTouch;
                        if (delta < 350 && delta > 0) {
                            // the second touchend event happened within half a second. Here is where we invoke the double tap code
                            //TODO implement - e.g. var win = window.open("http://news.bbc.co.uk"); win.focus();
                        }
                        bzutils.setCache (componentReference, "lastTouch", lastTouch) ;
                    } else {
                        console.log("not iOS");
                    }
                    // reset the clicked node to be the primary
                    // TODO This will need to be passed in the refreshVisibility call.
                    var primaryNodeId = d.id;
                    bzutils.setCache (componentReference, "primaryNodeId", primaryNodeId ) ;

                    bzutils.xfcr("refreshVisibility", componentReference); 
                    bzutils.xfcr("styleNodes", componentReference); 
                })
                .on('dblclick', $A.getCallback(function(d) {
                    console.log("dblclick");
                    // Two options - complete refresh OR keep and get data from this point?
                    // send a message identifying the node in question
                    var componentReference = component.get("v.componentReference");
                    var primaryNodeId = d.id;
                    bzutils.setCache (componentReference, "primaryNodeId", primaryNodeId ) ;
                    bzutils.xfcr("nodeDoubleClick", componentReference, primaryNodeId); 
                }))
                ;

            var nodeAdditionalAttribute = bzutils.xfcr("nodeAdditionalAttribute", componentReference, node); // an html selector for a class or element ids

        }

        console.log("calling text");    
    
        if (hasText) {

            // pick up the text styling
            var hasShadow = bzutils.hasParam(componentType, "node", "styleclassTextShadow");
            var styleclassText = bzutils.getParam(componentType, "node", "styleclassText");
            var styleclassTextShadow = bzutils.getParam(componentType, "node", "styleclassTextShadow");

            var textEnterSelection = textGroup
                .selectAll("g")
                .data(datajson.nodes,  function(d, i) { return d.id;} )
                .enter();
            
            text = textEnterSelection
                .append("svg:g")
                .attr("class", "nodeText"); // TODO what is nodeText class

            if (hasShadow == true) {                
                // A copy of the text with a thick white stroke for legibility ("s" for shadow, "t" for text).
                var svgText = text.append("svg:text");
                svgText.attr("id", function(d) {
                        return "s" + d.id;
                    })
                    .text(function(d) {
                        return d.name;
                    })
                    .attr("class", styleclassTextShadow) // shadow class
                    // .attr("x", 8)
                    // .attr("y", ".31em");
                bzutils.xfcr("textAdditionalAttribute", componentReference, svgText); // an html selector for a class or element ids
            }

            var svgText = text.append("svg:text");
            svgText.attr("id", function(d) {
                    return "t" + d.id;
                })
                .text(function(d) {
                    return d.name;
                })
                .attr("class", styleclassText) 
                // .attr("x", 8)
                // .attr("y", ".31em");

            bzutils.xfcr("textAdditionalAttribute", componentReference, svgText); // an html selector for a class or element ids
    
        }

        console.log("calling paths");

        if (!hasPaths) {
            datajson.links = []; 
        }

//        if (hasPaths) {
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
                .attr("id", function(d) {
                    return d.id;
                })
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
                    var showPathToolTip = bzutils.getCache (componentReference, "showPathToolTip"); 
                    if (showPathToolTip) {
                        bzutils.xfcr("pathMouseout", componentReference, pathToolTipDiv); 
                    }
                })
                .on('mouseover', $A.getCallback(function(d) { 
                    var showPathToolTip = bzutils.getCache (componentReference, "showPathToolTip") ;
                    console.log("showPathToolTip: " + showPathToolTip);
                    if (showPathToolTip) {
                        bzutils.xfcr("pathMouseover", componentReference, d, path, pathToolTipDiv); 
                    }
                }));

            // overwrite path with the updated version.
            path = d3.select("#" + pathGroupId).selectAll("path");
//        }
                
        console.log("apply node styling");
        bzutils.xfcr("styleNodes", componentReference); 

        console.log("apply node visibility");
        bzutils.xfcr("refreshVisibility", componentReference); 
    
        /* Above should be common to some degree - Below is forceSimulation specific */

        console.log("calling layout / simulation");

        // var forceNodes = {"nodes": [] };
        // var nodey4 = d3.select("#" + nodeGroupId).selectAll("circle")  
        // .each(function(d) {
        // // your update code here as it was in your example
        //     var d3this = d3.select(this) // Transform to d3 Object - THIS COULD BE MY ANSWER TO EVERYTHING
        //     forceNodes["nodes"].push(d3this);
        // });

        bzutils.xfcr("runSimulation", componentReference, path, node, text ); 
        
        bzutils.showCache (componentReference) ;
        
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



})