({
    initializeVisuals: function (component) {
		console.log("chartHierarchyPackHelper: enter initializeVisuals proper structure");
		let _this = this;

        let datajson = _this.getCache (component, "datajson") ;  
		let nodeGroup = _this.getCache (component, "nodeGroup") ;  

        /* Pack specification */

        let nodeSelector = "circle";
        let nodeDataSetFunction = _this.getRootStructurePack (component); 

        let nodeEnterSelection = nodeGroup
            .selectAll(nodeSelector)
            .data(nodeDataSetFunction(datajson), function(d, i) { return d.id;})
            .enter();

        let node = nodeEnterSelection
            .append("g")
            .attr("id", d => d.id)
            .attr("recordid", d => d.recordid)
            .on('mouseover', $A.getCallback(function(d) { // need getCallback to retain context - https://salesforce.stackexchange.com/questions/158422/a-get-for-application-event-is-undefined-or-can-only-fire-once
                _this.setCache (component, "mouseoverRecordId", d.id ) ;
                var preppedEvent = _this.nodeMouseover(component, d); 
                _this.publishPreppedEvent(component,preppedEvent);
            }))
        ;
        _this.stylePack(component, node);
    },

    stylePack : function (component, node) {
        // Not sure this is called
        var _this = this;
        console.log("stylePack enter");    

        var componentType = component.get("v.componentType");
        var currentMeasure = _this.getStore(component, "currentMeasure");
        console.log("xxxxx: currentMeasure: " , currentMeasure);
        console.log("stylePack componentType = " + componentType);

        node.attr("transform", "translate(2,2)") // new
            .attr("class", function(d) { return d.children ? "packbranch node" : "packleaf node"; })
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
    
        node.append("title")
            .text(function(d) { return d.data.name + "\n" + d3.format(",d")(d.value); }); // this is the d3 value accessor which handles sum in hierarchy layout 
    
        node.append("circle")
            .attr("r", function(d) { return d.r; })
            .style("fill", function(d) { 
                // we add new circles only to new nodes - the nodes are forgotten if collapsed
                return _this.getFromMeasureScheme(component, d.data, currentMeasure, "Color");
            })
            .style("fill-opacity", function(d, i) {
                return _this.getFilterOpacity(component, d.data);
            })
                
            ;
    
        node.filter(function(d) { return !d.children; }).append("text")
            .attr("dy", "0.3em")
            .text(function(d) { return d.data.name.substring(0, d.r / 3); });
    
        console.log("stylePack exit");
    },

    getRootStructurePack : function (component) {
        var _this = this;
        var componentReference = component.get("v.componentReference");  

        return function(datajson) { 
            console.log("getRootStructurePack computing callback " + componentReference);
            var root = d3.hierarchy(datajson)
            .sum((d) => d.size)
            .sort((a, b) => b.value - a.value);

            var diameter = Math.min(_this.getCache (component, "width"),_this.getCache (component, "height") ) ;  
            console.log("getRootStructurePack diameter: " + diameter);
            
            var pack = d3.pack()
            .size([diameter - 4, diameter - 4]);
            return pack(root).descendants();
        };
    },        


})
