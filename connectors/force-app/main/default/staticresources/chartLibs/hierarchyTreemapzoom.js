/* OVERRIDE MIXINS */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.chartHierarchyTreemapzoomMixin = global.chartHierarchyTreemapzoomMixin || {})));
}(this, (function (exports) { 'use strict';

console.log("loading: chartHierarchyTreemapzoomMixin IIFE");

const OverrideMixin = {

    initializeVisuals (storeObject) {
        console.log("chartHierarchyTreemapzoomMixin.initializeVisuals enter");

        let variantsMixin = bzchart.getStore (storeObject, "chartMixin") ;
        let componentReference = bzchart.getStore (storeObject, "componentReference") ;  

        var treemap;
        var transitioning;
        var grandparent;

        window.onerror = function (errorMsg, url, lineNumber, column, errorObj) {
            alert('Error: ' + errorMsg + ' Script: ' + url + ' Line: ' + lineNumber
                + ' Column: ' + column + ' StackTrace: ' + errorObj);
        }

        var datajson = bzchart.getStore (storeObject, "datajson");

        // dataPreprocess will set datajson in cache
        variantsMixin.dataPreprocess(storeObject, datajson, null);

        let rootAfter = d3.hierarchy(bzchart.getStore (storeObject, "datajson"))
            .eachBefore(function (d) {
                d.id = d.data.id;
            })
            .sum((d) =>  bzchart.getFromMeasureScheme(storeObject, d, "Value"))
            .sort(function (a, b) {
                return b.value - a.value;
            });

        bzchart.setStore (storeObject, "d3root", rootAfter ) ;    

        var margin = { top: 20, right: 0, bottom: 0, left: 0 };
        var formatNumber = d3.format(",d");
        var grandparentDepthInData = 0;

        let nodeGroup = bzchart.getStore (storeObject, "nodeGroup");
        var width = bzchart.getStore (storeObject, "width") - margin.left - margin.right - 50; // TODO not great  
        var height = bzchart.getStore (storeObject, "height") - margin.top - margin.bottom - 650;

        var x = d3.scaleLinear()
            .domain([0, width])
            .range([0, width]);

        var y = d3.scaleLinear()
            .domain([0, height])
            .range([0, height - margin.top]); // this is crucial, without substracting the margin.top the bottom cells fall over the line.

        var color = d3.scaleOrdinal(d3.schemeCategory20c);

        updateDrillDown();

        function updateDrillDown() {

            var svg = d3.select(bzutils.getDivId("svg", componentReference, true))
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

            var root = bzchart.getStore (storeObject, "d3root" );    

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
                    bzchart.setStore (storeObject, "mouseoverRecordId", d.id);
                    let preppedEvent = variantsMixin.nodeMouseover(storeObject, d);
                    bzaura.publishPreppedEvent(storeObject,preppedEvent,$A.get("e.c:evt_sfd3"));
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

    }
    
}

exports.OverrideMixin = OverrideMixin;

Object.defineProperty(exports, '__esModule', { value: true });

console.log("loaded: chartHierarchyTreemapzoomMixin IIFE");


})));
