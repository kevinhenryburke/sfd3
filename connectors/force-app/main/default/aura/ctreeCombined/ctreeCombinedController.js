({
    onInit: function(component, event, helper) {
        console.log('ctreeCombined: onInit: enter');

        let masterConfig = component.get("v.masterConfig");
        let masterConfigObject;
        if (typeof masterConfig === 'string' || masterConfig instanceof String) {
            console.log("masterConfig is a string");
            masterConfigObject = JSON.parse(masterConfig);
        }
        else {
            console.log("masterConfig is an object?");
            masterConfigObject = masterConfig;
        }
        
        component.set("v.showTopPanel" , masterConfigObject["panels"]["InfoPanel"]["showOnTop"]);
        component.set("v.Title" , masterConfigObject["panels"]["ChartPanel"]["Title"]);
    },

    /* receive a bubbled component event and distribute this to required children */

    handleCustomEvent  : function(component, event, helper) {

        var topic = event.getParam("topic");
        var parameters = event.getParam("parameters");
        var controller = event.getParam("controller");

        console.log('ctreeCombined: handleCustomEvent enter, topic: ' + topic);

        var tpc = {
            "topic" : topic,
            "parameters" : parameters,
            "controller" : controller,
        };

        var chartHierarchy = component.find("chartHierarchy");
        chartHierarchy.callFromContainer(tpc);

        var dataControlPanel = component.find("dataControlPanel");
        dataControlPanel.callFromContainer(tpc);

        var showTopPanel = component.get("v.showTopPanel");

        // if (showTopPanel == true) {
        //     var panelDisplay = component.find("panelDisplay");
        //     panelDisplay.callFromContainer(tpc);
        // }
    },
})