({

    initializeVisuals: function (component) {
		console.log("subhelper: enter initializeVisuals proper structure");
		var _this = this;
        let storeObject = component.get("v.storeObject");

        let componentReference = bzchart.getStore (storeObject, "componentReference") ;  

        var datajson = bzchart.getStore (storeObject, "datajson") ;  
		var nodeGroup = bzchart.getStore (storeObject, "nodeGroup") ;  
		var pathGroup = bzchart.getStore (storeObject, "pathGroup") ;  
		// var textGroup = bzchart.getStore (storeObject, "textGroup") ;  
		// var pathToolTipDiv = bzchart.getStore (storeObject, "pathToolTipDiv") ;  
		// var pathGroupId = bzchart.getStore (storeObject, "pathGroupId") ;  
		
		var width = bzchart.getStore (storeObject, "width") ;  
        var height = bzchart.getStore (storeObject, "height") ; 

        var cc = component.getConcreteComponent();
        // dataPreprocess will set datajson in cache
        cc.dataPreprocess(datajson);
        datajson = bzchart.getStore (storeObject, "datajson") ;  

        /* tree specification */
        
        var tree = d3.tree().size([height, width]);
        bzchart.setStore (storeObject, "tree", tree ) ;
        
        // Assigns parent, children, height, depth
        var root = d3.hierarchy(datajson, function(d) { return d.children; });
        root.x0 = height / 2;
        root.y0 = 0;

        // Collapse after the second level (provided root has children)
        if (root.children != null) {
            root.children.forEach(bzctree.collapse);
        }

        bzchart.setStore (storeObject, "root", root ) ;

        _this.update(component, nodeGroup, pathGroup, root, false);

        // Push out an initial message to highlight the root node to display panels
        // Effecitvely can do this via a mouseover event on root.
        // TODO can move this to a generic location?

        var highlightId = datajson["initialHighlightId"];
        bzchart.setStore (storeObject, "mouseoverRecordId", highlightId ) ;
        _this.restockCache(component);

        var nodeToPublish = root;

        if (highlightId != null && highlightId != root.id) {
            // in some cases we want the primary reference on a chart to be different from the top node
            // for example if we are showing parent node rather than having our focus node at the top

            nodeToPublish = d3.select("#" + componentReference + highlightId).datum();
            // in this case we will always highlight the path to the key node and open up that node
            bzctree.highlightPathsBy(storeObject, highlightId, "Id", true);

            bzctree.openPathsBy(storeObject, highlightId, "Id");
        }

        var preppedEvent = _this.nodeMouseover(component, nodeToPublish); 
        _this.publishPreppedEvent(component,preppedEvent);
        _this.updatePopoverDirectly(component, preppedEvent);

        console.log("initialize root path");
    },

    update : function(component, nodeGroup, pathGroup, source, makeSourceRoot) {
		var _this = this;
        let masterConfigObject = component.get("v.masterConfigObject");
        let storeObject = component.get("v.storeObject");
        let componentReference = bzchart.getStore (storeObject, "componentReference") ;

        var nodes;
        var links;
        var duration = 250;
        var shortDuration = 250;
        var fixedDepth = bzctree.getFixedDepth(storeObject); // this may need to be a function of chart area depth?

        var showMeasureValues = bzchart.getStore (storeObject, "showMeasureValues");

        var margin = bzchart.getStore (storeObject, "margin") ;  
        
        // Assigns the x and y position for the nodes

        var tree = bzchart.getStore (storeObject, "tree" ) ;

        var treeData;
        if (makeSourceRoot === true) {
            // INTERESTING -- RE-ROOT OPTION
            // WOULD NEED TO TRANSFROM TO SHIFT EVERYTHING TO THE LEFT
            // can do that by a variant of the nodes.forEach function a few lines below this
            treeData = tree(source);

        }
        else {
            var root = bzchart.getStore (storeObject, "root" ) ;
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
            if (!bzchart.hasStore (storeObject, "maxDepth")) {
                bzchart.setStore (storeObject, "maxDepth", 0) ;
            }
            var maxDepth = bzchart.getStore (storeObject, "maxDepth") ;
            if (d.depth > maxDepth) {
                bzchart.setStore (storeObject, "maxDepth", d.depth) ;
                console.log("maxDepth: " + bzchart.getStore (storeObject, "maxDepth") );
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
                    d.id = bzutils.addComponentRef(componentReference, d.data.id);
                    return d.id;
                }
                d.id = bzutils.addComponentRef(componentReference, "000000000000000000");
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
				bzchart.setStore (storeObject, "mouseoverRecordId", d.id ) ;
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
				bzchart.setStore (storeObject, "mouseoutRecordId", d.id ) ;
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
                return bzchart.getFilterOpacity (storeObject, d.data);
            })
            .style("stroke-opacity", function(d, i) {
                return bzchart.getFilterOpacity (storeObject, d.data);
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
                    return childLess(d) ? bzctree.getTextOffset(storeObject) : - bzctree.getTextOffset(storeObject);
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
                return bzctree.getFontSizePX(storeObject) + "px sans-serif";
            })
            .style("opacity", function(d) {
                return bzchart.getFilterOpacity (storeObject, d.data);
            })    
            .text(function(d) { 
                var textDisplay = d.data.name;
                return textDisplay;
            })
            .append('svg:tspan') // append a second line if measures are to be displayed. https://stackoverflow.com/questions/16701522/how-to-linebreak-an-svg-text-within-javascript/16701952#16701952
            .attr("id", d => "tspan2" + d.id)          
            .attr("x", function(d) {
                if (d.depth > 0) {
                    return childLess(d) ? bzctree.getTextOffset(storeObject) : - bzctree.getTextOffset(storeObject);
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
            .attr('r', bzctree.getRadius(storeObject))
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
                return bzchart.getFilterOpacity (storeObject, d.data);
            })
            .style("stroke-opacity", function(d, i) {
                return bzchart.getFilterOpacity (storeObject, d.data);
            })
            .attr('cursor', 'pointer');      

        /* TODO - wrap this is a check as to whether to change */   
        
        if (bzchart.getStore (storeObject, "updateColor")) {
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
                    return childLess(d) ? bzctree.getTextOffset(storeObject) : - bzctree.getTextOffset(storeObject);
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
                return bzchart.getFilterOpacity (storeObject, d.data);
            })    
            .select('tspan') // update the measures
            .text(function(d) { 
                if (showMeasureValues == true) {
                    // we don't have updates on size for tree hierarchies
                    if (bzchart.getStore (storeObject, "updateColor")) {
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
                return bzhierarchy.getFilterOpacityPath(storeObject,d);
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
        var highlightedPaths = bzchart.getStore (storeObject, "highlightedPaths") ;
        if (highlightedPaths != null) {
            bzctree.stylePathsStroke(highlightedPaths, true);
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
            _this.update(component, nodeGroup, pathGroup, d, false);
		}
  
        function childLess(d) {
            return (typeof d._children == "undefined" || d._children == null) && (typeof d.children == "undefined" || d.children == null) ; 
        }

        

        // finally auto-resize the chart if the bottom nodes are encroaching on the end
        var maxDepth = bzchart.getStore (storeObject, "maxDepth") ;
        var maxHorizontal = margin.left + (maxDepth * fixedDepth);
		var width = bzchart.getStore (storeObject, "width") ;  

        if (width - maxHorizontal < 100) {
            let csf = bzchart.getStoreWithDefault (storeObject, "ChartScaleFactor", 1) ;

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

    // TODO function appears in many places, try to consolidate
    publishPreppedEvent : function(component,preppedEvent){
        let storeObject = component.get("v.storeObject");
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
                var appEvents = bzchart.getStore (storeObject, "appEvents") ;
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
        // var infosvg = bzchart.getStore (storeObject, "infosvg") ;
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


})