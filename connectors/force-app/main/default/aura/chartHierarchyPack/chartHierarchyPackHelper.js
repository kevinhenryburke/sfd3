({
    initializeVisuals: function (component) {
		console.log("chartHierarchyPackHelper: enter initializeVisuals proper structure");
		let _this = this;

        let componentReference = component.get("v.componentReference");
        let masterConfigObject = component.get("v.masterConfigObject");

        let datajson = _this.getCache (component, "datajson") ;  
		let nodeGroup = _this.getCache (component, "nodeGroup") ;  

        /* Pack specification */

        var nodeSelector = _this.getMasterParam(component, "panels", "ChartPanel", "Selectors", "node", "selector"); // an html selector for a class or element ids
        var nodeDataSetFunction = _this.getRootStructurePack (component); 

        var nodeEnterSelection = nodeGroup
            .selectAll(nodeSelector)
            .data(nodeDataSetFunction(datajson), function(d, i) { return d.id;})
            .enter();

        if (_this.hasMasterParam(component, "panels", "ChartPanel", "Selectors", "node")) {

            let node = nodeEnterSelection
                .append(_this.getMasterParam(component, "panels", "ChartPanel", "Selectors", "node", "appendType"))
                .attr("id", function(d) {
                    return d.id;
                })
                .attr("recordid", function(d) {
                    return d.recordid;
                })
                .on('mouseover', $A.getCallback(function(d) { // need getCallback to retain context - https://salesforce.stackexchange.com/questions/158422/a-get-for-application-event-is-undefined-or-can-only-fire-once
                    _this.setCache (component, "mouseoverRecordId", d.id ) ;
                    var preppedEvent = _this.nodeMouseover(component, d); 
                    _this.publishPreppedEvent(component,preppedEvent);
                }))
            ;

            let stylePack = _this.stylePack(component, node);

        }
    }
})
