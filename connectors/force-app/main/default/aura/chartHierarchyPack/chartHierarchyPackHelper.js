({
    initializeVisuals: function (component) {
		console.log("chartHierarchyPackHelper: enter initializeVisuals proper structure");
		let _this = this;
        let storeObject = component.get("v.storeObject");
        let variantsMixin = bzchart.getStore (storeObject, "chartMixin") ;

        let datajson = bzchart.getStore (storeObject, "datajson") ;  
		let nodeGroup = bzchart.getStore (storeObject, "nodeGroup") ;  

        /* Pack specification */

        let nodeSelector = "circle";
        let nodeDataSetFunction = bzpack.getRootStructurePack (storeObject); 

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
                let preppedEvent = variantsMixin.nodeMouseover(storeObject, d);
                bzaura.publishPreppedEvent(storeObject,preppedEvent,$A.get("e.c:evt_sfd3"));
            }))
        ;
        bzpack.stylePack(storeObject, node);
    }

})
