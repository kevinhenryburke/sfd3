({
    initializeVisuals: function (component) {
		console.log("chartHierarchyTreeMapHelper.initializeVisuals enter");
		var _this = this;
        var componentReference = component.get("v.componentReference");

        window.onerror = function (errorMsg, url, lineNumber, column, errorObj) {
            alert('Error: ' + errorMsg + ' Script: ' + url + ' Line: ' + lineNumber
            + ' Column: ' + column + ' StackTrace: ' +  errorObj);
        }

        var datajson = _this.getCache (component, "datajson") ;  


        _this.setCache (component, "datajson", datajson) ;  

        var margin = {top: 20, right: 0, bottom: 0, left: 0},
        formatNumber = d3.format(",d"),
        transitioning;
        var grandparentDepth = 0;

        let nodeGroup = _this.getCache (component, "nodeGroup") ;  
        var width = _this.getCache (component, "width")  - margin.left - margin.right - 50; // TODO not great  
        var height = _this.getCache (component, "height")  - margin.top - margin.bottom - 650;  
//        var height = _this.getCache (component, "height") - 650;  
        
          console.log("xxxxx: height: " , height);

        var x = d3.scaleLinear()
            .domain([0, width]) 
            .range([0, width]);
        
        var y = d3.scaleLinear()
            .domain([0, height])
            .range([0, height - margin.top]); // this is crucial, without substracting the margin.top the bottom cells fall over the line.
                
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
                .paddingInner(1);
				  
            // id of an element is built up from concatenating the ids of the parents.
            // KB: change this to Salesforce record id?
                var root = d3.hierarchy(datajson)
                .eachBefore(function(d) { 
                    console.log("xxxxx: eachBefore: ",  d.data.id , d);
                    d.id = d.data.id; })
// .id((d) => d.id)
                .sum((d) => d.size)
                .sort(function(a, b) {
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

      c.x0 = d.x0 + c.x0 * d.x1;
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

  g.filter(function(d) { return d._children; })
      .classed("children", true)
      .on("click", transitionHigher);

  var children = g.selectAll(".child")
    .data(function(d) { return d._children || [d]; })
    .enter()
    .append("g");

  children.append("rect")
      .attr("class", "child")
      .call(rect)
    .append("title")
      .text(function(d) { return d.data.name + " (" + formatNumber(d.value) + ")"; });

  children.append("text")
      .attr("class", "ctext")
      .text(function(d) { return d.data.name; })
      .call(text2);

  g.append("rect")
      .attr("class", "parent")
      .call(rect);

  
	var t = g.append("text")
	  .attr("class", "ptext")
	  .attr("dy", ".75em")
	
	t.append("tspan")
	  .text(function(d) { return d.data.name; });
	t.append("tspan")
	  .attr("dy", "1.0em")
	  .text(function(d) { return formatNumber(d.value); });
	t.call(text);
	
	g.selectAll("rect")
    .style("fill", function(d) { return color(d.data.name); })

    .attr("id", d => d.id)

    .on('mouseover', $A.getCallback(function(d) { // need getCallback to retain context - https://salesforce.stackexchange.com/questions/158422/a-get-for-application-event-is-undefined-or-can-only-fire-once
        console.log("chartHierarchyTreemapZoomHelper.mouseover enter" , d);
        console.log("chartHierarchyTreemapZoomHelper.mouseover enter id " , d.id);
        console.log("chartHierarchyTreemapZoomHelper.mouseover enter component " , component);
        _this.setCache (component, "mouseoverRecordId", d.id ) ;
       var preppedEvent = _this.nodeMouseover(component, d); 
       _this.publishPreppedEvent(component,preppedEvent);
   }))

      ;
	
    function transitionHigher(d) {
        console.log("xxxxx: transitionHigher before: " +  grandparentDepth);
        grandparentDepth++;
        console.log("xxxxx: transitionHigher after: " +  grandparentDepth);
        transition(d);
    }

    function transitionLower(d) {
        console.log("xxxxx: transitionLower before: " +  grandparentDepth);
        grandparentDepth--;
        console.log("xxxxx: transitionLower after: " +  grandparentDepth);
        transition(d);
    }

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
    console.log("xxxxx: y.domain: ", d.y0, d.y1);

    // x.domain([d.x0, d.x0 + d.x1]);
    // y.domain([d.y0, d.y0 + d.y1]);
    x.domain([d.x0, d.x1]);
    y.domain([d.y0, d.y1]);

    // Enable anti-aliasing during the transition.
    nodeGroup.style("shape-rendering", null);

    // Draw child nodes on top of parent nodes. (KB this is key, we draw on top by sorting the nodes in terms of depth
    nodeGroup.selectAll(".depth").sort(function(a, b) { 
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
        .attr("font-size", "10px")
        .attr("fill", "black")
        .style("opacity", function(d) {
        	return this.getComputedTextLength() < x(d.x1) - x(d.x0) ? 1 : 0; 
        });
  }

  // this is the bottom right text box
  function text2(text) {
    text.attr("x", function(d) { return x(d.x1) - this.getComputedTextLength() - 6; })
        .attr("y", function(d) { 
            return y(d.y1) - 6; })
        .style("opacity", function(d) { return this.getComputedTextLength() < x(d.x1) - x(d.x0) ? 0.7 : 0; })
        .attr("font-size", "10px")
        .attr("fill", "black");

    }

  function rect(rect) {
    /*
    rect.attr("x", function(d) { return x(d.x0); })
        .attr("y", function(d) { return y(d.y0); })
        .attr("width", function(d) { return x(d.x0 + d.x1) - x(d.x0); })
        .attr("height", function(d) { return y(d.y0 + d.y1) - y(d.y0); });
*/

        rect.attr("x", function(d) { 
            console.log("xxxxx depth:" + d.depth );
            return x(d.x0); })
            .attr("y", (d) => y(d.y0))
            .attr("width", (d) =>  x(d.x1) - x(d.x0))
            .attr("height", (d) =>  y(d.y1) - y(d.y0))
            
            
            ;
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

  function displayNameValue(d) {
    return d.parent
        ? displayNameValue(d.parent) + " / " + d.data.name + " (" + formatNumber(d.value) + ")"
        : d.data.name + " (" + formatNumber(d.value) + ")";
  }

},


})
