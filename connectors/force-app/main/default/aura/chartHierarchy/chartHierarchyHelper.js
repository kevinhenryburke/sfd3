({

    initializeVisuals: function (component) {
		console.log("subhelper: enter initializeVisuals proper structure");
		var _this = this;

        var componentReference = component.get("v.componentReference");
        var masterConfigObject = component.get("v.masterConfigObject");

        var datajson = _this.getStore (component, "datajson") ;  
		var nodeGroup = _this.getStore (component, "nodeGroup") ;  
		var pathGroup = _this.getStore (component, "pathGroup") ;  
		// var textGroup = _this.getStore (component, "textGroup") ;  
		// var pathToolTipDiv = _this.getStore (component, "pathToolTipDiv") ;  
		// var pathGroupId = _this.getStore (component, "pathGroupId") ;  
		
		var width = _this.getStore (component, "width") ;  
        var height = _this.getStore (component, "height") ; 

        var cc = component.getConcreteComponent();
        // dataPreprocess will set datajson in cache
        cc.dataPreprocess(datajson);
        datajson = _this.getStore (component, "datajson") ;  

        /* tree specification */
        
        var tree = d3.tree().size([height, width]);
        _this.setStore (component, "tree", tree ) ;
        
        // Assigns parent, children, height, depth
        var root = d3.hierarchy(datajson, function(d) { return d.children; });
        root.x0 = height / 2;
        root.y0 = 0;

        // Collapse after the second level (provided root has children)
        if (root.children != null) {
            root.children.forEach(_this.collapse);
        }

        _this.setStore (component, "root", root ) ;

        _this.update(component, nodeGroup, pathGroup, componentReference, root, false);

        // Push out an initial message to highlight the root node to display panels
        // Effecitvely can do this via a mouseover event on root.
        // TODO can move this to a generic location?

        var highlightId = datajson["initialHighlightId"];
        _this.setStore (component, "mouseoverRecordId", highlightId ) ;
        _this.restockCache(component);

        var nodeToPublish = root;

        if (highlightId != null && highlightId != root.id) {
            // in some cases we want the primary reference on a chart to be different from the top node
            // for example if we are showing parent node rather than having our focus node at the top

            nodeToPublish = d3.select("#" + componentReference + highlightId).datum();
            // in this case we will always highlight the path to the key node and open up that node
            _this.highlightPathsBy(component, highlightId, "Id", true);
            _this.openPathsBy(component, highlightId, "Id");
        }

        var preppedEvent = _this.nodeMouseover(component, nodeToPublish); 
        _this.publishPreppedEvent(component,preppedEvent);
        _this.updatePopoverDirectly(component, preppedEvent);

        console.log("initialize root path");
    },

    update : function(component, nodeGroup, pathGroup, componentReference, source, makeSourceRoot) {
		var _this = this;

        let masterConfigObject = component.get("v.masterConfigObject");
        console.log("xxxxx masterConfigObject", masterConfigObject);

        var nodes;
        var links;
        var duration = 250;
        var shortDuration = 250;
        var fixedDepth = bzctree.getFixedDepth(masterConfigObject); // this may need to be a function of chart area depth?

        var showMeasureValues = _this.getStore(component, "showMeasureValues");

        var margin = _this.getStore (component, "margin") ;  
        
        // Assigns the x and y position for the nodes

        var tree = _this.getStore (component, "tree" ) ;

        var treeData;
        if (makeSourceRoot === true) {
            // INTERESTING -- RE-ROOT OPTION
            // WOULD NEED TO TRANSFROM TO SHIFT EVERYTHING TO THE LEFT
            // can do that by a variant of the nodes.forEach function a few lines below this
            treeData = tree(source);

        }
        else {
            var root = _this.getStore (component, "root" ) ;
            treeData = tree(root);
        }        
      
        // Compute the new tree layout.
        nodes = treeData.descendants();
        // descendants: nodes will contain all of the visible nodes
        links = treeData.descendants().slice(1);

        // Example of how to filter nodes and links
/*        nodes = nodes.filter(function(d, i) {
            if (d.data.name.length < 10) {
                return false;
            }
            return true;
        });
        links = links.filter(function(d, i) {
            if (d.data.name.length < 10) {
                return false;
            }
            if (d.parent.data.name.length < 10) {
                return false;
            }
            return true;
        }); */

        // Normalize for fixed-depth.
        nodes.forEach(function(d){ 
            d.y = margin.left + (d.depth * fixedDepth);

            // workout the maximum depth in the chart so we can perform any necessary resizing
            if (!_this.hasStore (component, "maxDepth")) {
                _this.setStore (component, "maxDepth", 0) ;
            }
            var maxDepth = _this.getStore (component, "maxDepth") ;
            if (d.depth > maxDepth) {
                _this.setStore (component, "maxDepth", d.depth) ;
                console.log("maxDepth: " + _this.getStore (component, "maxDepth") );
            }
        });

        // ****************** Nodes section ***************************
      
        // Update the nodes...
        
        var node = nodeGroup.selectAll('g.treenode') // note: notation g.treenode means it has both g and treenode classes
            .data(nodes, function(d) {   
                let retVal = d.id; 
                if (retVal != null ) {
                    return retVal;
                }
                if (retVal == null && d.data.id != null) {
                    d.id = _this.addComponentRef(componentReference, d.data.id);
                    return d.id;
                }
                d.id = _this.addComponentRef(componentReference, "000000000000000000");
                return d.id;
            });  

        // Enter any new modes at the parent's previous position.
        var nodeEnter = node.enter().append('g')
            .attr("class", function(d) {
                var classes = 'treenode ' + d.id;
                if (d.data.name == null || d.data.name.length < 5) {
                    classes += " shortname";
                }
                else {
                    classes += " longname";
                }
                return classes;
            })
            .attr("transform", function(d) {
                var t = "translate(" + source.y0 + "," + source.x0 + ")";
                return t;
            })
            .attr("id", d => d.id)            
            .attr("aura:id", d => d.id)            
            .attr("recordid", d => d.data.id)            
            // .filter(function(d, i) {if (d.data.name.length < 5) { return false; } return true;})            
            .on('click', click)
			.on('mouseover', $A.getCallback(function(d) { // need getCallback to retain context - https://salesforce.stackexchange.com/questions/158422/a-get-for-application-event-is-undefined-or-can-only-fire-once
				_this.setStore (component, "mouseoverRecordId", d.id ) ;
                var preppedEvent = _this.nodeMouseover(component, d); 
                _this.publishPreppedEvent(component,preppedEvent);
                if (d.depth <= 1) { // root or first level
                    _this.restockCache(component);
                }

                _this.updatePopoverDirectly(component, preppedEvent);

                // var textcontent = '<tspan x="100" y="0" style="font-weight: bold;">' + d.data.name ;
                // textcontent += '</tspan>'; 
                // textcontent += '<tspan x="10" dy="15">' + ' (' + ')</tspan>';
    
                // var tselect =  "t" + d.id;
                // var s = d3.select("#" + tselect);
                // s.html(textcontent);


            }))
			.on('mouseout', $A.getCallback(function(d) { // need getCallback to retain context - https://salesforce.stackexchange.com/questions/158422/a-get-for-application-event-is-undefined-or-can-only-fire-once
				_this.setStore (component, "mouseoutRecordId", d.id ) ;
                var preppedEvent = _this.nodeMouseout(component, d); 
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
            .attr("id", d => "circle" + d.id)            
            .attr("aura:id", function(d) {
                return "circle" + d.id;
            })            
            .style("stroke", function(d) {
                if(childLess(d)) {
                    return "black";
                }
                return "lightslategray";
            })
            .style("stroke-width", function(d) {
                if(childLess(d)) {
                    return "0.5px";
                }
                return "4px";
            })
            .style("fill-opacity", function(d, i) {
                return _this.getFilterOpacity(component, d.data);
            })
            .style("stroke-opacity", function(d, i) {
                return _this.getFilterOpacity(component, d.data);
            })
            ;

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
                    return childLess(d) ? bzctree.getTextOffset(masterConfigObject) : - bzctree.getTextOffset(masterConfigObject);
                }
                return -1;
            })
            .attr("text-anchor", function(d) {
                var textAnchor = "middle";
                if (d.depth > 0) {
                    textAnchor = childLess(d) ? "start" : "end";
                } 
                return textAnchor;
            })
            .attr("id", d => "t" + d.id)            
            .style("font", function(d) {
                return bzctree.getFontSizePX(masterConfigObject) + "px sans-serif";
            })
            .style("opacity", function(d) {
                return _this.getFilterOpacity(component, d.data);
            })    
            .text(function(d) { 
                var textDisplay = d.data.name;
                return textDisplay;
            })
            .append('svg:tspan') // append a second line if measures are to be displayed. https://stackoverflow.com/questions/16701522/how-to-linebreak-an-svg-text-within-javascript/16701952#16701952
            .attr("id", d => "tspan2" + d.id)          
            .attr("x", function(d) {
                if (d.depth > 0) {
                    return childLess(d) ? bzctree.getTextOffset(masterConfigObject) : - bzctree.getTextOffset(masterConfigObject);
                }
                return -1;
            })
            .attr("dy", function(d) {
                if (d.depth > 0) {
                    return "1.35em";
                }
                return "-1.35em";
            })
            ;

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
        var nuc = nodeUpdate.select('circle.treenode')
            .attr('r', bzctree.getRadius(masterConfigObject))
            .style("stroke", function(d) {
                if(childLess(d)) {
                    return "black";
                }
                return "lightslategray";
            })
            .style("stroke-width", function(d) {
                if(childLess(d)) {
                    return "0.5px";
                }
                return "4px";
            })
            .style("fill-opacity", function(d, i) {
                return _this.getFilterOpacity(component, d.data);
            })
            .style("stroke-opacity", function(d, i) {
                return _this.getFilterOpacity(component, d.data);
            })
            .attr('cursor', 'pointer');      

        /* TODO - wrap this is a check as to whether to change */   
        
        if (_this.getStore(component, "updateColor")) {
            nuc.style("fill", function(d) {
                // collapsed children are stored as d._children / expanded as d.children
                // at present color is treated the same for parents and children
                if(childLess(d)) {
                    return _this.getFromMeasureScheme(component, d.data, "Color");                
                }
                return _this.getFromMeasureScheme(component, d.data, "Color");                
            })
        }
          
        // text box starts to the right for childless nodes, to the left for parents (collapsed or expanded)  
        var nut = nodeUpdate.select('text')
            .attr("childLess", function(d) {
                return childLess(d);
            })
            .attr("x", function(d) {
                if (d.depth > 0) {
                    return childLess(d) ? bzctree.getTextOffset(masterConfigObject) : - bzctree.getTextOffset(masterConfigObject);
                }
                return -1;
            })
            .attr("text-anchor", function(d) {
                var textAnchor = "middle";
                if (d.depth > 0) {
                    textAnchor = childLess(d) ? "start" : "end";
                } 
                return textAnchor;
            })
            .style("font", function(d) {
                return bzctree.getFontSizePX(masterConfigObject) + "px sans-serif";
            })
            .style("opacity", function(d) {
                return _this.getFilterOpacity(component, d.data);
            })    
            .select('tspan') // update the measures
            .text(function(d) { 
                if (showMeasureValues == true) {
                    // we don't have updates on size for tree hierarchies
                    if (_this.getStore(component, "updateColor")) {
                        var nodeValue = _this.getFromMeasureScheme(component, d.data, "Value");
                        return "(" + nodeValue.toLocaleString()  + ")" ;
                    }
                }
            })            

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
            .attr("id", d => "path" + d.id)            
            .attr("aura:id", function(d) { return "path" + d.id; }) // identify a path using its lower level node (so must be unique!)
            .attr("class", "treelink")
            .attr('d', function(d){
                var o = {x: source.x0, y: source.y0}
                return diagonal(o, o)
            })
            .attr("stroke-opacity", function(d) {
                return _this.getFilterOpacityPath(component,d);
            })            
            ;
      
        // UPDATE        
        var linkUpdate = linkEnter.merge(link);


        // Transition back to the parent element position
        linkUpdate.transition()
            .duration(shortDuration)
            .attr('d', function(d){ return diagonal(d, d.parent) })
            
            ;
      
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
        var highlightedPaths = _this.getStore (component, "highlightedPaths") ;
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
        var maxDepth = _this.getStore (component, "maxDepth") ;
        var maxHorizontal = margin.left + (maxDepth * fixedDepth);
		var width = _this.getStore (component, "width") ;  

        if (width - maxHorizontal < 100) {
            let csf = bzchart.getStore (masterConfigObject, "ChartScaleFactor") ;
            if (csf == null) { csf = 1;}

            var newcsf = csf - 0.1;
            var eventParameters = { 
                "componentReference" : componentReference,
                "ChartScaleFactor" : newcsf
            }    

            var preppedEvent = _this.prepareEvent(component, "ReScale", eventParameters);
            preppedEvent.eventType = "Cache";
            _this.publishPreppedEvent (component,preppedEvent);    
        }
    },

    // open the input paths in the graph, note that need to call update afterwards
    openPathsBy : function (component, searchTerm, searchBy){
        var _this = this;
        var ultimateRoot = _this.getStore (component, "root");

        // try to find target node down from the root node
        var paths = bzhierarchy.searchTree(ultimateRoot,searchTerm,[],searchBy);
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

    highlightPathsBy : function (component, searchTerm, searchBy, highlightOn){
        var _this = this;
        var ultimateRoot = _this.getStore (component, "root");

        // try to find target node down from the root node
        var paths = bzhierarchy.searchTree(ultimateRoot,searchTerm,[],searchBy);
        _this.stylePathsStroke(paths, highlightOn);

        _this.setStore (component, "highlightedPaths", paths ) ;
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

    merge : function(component, updatejson) {
        var componentReference = component.get("v.componentReference");
        var _this = this;

        var newjsonarray;

        function setDepthFromBase (baseNode, baseNodeDepth) {
            console.log("setDepthFromBase");
            if(baseNode.children) {
                baseNode.children.forEach(function(d) {
                    d.depth = baseNodeDepth + 1;
                    setDepthFromBase(d,baseNodeDepth +1);            
                });
            }        
        }
    

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
            var addToNodeId = _this.addComponentRef(componentReference, parentRecordId);
            var parentNodeId = "circle" + addToNodeId;

            // see if this is searchable as a node
            var parentNode = _this.getNodeFromId(parentNodeId);

            if (parentNode == null) {
                var ultimateRoot = _this.getStore (component, "root");

                // try to find target node down from the root node
                var paths = bzhierarchy.searchTree(ultimateRoot,parentRecordId,[],"Id");
                parentNode = paths.slice(-1).pop(); // this gets the last element of the path array which is the parent node.
            }

            // parentNode should now be defined
            var fragmentRoot = d3.hierarchy(newjson, function(d) { return d.children; });

            fragmentRoot.children.forEach(function(newchild) {
                newchild.parent = parentNode;
                newchild.depth = parentNode.depth + 1; 
                newchild.height = parentNode.height - 1;
                setDepthFromBase(newchild, newchild.depth);
                if (parentNode.children) {
                    parentNode.children.push(newchild);
                }
                else {
                    if (parentNode._children) {
                        parentNode._children.push(newchild);
                    }
                    else {
                        // falls through to this case if a node has no children defined but we now want to push children to it
                        parentNode._children = [];
                        parentNode.data.children = [];
                        parentNode._children.push(newchild);
                        parentNode.data.children.push(newchild);
                    }
                }
        
                parentNode.data.children.push(newchild.data);
                _this.collapse(newchild);

            });        
        }
    },    

    // TODO function appears in many places, try to consolidate
    publishPreppedEvent : function(component,preppedEvent){
        var _this = this;
        if (preppedEvent != null) {
            var event;
            console.log("publishPreppedEvent: enter "+ preppedEvent.topic + " and " + preppedEvent.eventType);

            if (preppedEvent.eventType != null) {
                // go with preset value
                console.log("publishPreppedEvent: override eventType: " + preppedEvent.eventType);
            }
            else {
                preppedEvent.eventType = component.get("v.defaultEventType");
            }

            if (preppedEvent.eventType == "Component"){
                event = component.getEvent("evt_bzc");
            }
            if (preppedEvent.eventType == "Application"){
                event = $A.get("e.c:evt_sfd3");
            }
            if (preppedEvent.eventType == "Cache"){
                var appEvents = _this.getStore (component, "appEvents") ;
                event = appEvents.pop();
            }    
            bzutils.publishEventHelper(event, preppedEvent.topic, preppedEvent.parameters, preppedEvent.controllerId);     
        }
    },

    nodeMouseover : function (component, d) {
        var _this = this;
        console.log("chartHierarchyHelper.nodeMouseover enter");
        var publishParameters = {"data" : d.data, "parent" : d.parent ? d.parent.data : null};
        console.log(publishParameters);
        
        var preppedEvent = _this.prepareEvent(component, "ChartMouseOver", publishParameters);
        preppedEvent.eventType = "Cache";

        // attempt to get the lighting info panel to follow the highlight.        
        // var infosvg = _this.getStore (component, "infosvg") ;
        // var dx = d.x;
        // var dy = d.y;
        // console.log("popover:" + dy + " / " + dx);
        // infosvg.attr('transform',function(d,i) { return 'translate(' + dy + ',' + dx + ')';})

        // transitions fine but the lightning component only moves on scroll???
        // infosvg.transition()
        // .duration(1000)
        // .attr("transform", function(d) { 
        // var t = "translate(" + dy  + "," + dx + ")";
        //     return t;
        // });

        // if (dy > 500) {
        // infosvg.transition()
        // .duration(100)
        // .attr("transform", function(d) { 
        // var t = "translate(" + 50  + "," + dx + ")";
        //     return t;
        // });    
        // }

        // if (dy < 500) {
        // infosvg.transition()
        // .duration(100)
        // .attr("transform", function(d) { 
        // var t = "translate(" + 600  + "," + dx + ")";
        //     return t;
        // });    
        // }
    
        return preppedEvent;
        
    },
    
    nodeMouseout : function (component, d) {
        var _this = this;
        console.log("chartHierarchyHelper.nodeMouseout enter.");
        var publishParameters = {"data" : d.data, "parent" : d.parent ? d.parent.data : null};
        
        var preppedEvent = _this.prepareEvent(component, "ChartMouseOut", publishParameters);
        if (d.depth > 1) {
            preppedEvent.eventType = "Cache";
        } 
        return preppedEvent;
    },

    // Collapse the node and all its children
    collapse : function (d) {
        var recursor = function (e) {
            if(e.children) {
                e._children = e.children
                e._children.forEach(recursor)
                e.children = null
            }
        };

        if(d.children) {
            d._children = d.children
            d._children.forEach(recursor)
            d.children = null
        }
    },

    getFilterOpacityPath : function (component, d) {
        var _this = this;
        var filteredParent = _this.isFilteredOut(component, d.parent.data);
        var filteredNode = _this.isFilteredOut(component, d.data);

        if (filteredParent && filteredNode) {
            return 0.1;
        }
        if (filteredParent || filteredNode) {
            return 0.3;
        }
        return 1;
    },

    refreshVisibilityHelper: function(component){
        var _this = this;
        console.log("refreshVisibilityHelper enter");
        var componentReference = component.get("v.componentReference");       
        
        var node = d3.select(_this.getDivId("nodeGroup", componentReference, true))
            .selectAll("circle,rect") // comma separated searches for both
            .style("fill-opacity", function(d, i) {
                return _this.getFilterOpacity(component, d.data);
            })
            .style("stroke-opacity", function(d, i) {
                return _this.getFilterOpacity(component, d.data);
            })            
        ;

        var text = d3.select(_this.getDivId("nodeGroup", componentReference, true))
            .selectAll("text")
            .style("opacity", function(d, i) {
                return _this.getFilterOpacity(component, d.data);
            });

        var path = d3.select(_this.getDivId("pathGroup", componentReference, true))
            .selectAll("path")
            .style("stroke-opacity", function(d, i) {
                return _this.getFilterOpacityPath(component,d);
            });


        console.log("aura:method refreshVisibility in subcomponent exit");
    }


})