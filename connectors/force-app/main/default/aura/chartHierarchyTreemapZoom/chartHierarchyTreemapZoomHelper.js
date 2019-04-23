({

/*
Converting this to use a single object and hierarchy via picklists

if (!err) {
            console.log(res);
            var data = d3.nest().key(function(d) { return d.region; }).key(function(d) { return d.subregion; }).entries(res);
            main({title: "World Population"}, {key: "World", values: data});
        }

In the configuration, pull back only a single object level
in the role field put group0, group1 etc for our various layers

In buildMeasureSchemeMap create an array of groups (groupArray) ordered by level.
in each array element store the field name and the index of the group

Also will need to change the mouseover for these groups where there is no Salesforce record to display


In the zoom controller implement the following method dataPreprocess (started)

    dataPreprocess: function(component,event,helper){
        console.log("calling the aura:method dataPreprocess in chartHierarchyTreemapZoom");

        var args = event.getParam("arguments");
        var datajson = args.datajson;

        // need to check how long the groupArray is to determine how many levels to nest?
        // question - is it possible to iterate these calls to key - need to check d3.nest documentation
// answer - quite likely, see https://github.com/d3/d3-collection - 
// "Conceptually, this is similar to applying map.entries to the associative array returned by nest.map, but it applies to every level of the hierarchy rather than just the first (outermost) level. ""
        datajson = d3.nest()
            .key(function(d){ return d[groupArray[group0Index]]; }) // something like this....
            .key(function(d) { return d.subregion; }) // original ....
            .entries(datajson);
        component.set("v.datajson", datajson);
        helper.setStore (component, "datajson", datajson ) ;
    }





*/

    // I possiblly need to change the "displayed" rects around so that it's lower level not higher.
    // want the lowest level node text in the bottom right corner
    // want the lowest level node hover text to show
    // want the parent level text to show in the top left

    initializeVisuals: function (component) {
        console.log("chartHierarchyTreemapZoomHelper.initializeVisuals enter");
        var _this = this;
        let storeObject = component.get("v.storeObject");
        var componentReference = component.get("v.componentReference");

        var treemap;
        var transitioning;
        var grandparent;

        window.onerror = function (errorMsg, url, lineNumber, column, errorObj) {
            alert('Error: ' + errorMsg + ' Script: ' + url + ' Line: ' + lineNumber
                + ' Column: ' + column + ' StackTrace: ' + errorObj);
        }

        var datajson = _this.getStore(component, "datajson");

        var cc = component.getConcreteComponent();
        // dataPreprocess will set datajson in cache
        cc.dataPreprocess(datajson);

        let rootAfter = d3.hierarchy(_this.getStore (component, "datajson"))
            .eachBefore(function (d) {
                d.id = d.data.id;
            })
            .sum((d) =>  _this.getFromMeasureScheme(component, d, "Value"))
            .sort(function (a, b) {
                return b.value - a.value;
            });

        bzchart.setStore (storeObject, "d3root", rootAfter ) ;    

        var margin = { top: 20, right: 0, bottom: 0, left: 0 };
        var formatNumber = d3.format(",d");
        var grandparentDepthInData = 0;

        let nodeGroup = _this.getStore(component, "nodeGroup");
        var width = _this.getStore(component, "width") - margin.left - margin.right - 50; // TODO not great  
        var height = _this.getStore(component, "height") - margin.top - margin.bottom - 650;

        var x = d3.scaleLinear()
            .domain([0, width])
            .range([0, width]);

        var y = d3.scaleLinear()
            .domain([0, height])
            .range([0, height - margin.top]); // this is crucial, without substracting the margin.top the bottom cells fall over the line.

        var color = d3.scaleOrdinal(d3.schemeCategory20c);

        updateDrillDown();

        function updateDrillDown() {

            var svg = d3.select(_this.getDivId("svg", componentReference, true))
                .attr("width", width - margin.left - margin.right)
                .attr("height", height)
                .style("margin-left", -margin.left + "px")
                .style("margin.right", -margin.right + "px")
                ;

            // we move the nodeGroup down by margin.top to allow room for the grandparent with -ve y-axis            
            nodeGroup
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .style("shape-rendering", "crispEdges");

            // create a grandparent group and a rectangle and text within it
            grandparent = nodeGroup.append("g")
                .attr("class", "grandparent");

            // grandparent is given a negative y coordinate so main panel starts at zero    
            grandparent.append("rect")
                .attr("y", -margin.top)
                .attr("width", width)
                .attr("height", margin.top);

            grandparent.append("text")
                .attr("x", 6)
                .attr("y", 6 - margin.top)
                .attr("dy", ".75em");

            treemap = d3.treemap()
                .tile(d3.treemapResquarify)
                .size([width, height])
                .round(false)
                .paddingInner(0); // padding options explained at https://d3indepth.com/layouts/

            var root = _this.getStore (component, "d3root" );    

            initialize(root);
            accumulate(root);
            layout(root);
            treemap(root);
            display(root);

        };

        function initialize(root) {
            root.x = 0;
            root.y = 0;
            root.x1 = width;
            root.y1 = height;
            root.depth = 0;
        }

        // Aggregate the values for internal nodes. This is normally done by the
        // treemap layout, but not here because of our custom implementation.
        // We also take a snapshot of the original children (_children) to avoid
        // the children being overwritten when when layout is computed.
        function accumulate(d) {
            return (d._children = d.children)
                ? d.value = d.children.reduce(function (p, v) { return p + accumulate(v); }, 0)
                : d.value;
        }



        // Compute the treemap layout recursively such that each group of siblings
        // uses the same size (1×1) rather than the dimensions of the parent cell.
        // This optimizes the layout for the current zoom state. Note that a wrapper
        // object is created for the parent node for each group of siblings so that
        // the parent’s dimensions are not discarded as we recurse. Since each group
        // of sibling was laid out in 1×1, we must rescale to fit using absolute
        // coordinates. This lets us use a viewport to zoom.
        function layout(d) {
            if (d._children) {
                //    treemap.nodes({_children: d._children});
                // 	  treemap(d);

                d._children.forEach(function (c) {
                    c.x0 = d.x0 + c.x0 * d.x1;
                    c.y0 = d.y0 + c.y0 * d.y1;
                    c.x1 *= d.x1;
                    c.y1 *= d.y1;
                    c.parent = d;
                    layout(c);
                });
            }
        }

/* Aiming for a structure with two top level groups
1. Group with class="grandparent" which represents and element that sits on top
2. Group with class="depth" which is the parent group of all visible rectangles

Inside the depth construct we have
3. Groups with class="children" - these represent the top level visible rects. 

The "children" themselves have 
A rect element with class "parent" and a text element with class "ptext"
4. subgroups with class = "child" which contain the next level down

The "child" elements have
A rect element with class "child" and a text element with class "ctext"

Items below this depth do not have groups associated with them.

When you click to drill down the same structure is recreated started at the next data point.

*/

        function display(d) {

            // the top box
            grandparent
                .datum(d.parent)
                .on("click", transitionLower)
                .select("text")
                .text(displayNameValue(d));

            var grandparentgp = nodeGroup.insert("g", ".grandparent")
                .datum(d)
                .attr("class", "depth");

            var g = grandparentgp.selectAll("g")
                .data(d._children)
                .enter()
                .append("g");

            g.filter(function (d) { return d._children; })
                .classed("children", true)
                .on("click", transitionHigher);
                

            var children = g.selectAll(".child")
                .data(function (d) { return d._children || [d]; })
                .enter()
                .append("g");

            children.append("rect")
                .attr("class", "child")
                .call(rect)
                .append("title")
                .text(function (d) { 
                    console.log("xxxxx: highlight text: " , d.data.name, formatNumber(d.value));
                    return d.data.name + " (" + formatNumber(d.value) + ")"; });

            children.append("text")
                .attr("class", "ctext")
                .text(function (d) { return d.data.name; })
                .call(text2);

// TODO - although this is wrong ... it shows how to highlight on the chart itself!
// My issue is that most of the elements on the chart are coming through as parents
// Need to do something with the relative depth.

            g.append("rect")
                .attr("class", "parent")
                .call(rect)
                .append("title")
                .text(function (d) { 
                    console.log("xxxxx: highlight text: " , d.data.name, formatNumber(d.value));
                    return d.data.name + " (" + formatNumber(d.value) + ")"; })
                ;

            var t = g.append("text")
                .attr("class", "ptext")
                .attr("dy", ".75em")

            t.append("tspan")
                .text(function (d) { return d.data.name; });
            t.append("tspan")
                .attr("dy", "1.0em")
                .text(function (d) { return formatNumber(d.value); });
            t.call(text);

            g.selectAll("rect")
                .style("fill", d => color(d.data.name))
                .attr("id", d => d.id)
            ;

            g.selectAll("rect") // KB this is selecting all rects, can use rect.parent to select all the parents
                .on('mouseover', $A.getCallback(function (d) { // need getCallback to retain context - https://salesforce.stackexchange.com/questions/158422/a-get-for-application-event-is-undefined-or-can-only-fire-once
                    console.log("chartHierarchyTreemapZoomHelper.mouseover enter", d);
                    console.log("chartHierarchyTreemapZoomHelper.mouseover enter id ", d.id);
                    console.log("chartHierarchyTreemapZoomHelper.mouseover enter component ", component);
                    bzchart.setStore (storeObject, "mouseoverRecordId", d.id);
                    var preppedEvent = _this.nodeMouseover(component, d);
                    _this.publishPreppedEvent(component, preppedEvent);
                }))
            ;



            function transitionHigher(d) {
                console.log("xxxxx: transitionHigher before: " + grandparentDepthInData);
                grandparentDepthInData++;
                console.log("xxxxx: transitionHigher after: " + grandparentDepthInData);
                transition(d);
            }

            function transitionLower(d) {
                console.log("xxxxx: transitionLower before: " + grandparentDepthInData);
                grandparentDepthInData--;
                console.log("xxxxx: transitionLower after: " + grandparentDepthInData);
                transition(d);
            }

            function transition(d) {
                console.log("xxxxx: transitioning");
                if (transitioning || !d) return;
                transitioning = true;

                // assign the target state via display and set up the transitions.
                var parentsgp = display(d);
                var grandparenttransition = grandparentgp.transition().duration(750);
                var parentstransition = parentsgp.transition().duration(750);

                // Update the domain only after entering new elements.
                // The new domain focuses in on the area now in focus and blows that up to the whole canvas
                x.domain([d.x0, d.x1]);
                y.domain([d.y0, d.y1]);

                // Enable anti-aliasing during the transition.
                nodeGroup.style("shape-rendering", null);

                // Draw child nodes on top of parent nodes. (KB this is key, we draw on top by sorting the nodes in terms of depth
                nodeGroup.selectAll(".depth").sort(function (a, b) {
                    return a.depth - b.depth;
                });

                // Fade-in entering text.
                parentsgp.selectAll("text").style("fill-opacity", 0);

                // Transition to the new view.
                // select all the grandparent stuff and make it invisible
                // select all the parent stuff and make it visible
                grandparenttransition.selectAll(".ptext").call(text).style("fill-opacity", 0);
                grandparenttransition.selectAll(".ctext").call(text2).style("fill-opacity", 0);
                parentstransition.selectAll(".ptext").call(text).style("fill-opacity", 1).style("font-weight", "bold");
                parentstransition.selectAll(".ctext").call(text2).style("fill-opacity", 1);

                grandparenttransition.selectAll("rect").call(rect);
                parentstransition.selectAll("rect").call(rect);

                // Remove the old grandparent node when the transition is finished.
                grandparenttransition.remove().on("end", function () {
                    nodeGroup.style("shape-rendering", "crispEdges");
                    transitioning = false;
                });
            }

            return g;
        }

        // this is the top left text box
        function text(text) {
            text.selectAll("tspan")
                .attr("x", function (d) { return x(d.x0) + 6; })
            text.attr("x", function (d) { return x(d.x0) + 6; })
                .attr("y", function (d) { return y(d.y0) + 10; })
                .attr("font-size", "10px")
                .attr("fill", "black")
                .style("opacity", function (d) {
                    return this.getComputedTextLength() < x(d.x1) - x(d.x0) ? 1 : 0;
                });
        }

        // this is the bottom right text box
        function text2(text) {
            text.attr("x", function (d) { return x(d.x1) - this.getComputedTextLength() - 6; })
                .attr("y", function (d) {
                    return y(d.y1) - 6;
                })
                .style("opacity", function (d) { return this.getComputedTextLength() < x(d.x1) - x(d.x0) ? 0.7 : 0; })
                .attr("font-size", "10px")
                .attr("fill", "black");

        }

        // this is any rectangle
        function rect(rect) {
            rect.attr("x", function (d) {
                console.log("xxxxx depth:" + d.depth);
                return x(d.x0);
            })
                .attr("y", (d) => y(d.y0))
                .attr("width", (d) => x(d.x1) - x(d.x0))  
                .attr("height", (d) => y(d.y1) - y(d.y0));
        }

        function displayNameValue(d) {
            return d.parent
                ? displayNameValue(d.parent) + " / " + d.data.name + " (" + formatNumber(d.value) + ")"
                : d.data.name + " (" + formatNumber(d.value) + ")";
        }

    },


    refreshVisibilityHelper: function (component) {
        var _this = this;
        let storeObject = component.get("v.storeObject");
        console.log("refreshVisibilityHelper enter");
        var componentReference = component.get("v.componentReference");

        var node = d3.select(_this.getDivId("nodeGroup", componentReference, true))
            .selectAll("circle,rect") // comma separated searches for both
            .style("fill-opacity", function (d, i) {
                return _this.getFilterOpacity(component, d.data);
            })
            .style("stroke-opacity", function (d, i) {
                return bzchart.getFilterOpacity (storeObject, d.data);
            })
            ;

        var text = d3.select(_this.getDivId("nodeGroup", componentReference, true))
            .selectAll("text")
            .style("opacity", function (d, i) {
                return bzchart.getFilterOpacity (storeObject, d.data);
            });


        console.log("aura:method refreshVisibility in subcomponent exit");
    },



})
