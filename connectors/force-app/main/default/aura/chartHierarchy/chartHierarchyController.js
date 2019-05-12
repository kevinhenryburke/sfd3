({

    initializeVisuals: function(component,event,helper){
        console.log("calling the aura:method initializeVisuals in subcomponent");
        let storeObject = component.get("v.storeObject");
        let variantsMixin = bzchart.getStore (storeObject, "chartMixin") ;
        variantsMixin.initializeVisuals(storeObject);
    },

    refreshDataController: function(component,event,helper){
        console.log("calling the aura:method refreshDataController in subcomponent");
        let storeObject = component.get("v.storeObject");
        let args = event.getParam("arguments");
        let parameters = args.parameters;

        let updatejson = parameters.datajson;

        let nodeGroup = bzchart.getStore (storeObject, "nodeGroup") ;  
        let pathGroup = bzchart.getStore (storeObject, "pathGroup") ;  
        let root = bzchart.getStore (storeObject, "root") ;

        bzctree.merge(storeObject, updatejson);
        bzctree.update(storeObject, nodeGroup, pathGroup, root, false);
    },

    styleNodes: function(component,event,helper){
        console.log("aura:method styleNodes in chartHierarchy enter");
        let storeObject = component.get("v.storeObject");
        let variantsMixin = bzchart.getStore(storeObject, "chartMixin");
        variantsMixin.styleNodes(storeObject);
    }

})