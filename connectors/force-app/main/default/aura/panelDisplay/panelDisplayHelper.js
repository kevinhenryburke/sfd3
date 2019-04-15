({

    sectionExpandCollapseMaster : function(component, letter) {
        var _this = this;
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
        var nowShow = $A.util.hasClass(expandSection, 'slds-show');
        var isCollapsed;

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
        return isCollapsed;
    },

    showModal : function (component, mode, layoutType) {
        var modalBody;
        var modalFooter;
        var modalHeader;

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
        var fields = data["fields"];
        var displayValuesArray = [];

        for (var i = 0; i < fields.length; i++) {
            var field = fields[i];
            console.log("rf6 field.api: " + field.api + " " + field.display + " " + field.fieldType + " /field:  " , field);
            if (field.display == true) {
                let rv;
                let formatAs = 'STRING';
                if (field.retrievedValue != null) {
                    rv = field.retrievedValue;
                }
                if (field.fieldType == "DATETIME" && field.retrievedValue != null) {
                    rv = new Date(field.retrievedValue);
                }
                if (field.fieldType == "DATE" && field.retrievedValue != null) {
                    rv = new Date(field.retrievedValue);
                }
                if (field.fieldType == "CURRENCY" || field.fieldType == "DECIMAL" || field.fieldType == "DOUBLE") {
                    console.log("rf6 numeric: " + field.retrievedValue);
                    rv = field.retrievedValue;
                }
                if (field.fieldType == "INTEGER" && field.retrievedValue != null) {
                    rv = field.retrievedValue;
                }
                // This is horrible but necessary as component auar:if logic does not have a way of boolean and/or more than 2 items
                switch (field.fieldType) {
                    case "URL" : formatAs = "URL"; break;
                    case "EMAIL" : formatAs = "EMAIL"; break;
                    case "PHONE" : formatAs = "PHONE"; break;
                    case "CURRENCY" : formatAs = "CURRENCY"; break;
                    case "DECIMAL" : formatAs = "DECIMAL"; break;
                    case "DOUBLE" : formatAs = "DECIMAL"; break;
                    case "INTEGER" : formatAs = "INTEGER"; break;
                    case "DATETIME" : formatAs = "DATE"; break;
                    case "DATE" : formatAs = "DATE"; break;
                    case "TEXTAREA" : formatAs = "TEXTAREA"; break;
                }

                // special case for photo url on a user record
                if (field.api == "SmallPhotoUrl") {
                    rv = field.retrievedValue;
                    formatAs = "PHOTOURL";
                }
                if (field.api == "Name" || field.api.endsWith(".Name")) {
                    rv = field.retrievedValue;
                    formatAs = "NAME";
                }
                if (field.lookupId != null) {
                    formatAs = "LOOKUP";
                }
                console.log("rf6 formatAs: " + formatAs);

                displayValuesArray.push({"value" : rv, "api" : field.api, "fieldType" : field.fieldType, "formatAs" : formatAs, "lookupId" : field.lookupId, "displayPrefix" : field.displayPrefix });
            }    
        }
        return displayValuesArray;
    },

    extractRecordRoleField : function (data, role) {
        var fields = data["fields"];
        for (var i = 0; i < fields.length; i++) {
            var field = fields[i];
            if (field.role == role) {
                return field.retrievedValue;
            }
        }
    },
    


})
