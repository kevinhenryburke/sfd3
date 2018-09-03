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

        // Establish node coloring paradigm for leaf and parent nodes

        // have a default for leaves
        var LeafColorsObjectDefault = {"colorBy" : "size", "values" : [0], "colors" : ["white"]};
        bzctree.setColorCache (componentReference, component.get("v.LeafColors"), LeafColorsObjectDefault, "Leaf") ;
    
        // have a default for parents
        var ParentColorsObjectDefault = {"colorBy" : "size", "values" : [0], "colors" : ["lightsteelblue"]};
        bzctree.setColorCache (componentReference, component.get("v.ParentColors"), ParentColorsObjectDefault, "Parent") ;

        // Collapse after the second level (provided root has children)
        if (root.children != null) {
            root.children.forEach(bzctree.collapse);
        }

        bzutils.setCache (componentReference, "root", root ) ;
        _this.update(component, nodeGroup, pathGroup, componentReference, root, false);

        // Push out an initial message to highlight the root node to display panels
        // Effecitvely can do this via a mouseover event on root.
        // TODO can move this to a generic location?
        bzutils.setCache (componentReference, "mouseoverRecordId", root.id ) ;
        _this.restockCache(component);

        var preppedEvent = bzutils.xfcr("nodeMouseover", componentReference, root); 
        _this.publishPreppedEvent(component,preppedEvent);
        _this.updatePopoverDirectry(component, preppedEvent);
    },

    update : function(component, nodeGroup, pathGroup, componentReference, source, makeSourceRoot) {
		var _this = this;
        var nodes;
        var links;
        var duration = 250;
        var shortDuration = 250;
        var fixedDepth = _this.getFixedDepth(component); // this may need to be a function of chart area depth?
        
        var margin = bzutils.getCache (componentReference, "margin") ;  
        
        // Assigns the x and y position for the nodes

        var treemap = bzutils.getCache (componentReference, "treemap" ) ;

        var treeMappedData;
        if (makeSourceRoot === true) {
            // INTERESTING -- RE-ROOT OPTION
            // WOULD NEED TO TRANSFROM TO SHIFT EVERYTHING TO THE LEFT
            // can do that by a variant of the nodes.forEach function a few lines below this
            treeMappedData = treemap(source);

        }
        else {
            var root = bzutils.getCache (componentReference, "root" ) ;
            treeMappedData = treemap(root);
        }        
      
        // Compute the new tree layout.
        nodes = treeMappedData.descendants();
        // descendants: nodes will contain all of the visible nodes
        links = treeMappedData.descendants().slice(1);

        // Normalize for fixed-depth.
        nodes.forEach(function(d){ 
            d.y = margin.left + (d.depth * fixedDepth);

            // workout the maximum depth in the chart so we can perform any necessary resizing
            if (!bzutils.hasCache (componentReference, "maxDepth")) {
                bzutils.setCache (componentReference, "maxDepth", 0) ;
            }
            var maxDepth = bzutils.getCache (componentReference, "maxDepth") ;
            if (d.depth > maxDepth) {
                bzutils.setCache (componentReference, "maxDepth", d.depth) ;
                console.log("maxDepth: " + bzutils.getCache (componentReference, "maxDepth") );
            }
        });
      
        // ****************** Nodes section ***************************
      
        // Update the nodes...
        var node = nodeGroup.selectAll('g.treenode')
            .data(nodes, function(d) {    
                return d.id || (d.id = bzutils.addComponentRef(componentReference, d.data.id)); 
            });
                
        // Enter any new modes at the parent's previous position.
        var nodeEnter = node.enter().append('g')
            .attr('class', 'treenode')
            .attr("class", function(d) {
                return 'treenode ' + d.id;
            })
            .attr("transform", function(d) {
                var t = "translate(" + source.y0 + "," + source.x0 + ")";
                return t;
            })
            .attr("id", function(d) {
                return d.id;
            })            
            .attr("aura:id", function(d) {
                return d.id;
            })            
            .attr("recordid", function(d) {
                return d.data.id;
            })            
            .on('click', click)
			.on('mouseover', $A.getCallback(function(d) { // need getCallback to retain context - https://salesforce.stackexchange.com/questions/158422/a-get-for-application-event-is-undefined-or-can-only-fire-once
				bzutils.setCache (componentReference, "mouseoverRecordId", d.id ) ;
                var preppedEvent = bzutils.xfcr("nodeMouseover", componentReference, d); 
                _this.publishPreppedEvent(component,preppedEvent);
                if (d.depth <= 1) { // root or first level
                    _this.restockCache(component);
                }

                _this.updatePopoverDirectry(component, preppedEvent);

            }))
			.on('mouseout', $A.getCallback(function(d) { // need getCallback to retain context - https://salesforce.stackexchange.com/questions/158422/a-get-for-application-event-is-undefined-or-can-only-fire-once
				bzutils.setCache (componentReference, "mouseoutRecordId", d.id ) ;
                var preppedEvent = bzutils.xfcr("nodeMouseout", componentReference, d); 
                _this.publishPreppedEvent(component,preppedEvent);
            }))
			;
      
        // Add Circle for the nodes
        nodeEnter.append('circle')
            .attr('class', 'treenode') // redundant
            .attr("class", function(d) {
                return 'treenode ' + d.id;
            })
            .attr('r', 1e-6)
            .attr("id", function(d) {
                return "circle" + d.id;
            })            
            .attr("aura:id", function(d) {
                return "circle" + d.id;
            })            
            .style("fill", function(d) {
                // we add new circles only to new nodes - the nodes are forgotten if collapsed
                return d._children ? bzctree.getNodeColor(componentReference, d, "Parent") : bzctree.getNodeColor(componentReference, d, "Leaf");
            });
      

        nodeEnter.append('text')
            .attr("childLess", function(d) {
                return childLess(d);
            })
            .attr("dy", function(d) {
                if (d.depth > 0) {
                    return ".35em";
                }
                return "-1.35em";
            })
            .attr("x", function(d) {
                if (d.depth > 0) {
                    return childLess(d) ? _this.getTextOffset(component) : - _this.getTextOffset(component);
                }
                return -1;
            })
            .attr("text-anchor", function(d) {
                var textAnchor = "middle";
                console.log("check if root");
                if (d.depth > 0) {
                    textAnchor = childLess(d) ? "start" : "end";
                } 
                else {
                    console.log("it must be root");
                }
                return textAnchor;
            })
            .style("font", function(d) {
                return _this.getFontSizePX(component) + "px sans-serif";
            })
            .text(function(d) { return d.data.name; });
      
        // UPDATE
        var nodeUpdate = nodeEnter.merge(node);
      
        // Transition to the proper position for the node
        nodeUpdate.transition()
          .duration(shortDuration)
          .attr("transform", function(d) { 
            var t = "translate(" + d.y  + "," + d.x + ")";
              return t;
           });
      
        // Update the node attributes and style
        nodeUpdate.select('circle.treenode')
          .attr('r', _this.getRadius(component))
          .style("fill", function(d) {
              // collapsed children are stored as d._children / expanded as d.children
            if(childLess(d)) {
                  return bzctree.getNodeColor(componentReference, d, "Leaf");
              }
              return bzctree.getNodeColor(componentReference, d, "Parent"); 
          })
          .attr('cursor', 'pointer');      
          
        // text box starts to the right for childless nodes, to the left for parents (collapsed or expanded)  
        nodeUpdate.select('text')
            .attr("childLess", function(d) {
                return childLess(d);
            })
            .attr("x", function(d) {
                if (d.depth > 0) {
                    return childLess(d) ? _this.getTextOffset(component) : - _this.getTextOffset(component);
                }
                return -1;
            })
            .attr("text-anchor", function(d) {
                var textAnchor = "middle";
                console.log("check if root");
                if (d.depth > 0) {
                    textAnchor = childLess(d) ? "start" : "end";
                } 
                else {
                    console.log("it must be root");
                }
                return textAnchor;
            })
            .style("font", function(d) {
                return _this.getFontSizePX(component) + "px sans-serif";
            });
        
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
            .data(links, function(d) { 
                return d.id; 
            });
      
        // Enter any new links at the parent's previous position.
        var linkEnter = link.enter().insert('path', "g")
            .attr("id", function(d) { return "path" + d.id; }) // identify a path using its lower level node (so must be unique!)
            .attr("aura:id", function(d) { return "path" + d.id; }) // identify a path using its lower level node (so must be unique!)
            .attr("class", "treelink")
            .attr('d', function(d){
                var o = {x: source.x0, y: source.y0}
              return diagonal(o, o)
            });
      
        // UPDATE
        var linkUpdate = linkEnter.merge(link);
      
        // Transition back to the parent element position
        linkUpdate.transition()
            .duration(shortDuration)
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

        // KB: added to ensure highlighted nodes remain highlighted after collapse and expand
        // takes the cached paths and highlights them.
        var highlightedPaths = bzutils.getCache (componentReference, "highlightedPaths") ;
        if (highlightedPaths != null) {
            _this.stylePathsStroke(highlightedPaths, true);
        }
    

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
            _this.update(component, nodeGroup, pathGroup, componentReference, d, false);
		}
  
        function childLess(d) {
            return (typeof d._children == "undefined" || d._children == null) && (typeof d.children == "undefined" || d.children == null) ; 
        }

        // finally auto-resize the chart if the bottom nodes are encroaching on the end
        var maxDepth = bzutils.getCache (componentReference, "maxDepth") ;
        var maxHorizontal = margin.left + (maxDepth * fixedDepth);
		var width = bzutils.getCache (componentReference, "width") ;  

        if (width - maxHorizontal < 100) {
            var csf = component.get("v.ChartScaleFactor");
            var newcsf = csf - 0.1;
            var eventParameters = { 
                "componentReference" : componentReference,
                "ChartScaleFactor" : newcsf
            }    

            var preppedEvent = bzchart.prepareEvent(componentReference, "ReScale", eventParameters);
            preppedEvent.eventType = "Cache";
            _this.publishPreppedEvent (component,preppedEvent);    
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

    // A way to get the path to an object - this is independent of the search box
    // we can search by name or id (searchBy = "Name" or "Id")
    searchTree : function(obj,search,path, searchBy){
        var _this = this;
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
    // searchBy is "name" or "id" depending on what searchTerm we are using
    // highlightOn is boolean - if true we switch highlighting on, otherwise we switch it off

    highlightPathsBy : function (componentReference, searchTerm, searchBy, highlightOn){
        var _this = this;
        var ultimateRoot = bzutils.getCache (componentReference, "root");

        // try to find target node down from the root node
        var paths = _this.searchTree(ultimateRoot,searchTerm,[],searchBy);
        _this.stylePathsStroke(paths, highlightOn);

        bzutils.setCache (componentReference, "highlightedPaths", paths ) ;
    },

    stylePathsStroke : function(paths, highlightOn) {
        var stroke = (highlightOn == true ? "#f00" : "#ccc");
        for(var i =0;i<paths.length;i++){
            if(paths[i].id !== "1"){//i.e. not root - TODO check value not equal to root
                var thispath = paths[i];
                var relatedPathId = "path" + paths[i]["id"];
                var g1 = d3.select("#" + relatedPathId).style("stroke", stroke); 
            }
        }
    },


    clearHighlightPaths : function () {
        //TODO - IMPLEMENT
    },

    merge : function(componentReference, updatejson) {
        bzutils.log("merge enter");
        var _this = this;

        var newjsonarray;

        if (Array.isArray(updatejson)) {
            newjsonarray = updatejson;
        }
        else {
            // if input is not an array then make it one to ease processing
            newjsonarray = [ updatejson ];
        }

        for(var i =0;i<newjsonarray.length;i++){
            var newjson = newjsonarray[i];

            // the first node id of the newjson is assumed to be a pre-existing node and should not result in a new node.
            var parentRecordId = newjson["id"]; 
            var addToNodeId = bzutils.addComponentRef(componentReference, parentRecordId);
            var parentNodeId = "circle" + addToNodeId;

            // see if this is searchable as a node
            var parentNode = bzutils.getNodeFromId(parentNodeId);

            if (parentNode == null) {
                bzutils.log("parentNode is undefined - so assuming it is collapsed. Search down from the root node of the base hierarchy");

                var ultimateRoot = bzutils.getCache (componentReference, "root");

                // try to find target node down from the root node
                var paths = _this.searchTree(ultimateRoot,parentRecordId,[],"Id");
                parentNode = paths.slice(-1).pop(); // this gets the last element of the path array which is the parent node.
            }

            // parentNode should now be defined
            var fragmentRoot = d3.hierarchy(newjson, function(d) { return d.children; });

            fragmentRoot.children.forEach(function(newchild) {
                newchild.parent = parentNode;
                newchild.depth = parentNode.depth + 1; 
                newchild.height = parentNode.height - 1;
                _this.setDepth(newchild, newchild.depth);
                if (parentNode.children) {
                    bzutils.log("parentNode has open children");
                    parentNode.children.push(newchild);
                }
                else {
                    if (parentNode._children) {
                        bzutils.log("parentNode has closed children");
                        parentNode._children.push(newchild);
                    }
                    else {
                        // falls through to this case if a node has no children defined but we now want to push children to it
                        bzutils.log("parentNode has no children defined:" + parentNodeId);
                        parentNode._children = [];
                        parentNode.data.children = [];
                        parentNode._children.push(newchild);
                        parentNode.data.children.push(newchild);
                    }
                }
        
                parentNode.data.children.push(newchild.data);
                bzctree.collapse(newchild);

            });        
        }
        bzutils.log("merge exit");
    },    


    /* Configuration number functions */

    getFixedDepth : function(component) {
        return Math.ceil(180 * component.get("v.ChartScaleFactor"));
    },

    getTextOffset : function(component) {
        return Math.ceil(13 * component.get("v.ChartScaleFactor"));
    },

    getFontSizePX : function(component) {
        return Math.ceil(12 * component.get("v.ChartScaleFactor"));
    },    

    getRadius : function(component) {
        return Math.ceil(10 * component.get("v.ChartScaleFactor"));
    },    

    // TODO function appears in many places, try to consolidate
    publishPreppedEvent : function(component,preppedEvent){
        if (preppedEvent != null) {
            var event;
            console.log("publishPreppedEvent: enter "+ preppedEvent.topic + " and " + preppedEvent.eventType);

            if (preppedEvent.eventType != null) {
                // go with preset value
                console.log("publishPreppedEvent: override eventType: " + preppedEvent.eventType);
            }
            else {
                preppedEvent.eventType = component.get("v.defaultEventType");
                console.log("publishPreppedEvent: use default eventType: " + preppedEvent.eventType);
            }

            if (preppedEvent.eventType == "Component"){
                console.log("publishPreppedEvent: eventType used will be: " +  preppedEvent.eventType);
                event = component.getEvent("evt_bzc");
            }
            if (preppedEvent.eventType == "Application"){
                console.log("publishPreppedEvent: eventType used will be: " +  preppedEvent.eventType);
                event = $A.get("e.c:evt_sfd3");
            }
            if (preppedEvent.eventType == "Cache"){
                console.log("publishPreppedEvent: eventType used will be: " +  preppedEvent.eventType);
                var componentReference = component.get("v.componentReference");
                var appEvents = bzutils.getCache (componentReference, "appEvents") ;
                event = appEvents.pop();
            }    
            bzutils.publishEventHelper(event, preppedEvent.topic, preppedEvent.parameters, preppedEvent.controllerId);     
        }
    },


})