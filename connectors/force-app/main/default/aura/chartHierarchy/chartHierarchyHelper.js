({

    initializeVisuals: function (component) {
		console.log("subhelper: enter initializeVisuals proper structure");
		var _this = this;

        var componentType = component.get("v.componentType");
        var componentReference = component.get("v.componentReference");

		var datajson = bzutils.getCache (componentReference, "datajson") ;  
		var nodeGroup = bzutils.getCache (componentReference, "nodeGroup") ;  
		var pathGroup = bzutils.getCache (componentReference, "pathGroup") ;  
		var textGroup = bzutils.getCache (componentReference, "textGroup") ;  
		var pathToolTipDiv = bzutils.getCache (componentReference, "pathToolTipDiv") ;  
		var pathGroupId = bzutils.getCache (componentReference, "pathGroupId") ;  
		
		var width = bzutils.getCache (componentReference, "width") ;  
		var height = bzutils.getCache (componentReference, "height") ; 
        
        var treemap = d3.tree().size([height, width]);
        bzutils.setCache (componentReference, "treemap", treemap ) ;
        
        // Assigns parent, children, height, depth
        var root = d3.hierarchy(datajson, function(d) { return d.children; });
        root.x0 = height / 2;
        root.y0 = 0;
        
        // Collapse after the second level
        root.children.forEach(bzctree.collapse);
        bzutils.setCache (componentReference, "root", root ) ;
//        _this.merge(root);
        _this.update(nodeGroup, pathGroup, componentReference, root);
    },

    update : function(nodeGroup, pathGroup, componentReference, source) {
		var _this = this;
        var nodes;
        var links;
        var duration = 750;
        var fixedDepth = 180; // this may need to be a function of chart area depth?
        
        var margin = bzutils.getCache (componentReference, "margin") ;  
        
        // Assigns the x and y position for the nodes

        var treemap = bzutils.getCache (componentReference, "treemap" ) ;
        var root = bzutils.getCache (componentReference, "root" ) ;

        var treeMappedData = treemap(root);
      
        // Compute the new tree layout.
        nodes = treeMappedData.descendants();
        console.log("kb: descendants: nodes will contain all of the visible nodes");
        console.log(nodes);
        links = treeMappedData.descendants().slice(1);
      
        // Normalize for fixed-depth.
        nodes.forEach(function(d){ d.y = margin.left + (d.depth * fixedDepth)});
      
        // ****************** Nodes section ***************************
      
        // Update the nodes...
        var node = nodeGroup.selectAll('g.treenode')
            .data(nodes, function(d) {                
//                console.log("xxx: " + d.id);
                return d.id || (d.id = bzutils.addComponentRef(componentReference, d.data.id)); 
            });
                
        // Enter any new modes at the parent's previous position.
        var nodeEnter = node.enter().append('g')
            .attr('class', 'treenode')
            .attr("transform", function(d) {
                var t = "translate(" + source.y0 + "," + source.x0 + ")";
//                console.log("enter new node: " + t);
              return t;
            })
            .attr("id", function(d) {
                return d.id;
            })            
            .attr("recordid", function(d) {
                return d.data.id;
            })            
            .on('click', click)
			.on('mouseover', $A.getCallback(function(d) { // need getCallback to retain context - https://salesforce.stackexchange.com/questions/158422/a-get-for-application-event-is-undefined-or-can-only-fire-once
//				console.log("mouseover: " + d.id);
				bzutils.setCache (componentReference, "mouseoverRecordId", d.id ) ;
				bzutils.xfcr("nodeMouseover", componentReference, d); 

// var publisherCategory = bzutils.getCache (componentReference, "componentCategory") ;
// var publisherType = bzutils.getCache (componentReference, "componentType") ;
// var controller = bzutils.getCache (componentReference, "UserControllerComponentId") ;

// var appEvent = $A.get("e.c:evt_sfd3");
// appEvent.setParams({
// 	"topic" : "ChartMouseOver",
// 	"publisher" : "publisher",
// 	"publisherCategory" : publisherCategory,
// 	"publisherType" : publisherType,
// 	"controller" : controller,
// 	"parameters" : {}
// });
// appEvent.fire();


			}))
			;
      
        // Add Circle for the nodes
        nodeEnter.append('circle')
            .attr('class', 'treenode')
            .attr('r', 1e-6)
            .style("fill", function(d) {
                console.log("kb: we add new circles only to new nodes - the nodes are forgotten if collapsed");
                return d._children ? bzctree.getCanExpandColor(d) : bzctree.getExpandedColor(d);
            })
            
	
            ;
      
        // Add labels for the nodes
        nodeEnter.append('text')
            .attr("dy", ".35em")
            .attr("x", function(d) {
                return d.children || d._children ? -13 : 13;
            })
            .attr("text-anchor", function(d) {
                return d.children || d._children ? "end" : "start";
            })
            .text(function(d) { return d.data.name; });
      
        // UPDATE
        var nodeUpdate = nodeEnter.merge(node);
      
        // Transition to the proper position for the node
        nodeUpdate.transition()
          .duration(duration)
          .attr("transform", function(d) { 
              var t = "translate(" + d.y  + "," + d.x + ")";
//              console.log(t);
              return t;
           });
      
        // Update the node attributes and style
        nodeUpdate.select('circle.treenode')
          .attr('r', 10)
          .style("fill", function(d) {
              return d._children ? bzctree.getCanExpandColor(d) : bzctree.getExpandedColor(d);
          })
          .attr('cursor', 'pointer');
      
      
        // Remove any exiting nodes
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + source.y + "," + source.x + ")";
            })
            .remove();
      
        // On exit reduce the node circles size to 0
        nodeExit.select('circle')
          .attr('r', 1e-6);
      
        // On exit reduce the opacity of text labels
        nodeExit.select('text')
          .style('fill-opacity', 1e-6);
      
        // ****************** links section ***************************
      
        // Update the links...
        var link = pathGroup.selectAll('path.treelink')
            .data(links, function(d) { return d.id; });
      
        // Enter any new links at the parent's previous position.
        var linkEnter = link.enter().insert('path', "g")
            .attr("class", "treelink")
            .attr('d', function(d){
                var o = {x: source.x0, y: source.y0}
              return diagonal(o, o)
            });
      
        // UPDATE
        var linkUpdate = linkEnter.merge(link);
      
        // Transition back to the parent element position
        linkUpdate.transition()
            .duration(duration)
            .attr('d', function(d){ return diagonal(d, d.parent) });
      
        // Remove any exiting links
        var linkExit = link.exit().transition()
            .duration(duration)
            .attr('d', function(d) {
              var o = {x: source.x, y: source.y}
              return diagonal(o, o)
            })
            .remove();
      
        // Store the old positions for transition.
        nodes.forEach(function(d){
          d.x0 = d.x;
          d.y0 = d.y;
        });
      
        // Creates a curved (diagonal) path from parent to the child nodes
        function diagonal(s, d) {
      
          var path = `M ${s.y} ${s.x}
                  C ${(s.y + d.y) / 2} ${s.x},
                    ${(s.y + d.y) / 2} ${d.x},
                    ${d.y} ${d.x}`
      
          return path
        }
      
        // Toggle children on click.
        function click(d) {
          if (d.children) {
              d._children = d.children;
              d.children = null;
            } else {
              d.children = d._children;
              d._children = null;
            }
            _this.update(nodeGroup, pathGroup, componentReference, d);
		}
		

      },
	
    merge : function(source) {
        console.log("kb: in update:");
        var newjson =             {
            "id": "100000000000000003",
            "name": "KB Extra Node",
            "size": 3938
        };
        var newroot = d3.hierarchy(newjson, function(d) { return d.children; });
        source.children.push(newroot);
        source.data.children.push(newroot.data);
        console.log("kb: added node:");
    
/*    
            var _this = this;
            var nodes;
            var links;
            var duration = 750;
            var fixedDepth = 180; // this may need to be a function of chart area depth?
            
            var margin = bzutils.getCache (componentReference, "margin") ;  
            
            // Assigns the x and y position for the nodes
    
            var treemap = bzutils.getCache (componentReference, "treemap" ) ;
            var root = bzutils.getCache (componentReference, "root" ) ;
    
            var treeMappedData = treemap(root);
            
            // Compute the new tree layout.
            nodes = treeMappedData.descendants();
            console.log("kb: descendants: nodes will contain all of the visible nodes");
            console.log(nodes);
            links = treeMappedData.descendants().slice(1);
            
            // Normalize for fixed-depth.
            nodes.forEach(function(d){ d.y = margin.left + (d.depth * fixedDepth)});
            
            // ****************** Nodes section ***************************
            
            // Update the nodes...
            var node = nodeGroup.selectAll('g.treenode')
                .data(nodes, function(d) {                
    //                console.log("xxx: " + d.id);
                    return d.id || (d.id = bzutils.addComponentRef(componentReference, d.data.id)); 
                });
                    
            // Enter any new modes at the parent's previous position.
            var nodeEnter = node.enter().append('g')
                .attr('class', 'treenode')
                .attr("transform", function(d) {
                    var t = "translate(" + source.y0 + "," + source.x0 + ")";
    //                console.log("enter new node: " + t);
                    return t;
                })
                .attr("id", function(d) {
                    return d.id;
                })            
                .attr("recordid", function(d) {
                    return d.data.id;
                })            
                .on('click', click)
                .on('mouseover', $A.getCallback(function(d) { // need getCallback to retain context - https://salesforce.stackexchange.com/questions/158422/a-get-for-application-event-is-undefined-or-can-only-fire-once
    //				console.log("mouseover: " + d.id);
                    bzutils.setCache (componentReference, "mouseoverRecordId", d.id ) ;
                    bzutils.xfcr("nodeMouseover", componentReference, d); 
                }))
                ;
            
            // Add Circle for the nodes
            nodeEnter.append('circle')
                .attr('class', 'treenode')
                .attr('r', 1e-6)
                .style("fill", function(d) {
                    console.log("kb: we add new circles only to new nodes - the nodes are forgotten if collapsed");
                    return d._children ? bzctree.getCanExpandColor(d) : bzctree.getExpandedColor(d);
                })
                
        
                ;
            
            // Add labels for the nodes
            nodeEnter.append('text')
                .attr("dy", ".35em")
                .attr("x", function(d) {
                    return d.children || d._children ? -13 : 13;
                })
                .attr("text-anchor", function(d) {
                    return d.children || d._children ? "end" : "start";
                })
                .text(function(d) { return d.data.name; });
            
            // UPDATE
            var nodeUpdate = nodeEnter.merge(node);
            
            // Transition to the proper position for the node
            nodeUpdate.transition()
                .duration(duration)
                .attr("transform", function(d) { 
                    var t = "translate(" + d.y  + "," + d.x + ")";
    //              console.log(t);
                    return t;
                });
            
            // Update the node attributes and style
            nodeUpdate.select('circle.treenode')
                .attr('r', 10)
                .style("fill", function(d) {
                    return d._children ? bzctree.getCanExpandColor(d) : bzctree.getExpandedColor(d);
                })
                .attr('cursor', 'pointer');
            
            
            // Remove any exiting nodes
            var nodeExit = node.exit().transition()
                .duration(duration)
                .attr("transform", function(d) {
                    return "translate(" + source.y + "," + source.x + ")";
                })
                .remove();
            
            // On exit reduce the node circles size to 0
            nodeExit.select('circle')
                .attr('r', 1e-6);
            
            // On exit reduce the opacity of text labels
            nodeExit.select('text')
                .style('fill-opacity', 1e-6);
            
            // ****************** links section ***************************
            
            // Update the links...
            var link = pathGroup.selectAll('path.treelink')
                .data(links, function(d) { return d.id; });
            
            // Enter any new links at the parent's previous position.
            var linkEnter = link.enter().insert('path', "g")
                .attr("class", "treelink")
                .attr('d', function(d){
                    var o = {x: source.x0, y: source.y0}
                    return diagonal(o, o)
                });
            
            // UPDATE
            var linkUpdate = linkEnter.merge(link);
            
            // Transition back to the parent element position
            linkUpdate.transition()
                .duration(duration)
                .attr('d', function(d){ return diagonal(d, d.parent) });
            
            // Remove any exiting links
            var linkExit = link.exit().transition()
                .duration(duration)
                .attr('d', function(d) {
                    var o = {x: source.x, y: source.y}
                    return diagonal(o, o)
                })
                .remove();
            
            // Store the old positions for transition.
            nodes.forEach(function(d){
                d.x0 = d.x;
                d.y0 = d.y;
            });
            
            // Creates a curved (diagonal) path from parent to the child nodes
            function diagonal(s, d) {
            
                var path = `M ${s.y} ${s.x}
                        C ${(s.y + d.y) / 2} ${s.x},
                        ${(s.y + d.y) / 2} ${d.x},
                        ${d.y} ${d.x}`
            
                return path
            }
            
            // Toggle children on click.
            function click(d) {
                if (d.children) {
                    d._children = d.children;
                    d.children = null;
                } else {
                    d.children = d._children;
                    d._children = null;
                }
                _this.update(nodeGroup, pathGroup, componentReference, d);
            }
*/            
    
            }
        

})