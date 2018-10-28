({

    onInit: function(component, event, helper) {
        console.log('bzChartHierarchy: onInit: enter');
        console.log(component.get("v.masterConfig"));

        var masterConfig = component.get("v.masterConfig");
        if (typeof masterConfig === 'string' || masterConfig instanceof String) {
            console.log("masterConfig is a string");
            component.set("v.masterConfigObject", JSON.parse(masterConfig));
        }
        else {
            console.log("masterConfig is an object?");
            component.set("v.masterConfigObject", masterConfig);
        }
        var masterConfigObject = component.get("v.masterConfigObject");

// TODO remove this so that only read from configuration above - handy for dev speed for now
// masterConfigObject = 
// {
//     "data": {
// DONE         "dataFormat": "HierarchyJSON",
// DONE         "dataSourceMethod": "c.returnHierarchyTop",
// DONE         "dataUpdateMethod": "c.returnHierarchyLevels",
// DONE        "queryJSON": {
//             "initialLevelsToRetrieve": 2,
//             "chartType": "Hierarchy",

//             "objectLevels": [{
//                 "terminal": false,
//                 "recursive": true,
//                 "fields": [
//                     {
//                          "api" : "AnnualRevenue",                                     
//                          "role" : "size", 
//                          "display" : true,
//                          "orderByField" : true                                   
//                     },
//                     {
//                          "api" : "name",                                     
//                          "role" : "name", 
//                          "display" : true                                     
//                      },
//                      {
//                          "api" : "id",                                     
//                          "role" : "id", 
//                          "display" : false                                     
//                     },                    
//                     {
//                          "api" : "parentId",                                     
//                          "role" : "parentId", 
//                          "display" : false                                     
//                     },                    
//                     {
//                          "api" : "AccountNumber",                                     
//                          "role" : "none", 
//                          "display" : true                                     
//                     }  
//                 ],
//                 "objectType": "Account"
//             }]

//         },
//         "primaryNodeInitialization": "None"

//     },
//     "panels": {
//         "InfoPanel": {
//             "showOnTop": true,
//             "showPopover": true,
//             "objectIcons": {
//                 "Account": "standard:account",
//                 "Opportunity": "standard:opportunity"
//             }
//         },
//         "ControlPanel": {
//             "showBanner": true,
//             "configjsonString": {
//                 "showtestbuttons": true,
//                 "levels": 5,
//                 "levelsIncreaseOnly": true,
//                 "autoIncreaseLevels": true
//             }
//         },
//         "ChartPanel": {
//             "Title": "",
//             "showLevelsInitial": 1,
//             "Hierarchy" : {
//                 "LeafColors" : {"Account" : { "colorBy" : "size" , "values" : [0,22070163,25070163], "colors" : ["white" , "yellow", "green"] }},
//                 "ParentColors" : {"Account" : {  "colorBy" : "size" ,  "values" : [0,38970163], "colors" : ["lightsteelblue" , "purple"] }},
//                 "showZoomSlider" : false,
//                 "clearHighlightedPaths" : true
//             },
//             "Network" : {
//                 "showPathToolTip" : true,
//                 "nodestrokewidth" : "0.5px"
//             },
//             "Selectors" : {
//                 "node" : {
//                     "selector" : ".node",            
//                     "appendType" : "g",            
//                     "styleclassText" : "chartText",
//                     "styleclassTextShadow" : "chartTextShadow"
//                 }        
//             }
//         }
//     },
// DONE    "search": {
// DONE         "searchAction": "HighlightOpenPath",
// DONE         "configuredAllowSearch": true
//     }
// }
//         ;
        
        component.set("v.masterConfigObject", masterConfigObject);

        component.set("v.primaryNodeInitialization" , masterConfigObject["data"]["primaryNodeInitialization"]);

        component.set("v.showTopPanel" , masterConfigObject["panels"]["InfoPanel"]["showOnTop"]);
        component.set("v.showBanner" , masterConfigObject["panels"]["ControlPanel"]["showBanner"]);
        component.set("v.allowPopover" , masterConfigObject["panels"]["InfoPanel"]["showPopover"]);

        component.set("v.Title" , masterConfigObject["panels"]["ChartPanel"]["Title"]);
        component.set("v.showLevelsInitial" , masterConfigObject["panels"]["ChartPanel"]["showLevelsInitial"]);

        // <!-- DISPLAY FEATURES - HIERARCHY -->

        component.set("v.LeafColors" , JSON.stringify(masterConfigObject["panels"]["ChartPanel"]["Hierarchy"]["LeafColors"]));
        component.set("v.ParentColors" , JSON.stringify(masterConfigObject["panels"]["ChartPanel"]["Hierarchy"]["ParentColors"]));
        component.set("v.showZoomSlider" , masterConfigObject["panels"]["ChartPanel"]["Hierarchy"]["showZoomSlider"]);
        component.set("v.clearHighlightedPaths" , masterConfigObject["panels"]["ChartPanel"]["Hierarchy"]["clearHighlightedPaths"]);

        // <!-- DISPLAY FEATURES - NETWORK -->
        
        component.set("v.showPathToolTip" , masterConfigObject["panels"]["ChartPanel"]["Network"]["showPathToolTip"]);
        component.set("v.nodestrokewidth" , masterConfigObject["panels"]["ChartPanel"]["Network"]["nodestrokewidth"]);
      
    },

    /* receive a bubbled component event and distribute this to required children */

    handle_evt_sfd3  : function(component, event, helper) {
        console.log('bzChartHierarchy: handle_evt_sfd3 enter');

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