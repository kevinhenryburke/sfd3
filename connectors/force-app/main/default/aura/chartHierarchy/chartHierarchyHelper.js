({

    initializeVisuals: function (component) {
		console.log("subhelper: enter initializeVisuals proper structure");
		var _this = this;
        let storeObject = component.get("v.storeObject");
        let variantsMixin = bzchart.getStore (storeObject, "chartMixin") ;

        let componentReference = bzchart.getStore (storeObject, "componentReference") ;  

        var datajson = bzchart.getStore (storeObject, "datajson") ;  
		var nodeGroup = bzchart.getStore (storeObject, "nodeGroup") ;  
		var pathGroup = bzchart.getStore (storeObject, "pathGroup") ;  
		// var textGroup = bzchart.getStore (storeObject, "textGroup") ;  
		// var pathToolTipDiv = bzchart.getStore (storeObject, "pathToolTipDiv") ;  
		// var pathGroupId = bzchart.getStore (storeObject, "pathGroupId") ;  
		
		var width = bzchart.getStore (storeObject, "width") ;  
        var height = bzchart.getStore (storeObject, "height") ; 

        variantsMixin.dataPreprocess(storeObject, datajson, null);

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

        bzhierarchy.update(storeObject, nodeGroup, pathGroup, root, false);

        // Push out an initial message to highlight the root node to display panels
        // Effecitvely can do this via a mouseover event on root.
        // TODO can move this to a generic location?

        var highlightId = datajson["initialHighlightId"];
        bzchart.setStore (storeObject, "mouseoverRecordId", highlightId ) ;

        var nodeToPublish = root;

        if (highlightId != null && highlightId != root.id) {
            // in some cases we want the primary reference on a chart to be different from the top node
            // for example if we are showing parent node rather than having our focus node at the top

            nodeToPublish = d3.select("#" + componentReference + highlightId).datum();
            // in this case we will always highlight the path to the key node and open up that node
            bzctree.highlightPathsBy(storeObject, highlightId, "Id", true);

            bzctree.openPathsBy(storeObject, highlightId, "Id");
        }

        let preppedEvent = variantsMixin.nodeMouseover(storeObject, nodeToPublish);
        bzaura.publishPreppedEvent(storeObject,preppedEvent,$A.get("e.c:evt_sfd3"));
        bzhierarchy.updatePopoverDirectly(storeObject, preppedEvent);

        console.log("initialize root path");
    },

})