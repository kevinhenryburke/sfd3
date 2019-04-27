({
    initializeVisuals: function (component) {
		console.log("chartHierarchyPackHelper: enter initializeVisuals proper structure");
		let _this = this;
        let storeObject = component.get("v.storeObject");

        let datajson = bzchart.getStore (storeObject, "datajson") ;  
		let nodeGroup = bzchart.getStore (storeObject, "nodeGroup") ;  

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
                bzchart.setStore (storeObject, "mouseoverRecordId", d.id ) ;
                var preppedEvent = _this.nodeMouseover(component, d); 
                _this.publishPreppedEvent(component,preppedEvent);
            }))
        ;
        _this.stylePack(component, node);
    },

    stylePack : function (component, node) {
        // Not sure this is called
        let storeObject = component.get("v.storeObject");
        console.log("stylePack enter");    

        node.attr("transform", "translate(2,2)") // new
            .attr("class", function(d) { return d.children ? "packbranch node" : "packleaf node"; })
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
    
        node.append("title")
            .text(function(d) { return d.data.name + "\n" + d3.format(",d")(d.value); }); // this is the d3 value accessor which handles sum in hierarchy layout 
    
        var noc = node.append("circle")
            .attr("r", function(d) { return d.r; })
            .style("fill-opacity", function(d, i) {
                return bzchart.getFilterOpacity (storeObject, d.data);
            });

        let latestSizeOrColor = bzchart.getStore (storeObject, "latestSizeOrColor");

        // if (latestSizeOrColor == "color" || latestSizeOrColor == "none") {
            noc.style("fill", function(d) { 
                // we add new circles only to new nodes - the nodes are forgotten if collapsed
                return bzchart.getFromMeasureScheme(storeObject, d.data, "Color");
            })
        // }

        node.filter(function(d) { return !d.children; }).append("text")
            .attr("dy", "0.3em")
            .text(function(d) { return d.data.name.substring(0, d.r / 3); });
    
        console.log("stylePack exit");
    },

    getRootStructurePack : function (component) {
        var _this = this;
        let storeObject = component.get("v.storeObject");
        let componentReference = bzchart.getStore (storeObject, "componentReference") ;  

        return function(datajson) { 
            console.log("getRootStructurePack computing callback " + componentReference);
            var root = d3.hierarchy(datajson)
            .sum((d) => d.size)
            .sort((a, b) => b.value - a.value);

            var diameter = Math.min(bzchart.getStore (storeObject, "width"),bzchart.getStore (storeObject, "height") ) ;  
            console.log("getRootStructurePack diameter: " + diameter);
            
            var pack = d3.pack()
            .size([diameter - 4, diameter - 4]);
            return pack(root).descendants();
        };
    },        

    recursiveMap: function(component,datajsonBefore, topCall){
        // console.log("chartNetworkTimeline.recursiveMap enter");
        var _this = this;
        let storeObject = component.get("v.storeObject");

        datajsonBefore["size"] =  bzchart.getFromMeasureScheme(storeObject, datajsonBefore, "Size");

        if (datajsonBefore.children != null && datajsonBefore.children.length > 0) {
            for (var i = 0; i < datajsonBefore.children.length; i++){
                _this.recursiveMap(component, datajsonBefore.children[i], false);
            } 
        }
        else {
            return;
        }
    },

    

})
