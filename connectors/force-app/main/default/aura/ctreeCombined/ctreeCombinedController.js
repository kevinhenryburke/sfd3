({
 
    onInit: function(component, event, helper) {
        console.log('ctreeCombined: onInit: enter');
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
// DONE    "data": {
// DONE         "dataFormat": "HierarchyJSON",
// DONE         "dataSourceMethod": "c.returnHierarchyTop",
// DONE         "dataUpdateMethod": "c.returnHierarchyLevels",
// DONE        "queryJSON": {
// DONE            "initialLevelsToRetrieve": 2,
// DONE            "chartType": "Hierarchy",
// DONE             "objectLevels": [{
// DONE                "terminal": false,
// DONE                "recursive": true,
// DONE                "fields": [
// DONE                    {
// DONE                         "api" : "AnnualRevenue",                                     
// DONE                         "role" : "size", 
// DONE                         "display" : true,
// DONE                         "orderByField" : true                                   
// DONE                    },
// DONE                    {
// DONE                         "api" : "name",                                     
// DONE                         "role" : "name", 
// DONE                         "display" : true                                     
// DONE                     },
// DONE                     {
// DONE                         "api" : "id",                                     
// DONE                         "role" : "id", 
// DONE                         "display" : false                                     
// DONE                    },                    
// DONE                    {
// DONE                         "api" : "parentId",                                     
// DONE                         "role" : "parentId", 
// DONE                         "display" : false                                     
// DONE                    },                    
// DONE                    {
// DONE                         "api" : "AccountNumber",                                     
// DONE                         "role" : "none", 
// DONE                         "display" : true                                     
// DONE                    }  
// DONE                ],
// DONE                "objectType": "Account"
// DONE            }]
// DONE        },
// DONE        "primaryNodeInitialization": "None" // Primary Node to highlight - "FirstInData, RecordId, None"
// DONE    },
//     "panels": {
//         "InfoPanel": {
//             "showOnTop": true,
// DONE             "allowPopover": true,
//             "objectIcons": {
//                 "Account": "standard:account",
//                 "Opportunity": "standard:opportunity"
//             }
//         },
// DONE        "ControlPanel": {
// DONE            "showBanner": true,
// DONE            "buttonParameters": {
// DONE                "showtestbuttons": true,
// DONE                "levels": 5,
// DONE                "levelsIncreaseOnly": true,
// DONE                "autoIncreaseLevels": true
// DONE            }
// DONE        },
//         "ChartPanel": {
//             "Title": "",
// DONE            "showLevelsInitial": 1,
// DONE            "Hierarchy" : {
// DONE                "LeafColors" : {"Account" : { "colorBy" : "size" , "values" : [0,22070163,25070163], "colors" : ["white" , "yellow", "green"] }},
// DONE                "ParentColors" : {"Account" : {  "colorBy" : "size" ,  "values" : [0,38970163], "colors" : ["lightsteelblue" , "purple"] }},
// DONE                "showZoomSlider" : false,
// DONE                "clearHighlightedPaths" : true
//             },
//             "Network" : {
//                "primaryNodeHighlightingOn" : true, // description="Determines if selected node should be highlighted"/>    
//                "primaryNodeHighlightingColour" : "gold", // description="Name of the colour of highlighed node"/>    
//                "primaryNodeHighlightingRadius" : "10px", // description="Determines width of highlighting on a selected node"/>      
//                "retainNodeDetailsMouseOut" : true,  // description="Set to true if we wish extended details following a node mouseover to be retain after mouseout"/>    
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

        component.set("v.showTopPanel" , masterConfigObject["panels"]["InfoPanel"]["showOnTop"]);

        component.set("v.Title" , masterConfigObject["panels"]["ChartPanel"]["Title"]);

        // <!-- DISPLAY FEATURES - NETWORK -->
        
        component.set("v.showPathToolTip" , masterConfigObject["panels"]["ChartPanel"]["Network"]["showPathToolTip"]);
        component.set("v.nodestrokewidth" , masterConfigObject["panels"]["ChartPanel"]["Network"]["nodestrokewidth"]);
      
    },

    /* receive a bubbled component event and distribute this to required children */

    handle_evt_sfd3  : function(component, event, helper) {
        console.log('ctreeCombined: handle_evt_sfd3 enter');

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

        var dataControlPanel = component.find("dataControlPanel");
        dataControlPanel.callFromContainer(tpc);

        var showTopPanel = component.get("v.showTopPanel");

        if (showTopPanel == true) {
            var panelDisplay = component.find("panelDisplay");
            panelDisplay.callFromContainer(tpc);
        }


    },
})