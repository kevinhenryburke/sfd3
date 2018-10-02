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

    /* param is of form "data.xxx" or "parent.xxx" and the first part determines which of the first two input variable we use
        The code looks at the first part and returns the attribute with the name of the second part of the relevant structure */
    parseCardParam : function (data, parent, param) {
        var paramSplitArray = param.split(".");
        if (paramSplitArray[0] == "data") {
            if (data != null) {
                if (paramSplitArray[1] != "otherFields") {
                    // these are the key fields
                    return data[paramSplitArray[1]];
                }
                else {
                    // this is the otherFields parameters
                    return data[paramSplitArray[1]][paramSplitArray[2]];
                }
            }
        }
        if (paramSplitArray[0] == "parent") {
            if (parent != null) {
                return parent[paramSplitArray[1]];
            }
        }
        return "";
    }


})
