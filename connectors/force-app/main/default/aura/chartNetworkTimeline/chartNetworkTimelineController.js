({
    refreshDataController: function(component,event,helper){
        bzutils.log("calling the aura:method refreshDataController in chartNetworkTimeline");
        let storeObject = component.get("v.storeObject");

        var args = event.getParam("arguments");
        var parameters = args.parameters;

        let variantsMixin = bzchart.getStore (storeObject, "chartMixin") ;
        variantsMixin.refreshDataController(storeObject,parameters);

    }

})
