(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.bzhierarchy = global.bzhierarchy || {})));
}(this, (function (exports) { 'use strict';

    console.log("loading: bzhierarchy IIFE");

    function picklistNest (groupingFields, datajson) {
        let numberOfGroupings = groupingFields.length; 

        // we use d3.nest to produce the levels and utilize to create a new version of datajson
        let nestData = d3.nest()
            .key(function(d){  
                return d.fields[groupingFields[0].fieldIndex].retrievedValue;
            }) 
            if (numberOfGroupings >= 2) {
                nestData = nestData.key(d => d.fields[groupingFields[1].fieldIndex].retrievedValue);
            }
            if (numberOfGroupings >= 3) {
                nestData = nestData.key(d => d.fields[groupingFields[2].fieldIndex].retrievedValue);
            }

        nestData = nestData.entries(datajson.children);

        // Top (Total) level
        let djSetup = {"name" : "Total", "children" : []};

        return bzhierarchy.nestChildren(djSetup, nestData, numberOfGroupings);
    }


    function nestChildren (jsonStructure, nestData, levelsFromBottom) {
        console.log("loading: bzhierarchy nestChildren");

        for (var i = 0; i < nestData.length; i++) {
            let newJsonSegment = {"name" : nestData[i].key};
            newJsonSegment["children"] = [];

            if (levelsFromBottom > 1) {
                let nextLevelDown = levelsFromBottom - 1;
                let childStructureToAdd = bzhierarchy.nestChildren(newJsonSegment, nestData[i]["values"], nextLevelDown);
                jsonStructure["children"].push(childStructureToAdd) ;
            }

            // we have leaf nodes to add
            if (levelsFromBottom == 1) {
                for (var j = 0; j < nestData[i]["values"].length; j++) {
                    newJsonSegment["children"].push(nestData[i]["values"][j]);
                }
                jsonStructure["children"].push(newJsonSegment) ;
            }
        }           
        return jsonStructure; 
    }

    // A way to get the path to an object - this is independent of the search box
    // we can search by name or id (searchBy = "Name" or "Id")
    function searchTree (obj,search,path, searchBy){
        var objFieldValue = (searchBy == "Name" ? obj.data.name : obj.data.id );
        
        if(objFieldValue === search){ //if search is found return, add the object to the path and return it
            path.push(obj);
            return path;
        }

        else if(obj.children || obj._children){ //if children are collapsed d3 object will have them instantiated as _children
            var children = (obj.children) ? obj.children : obj._children;
            for(var i=0;i<children.length;i++){
                path.push(obj);// we assume this path is the right one
                var found = bzhierarchy.searchTree(children[i],search,path, searchBy);
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

    }

    function getFilterOpacityPath (storeObject, d) {
        console.log("xxxxx: getFilterOpacityPath");
        var filteredParent = bzchart.isFilteredOut(storeObject, d.parent.data);
        var filteredNode = bzchart.isFilteredOut(storeObject, d.data);

        if (filteredParent && filteredNode) {
            return 0.1;
        }
        if (filteredParent || filteredNode) {
            return 0.3;
        }
        return 1;
    }

    function merge (storeObject, updatejson) {
        let componentReference = bzchart.getStore (storeObject, "componentReference") ;
        let newjsonarray;

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
            var addToNodeId = bzutils.addComponentRef(componentReference, parentRecordId);
            var parentNodeId = "circle" + addToNodeId;

            // see if this is searchable as a node
            var parentNode = bzutils.getNodeFromId(parentNodeId);

            if (parentNode == null) {
                var ultimateRoot = bzchart.getStore (storeObject, "root");

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
                bzctree.collapse(newchild);

            });        
        }
    }  

    function refreshVisibilityHelper(storeObject){
        let componentReference = bzchart.getStore (storeObject, "componentReference") ;  
        
        let node = d3.select(bzutils.getDivId("nodeGroup", componentReference, true))
            .selectAll("circle,rect") // comma separated searches for both
            .style("fill-opacity", function(d, i) {
                return bzchart.getFilterOpacity (storeObject, d.data);
            })
            .style("stroke-opacity", function(d, i) {
                return bzchart.getFilterOpacity (storeObject, d.data);
            });

        let text = d3.select(bzutils.getDivId("nodeGroup", componentReference, true))
            .selectAll("text")
            .style("opacity", function(d, i) {
                return bzchart.getFilterOpacity (storeObject, d.data);
            });

        let path = d3.select(bzutils.getDivId("pathGroup", componentReference, true))
            .selectAll("path")
            .style("stroke-opacity", function(d, i) {
                return bzhierarchy.getFilterOpacityPath(storeObject,d);
            });
    }

    /*
     Note - popover component is not in the component hierarchy so needs to be invoked directly, 
     not via a component event which is till not recognize
    */

    function updatePopoverDirectly(storeObject, preppedEvent) {
        let allowPopover = bzchart.getStore(storeObject, "allowPopover");
        if (allowPopover == null) { allowPopover = false; }

        if (allowPopover == true) {
            let defaultEventType = bzchart.getStore(storeObject, "defaultEventType");

            if (defaultEventType == "Component") {
                let popoverPanel = bzchart.getStore(storeObject, "popoverPanel");
                let popoverPanelFirst = popoverPanel[0];
                bzaura.callFromContainerWrap(popoverPanelFirst, preppedEvent);
            }
        }
    }

    function update (storeObject, nodeGroup, pathGroup, source, makeSourceRoot) {
        let variantsMixin = bzchart.getStore (storeObject, "chartMixin") ;
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
                let preppedEvent = variantsMixin.nodeMouseover(storeObject, d);
                bzaura.publishPreppedEvent(storeObject,preppedEvent,$A.get("e.c:evt_sfd3"));
                bzhierarchy.updatePopoverDirectly(storeObject, preppedEvent);

                // var textcontent = '<tspan x="100" y="0" style="font-weight: bold;">' + d.data.name ;
                // textcontent += '</tspan>'; 
                // textcontent += '<tspan x="10" dy="15">' + ' (' + ')</tspan>';
    
                // var tselect =  "t" + d.id;
                // var s = d3.select("#" + tselect);
                // s.html(textcontent);
            }))
			.on('mouseout', $A.getCallback(function(d) { // need getCallback to retain context - https://salesforce.stackexchange.com/questions/158422/a-get-for-application-event-is-undefined-or-can-only-fire-once
				bzchart.setStore (storeObject, "mouseoutRecordId", d.id ) ;
                let preppedEvent = variantsMixin.nodeMouseout(storeObject, d);
                bzaura.publishPreppedEvent(storeObject,preppedEvent,$A.get("e.c:evt_sfd3"));
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
                    return bzchart.getFromMeasureScheme(storeObject, d.data, "Color");                
                }
                return bzchart.getFromMeasureScheme(storeObject, d.data, "Color");                
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
                return bzctree.getFontSizePX(storeObject) + "px sans-serif";
            })
            .style("opacity", function(d) {
                return bzchart.getFilterOpacity (storeObject, d.data);
            })    
            .select('tspan') // update the measures
            .text(function(d) { 
                if (showMeasureValues == true) {
                    // we don't have updates on size for tree hierarchies
                    if (bzchart.getStore (storeObject, "updateColor")) {
                        var nodeValue = bzchart.getFromMeasureScheme(storeObject, d.data, "Value");
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
            bzhierarchy.update(storeObject, nodeGroup, pathGroup, d, false);
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

            var preppedEvent = bzchart.prepareEvent(storeObject, "ReScale", eventParameters);
            preppedEvent.eventType = "Cache";
            bzaura.publishPreppedEvent (storeObject,preppedEvent,$A.get("e.c:evt_sfd3"));    
        }
    }


    exports.nestChildren = nestChildren;
    exports.picklistNest = picklistNest;
    exports.searchTree = searchTree;
    exports.getFilterOpacityPath = getFilterOpacityPath;
    exports.merge = merge;
    exports.refreshVisibilityHelper = refreshVisibilityHelper;
    exports.updatePopoverDirectly = updatePopoverDirectly;
    exports.update = update;
    
    Object.defineProperty(exports, '__esModule', { value: true });

    console.log("loaded: bzhierarchy  IIFE");

})));

/* OVERRIDE MIXINS */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.chartHierarchyMixin = global.chartHierarchyMixin || {})));
}(this, (function (exports) { 'use strict';

console.log("loading: chartHierarchyMixin IIFE");

const OverrideMixin = {
    refreshVisibility(storeObject){
        bzhierarchy.refreshVisibilityHelper(storeObject);
    },

    nodeMouseover (storeObject, d) {
        var publishParameters = {"data" : d.data, "parent" : d.parent ? d.parent.data : null};
        var preppedEvent = bzchart.prepareEvent(storeObject, "ChartMouseOver", publishParameters);
        preppedEvent.eventType = "Cache";    
        return preppedEvent;        
    },

    nodeMouseout (storeObject, d) {
        var publishParameters = {"data" : d.data, "parent" : d.parent ? d.parent.data : null};
        var preppedEvent = bzchart.prepareEvent(storeObject, "ChartMouseOut", publishParameters);
        if (d.depth > 1) {
            preppedEvent.eventType = "Cache";
        } 
        return preppedEvent;
    },

    // dataPreprocess works by resetting datajson value in Cache
    dataPreprocess(storeObject, datajson, datajsonRefresh) {
        console.log("xxxxxx: mixin: dataPreprocess");
        let groupingFields = bzchart.getStore (storeObject, "groupingFields");

        if (groupingFields.length > 0) {
            let groupingFields = bzchart.getStore (storeObject, "groupingFields");
            datajson = bzhierarchy.picklistNest(groupingFields, datajson);
            bzchart.setStore (storeObject, "datajson", datajson ) ;    
        }  
    }
  
}

exports.OverrideMixin = OverrideMixin;

Object.defineProperty(exports, '__esModule', { value: true });

console.log("loaded: chartHierarchyMixin IIFE");


})));
