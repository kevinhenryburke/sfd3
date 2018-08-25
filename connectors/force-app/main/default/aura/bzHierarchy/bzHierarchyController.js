({

    /* receive a bubbled component event and distribute this to required children */
    
    handle_evt_sfd3  : function(component, event, helper) {
        bzutils.log('bzHierarchy: handle_evt_sfd3 enter');

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

    },
})