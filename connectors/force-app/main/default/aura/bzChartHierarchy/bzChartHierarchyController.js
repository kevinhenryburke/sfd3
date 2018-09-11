({

    onInit: function(component, event, helper) {
        console.log('bzChartHierarchy: onInit: enter');

        var masterConfigObject = JSON.parse(component.get("v.masterConfig"));
        component.set("v.masterConfigObject", masterConfigObject);

        console.log('bzChartHierarchy: onInit: test: ' + masterConfigObject["data"]["dataFormat"]);

        component.set("v.dataFormat" , masterConfigObject["data"]["dataFormat"]);
        component.set("v.dataSourceMethod" , masterConfigObject["data"]["dataSourceMethod"]);
        component.set("v.dataUpdateMethod" , masterConfigObject["data"]["dataUpdateMethod"]);
        component.set("v.queryJSON" , JSON.stringify(masterConfigObject["data"]["queryJSON"]));
        component.set("v.configjsonString" , JSON.stringify(masterConfigObject["data"]["configjsonString"]));
        component.set("v.primaryNodeInitialization" , masterConfigObject["data"]["primaryNodeInitialization"]);

        component.set("v.showTopPanel" , masterConfigObject["panels"]["showTopPanel"]);
        component.set("v.showBanner" , masterConfigObject["panels"]["showBanner"]);
        component.set("v.allowPopover" , masterConfigObject["panels"]["allowPopover"]);

    },

    /* receive a bubbled component event and distribute this to required children */

    handle_evt_sfd3  : function(component, event, helper) {
        bzutils.log('bzChartHierarchy: handle_evt_sfd3 enter');

        var topic = event.getParam("topic");
        var parameters = event.getParam("parameters");
        var controller = event.getParam("controller");

        var tpc = {
            "topic" : topic,
            "parameters" : parameters,
            "controller" : controller,
        };

        var chartHierarchy = component.find("chartHierarchy");
        chartHierarchy.callFromContainer(tpc);

        var d3comp = component.find("d3comp");
        d3comp.callFromContainer(tpc);

        var showTopPanel = component.get("v.showTopPanel");
        if (showTopPanel == true) {
            var panelDisplay = component.find("panelDisplay");
            panelDisplay.callFromContainer(tpc);
        }


    },
})