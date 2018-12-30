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

        if (_this.hasMasterParam(component, "panels", "ChartPanel", "Selectors", "node")) {
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
        }
    }
})
