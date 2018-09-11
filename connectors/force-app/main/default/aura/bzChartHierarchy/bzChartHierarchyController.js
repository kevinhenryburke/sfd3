({

    onInit: function(component, event, helper) {
        console.log('bzChartHierarchy: onInit: enter');

        var masterConfigObject = JSON.parse(component.get("v.masterConfig"));

// TODO remove this so that only read from configuration above - handy for dev speed for now
masterConfigObject = 
{
    "data": {
        "dataFormat": "HierarchyJSON",
        "dataSourceMethod": "c.returnDataPack",
        "dataUpdateMethod": "c.returnDataPackUpdate",
        "queryJSON": {
            "loc": [{
                "terminal": false,
                "recursive": true,
                "requiredFields": {
                    "size": "AnnualRevenue",
                    "name": "name",
                    "id": "id"
                },
                "parentField": "parentId",
                "objectType": "Account"
            }],
            "initialLevelsToRetrieve": 2,
            "chartType": "Hierarchy"
        },
        "configjsonString": {
            "showtestbuttons": true,
            "levels": 5,
            "levelsIncreaseOnly": true,
            "autoIncreaseLevels": false
        },
        "primaryNodeInitialization": "None"

    },
    "panels": {
        "InfoPanel": {
            "showOnTop": false,
            "showPopover": true,
            "cardFields": {
                "Account": ["data.name", "data.size", "parent.name"]
            },
            "objectIcons": {
                "Account": "standard:account",
                "Opportunity": "standard:opportunity"
            }
        },
        "ControlPanel": {
            "showBanner": true
        },
        "ChartPanel": {
            "Title": "It is a new title",
            "showLevelsInitial": 1,
            "Hierarchy" : {
                "LeafColors" : {"Account" : { "colorBy" : "size" , "values" : [0,22070163,25070163], "colors" : ["white" , "yellow", "green"] }},
                "ParentColors" : {"Account" : {  "colorBy" : "size" ,  "values" : [0,38970163], "colors" : ["lightsteelblue" , "purple"] }},
                "showZoomSlider" : false,
                "clearHighlightedPaths" : true
            }
        }
    },
    "search": {
        "searchAction": "HighlightOpenPath",
        "configuredAllowSearch": true
    }
}
        ;
        
        component.set("v.masterConfigObject", masterConfigObject);

        console.log('bzChartHierarchy: onInit: test: ' + masterConfigObject["data"]["dataFormat"]);

        component.set("v.dataFormat" , masterConfigObject["data"]["dataFormat"]);
        component.set("v.dataSourceMethod" , masterConfigObject["data"]["dataSourceMethod"]);
        component.set("v.dataUpdateMethod" , masterConfigObject["data"]["dataUpdateMethod"]);
        component.set("v.queryJSON" , JSON.stringify(masterConfigObject["data"]["queryJSON"]));
        component.set("v.configjsonString" , JSON.stringify(masterConfigObject["data"]["configjsonString"]));
        component.set("v.primaryNodeInitialization" , masterConfigObject["data"]["primaryNodeInitialization"]);

        component.set("v.showTopPanel" , masterConfigObject["panels"]["InfoPanel"]["showOnTop"]);
        component.set("v.showBanner" , masterConfigObject["panels"]["ControlPanel"]["showBanner"]);
        component.set("v.allowPopover" , masterConfigObject["panels"]["InfoPanel"]["showPopover"]);

        component.set("v.searchAction" , masterConfigObject["search"]["searchAction"]);
        component.set("v.configuredAllowSearch" , masterConfigObject["search"]["configuredAllowSearch"]);

        component.set("v.Title" , masterConfigObject["panels"]["ChartPanel"]["Title"]);
        component.set("v.showLevelsInitial" , masterConfigObject["panels"]["ChartPanel"]["showLevelsInitial"]);

        // <!-- DISPLAY FEATURES - HIERARCHY -->

        component.set("v.cardFields" , JSON.stringify(masterConfigObject["panels"]["InfoPanel"]["cardFields"]));
        component.set("v.objectIcons" , JSON.stringify(masterConfigObject["panels"]["InfoPanel"]["objectIcons"]));

        component.set("v.LeafColors" , JSON.stringify(masterConfigObject["panels"]["ChartPanel"]["Hierarchy"]["LeafColors"]));
        component.set("v.ParentColors" , JSON.stringify(masterConfigObject["panels"]["ChartPanel"]["Hierarchy"]["ParentColors"]));
        component.set("v.showZoomSlider" , masterConfigObject["panels"]["ChartPanel"]["Hierarchy"]["showZoomSlider"]);
        component.set("v.clearHighlightedPaths" , masterConfigObject["panels"]["ChartPanel"]["Hierarchy"]["clearHighlightedPaths"]);
        
        // "LeafColors" type="String" default="{&quot;values&quot; : [0], &quot;colors&quot; : [&quot;white&quot;]}" description="Determines the color of a leaf node"/>    
        // "ParentColors" type="String" default="{&quot;values&quot; : [0], &quot;colors&quot; : [&quot;lightsteelblue&quot; ]}" description="Determines the color of parent node"/>    
        // "showZoomSlider" type="Boolean" default="false"/>    
        // "clearHighlightedPaths" type="Boolean" default="true" description="Determines if the chart has a primary node"/>    
      
        // <!-- DISPLAY FEATURES - NETWORK -->
      
        // "showPathToolTip" type="Boolean" default="false"/>    
        // "nodestrokewidth" type="String" default="0.5px"/>    
      

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