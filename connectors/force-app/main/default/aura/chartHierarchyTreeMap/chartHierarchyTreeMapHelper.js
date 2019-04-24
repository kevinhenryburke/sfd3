({
    initializeVisuals: function (component) {
		console.log("chartHierarchyTreeMapHelper.initializeVisuals enter");
		let _this = this;
        let storeObject = component.get("v.storeObject");

        let datajson = bzchart.getStore (storeObject, "datajson") ;  
		let nodeGroup = bzchart.getStore (storeObject, "nodeGroup") ;  

        let nodeDataSetFunction = _this.getRootStructureTreeMap (component); 

        nodeDataSetFunction(datajson);

        let root = bzchart.getStore (storeObject, "root") ;  

        let cells = nodeGroup
            .selectAll("g")
            .data(root.leaves()) // <-D


        _this.renderCells(component, cells);
    },

    getRootStructureTreeMap : function (component) {
        console.log("chartHierarchyTreeMapHelper.getRootStructureTreeMap");
        
        var _this = this;
        let storeObject = component.get("v.storeObject");
        let componentReference = bzchart.getStore (storeObject, "componentReference") ;  

        return function(datajson) { 
            console.log("chartHierarchyTreeMapHelper computing callback " + componentReference);

            var treemap = d3.treemap()
                .size([bzchart.getStore (storeObject, "width") - 20, bzchart.getStore (storeObject, "height") - 4])
                .round(true)
                .padding(1);

            var root = d3.hierarchy(datajson) // <-B
                .sum(_this.valueAccessor(component))
                .sort((a, b) => b.value - a.value);

            bzchart.setStore (storeObject, "root", root) ;  

            console.log("chartHierarchyTreeMapHelper callback returning" , root);

            return treemap(root);
        };
    },        

    valueAccessor : function (component) {
        var _this = this;        
        return (d) =>  _this.getFromMeasureScheme(component, d, "Value");
    },

    renderCells : function (component, cells) {
        var _this = this;
        let storeObject = component.get("v.storeObject");

		console.log("chartHierarchyTreeMapHelper.renderCells enter");

        var cellEnter = cells.enter().append("g")
            .merge(cells)
            .attr("class", "cell")
            .attr("transform", function (d) {
                return "translate(" + d.x0 + "," + d.y0 + ")"; //<-E
            })
            .attr("id", d => d.id)
            .on('mouseover', $A.getCallback(function(d) { // need getCallback to retain context - https://salesforce.stackexchange.com/questions/158422/a-get-for-application-event-is-undefined-or-can-only-fire-once
                console.log("chartHierarchyTreeMapHelper.mouseover enter");
                bzchart.setStore (storeObject, "mouseoverRecordId", d.id ) ;
                var preppedEvent = _this.nodeMouseover(component, d); 
                _this.publishPreppedEvent(component,preppedEvent);
            }))
        ;

        _this.renderRect(cellEnter, cells);

        _this.renderText(cellEnter, cells);

        cells.exit().remove();
		console.log("chartHierarchyTreeMapHelper.renderCells exit");

    },

    renderRect : function(cellEnter, cells) {

        var _colors = d3.scaleOrdinal(d3.schemeCategory20c);

        cellEnter.append("rect");

        cellEnter.merge(cells)
            .transition()
            .select("rect")
            .attr("width", function (d) { //<-F
                return d.x1 - d.x0;
            })
            .attr("height", function (d) {
                return d.y1 - d.y0;
            })
            .style("fill", function (d) {
                return _colors(d.parent.data.name); //<-G
            });
    },

    renderText : function(cellEnter, cells) {
        cellEnter.append("text");

        cellEnter.merge(cells)
            .select("text") //<-H
            .style("font-size", 9)
            .attr("x", function (d) {
                return (d.x1 - d.x0) / 2;
            })
            .attr("y", function (d) {
                return (d.y1 - d.y0) / 2;
            })
            .attr("text-anchor", "middle")
            .text(function (d) {
                return d.data.name;
            })
            .style("opacity", function (d) {
                d.w = this.getComputedTextLength();
                return d.w < (d.x1 - d.x0) ? 1 : 0; //<-I
            });
    }

})
