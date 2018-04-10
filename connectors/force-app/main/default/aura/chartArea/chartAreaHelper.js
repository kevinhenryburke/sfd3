({

    // first method called after all resources are ready
    doneRenderLoad: function (component) {
        var _this = this;
        console.log("chartArea: doneRenderLoad enter");
        var componentReference = component.get("v.componentReference");

        bzutils.initializeCache (componentReference) ;

        bzutils.setCache (componentReference, "componentReference", component.get("v.componentReference") ) ;
        bzutils.setCache (componentReference, "componentType", component.get("v.componentType") ) ;
        bzutils.setCache (componentReference, "componentCategory", component.get("v.componentCategory") ) ;

        bzutils.setCache (componentReference, "UserComponentId", component.get("v.UserComponentId") ) ;
        bzutils.setCache (componentReference, "UserControllerComponentId", component.get("v.UserControllerComponentId") ) ;
        bzutils.setCache (componentReference, "primaryNodeHighlightingOn", component.get("v.primaryNodeHighlightingOn") ) ;
        bzutils.setCache (componentReference, "primaryNodeHighlightingColour", component.get("v.primaryNodeHighlightingColour") ) ;
        bzutils.setCache (componentReference, "primaryNodeHighlightingRadius", component.get("v.primaryNodeHighlightingRadius") ) ;
        bzutils.setCache (componentReference, "retainNodeDetailsMouseOut", component.get("v.retainNodeDetailsMouseOut") ) ;
        bzutils.setCache (componentReference, "showPathToolTip", component.get("v.showPathToolTip") ) ;
        bzutils.setCache (componentReference, "nodestrokewidth", component.get("v.nodestrokewidth") ) ;
        bzutils.setCache (componentReference, "showLevels", component.get("v.showLevelsInitial")) ;

        bzutils.setCache (componentReference, "lastTouch", new Date().getTime()) ;
        bzutils.setCache (componentReference, "width", Math.min(screen.width, screen.height)) ; // review this
        bzutils.setCache (componentReference, "height", Math.min(screen.width, screen.height)) ; // review this

        var flexiWidth = component.get("v.flexiWidth");
        console.log("flexiWidth: " + flexiWidth);

        if (flexiWidth == null) {
            // this is the case when not embedded in a Lightning Page - e.g. in aura preview
            flexiWidth = "MEDIUM";
            console.log("defaulting flexiWidth: " + flexiWidth);
        }

        if (flexiWidth == "SMALL")
        {
            // need to check all the numbers here
            bzutils.setCache (componentReference, "width", 420) ; 
            bzutils.setCache (componentReference, "height", 800) ;                 
        }

        if (flexiWidth == "MEDIUM")
        {
            // need to check all the numbers here
            bzutils.setCache (componentReference, "width", 600) ; 
            bzutils.setCache (componentReference, "height", 800) ;                 
        }

        if (flexiWidth == "LARGE")
        {
            // need to check all the numbers here
            bzutils.setCache (componentReference, "width", 1000) ; 
            bzutils.setCache (componentReference, "height", 800) ;                 
        }
        
        d3.select(bzutils.getDivId("chartArea", componentReference, true))
            .append("svg")
            .attr("id", bzutils.getDivId("svg", componentReference, false)) // If putting more than one chart on a page we need to provide unique ids for the svg elements   
            .attr("width", bzutils.getCache (componentReference, "width") )
            .attr("height", bzutils.getCache (componentReference, "height") );

        var agent = navigator.userAgent.toLowerCase();
        if(agent.indexOf('iphone') >= 0 || agent.indexOf('ipad') >= 0){
            bzchart.isiOS = true;
            component.set("v.isiOS", true);
        }
        else {
            bzchart.isiOS = false;
        }
        
        var eventParameters = { 
            "componentReference" : componentReference
        }    
        bzchart.publishEvent(componentReference, "ChartRendered", eventParameters);

        console.log("chartArea: doneRenderLoad exit");

    },

    // unsophisticated version is to remove everything and re-initialize
    refreshData: function (component, datajsonRefresh, currentMeasure, primaryNodeId, showFilters) {
        var _this = this;
        var componentReference = component.get("v.componentReference");
        console.log("chartArea: enter refreshData with primaryNodeId: " + primaryNodeId);

        // delete the paths and the groups
        // this is not the preferred option - would have preferred to use d3 joins.
        bzchart.clearChart(componentReference);
        
        // retrieve the existing underlying data
        var datajson = bzutils.getCache (componentReference, "datajson") ;

        // initialize the new raw data, setting component references
        bzutils.initializeAddComponentRef(componentReference, datajsonRefresh);

        // merge the old and the new data
        var nodeIds = [];
        datajson.nodes.forEach(function(node) {
            nodeIds.push(node["id"]);
        });        

        datajsonRefresh.nodes.forEach(function(node) {
            var indexer = nodeIds.indexOf(node["id"]);       
            if (indexer == -1) {     
                datajson["nodes"].push(node);
            }
        });

        var linkIds = [];
        datajson.links.forEach(function(link) {
            linkIds.push(link["id"]);
        });        
        
        datajsonRefresh.links.forEach(function(link) {
            datajson["links"].push(link);
        });

        // re-initialize the chart
        var isInit = false;
        _this.initializeData(component, datajson, currentMeasure, primaryNodeId, showFilters, isInit);                 
        
        console.log("chartArea: exit refreshData");
    },    
    
    initializeData: function (component, datajson, currentMeasure, primaryNodeId, showFilters, isInit) {

        var _this = this;
        var componentReference = component.get("v.componentReference");
        var componentType = bzutils.getCache (componentReference, "componentType");

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

        primaryNodeId = bzutils.addComponentRef(componentReference, primaryNodeId);

        bzutils.setCache (componentReference, "currentMeasure", currentMeasure ) ;
        bzutils.setCache (componentReference, "primaryNodeId", primaryNodeId ) ;
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

        // Generic up to this point - variation starts to come in here ....

        // TODO - this is temporary! perhaps turn this into a generic test data load (from static resource) mechanism.
        if (componentType == "pack") {
            datajson = _this.getJson();
        }
        
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
            text = textGroup
                .selectAll("g")
                .data(datajson.nodes,  function(d, i) { return d.id;} )
                .enter().append("svg:g")
                .attr("class", "nodeText");

            // A copy of the text with a thick white stroke for legibility ("s" for shadow, "t" for text).
            text.append("svg:text")
                .attr("x", 8)
                .attr("y", ".31em")
                .attr("class", "shadow") // shadow class
                .attr("id", function(d) {
                    return "s" + d.id;
                })
                .text(function(d) {
                    return d.name;
                });

            text.append("svg:text")
                .attr("x", 8)
                .attr("y", ".31em")
                .attr("id", function(d) {
                    return "t" + d.id;
                })
                .text(function(d) {
                    return d.name;
                });
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


    // ideally would prefer to put in Berlioz library but externals can't safely be called in doInit
    simpleHash : function(s) {
        var hash = 0;
        if (s.length == 0) {
            return hash;
        }
        for (var i = 0; i < s.length; i++) {
            var char = s.charCodeAt(i);
            hash = ((hash<<5)-hash)+char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    },    



// TODO here's the d3 nodes .... all in a line ... not proper code!
/*
var mdata = [0,1,2,3,4,5,6];

svg.selectAll('.symbol')
   .data(mdata)
   .enter()
   .append('path')
   .attr('transform',function(d,i) { return 'translate('+(i*20+20)+','+30+')';})
   .attr('d', d3.symbol().type( function(d,i) { return d3.symbols[i];}) );
*/

    // TODO ths should be fed in via datajson in method signature.
    getJson : function () {
        return {
            "id":"000000000000000000",
            "name":"flare",
            "children":[  
               {  
                  "id":"000000000000000000",
                  "name":"analytics",
                  "children":[  
                     {  
                        "id":"000000000000000000",
                        "name":"cluster",
                        "children":[  
                           {  
                              "id":"000000000000000000",
                              "name":"AgglomerativeCluster",
                              "size":3938
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"CommunityStructure",
                              "size":3812
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"HierarchicalCluster",
                              "size":6714
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"MergeEdge",
                              "size":743
                           }
                        ]
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"graph",
                        "children":[  
                           {  
                              "id":"000000000000000000",
                              "name":"BetweennessCentrality",
                              "size":3534
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"LinkDistance",
                              "size":5731
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"MaxFlowMinCut",
                              "size":7840
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"ShortestPaths",
                              "size":5914
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"SpanningTree",
                              "size":3416
                           }
                        ]
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"optimization",
                        "children":[  
                           {  
                              "id":"000000000000000000",
                              "name":"AspectRatioBanker",
                              "size":7074
                           }
                        ]
                     }
                  ]
               },
               {  
                  "id":"000000000000000000",
                  "name":"animate",
                  "children":[  
                     {  
                        "id":"000000000000000000",
                        "name":"Easing",
                        "size":17010
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"FunctionSequence",
                        "size":5842
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"interpolate",
                        "children":[  
                           {  
                              "id":"000000000000000000",
                              "name":"ArrayInterpolator",
                              "size":1983
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"ColorInterpolator",
                              "size":2047
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"DateInterpolator",
                              "size":1375
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"Interpolator",
                              "size":8746
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"MatrixInterpolator",
                              "size":2202
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"NumberInterpolator",
                              "size":1382
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"ObjectInterpolator",
                              "size":1629
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"PointInterpolator",
                              "size":1675
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"RectangleInterpolator",
                              "size":2042
                           }
                        ]
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"ISchedulable",
                        "size":1041
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"Parallel",
                        "size":5176
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"Pause",
                        "size":449
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"Scheduler",
                        "size":5593
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"Sequence",
                        "size":5534
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"Transition",
                        "size":9201
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"Transitioner",
                        "size":19975
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"TransitionEvent",
                        "size":1116
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"Tween",
                        "size":6006
                     }
                  ]
               },
               {  
                  "id":"000000000000000000",
                  "name":"data",
                  "children":[  
                     {  
                        "id":"000000000000000000",
                        "name":"converters",
                        "children":[  
                           {  
                              "id":"000000000000000000",
                              "name":"Converters",
                              "size":721
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"DelimitedTextConverter",
                              "size":4294
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"GraphMLConverter",
                              "size":9800
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"IDataConverter",
                              "size":1314
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"JSONConverter",
                              "size":2220
                           }
                        ]
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"DataField",
                        "size":1759
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"DataSchema",
                        "size":2165
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"DataSet",
                        "size":586
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"DataSource",
                        "size":3331
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"DataTable",
                        "size":772
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"DataUtil",
                        "size":3322
                     }
                  ]
               },
               {  
                  "id":"000000000000000000",
                  "name":"display",
                  "children":[  
                     {  
                        "id":"000000000000000000",
                        "name":"DirtySprite",
                        "size":8833
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"LineSprite",
                        "size":1732
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"RectSprite",
                        "size":3623
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"TextSprite",
                        "size":10066
                     }
                  ]
               },
               {  
                  "id":"000000000000000000",
                  "name":"flex",
                  "children":[  
                     {  
                        "id":"000000000000000000",
                        "name":"FlareVis",
                        "size":4116
                     }
                  ]
               },
               {  
                  "id":"000000000000000000",
                  "name":"physics",
                  "children":[  
                     {  
                        "id":"000000000000000000",
                        "name":"DragForce",
                        "size":1082
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"GravityForce",
                        "size":1336
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"IForce",
                        "size":319
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"NBodyForce",
                        "size":10498
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"Particle",
                        "size":2822
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"Simulation",
                        "size":9983
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"Spring",
                        "size":2213
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"SpringForce",
                        "size":1681
                     }
                  ]
               },
               {  
                  "id":"000000000000000000",
                  "name":"query",
                  "children":[  
                     {  
                        "id":"000000000000000000",
                        "name":"AggregateExpression",
                        "size":1616
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"And",
                        "size":1027
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"Arithmetic",
                        "size":3891
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"Average",
                        "size":891
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"BinaryExpression",
                        "size":2893
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"Comparison",
                        "size":5103
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"CompositeExpression",
                        "size":3677
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"Count",
                        "size":781
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"DateUtil",
                        "size":4141
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"Distinct",
                        "size":933
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"Expression",
                        "size":5130
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"ExpressionIterator",
                        "size":3617
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"Fn",
                        "size":3240
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"If",
                        "size":2732
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"IsA",
                        "size":2039
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"Literal",
                        "size":1214
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"Match",
                        "size":3748
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"Maximum",
                        "size":843
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"methods",
                        "children":[  
                           {  
                              "id":"000000000000000000",
                              "name":"add",
                              "size":593
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"and",
                              "size":330
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"average",
                              "size":287
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"count",
                              "size":277
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"distinct",
                              "size":292
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"div",
                              "size":595
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"eq",
                              "size":594
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"fn",
                              "size":460
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"gt",
                              "size":603
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"gte",
                              "size":625
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"iff",
                              "size":748
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"isa",
                              "size":461
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"lt",
                              "size":597
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"lte",
                              "size":619
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"max",
                              "size":283
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"min",
                              "size":283
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"mod",
                              "size":591
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"mul",
                              "size":603
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"neq",
                              "size":599
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"not",
                              "size":386
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"or",
                              "size":323
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"orderby",
                              "size":307
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"range",
                              "size":772
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"select",
                              "size":296
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"stddev",
                              "size":363
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"sub",
                              "size":600
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"sum",
                              "size":280
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"update",
                              "size":307
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"variance",
                              "size":335
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"where",
                              "size":299
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"xor",
                              "size":354
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"_",
                              "size":264
                           }
                        ]
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"Minimum",
                        "size":843
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"Not",
                        "size":1554
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"Or",
                        "size":970
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"Query",
                        "size":13896
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"Range",
                        "size":1594
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"StringUtil",
                        "size":4130
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"Sum",
                        "size":791
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"Variable",
                        "size":1124
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"Variance",
                        "size":1876
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"Xor",
                        "size":1101
                     }
                  ]
               },
               {  
                  "id":"000000000000000000",
                  "name":"scale",
                  "children":[  
                     {  
                        "id":"000000000000000000",
                        "name":"IScaleMap",
                        "size":2105
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"LinearScale",
                        "size":1316
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"LogScale",
                        "size":3151
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"OrdinalScale",
                        "size":3770
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"QuantileScale",
                        "size":2435
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"QuantitativeScale",
                        "size":4839
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"RootScale",
                        "size":1756
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"Scale",
                        "size":4268
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"ScaleType",
                        "size":1821
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"TimeScale",
                        "size":5833
                     }
                  ]
               },
               {  
                  "id":"000000000000000000",
                  "name":"util",
                  "children":[  
                     {  
                        "id":"000000000000000000",
                        "name":"Arrays",
                        "size":8258
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"Colors",
                        "size":10001
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"Dates",
                        "size":8217
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"Displays",
                        "size":12555
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"Filter",
                        "size":2324
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"Geometry",
                        "size":10993
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"heap",
                        "children":[  
                           {  
                              "id":"000000000000000000",
                              "name":"FibonacciHeap",
                              "size":9354
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"HeapNode",
                              "size":1233
                           }
                        ]
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"IEvaluable",
                        "size":335
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"IPredicate",
                        "size":383
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"IValueProxy",
                        "size":874
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"math",
                        "children":[  
                           {  
                              "id":"000000000000000000",
                              "name":"DenseMatrix",
                              "size":3165
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"IMatrix",
                              "size":2815
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"SparseMatrix",
                              "size":3366
                           }
                        ]
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"Maths",
                        "size":17705
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"Orientation",
                        "size":1486
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"palette",
                        "children":[  
                           {  
                              "id":"000000000000000000",
                              "name":"ColorPalette",
                              "size":6367
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"Palette",
                              "size":1229
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"ShapePalette",
                              "size":2059
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"SizePalette",
                              "size":2291
                           }
                        ]
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"Property",
                        "size":5559
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"Shapes",
                        "size":19118
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"Sort",
                        "size":6887
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"Stats",
                        "size":6557
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"Strings",
                        "size":22026
                     }
                  ]
               },
               {  
                  "id":"000000000000000000",
                  "name":"vis",
                  "children":[  
                     {  
                        "id":"000000000000000000",
                        "name":"axis",
                        "children":[  
                           {  
                              "id":"000000000000000000",
                              "name":"Axes",
                              "size":1302
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"Axis",
                              "size":24593
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"AxisGridLine",
                              "size":652
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"AxisLabel",
                              "size":636
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"CartesianAxes",
                              "size":6703
                           }
                        ]
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"controls",
                        "children":[  
                           {  
                              "id":"000000000000000000",
                              "name":"AnchorControl",
                              "size":2138
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"ClickControl",
                              "size":3824
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"Control",
                              "size":1353
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"ControlList",
                              "size":4665
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"DragControl",
                              "size":2649
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"ExpandControl",
                              "size":2832
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"HoverControl",
                              "size":4896
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"IControl",
                              "size":763
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"PanZoomControl",
                              "size":5222
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"SelectionControl",
                              "size":7862
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"TooltipControl",
                              "size":8435
                           }
                        ]
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"data",
                        "children":[  
                           {  
                              "id":"000000000000000000",
                              "name":"Data",
                              "size":20544
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"DataList",
                              "size":19788
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"DataSprite",
                              "size":10349
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"EdgeSprite",
                              "size":3301
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"NodeSprite",
                              "size":19382
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"render",
                              "children":[  
                                 {  
                                    "id":"000000000000000000",
                                    "name":"ArrowType",
                                    "size":698
                                 },
                                 {  
                                    "id":"000000000000000000",
                                    "name":"EdgeRenderer",
                                    "size":5569
                                 },
                                 {  
                                    "id":"000000000000000000",
                                    "name":"IRenderer",
                                    "size":353
                                 },
                                 {  
                                    "id":"000000000000000000",
                                    "name":"ShapeRenderer",
                                    "size":2247
                                 }
                              ]
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"ScaleBinding",
                              "size":11275
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"Tree",
                              "size":7147
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"TreeBuilder",
                              "size":9930
                           }
                        ]
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"events",
                        "children":[  
                           {  
                              "id":"000000000000000000",
                              "name":"DataEvent",
                              "size":2313
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"SelectionEvent",
                              "size":1880
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"TooltipEvent",
                              "size":1701
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"VisualizationEvent",
                              "size":1117
                           }
                        ]
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"legend",
                        "children":[  
                           {  
                              "id":"000000000000000000",
                              "name":"Legend",
                              "size":20859
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"LegendItem",
                              "size":4614
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"LegendRange",
                              "size":10530
                           }
                        ]
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"operator",
                        "children":[  
                           {  
                              "id":"000000000000000000",
                              "name":"distortion",
                              "children":[  
                                 {  
                                    "id":"000000000000000000",
                                    "name":"BifocalDistortion",
                                    "size":4461
                                 },
                                 {  
                                    "id":"000000000000000000",
                                    "name":"Distortion",
                                    "size":6314
                                 },
                                 {  
                                    "id":"000000000000000000",
                                    "name":"FisheyeDistortion",
                                    "size":3444
                                 }
                              ]
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"encoder",
                              "children":[  
                                 {  
                                    "id":"000000000000000000",
                                    "name":"ColorEncoder",
                                    "size":3179
                                 },
                                 {  
                                    "id":"000000000000000000",
                                    "name":"Encoder",
                                    "size":4060
                                 },
                                 {  
                                    "id":"000000000000000000",
                                    "name":"PropertyEncoder",
                                    "size":4138
                                 },
                                 {  
                                    "id":"000000000000000000",
                                    "name":"ShapeEncoder",
                                    "size":1690
                                 },
                                 {  
                                    "id":"000000000000000000",
                                    "name":"SizeEncoder",
                                    "size":1830
                                 }
                              ]
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"filter",
                              "children":[  
                                 {  
                                    "id":"000000000000000000",
                                    "name":"FisheyeTreeFilter",
                                    "size":5219
                                 },
                                 {  
                                    "id":"000000000000000000",
                                    "name":"GraphDistanceFilter",
                                    "size":3165
                                 },
                                 {  
                                    "id":"000000000000000000",
                                    "name":"VisibilityFilter",
                                    "size":3509
                                 }
                              ]
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"IOperator",
                              "size":1286
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"label",
                              "children":[  
                                 {  
                                    "id":"000000000000000000",
                                    "name":"Labeler",
                                    "size":9956
                                 },
                                 {  
                                    "id":"000000000000000000",
                                    "name":"RadialLabeler",
                                    "size":3899
                                 },
                                 {  
                                    "id":"000000000000000000",
                                    "name":"StackedAreaLabeler",
                                    "size":3202
                                 }
                              ]
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"layout",
                              "children":[  
                                 {  
                                    "id":"000000000000000000",
                                    "name":"AxisLayout",
                                    "size":6725
                                 },
                                 {  
                                    "id":"000000000000000000",
                                    "name":"BundledEdgeRouter",
                                    "size":3727
                                 },
                                 {  
                                    "id":"000000000000000000",
                                    "name":"CircleLayout",
                                    "size":9317
                                 },
                                 {  
                                    "id":"000000000000000000",
                                    "name":"CirclePackingLayout",
                                    "size":12003
                                 },
                                 {  
                                    "id":"000000000000000000",
                                    "name":"DendrogramLayout",
                                    "size":4853
                                 },
                                 {  
                                    "id":"000000000000000000",
                                    "name":"ForceDirectedLayout",
                                    "size":8411
                                 },
                                 {  
                                    "id":"000000000000000000",
                                    "name":"IcicleTreeLayout",
                                    "size":4864
                                 },
                                 {  
                                    "id":"000000000000000000",
                                    "name":"IndentedTreeLayout",
                                    "size":3174
                                 },
                                 {  
                                    "id":"000000000000000000",
                                    "name":"Layout",
                                    "size":7881
                                 },
                                 {  
                                    "id":"000000000000000000",
                                    "name":"NodeLinkTreeLayout",
                                    "size":12870
                                 },
                                 {  
                                    "id":"000000000000000000",
                                    "name":"PieLayout",
                                    "size":2728
                                 },
                                 {  
                                    "id":"000000000000000000",
                                    "name":"RadialTreeLayout",
                                    "size":12348
                                 },
                                 {  
                                    "id":"000000000000000000",
                                    "name":"RandomLayout",
                                    "size":870
                                 },
                                 {  
                                    "id":"000000000000000000",
                                    "name":"StackedAreaLayout",
                                    "size":9121
                                 },
                                 {  
                                    "id":"000000000000000000",
                                    "name":"TreeMapLayout",
                                    "size":9191
                                 }
                              ]
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"Operator",
                              "size":2490
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"OperatorList",
                              "size":5248
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"OperatorSequence",
                              "size":4190
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"OperatorSwitch",
                              "size":2581
                           },
                           {  
                              "id":"000000000000000000",
                              "name":"SortOperator",
                              "size":2023
                           }
                        ]
                     },
                     {  
                        "id":"000000000000000000",
                        "name":"Visualization",
                        "size":16540
                     }
                  ]
               }
            ]
         };
           



    }

})


    
