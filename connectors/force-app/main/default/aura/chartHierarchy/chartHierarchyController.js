({

    refreshDataController: function(component,event,helper){
        console.log("calling the aura:method refreshDataController in subcomponent");
        let storeObject = component.get("v.storeObject");
        let args = event.getParam("arguments");
        let parameters = args.parameters;

        let variantsMixin = bzchart.getStore (storeObject, "chartMixin") ;
        variantsMixin.refreshDataController(storeObject,parameters);
    }

})