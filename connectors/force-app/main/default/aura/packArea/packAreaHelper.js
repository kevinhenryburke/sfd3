({

    // first method called after all resources are ready
    doneRenderLoad: function (component) {
        var _this = this;
        console.log("chartArea: doneRenderLoad enter");
        var componentReference = component.get("v.componentReference");

        berlioz.utils.initializeCache (componentReference) ;

        berlioz.utils.setCache (componentReference, "componentReference", component.get("v.componentReference") ) ;
        berlioz.utils.setCache (componentReference, "componentType", component.get("v.componentType") ) ;

        berlioz.utils.setCache (componentReference, "UserComponentId", component.get("v.UserComponentId") ) ;
        berlioz.utils.setCache (componentReference, "UserControllerComponentId", component.get("v.UserControllerComponentId") ) ;
        berlioz.utils.setCache (componentReference, "primaryNodeHighlightingOn", component.get("v.primaryNodeHighlightingOn") ) ;
        berlioz.utils.setCache (componentReference, "primaryNodeHighlightingColour", component.get("v.primaryNodeHighlightingColour") ) ;
        berlioz.utils.setCache (componentReference, "primaryNodeHighlightingRadius", component.get("v.primaryNodeHighlightingRadius") ) ;
        berlioz.utils.setCache (componentReference, "retainNodeDetailsMouseOut", component.get("v.retainNodeDetailsMouseOut") ) ;
        berlioz.utils.setCache (componentReference, "showPathToolTip", component.get("v.showPathToolTip") ) ;
        berlioz.utils.setCache (componentReference, "nodestrokewidth", component.get("v.nodestrokewidth") ) ;
        berlioz.utils.setCache (componentReference, "showLevels", component.get("v.showLevelsInitial")) ;

        berlioz.utils.setCache (componentReference, "lastTouch", new Date().getTime()) ;
        berlioz.utils.setCache (componentReference, "width", Math.min(screen.width, screen.height)) ; // review this
        berlioz.utils.setCache (componentReference, "height", Math.min(screen.width, screen.height)) ; // review this

        var flexiWidth = component.get("v.flexiWidth");
        console.log("flexiWidth: " + flexiWidth);

        if (flexiWidth == null) {
            // this is the case when not embedded in a Lightning Page - e.g. in aura preview
            flexiWidth = "LARGE";
            console.log("defaulting flexiWidth: " + flexiWidth);
        }

        if (flexiWidth == "SMALL")
        {
            // need to check all the numbers here
            berlioz.utils.setCache (componentReference, "width", 420) ; 
            berlioz.utils.setCache (componentReference, "height", 800) ;                 
        }

        if (flexiWidth == "MEDIUM")
        {
            // need to check all the numbers here
            berlioz.utils.setCache (componentReference, "width", 600) ; 
            berlioz.utils.setCache (componentReference, "height", 800) ;                 
        }

        if (flexiWidth == "LARGE")
        {
            // need to check all the numbers here
            berlioz.utils.setCache (componentReference, "width", 1000) ; 
            berlioz.utils.setCache (componentReference, "height", 800) ;                 
        }
        
        d3.select(berlioz.utils.getDivId("chartArea", componentReference, true))
            .append("svg")
            .attr("id", berlioz.utils.getDivId("svg", componentReference, false)) // If putting more than one chart on a page we need to provide unique ids for the svg elements   
            .attr("width", berlioz.utils.getCache (componentReference, "width") )
            .attr("height", berlioz.utils.getCache (componentReference, "height") );

        var agent = navigator.userAgent.toLowerCase();
        if(agent.indexOf('iphone') >= 0 || agent.indexOf('ipad') >= 0){
            berlioz.chart.isiOS = true;
            component.set("v.isiOS", true);
        }
        else {
            berlioz.chart.isiOS = false;
        }
        
        var eventParameters = { 
            "componentReference" : componentReference
        }    
        berlioz.chart.publishEvent(componentReference, "ChartRendered", eventParameters);

        console.log("chartArea: doneRenderLoad exit");

    },

    
    initializeData: function (component, datajson, currentMeasure, primaryNodeId, showFilters, isInit) {

        var _this = this;
        var componentReference = component.get("v.componentReference");

        console.log("init:initializing initializeData with primaryNodeId: " + primaryNodeId);
        
        if (isInit) {
            berlioz.utils.initializeAddComponentRef(componentReference, datajson);
        }

        berlioz.utils.setCache (componentReference, "datajson", datajson ) ;

        primaryNodeId = berlioz.utils.addComponentRef(componentReference, primaryNodeId);

        berlioz.utils.setCache (componentReference, "currentMeasure", currentMeasure ) ;
        berlioz.utils.setCache (componentReference, "primaryNodeId", primaryNodeId ) ;
        berlioz.utils.setCache (componentReference, "showFilters", showFilters ) ;

        var svg = d3.select(berlioz.utils.getDivId("svg", componentReference, true));
        
        // Styling of tooltips - see GitHub prior to Feb 24, 2018
        var nodeToolTipDiv = d3.select("#nodeToolTip");
        var pathToolTipDivId = berlioz.utils.addComponentRef(componentReference, "pathToolTip");
        var pathToolTipDiv = d3.select("#" + pathToolTipDivId);

        var isRefresh = false;
        
        console.log("create some groups inside the svg element to store the raw data");

        var pathGroupId = berlioz.utils.getDivId("pathGroup", componentReference, false);
        var nodeGroupId = berlioz.utils.getDivId("nodeGroup", componentReference, false);
        var textGroupId = berlioz.utils.getDivId("textGroup", componentReference, false);
        
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

        // starting by here 

        // TODO ths should be fed in via datajson in method signature.
        var datajson = _this.getJson();
            
        var nodeSelector = berlioz.utils.r1("nodeSelector", componentReference); // an html selector for a class or element ids
        var nodeDataSetFunction = berlioz.utils.r1("nodeDataSetFunction", componentReference); // returns an anonymous function
        var nodeDataKeyFunction = berlioz.utils.r1("nodeDataKeyFunction", componentReference); // returns an anonymous function

        console.log("pack nodeSelector: " + nodeSelector);            

        var nodeEnterSelection = nodeGroup
            .selectAll(nodeSelector)
            .data(nodeDataSetFunction(datajson), nodeDataKeyFunction)
            .enter();
            
        var node = nodeEnterSelection     
            .append("g")
            .attr("transform", "translate(2,2)") // new
            .attr("class", function(d) { return d.children ? "node" : "leaf node"; })
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
    
        var format = d3.format(",d");
        node.append("title")
            .text(function(d) { return d.data.name + "\n" + format(d.value); });
    
        node.append("circle")
            .attr("r", function(d) { return d.r; });
    
        node.filter(function(d) { return !d.children; }).append("text")
            .attr("dy", "0.3em")
            .text(function(d) { return d.data.name.substring(0, d.r / 3); });



        node.attr("id", function(d) {
                return d.id;
            })
            // symbols...           .attr("d", d3.symbol().type( function(d) { return d3.symbols[4];}))
            .on('mouseout', function(d) { // hide the div
                var retainNodeDetailsMouseOut = berlioz.utils.getCache (componentReference, "retainNodeDetailsMouseOut" ) ;
                if (!retainNodeDetailsMouseOut)
                {
                    berlioz.utils.r1("nodeMouseout", d); 
                }
            })
            // .on('mouseover', $A.getCallback(function(d) { // need getCallback to retain context - https://salesforce.stackexchange.com/questions/158422/a-get-for-application-event-is-undefined-or-can-only-fire-once
            //     berlioz.utils.setCache (componentReference, "mouseoverRecordId", d.id ) ;
            //     berlioz.utils.r2("nodeMouseover", componentReference, d); 
            // }))
            .on('click', function(d) {
                console.log("retrieve info on whether isiOS");
                var isiOS = berlioz.chart.isiOS;
                if (isiOS) {
                    var now = new Date().getTime();
                    var lastTouch = berlioz.utils.getCache (componentReference, "lastTouch");
                    var delta = now - lastTouch;
                    if (delta < 350 && delta > 0) {
                        // the second touchend event happened within half a second. Here is where we invoke the double tap code
                        //TODO implement - e.g. var win = window.open("http://news.bbc.co.uk"); win.focus();
                    }
                    berlioz.utils.setCache (componentReference, "lastTouch", lastTouch) ;
                } else {
                    console.log("not iOS");
                }
                // reset the clicked node to be the primary
                // TODO This will need to be passed in the refreshVisibility call.
                var primaryNodeId = d.id;
                berlioz.utils.setCache (componentReference, "primaryNodeId", primaryNodeId ) ;

                berlioz.utils.r1("refreshVisibility", componentReference); 
                berlioz.utils.r1("styleNodes", componentReference); 
            })
            // .on('dblclick', $A.getCallback(function(d) {
            //     console.log("dblclick");
            //     // Two options - complete refresh OR keep and get data from this point?
            //     // send a message identifying the node in question
            //     var componentReference = component.get("v.componentReference");
            //     var primaryNodeId = d.id;
            //     berlioz.utils.setCache (componentReference, "primaryNodeId", primaryNodeId ) ;
            //     berlioz.utils.r2("nodeDoubleClick", componentReference, primaryNodeId); 
            // }))
            ;




/*
            var nodeSelection = nodeGroup
            .selectAll("circle")
            .data(datajson.nodes,  function(d, i) { return d.id;} );

//        nodeSelection.exit().remove();    

        var node = nodeSelection     
            .enter().append("circle")
            // set data related attributes - visual styling is applied later
            .attr("id", function(d) {
                return d.id;
            })
            // symbols...           .attr("d", d3.symbol().type( function(d) { return d3.symbols[4];}))
            .on('mouseout', function(d) { // hide the div
                var retainNodeDetailsMouseOut = berlioz.utils.getCache (componentReference, "retainNodeDetailsMouseOut" ) ;
                if (!retainNodeDetailsMouseOut)
                {
                    berlioz.utils.r1("nodeMouseout", d); 
                }
            })
            .on('mouseover', $A.getCallback(function(d) { // need getCallback to retain context - https://salesforce.stackexchange.com/questions/158422/a-get-for-application-event-is-undefined-or-can-only-fire-once
                berlioz.utils.setCache (componentReference, "mouseoverRecordId", d.id ) ;
                berlioz.utils.r2("nodeMouseover", componentReference, d); 
            }))
            .on('click', function(d) {
                console.log("retrieve info on whether isiOS");
                var isiOS = berlioz.chart.isiOS;
                if (isiOS) {
                    var now = new Date().getTime();
                    var lastTouch = berlioz.utils.getCache (componentReference, "lastTouch");
                    var delta = now - lastTouch;
                    if (delta < 350 && delta > 0) {
                        // the second touchend event happened within half a second. Here is where we invoke the double tap code
                        //TODO implement - e.g. var win = window.open("http://news.bbc.co.uk"); win.focus();
                    }
                    berlioz.utils.setCache (componentReference, "lastTouch", lastTouch) ;
                } else {
                    console.log("not iOS");
                }
                // reset the clicked node to be the primary
                // TODO This will need to be passed in the refreshVisibility call.
                var primaryNodeId = d.id;
                berlioz.utils.setCache (componentReference, "primaryNodeId", primaryNodeId ) ;

                berlioz.utils.r1("refreshVisibility", componentReference); 
                berlioz.utils.r1("styleNodes", componentReference); 
            })
            .on('dblclick', $A.getCallback(function(d) {
                console.log("dblclick");
                // Two options - complete refresh OR keep and get data from this point?
                // send a message identifying the node in question
                var componentReference = component.get("v.componentReference");
                var primaryNodeId = d.id;
                berlioz.utils.setCache (componentReference, "primaryNodeId", primaryNodeId ) ;
                berlioz.utils.r2("nodeDoubleClick", componentReference, primaryNodeId); 
            }));
*/










        berlioz.utils.showCache (componentReference) ;
        
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

