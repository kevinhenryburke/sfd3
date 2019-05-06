({
    initializeVisuals: function (component) {
        let storeObject = component.get("v.storeObject");
        let variantsMixin = bzchart.getStore (storeObject, "chartMixin") ;
        variantsMixin.initializeVisuals(storeObject);
    }

})
