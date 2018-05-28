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
			}))
			;
      
        // Add Circle for the nodes
        nodeEnter.append('circle')
            .attr('class', 'treenode')
            .attr('r', 1e-6)
            .attr("id", function(d) {
                return "circle" + d.id;
            })            
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
              // collapsed children are stored as d._children / expanded a d.children
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
            .attr("id", function(d) { return "path" + d.id; }) // identify a path using it's lower level node (so must be unique!)
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
// START: KB ADDED            
// added to try to merge nodes ......
console.log("click");
console.log(d);
console.log("Click: " + d.data.name);
            if (d.data.name == "analytics") {
                _this.merge(componentReference, d);
            }

            // END: KB ADDED            
            _this.update(nodeGroup, pathGroup, componentReference, d);
            _this.openPathsBy(componentReference, "000000000000000082","id");
            _this.update(nodeGroup, pathGroup, componentReference, d);
            _this.highlightPathsBy(componentReference, "000000000000000083","id");
            _this.update(nodeGroup, pathGroup, componentReference, d);
		}
		

      },

      setDepth : function (baseNode, baseNodeDepth) {
        console.log("setDepth: " + baseNodeDepth);
		var _this = this;
        if(baseNode.children) {
            baseNode.children.forEach(function(d) {
                d.depth = baseNodeDepth + 1;
                _this.setDepth(d,baseNodeDepth +1);            
            });
        }        
      },

    //basically a way to get the path to an object - this is independent of the search box
    // KB root level call is - var paths = searchTree(root,e.object.text,[]);

    // we have search by name or id (searchBy = "Name" or "Id")
    searchTree : function(obj,search,path, searchBy){
        var _this = this;
//        console.log(obj.data.name); // shows the node names
//        console.log(obj.data.id); // shows the node ids

        var objFieldValue = (searchBy == "Name" ? obj.data.name : obj.data.id );
        
        if(objFieldValue === search){ //if search is found return, add the object to the path and return it
            path.push(obj);
            return path;
        }
        else if(obj.children || obj._children){ //if children are collapsed d3 object will have them instantiated as _children
            var children = (obj.children) ? obj.children : obj._children;
            for(var i=0;i<children.length;i++){
                path.push(obj);// we assume this path is the right one
                var found = _this.searchTree(children[i],search,path, searchBy);
                if(found){// we were right, this should return the bubbled-up path from the first if statement
                    return found;
                }
                else{//we were wrong, remove this parent from the path and continue iterating
                    path.pop();
                }
            }
        }
        else{//not the right object, return false so it will continue to iterate in the loop
            return false;
        }
    },

    // open the input paths in the graph, note that need to call update afterwards
    openPaths : function (paths){
        for(var i =0;i<paths.length;i++){
            if(paths[i].id !== "1"){//i.e. not root
                paths[i].class = 'found';
                if(paths[i]._children){ //if children are hidden: open them, otherwise: don't do anything
                    paths[i].children = paths[i]._children;
                    paths[i]._children = null;
                }
            }
        }
    },

    // open the input paths in the graph, note that need to call update afterwards
    openPathsBy : function (componentReference, searchTerm, searchBy){
        var _this = this;
        var ultimateRoot = bzutils.getCache (componentReference, "root");

        // try to find target node down from the root node
        var paths = _this.searchTree(ultimateRoot,searchTerm,[],searchBy);
        for(var i =0;i<paths.length;i++){
            if(paths[i].id !== "1"){//i.e. not root
                paths[i].class = 'found';
                if(paths[i]._children){ //if children are hidden: open them, otherwise: don't do anything
                    paths[i].children = paths[i]._children;
                    paths[i]._children = null;
                }
            }
        }
    },

    
    // highlight the input paths in the graph, note that need to call update afterwards
    highlightPathsBy : function (componentReference, searchTerm, searchBy){
        var _this = this;
        var ultimateRoot = bzutils.getCache (componentReference, "root");

        // try to find target node down from the root node
        var paths = _this.searchTree(ultimateRoot,searchTerm,[],searchBy);
        console.log("searchby path");
        console.log(paths);
        for(var i =0;i<paths.length;i++){
            if(paths[i].id !== "1"){//i.e. not root - TODO check value not equal to root
                console.log("kb: highlight path");
                var thispath = paths[i];
                var relatedPathId = "path" + paths[i]["id"];
                console.log(relatedPathId);
                var g1 = d3.select("#" + relatedPathId).style("stroke", "red"); 
                console.log("g1");
                console.log(g1);
            }
        }
        
    },

    merge : function(componentReference, source) {
        console.log("kb: in merge:");
		var _this = this;

        // TEMPORARY GUFF

        // the first node id is assumed to be a pre-existing node and should not result in a new node.
        // temp - node 15 for the expanded version, 83 for the collapsed
        var newjson =             
        {
            "id": "000000000000000083",
            "name": "methods",
            "children": [
                {
                    "id": "100000000000000002",
                    "name": "L2",
                    "children": [
                        {
                            "id": "100000000000000003",
                            "name": "L3a",
                            "size": 3938
                        },
                        {
                            "id": "100000000000000004",
                            "name": "L3b",
                            "size": 382
                        }]
                }]
        };

        var parentRecordId = newjson["id"]; // TODO - change - this is the graph node
        var addToNodeId = bzutils.addComponentRef(componentReference, parentRecordId);
        var parentNodeId = "circle" + addToNodeId;

        // see if this is searchable as a node
        var parentNode = bzutils.getNodeFromId(parentNodeId);

        if (parentNode == null) {
            console.log("parentNode is undefined - so assuming it is collapsed. Search down from the root node of the base hierarchy");

            var ultimateRoot = bzutils.getCache (componentReference, "root");

            // try to find target node down from the root node
            var paths = _this.searchTree(ultimateRoot,parentRecordId,[],"Id");
            parentNode = paths.slice(-1).pop(); // this gets the last element of the path array which is the parent node.
        }


        if (parentNode != null) {
            console.log("parentNode is defined");
            var newroot = d3.hierarchy(newjson, function(d) { return d.children; });

            newroot.children.forEach(function(newchild) {
                newchild.parent = parentNode;
                newchild.depth = parentNode.depth + 1; 
                newchild.height = parentNode.height - 1;
                _this.setDepth(newchild, newchild.depth);
                if (parentNode.children) {
                    parentNode.children.push(newchild);
                }
                if (parentNode._children) {
                    parentNode._children.push(newchild);
                }
        
                parentNode.data.children.push(newchild.data);
                bzctree.collapse(newchild);
            });
        }
        else {
            console.log("parentNode is undefined still - TODO error handling");
        }
        console.log("kb: merge: added node:");
    }
        

})