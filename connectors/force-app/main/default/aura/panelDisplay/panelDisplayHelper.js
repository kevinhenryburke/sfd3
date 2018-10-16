({

    sectionExpandCollapseMaster : function(component, letter) {
        var _this = this;
        console.log("sectionExpandCollapseMaster: " + letter);
        var sectionId = "expand" + letter;
        var expandComponent = component.find(sectionId);
        var isCollapsed = _this.sectionExpandCollapse(expandComponent);
        if (isCollapsed) {
            component.set("v.icon" + letter, "utility:chevronright");
        } 
        else {
            component.set("v.icon" + letter, "utility:chevrondown");
        } 
    },

    sectionExpandCollapse : function(expandSection) {
        console.log("sectionExpandCollapse: enter");
        var nowShow = $A.util.hasClass(expandSection, 'slds-show');
        var isCollapsed;
        console.log(expandSection);

        if (nowShow == true) {
            $A.util.addClass(expandSection, 'slds-hide');
            $A.util.removeClass(expandSection, 'slds-show');    
            isCollapsed = true;
        }
        else {
            $A.util.addClass(expandSection, 'slds-show');
            $A.util.removeClass(expandSection, 'slds-hide');    
            isCollapsed = false;
        }
        console.log("sectionExpandCollapse: exit");
        return isCollapsed;
    },

    showModal : function (component, mode, layoutType) {
        var modalBody;
        var modalFooter;
        var modalHeader;

        console.log("showModal: about to create components");

        $A.createComponents([
            ["c:modalPanelDisplayContent",{
                'recordId' : component.get("v.recordId"),
                'objectApiName' : component.get("v.objectType"),
                'layoutType' : layoutType,
                'mode' : mode
            }],
            ["c:modalPanelDisplayFooter",{}]
        ],
        function(components, status){
            if (status === "SUCCESS") {
                modalBody = components[0];
                modalFooter = components[1];
                modalHeader = "Record Details: " + component.get("v.layoutType");
                console.log("showModal: got body and footer");
                component.find('overlayLib').showCustomModal({
                   header: modalHeader,
                   body: modalBody, 
                   // footer: modalFooter,
                   showCloseButton: true,
                   // cssClass: "my-modal,my-custom-class,my-other-class",
                   closeCallback: function() {
                       console.log("closing modal");
                   }
               })
            }
        }
       );
    },

    // CANDIDATE FOR DELETION 

    /* param is of form "data.xxx" or "parent.xxx" and the first part determines which of the first two input variable we use
        The code looks at the first part and returns the attribute with the name of the second part of the relevant structure */
    parseCardParam : function (data, parent, param) {
        console.log("panelDisplayHelper.parseCardParam");

        var paramSplitArray = param.split(".");
        if (paramSplitArray[0] == "data") {
            if (data != null) {
                return data[paramSplitArray[1]];
            }
        }
        if (paramSplitArray[0] == "parent") {
            if (parent != null) {
                return parent[paramSplitArray[1]];
            }
        }
        return "";
    },


    extractDisplayValues : function (data) {
        var excludeRoles = ["id", "name"];

        console.log("panelDisplayHelper.extractDisplayValues");
        console.log(JSON.stringify(data));

        var fields = data["fields"];
        console.log(fields.length);
        var displayApiArray = [];

        for (var i = 0; i < fields.length; i++) {
            var field = fields[i];
            if (excludeRoles.indexOf(field.role) == -1) { // not in the excluded list
                if (field.display == true) {
                    if (field.retrievedValue != null) {
                        displayApiArray.push(field.retrievedValue);
                    }
                    if (field.retrievedDatetime != null) {
                        displayApiArray.push(field.retrievedDatetime);
                    }
                    if (field.retrievedCurrency != null) {
                        displayApiArray.push(field.retrievedCurrency);
                    }
                    if (field.retrievedInteger != null) {
                        displayApiArray.push(field.retrievedInteger);
                    }
                }    
            }
        }
        console.log(displayApiArray);
        return displayApiArray;
    },

    extractRecordRoleField : function (data, role) {
        console.log("panelDisplayHelper.extractRecordRoleField");

        var fields = data["fields"];
        console.log(fields.length);

        for (var i = 0; i < fields.length; i++) {
            var field = fields[i];
            if (field.role == role) {
                return field.retrievedValue;
            }
        }
    },
    


})
