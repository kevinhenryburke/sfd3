({
    initializeVisuals: function (component) {
		console.log("chartHierarchyTreeMapHelper.initializeVisuals enter");
		let _this = this;

        let datajson = _this.getCache (component, "datajson") ;  
		let nodeGroup = _this.getCache (component, "nodeGroup") ;  

        let nodeDataSetFunction = _this.getRootStructureTreeMap (component); 

        nodeDataSetFunction(datajson);

        let root = _this.getCache (component, "root") ;  

        let cells = nodeGroup
            .selectAll("g")
            .data(root.leaves()) // <-D


        _this.renderCells(component, cells);

        // let nodeEnterSelection = nodeGroup
        //     .selectAll("g")
//            .data(root.leaves(), function(d){console.log("chartHierarchyTreeMapHelper" + d.data.id);return d.data.id;}); // <-D



        // let nodeEnterSelection = nodeGroup
        //     .selectAll("g")
        //     .data(nodeDataSetFunction(datajson), function(d, i) { return d.id;})
        //     .enter();

        // let node = nodeEnterSelection
        // //     .append("g")
        //     .attr("id", d => d.id)
        //     .attr("recordid", d => d.recordid)
        //     .on('mouseover', $A.getCallback(function(d) { // need getCallback to retain context - https://salesforce.stackexchange.com/questions/158422/a-get-for-application-event-is-undefined-or-can-only-fire-once
        //         console.log("chartHierarchyTreeMapHelper.mouseover enter");
        //         _this.setCache (component, "mouseoverRecordId", d.id ) ;
        //         var preppedEvent = _this.nodeMouseover(component, d); 
        //         _this.publishPreppedEvent(component,preppedEvent);
        //     }))
        // ;
        // _this.styleTreemap(component, node);
    },

    getRootStructureTreeMap : function (component) {
        console.log("chartHierarchyTreeMapHelper.getRootStructureTreeMap");
        
        var _this = this;
        var componentReference = component.get("v.componentReference");  
        var currentMeasure = _this.getStore(component, "currentMeasure");

        return function(datajson) { 
            console.log("chartHierarchyTreeMapHelper computing callback " + componentReference);

            var treemap = d3.treemap()
                .size([_this.getCache (component, "width") - 20, _this.getCache (component, "height") - 4])
                .round(true)
                .padding(1);

            var root = d3.hierarchy(datajson) // <-B
                .sum(_this.valueAccessor(component, currentMeasure))
                .sort((a, b) => b.value - a.value);

            _this.setCache (component, "root", root) ;  

            console.log("chartHierarchyTreeMapHelper callback returning" , root);

            return treemap(root);
        };
    },        

    valueAccessor : function (component, currentMeasure) {
        var _this = this;
        console.log("chartHierarchyTreeMapHelper valueAccessor");
        return function (d) {
            console.log("chartHierarchyTreeMapHelper valueAccessor", d);
            return _this.getFromMeasureScheme(component, d, currentMeasure, "Value");
        }
    },

    styleTreemap : function (component, node) {
        // Not sure this is called
        var _this = this;
        console.log("chartHierarchyTreeMapHelper.styleTreemap enter");    

        var componentType = component.get("v.componentType");
        var currentMeasure = _this.getStore(component, "currentMeasure");
        console.log("chartHierarchyTreeMapHelper.currentMeasure: " , currentMeasure);
        console.log("chartHierarchyTreeMapHelper.styleTreemap componentType = " + componentType);

        // node.attr("transform", "translate(2,2)") // new
        //     .attr("class", function(d) { return d.children ? "packbranch node" : "packleaf node"; })
        //     .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
    
        // node.append("title")
        //     .text(function(d) { return d.data.name + "\n" + d3.format(",d")(d.value); }); // this is the d3 value accessor which handles sum in hierarchy layout 
    
        // node.append("circle")
        //     .attr("r", function(d) { return d.r; })
        //     .style("fill", function(d) { 
        //         // we add new circles only to new nodes - the nodes are forgotten if collapsed
        //         return _this.getFromMeasureScheme(component, d.data, currentMeasure, "Color");
        //     })
        //     .style("fill-opacity", function(d, i) {
        //         return _this.getFilterOpacity(component, d.data);
        //     })
                
        //     ;
    
        // node.filter(function(d) { return !d.children; }).append("text")
        //     .attr("dy", "0.3em")
        //     .text(function(d) { return d.data.name.substring(0, d.r / 3); });
    
        console.log("chartHierarchyTreeMapHelper.styleTreemap exit");    
    },

    renderCells : function (component, cells) {
        var _this = this;

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
                _this.setCache (component, "mouseoverRecordId", d.id ) ;
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
            .style("font-size", 11)
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
