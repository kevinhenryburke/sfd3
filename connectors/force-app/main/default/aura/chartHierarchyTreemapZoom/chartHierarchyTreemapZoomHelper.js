({
    initializeVisuals: function (component) {
		console.log("chartHierarchyTreeMapHelper.initializeVisuals enter");
		let _this = this;
        var componentReference = component.get("v.componentReference");

        window.onerror = function (errorMsg, url, lineNumber, column, errorObj) {
            alert('Error: ' + errorMsg + ' Script: ' + url + ' Line: ' + lineNumber
            + ' Column: ' + column + ' StackTrace: ' +  errorObj);
        }

        let datajson = {
            "name": 'Sample',
            "shortName": 'Sample',
            "children": [
              {
                "name": "6.1 Identify and plan learning needs",
                "shortName": "Level 1 Item 1",
                "size": null,
                "children": [
                  {
                    "name": "Analyse the Standards for.",
                    "shortName": "Level 1 Item 1 Sub 1",
                    "size": null,
                    "children": [
                        {
                            "name": "Bottom 1",
                            "shortName": "Level 1 Item 1 Sub 1 A",
                            "size": 148,
                            "children": [
                              
                            ]
                          },
                          {
                            "name": "Bottom 2",
                            "shortName": "Level 1 Item 1 Sub 1 B",
                            "size": 259,
                            "children": [
                              
                            ]
                          }                              
                    ]
                  },
                  {
                    "name": "Demonstrate an  of the role of the",
                    "shortName": "Level 1 Item 1 Sub 2",
                    "size": 448,
                    "children": [
                        {
                            "name": "Bottom 1",
                            "shortName": "Level 1 Item 1 Sub 2 A",
                            "size": 148,
                            "children": [
                              
                            ]
                          },
                          {
                            "name": "Bottom 2",
                            "shortName": "Level 1 Item 1 Sub 2 B",
                            "size": 259,
                            "children": [
                              
                            ]
                          }                              
                      
                    ]
                  },
                  {
                    "name": "Use  knowledge of the Standards for ",
                    "shortName": "Level 1 Item 1 Sub 3",
                    "size": 59,
                    "children": [
                        {
                            "name": "Bottom 1",
                            "shortName": "Level 1 Item 1 Sub 3 A",
                            "size": 148,
                            "children": [
                              
                            ]
                          },
                          {
                            "name": "Bottom 2",
                            "shortName": "Level 1 Item 1 Sub 3 B",
                            "size": 259,
                            "children": [
                              
                            ]
                          }                              
                      
                    ]
                  },
                  {
                    "name": "Use the  plan learning needs.",
                    "shortName": "Level 1 Item 1 Sub 4",
                    "size": 101,
                    "children": [
                        {
                            "name": "Bottom 1",
                            "shortName": "Level 1 Item 1 Sub 4 A",
                            "size": 148,
                            "children": [
                              
                            ]
                          },
                          {
                            "name": "Bottom 2",
                            "shortName": "Level 1 Item 1 Sub 4 B",
                            "size": 259,
                            "children": [
                              
                            ]
                          }                              
                      
                    ]
                  }
                ]
              },
              {
                "name": "6.2 Engage in improve practice",
                "shortName": "Level 1 Item 2",
                "size": null,
                "children": [
                  {
                    "name": "Participate in to update knowledge .",
                    "shortName": "AITSL-A62-P",
                    "size": 92,
                    "children": [
                      
                    ]
                  },
                  {
                    "name": "Understand appropriate sources of .",
                    "shortName": "AITSL-A62-G",
                    "size": 405,
                    "children": [
                      
                    ]
                  },
                  {
                    "name": "Plan for  and critiquing ",
                    "shortName": "AITSL-A62-H",
                    "size": 49,
                    "children": [
                      
                    ]
                  },
                  {
                    "name": "Initiate to expand opportunities.",
                    "shortName": "AITSL-A62-L",
                    "size": 47,
                    "children": [
                      
                    ]
                  }
                ]
              },
              {
                "name": "6.3 Engage with  and improve practice",
                "shortName": "Level 1 Item 3",
                "size": null,
                "children": [
                  {
                    "name": "Contribute to collegial  and apply.",
                    "shortName": "AITSL-A63-P",
                    "size": 84,
                    "children": [
                      
                    ]
                  },
                  {
                    "name": "Initiate and engage in  discussions.",
                    "shortName": "AITSL-A63-H",
                    "size": 51,
                    "children": [
                      
                    ]
                  },
                  {
                    "name": "Seek and feedback from .",
                    "shortName": "AITSL-A63-G",
                    "size": 458,
                    "children": [
                      
                    ]
                  },
                  {
                    "name": "Implement  dialogue within   by .",
                    "shortName": "AITSL-A63-L",
                    "size": 40,
                    "children": [
                      
                    ]
                  }
                ]
              },
              {
                "name": "6.4 Apply  improve learning",
                "shortName": "Level 1 Item 4",
                "size": null,
                "children": [
                  {
                    "name": "Undertake  .",
                    "shortName": "AITSL-A64-P",
                    "size": 76,
                    "children": [
                      
                    ]
                  },
                  {
                    "name": "Demonstrate an  of the rationale.",
                    "shortName": "AITSL-A64-G",
                    "size": 426,
                    "children": [
                      
                    ]
                  },
                  {
                    "name": "Engage with  to evaluate the .",
                    "shortName": "AITSL-A64-H",
                    "size": 54,
                    "children": [
                      
                    ]
                  },
                  {
                    "name": "Advocate,  in and lead high-quality .",
                    "shortName": "AITSL-A64-L",
                    "size": 43,
                    "children": [
                      
                    ]
                  }
                ]
              }
            ]
          };

        _this.setCache (component, "datajson", datajson) ;  

        var margin = {top: 20, right: 20, bottom: 0, left: 20},
        formatNumber = d3.format(",d"),
        transitioning;

        let nodeGroup = _this.getCache (component, "nodeGroup") ;  
        var width = _this.getCache (component, "width")  - margin.left - margin.right; // TODO not great  
        var height = _this.getCache (component, "height") ;  
        
        var x = d3.scaleLinear()
            .domain([0, width])
            .range([0, width]);
        
        var y = d3.scaleLinear()
            .domain([0, height - margin.top - margin.bottom])
            .range([0, height - margin.top - margin.bottom]);
                
        // var color = d3.scaleOrdinal()
        //     .range(d3.schemeCategory10
        //     .map(function(c) { c = d3.rgb(c); c.opacity = 1; return c; }));
        // NOTE original had c.opacity = 0.6

        var color = d3.scaleOrdinal(d3.schemeCategory20c);
            
        var treemap;
        
        var grandparent;
        
        updateDrillDown();
            
        function updateDrillDown() {
            console.log("updateDrillDown enter");

            var svg = d3.select(_this.getDivId("svg", componentReference, true))
                .attr("width", width - margin.left - margin.right)
                .attr("height", height - margin.bottom - margin.top)
                .style("margin-left", -margin.left + "px")
                .style("margin.right", -margin.right + "px");

            nodeGroup
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .style("shape-rendering", "crispEdges");		

            // KB great a grandparent group and a rectangle and text within it
            grandparent = nodeGroup.append("g")
                .attr("class", "grandparent");
		  
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
                .paddingInner(1);
				  
            var root = d3.hierarchy(datajson)
                .eachBefore(function(d) { d.id = (d.parent ? d.parent.id + "." : "") + d.data.shortName; })
                .sum((d) => d.size)
                .sort(function(a, b) {
                    console.log('xxxxx: initial root sort a ' + a.value + ' b ' + b.value);
                    return b.value - a.value; 
                });
		  
            initialize(root);
            accumulate(root);
            layout(root);
            treemap(root);
            display(root);

            console.log("updateDrillDown exit");

        };



        function initialize(root) {
            root.x = root.y = 0;
            root.x1 = width;
            root.y1 = height;
            root.depth = 0;
        }

  // Aggregate the values for internal nodes. This is normally done by the
  // treemap layout, but not here because of our custom implementation.
  // We also take a snapshot of the original children (_children) to avoid
  // the children being overwritten when when layout is computed.
  function accumulate(d) {
	  console.log('accumulate called ' + d.data.name);
    return (d._children = d.children)
        ? d.value = d.children.reduce(function(p, v) { return p + accumulate(v); }, 0)
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
    console.log("xxxxx: layout enter");
  if (d._children) {
//    treemap.nodes({_children: d._children});
// 	  treemap(d);

    d._children.forEach(function(c) {
        console.log("xxxxx: layout child: ", c.data.shortName);
        console.log("xxxxx: c.x0 =>: ", c.x0);

      c.x0 = d.x0 + c.x0 * d.x1;
      console.log("xxxxx: c.x0 =>>>: ", c.x0);
      c.y0 = d.y0 + c.y0 * d.y1;
      c.x1 *= d.x1;
      c.y1 *= d.y1;
      c.parent = d;
      layout(c);
    });
  }
}



function display(d) {
    
    // the top box
  grandparent
      .datum(d.parent)
      .on("click", transition)
    .select("text")
      .text(name(d));

  var grandparentgp = nodeGroup.insert("g", ".grandparent")
      .datum(d)
      .attr("class", "depth");
  
  var g = grandparentgp.selectAll("g")
      .data(d._children)
    .enter().append("g");

  g.filter(function(d) { return d._children; })
      .classed("children", true)
      .on("click", transition);

  var children = g.selectAll(".child")
      .data(function(d) { return d._children || [d]; })
    .enter().append("g");

  children.append("rect")
      .attr("class", "child")
      .call(rect)
    .append("title")
      .text(function(d) { return d.data.shortName + " (" + formatNumber(d.value) + ")"; });

  children.append("text")
      .attr("class", "ctext")
      .text(function(d) { return d.data.shortName; })
      .call(text2);

  g.append("rect")
      .attr("class", "parent")
      .call(rect);

  
	var t = g.append("text")
	  .attr("class", "ptext")
	  .attr("dy", ".75em")
	
	t.append("tspan")
	  .text(function(d) { return d.data.shortName; });
	t.append("tspan")
	  .attr("dy", "1.0em")
	  .text(function(d) { return formatNumber(d.value); });
	t.call(text);
	
	g.selectAll("rect")
	  .style("fill", function(d) { return color(d.data.shortName); });
	
	

  function transition(d) {
    console.log("xxxxx: transitioning");
    if (transitioning || !d) return;
    transitioning = true;

    var parentsgp = display(d);
    var grandparenttransition = grandparentgp.transition().duration(750);
    var parentstransition = parentsgp.transition().duration(750);

    // Update the domain only after entering new elements.
    // KB: The new domain focuses in on the area now in focus and blows that up to the whole canvas
    console.log("xxxxx: x.domain: ", d.x0, d.x1);

    // x.domain([d.x0, d.x0 + d.x1]);
    // y.domain([d.y0, d.y0 + d.y1]);
    x.domain([d.x0, d.x1]);
    y.domain([d.y0, d.y1]);

    // Enable anti-aliasing during the transition.
    nodeGroup.style("shape-rendering", null);

    // Draw child nodes on top of parent nodes. (KB this is key, we draw on top!)
    nodeGroup.selectAll(".depth").sort(function(a, b) { 
    	console.log('xxxx: .depth sort a ' + a.depth + ' b ' + b.depth);
    	return a.depth - b.depth; });

    // Fade-in entering text.
    parentsgp.selectAll("text").style("fill-opacity", 0);

    // Transition to the new view.

    grandparenttransition.selectAll(".ptext").call(text).style("fill-opacity", 0);
    grandparenttransition.selectAll(".ctext").call(text2).style("fill-opacity", 0);
    parentstransition.selectAll(".ptext").call(text).style("fill-opacity", 1);
    parentstransition.selectAll(".ctext").call(text2).style("fill-opacity", 1);

    // grandparenttransition.selectAll("text").call(text).style("fill-opacity", 0);
    // parentstransition.selectAll("text").call(text).style("fill-opacity", 1);
    grandparenttransition.selectAll("rect").call(rect);
    parentstransition.selectAll("rect").call(rect);

    // Remove the old grandparent node when the transition is finished.
    grandparenttransition.remove().on("end", function() {
        nodeGroup.style("shape-rendering", "crispEdges");
        transitioning = false;
    });
  }

  return g;
}

  // this is the top left text box

function text(text) {
    text.selectAll("tspan")
        .attr("x", function(d) { return x(d.x0) + 6; })
    text.attr("x", function(d) { return x(d.x0) + 6; })
        .attr("y", function(d) { return y(d.y0) + 10; })
        .style("opacity", function(d) {
        	console.log("text opacity setting textlength " + this.getComputedTextLength() + " d size " + (x(d.x0 + d.x1) - x(d.x0)));
        	return this.getComputedTextLength() < x(d.x0 + d.x1) - x(d.x0) ? 1 : 0; 
        });
  }

  // this is the bottom right text box
  function text2(text) {
    
    text.attr("x", function(d) { return x(d.x1) - this.getComputedTextLength() - 6; })
        .attr("y", function(d) { 
            console.log("text2 " + d.data.shortName + " y:" + d.y0 + " diff:" + d.y1);
            return y(d.y1) - 6; })
        .style("opacity", function(d) { return this.getComputedTextLength() < x(d.x0 + d.x1) - x(d.x0) ? 1 : 0; });

        // This version is original
        // text.attr("x", function(d) { return x(d.x0 + d.x1) - this.getComputedTextLength() - 6; })
        // .attr("y", function(d) { 
        //     console.log("text2 " + d.data.shortName + " y:" + d.y0 + " diff:" + d.y1);
        //     return y(d.y0 + d.y1) - 6; })
        // .style("opacity", function(d) { return this.getComputedTextLength() < x(d.x0 + d.x1) - x(d.x0) ? 1 : 0; });


}

  function rect(rect) {

    /*
    rect.attr("x", function(d) { return x(d.x0); })
        .attr("y", function(d) { return y(d.y0); })
        .attr("width", function(d) { return x(d.x0 + d.x1) - x(d.x0); })
        .attr("height", function(d) { return y(d.y0 + d.y1) - y(d.y0); });
*/
        rect.attr("x", function(d) { return x(d.x0); })
            .attr("y", function(d) { return y(d.y0); })
            .attr("width", function(d) { 
                
                console.log("xxxxx: rect: " , d.data.shortName, d.x0, d.x1, x(d.x1 - d.x0));
                
                return x(d.x1) - x(d.x0); })
            .attr("height", function(d) { return y(d.y1) - y(d.y0); });
    }

/*  
  function rect(rect) {
    rect.attr("x", function(d) { return x(d.x0); })
        .attr("y", function(d) { return y(d.y0); })
        .attr("width", function(d) {
        	console.log('id ' + d.id+' rect width ' + (d.x1 - d.x0));
// KB: next line is from the online example but doesn't work well with opacity and width
        	return x(d.x0 + d.x1) - x(d.x0); 
// KB: next is an alternative that doesn't work well on drill down
//return (d.x1 -d.x0);
      
        	})
        .attr("height", function(d) { 
        	console.log('id ' + d.id+' rect height ' + (d.y1 - d.y0) + ' ordinal ' + (y(d.y1 +d.y0)  - y(d.y0)));
        	return y(d.y0 + d.y1) - y(d.y0);
//        	return y(d.y1 - d.y0);
      
        	});
  }
*/

  function name(d) {
    return d.parent
        ? name(d.parent) + " / " + d.data.shortName + " (" + formatNumber(d.value) + ")"
        : d.data.shortName + " (" + formatNumber(d.value) + ")";
  }

},


})
