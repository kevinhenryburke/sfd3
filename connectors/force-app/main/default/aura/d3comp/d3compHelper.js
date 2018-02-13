({


     init: function (component, inputjson) {
        var _this = this; 
        console.log("in init helper function");
      
        var initialized = component.get("v.initialized");
        console.log("init:initialized: " + initialized);
      
        if (initialized != true) {
          // underlying data parsed to JSON object
          datajson = JSON.parse(inputjson);
      
          console.log(datajson);
      
          // set the first measure as default
          measure = datajson.measures[0];
      
          /* primary node */
          primaryid = datajson.people[0].id;
      
          // Compute the distinct nodes from the links.
          datajson.relations.forEach(function(link) {
            link.source = datajson.people[link.source];
            link.target = datajson.people[link.target];
          });
      
      
          datajson.filtertypes.forEach(function(filtertype) {
            clickedfilters.push(filtertype);
          });
      
      
          force = d3.layout.force()
            .nodes(d3.values(datajson.people))
            .links(datajson.relations)
            .size([width, height])
            .linkDistance(200)
            .charge(-800)
            .on("tick", tick)
            .start();
      
        var initialized = component.get("v.initialized");
        if (initialized != true) {
                component.set("v.initialized", true);    
        }
      
          // Per-type markers, as they don't inherit styles.
          // KB not sure what benefit this is giving
          svg.append("defs").selectAll("marker")
            .data(datajson.filtertypes)
            .enter().append("marker")
            .attr("id", function(d) {
              return d;
            })
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 15)
            .attr("refY", -1.5)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M0,-5L10,0L0,5");
      
      
          path = svg.append("g").selectAll("path")
            .data(force.links())
            .enter().append("path")
            .attr("class", function(d) {
              return "link " + d.type;
            })
            .attr("stroke", function(d) {
              return d.stroke;
            })
            .attr("marker-end", function(d) {
              return "url(#" + d.type + ")";
            })
            .on('mouseover', pathtip.show)
            .on('mouseout', pathtip.hide);
      
          circle = svg.append("g").selectAll("circle")
            .data(force.nodes())
            .enter().append("circle")
            .attr("r", function(d) {
              return d.measures[measure].radius;
            })
            .attr("fill", function(d) {
              return d.measures[measure].color;
            })
            .attr("id", function(d) {
              return d.id;
            })
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide)
            .on('click', function(d) {
              if(isiOS){
                var now = new Date().getTime();
                var delta = now - lastTouch;
      
                if(delta<350 && delta>0){
                     // the second touchend event happened within half a second. Here is where we invoke the double tap code
                  var win = window.open("http://news.bbc.co.uk");
                  win.focus();        
                }
                lastTouch = new Date().getTime();
      
              } else{
               console.log("not iOS");
              }
              primaryid = d.id;
              _this.filterGraph();
            })
            .on('dblclick', function(d) {
              var win = window.open("/" + d.id, '_blank');
              win.focus();        
      
            })
            .call(force.drag);
      
          /* old
          var text = svg.append("g").selectAll("text")
              .data(force.nodes())
            .enter().append("text")
              .attr("x", 8)
              .attr("y", ".31em")
              .text(function(d) { return d.name; });
          */
      
          text = svg.append("svg:g")
            .selectAll("g")
            .data(force.nodes())
            .enter().append("svg:g")
            .attr("class", "nodeText");
      
          // A copy of the text with a thick white stroke for legibility.
          text.append("svg:text")
            .attr("x", 8)
            .attr("y", ".31em")
            .attr("class", "shadow")
            .attr("id", function(d) {
              return "s" + d.id;
            })
            .text(function(d) {
              return d.name;
            });
      
          text.append("svg:text")
            .attr("x", 8)
            .attr("y", ".31em")
            .attr("id", function(d) {
              return "t" + d.id;
            })
            .text(function(d) {
              return d.name;
            });
      
        }
        console.log("exit init");
      },
      
// Method to filter graph
filterGraph : function () {
    var _this = this;
    // change the visibility of the connection path
  
    console.log("Static Resource.filterGraph");
  
    var showcirclesids = [];
    var relatedNodes = getRelatedNodes(levels);
  
    path.style("visibility", function(o) {
  
      var retval = "hidden";
      var sourcevis = o.source.measures[measure].visible;
      var targetvis = o.target.measures[measure].visible;
  
      var sourceindex = $.inArray(o.source.id, relatedNodes);
      var targetindex = $.inArray(o.target.id, relatedNodes);
  
      var primaryrelated = (sourceindex > -1 && targetindex > -1);
  
  
      if ((sourcevis === 1) && (targetvis === 1) && primaryrelated) {
  
        var index = $.inArray(o.type, clickedfilters);
  
        if (index > -1) {
          console.log('for: ' + o.source.name + '/' + o.target.name + " return TRUE");
  
          var indexsource = $.inArray(o.source.id, showcirclesids);
          if (indexsource == -1) {
            showcirclesids.push(o.source.id);
          }
          var indextarget = $.inArray(o.target.id, showcirclesids);
          if (indextarget == -1) {
            showcirclesids.push(o.target.id);
          }
        }
  
      }
  
      return (index > -1) ? "visible" : "hidden";
    });
  
  
    console.log("circles shown: " + showcirclesids.length);
  
    // change the visibility of the node
    // if all the links with that node are invisibile, the node should also be invisible
    // otherwise if any link related to that node is visibile, the node should be visible
    circle.style("visibility", function(o, i) {
      var index = $.inArray(o.id, showcirclesids);
      if (index > -1) {
        d3.select("#t" + o.id).style("visibility", "visible");
        d3.select("#s" + o.id).style("visibility", "visible");
        return "visible";
      } else {
        d3.select("#t" + o.id).style("visibility", "hidden");
        d3.select("#s" + o.id).style("visibility", "hidden");
        return "hidden";
      }
    });
  
    _this.resizeNodes(measure);
  },
      
// Method to resize nodes
resizeNodes : function (aType) {
    // change the visibility of the connection path
    console.log("resizeNodes : " + aType);
  
  
    // change the size of the node 
  
    circle.attr("r", function(o, i) {
      return o.measures[aType].radius;
    });
  
    circle.style("fill", function(o, i) {
      return o.measures[aType].color;
    });
  
  
    circle.style("stroke", function(o, i) {
      if (o.id == primaryid) {
        return "gold";
      }
      return o.stroke;
    });
  
    circle.style("stroke-width", function(o, i) {
      if (o.id == primaryid) {
        return "10px";
      }
      return circlestrokewidth;
    });
  
  },
  



    formatButtons : function (component, arrayNames, idprefix, maxbuttons)
    {
        var _this = this; 
        var arrayNamesLength = arrayNames.length; 
        var index = 0;

        arrayNames.forEach(function(filtertype) {
            if (index < arrayNamesLength)
            {
                index++;
                var cmpTarget = component.find(idprefix + index);
                cmpTarget.set("v.label",filtertype);
            }
        });
        // clean up unused buttons
        for (; index < maxbuttons; )
        {
            index++;
            var cmpTarget = component.find(idprefix + index);
            cmpTarget.set("v.show","false");
        }
        _this.filterGraph();
        
    },

    setConnectionLevel : function(component, d) {
        var _this = this; 
        levels = d;
        _this.filterGraph() ;
        var elementid = 'l' + d;
        var cmpTarget = component.find(elementid);
        $A.util.toggleClass(cmpTarget, 'slds-button--neutral');
        $A.util.toggleClass(cmpTarget, 'slds-button--brand');
        this.clearOtherLevels(component,elementid);
    },

    setConnectionLevelLess : function(component) {
        var _this = this; 
        if (levels > 1)
        {
            levels--;
	        _this.filterGraph() ;
        }
        var cmpTargetMore = component.find("more");
        cmpTargetMore.set("v.disabled", "false");
        if (levels == 1)
        {
	        var cmpTargetLess = component.find("less");
			cmpTargetLess.set("v.disabled", "true");
        }
        
    },
    
    setConnectionLevelMore : function(component) {
        var _this = this; 
        if (levels < 4)
        {
            levels++;
	        _this.filterGraph() ;
        }
        var cmpTargetLess = component.find("less");
        cmpTargetLess.set("v.disabled", "false");
        if (levels == 4)
        {
	        var cmpTargetMore = component.find("more");
			cmpTargetMore.set("v.disabled", "true");
        }
    },
    
    setNodeSize : function(d) {
        var _this = this; 
        measure = d;
        _this.filterGraph() ;
	},

    setThisRelationshipType : function(component, indexer) {
        var cmpTarget = component.find('b' + indexer);
        $A.util.toggleClass(cmpTarget, 'slds-button--neutral');
        $A.util.toggleClass(cmpTarget, 'slds-button--brand');
        var isClicked = $A.util.hasClass(cmpTarget, 'slds-button--brand');
        var thisType = datajson.filtertypes[indexer - 1];
		this.setRelationshipType(thisType,isClicked);
    },

    setMeasure : function(component, indexer) {
        var idprefix = 'v' + indexer;
        var cmpTarget = component.find(idprefix);
        var thisMeasure = datajson.measures[indexer - 1];

		this.setNodeSize(thisMeasure);
        var cmpTarget = component.find(idprefix);
        $A.util.toggleClass(cmpTarget, 'slds-button--neutral');
        $A.util.toggleClass(cmpTarget, 'slds-button--brand');
        this.clearOtherSizes(component,idprefix);
    },
    
    setRelationshipType : function(thisType, isClicked) {
        var _this = this; 
        if (isClicked)
        {
            clickedfilters.push(thisType);
        }
        else
        {
            var index = $.inArray(thisType, clickedfilters);
            if (index > -1) {
                clickedfilters.splice(index, 1);
            }
        }
        _this.filterGraph();
	},
    
    clearOtherLevels: function(cmp,b)  {
    	if (b != 'l1')
    	{
	        var cmpTarget = cmp.find('l1');
            $A.util.addClass(cmpTarget, 'slds-button--neutral');
            $A.util.removeClass(cmpTarget, 'slds-button--brand');
		}
    	if (b != 'l2')
    	{
	        var cmpTarget = cmp.find('l2');
            $A.util.addClass(cmpTarget, 'slds-button--neutral');
            $A.util.removeClass(cmpTarget, 'slds-button--brand');
		}
    	if (b != 'l3')
    	{
	        var cmpTarget = cmp.find('l3');
            $A.util.addClass(cmpTarget, 'slds-button--neutral');
            $A.util.removeClass(cmpTarget, 'slds-button--brand');
		}
    	if (b != 'l4')
    	{
	        var cmpTarget = cmp.find('l4');
            $A.util.addClass(cmpTarget, 'slds-button--neutral');
            $A.util.removeClass(cmpTarget, 'slds-button--brand');
		}
    },
    
    clearOtherSizes: function(cmp,b)  {
    	if (b != 'v1')
    	{
	        var cmpTarget = cmp.find('v1');
            $A.util.addClass(cmpTarget, 'slds-button--neutral');
            $A.util.removeClass(cmpTarget, 'slds-button--brand');
		}
    	if (b != 'v2')
    	{
	        var cmpTarget = cmp.find('v2');
            $A.util.addClass(cmpTarget, 'slds-button--neutral');
            $A.util.removeClass(cmpTarget, 'slds-button--brand');
		}
    	if (b != 'v3')
    	{
	        var cmpTarget = cmp.find('v3');
            $A.util.addClass(cmpTarget, 'slds-button--neutral');
            $A.util.removeClass(cmpTarget, 'slds-button--brand');
		}
    	if (b != 'v4')
    	{
	        var cmpTarget = cmp.find('v4');
            $A.util.addClass(cmpTarget, 'slds-button--neutral');
            $A.util.removeClass(cmpTarget, 'slds-button--brand');
		}
    	if (b != 'v5')
    	{
	        var cmpTarget = cmp.find('v5');
            $A.util.addClass(cmpTarget, 'slds-button--neutral');
            $A.util.removeClass(cmpTarget, 'slds-button--brand');
		}
    }  

})