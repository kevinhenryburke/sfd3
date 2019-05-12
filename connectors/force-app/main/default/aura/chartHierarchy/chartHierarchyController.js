({

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
    }

})