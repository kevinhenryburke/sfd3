({
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

    showModal : function (component, mode) {
        var modalBody;
        var modalFooter;
        var modalHeader;

        console.log("showModal: about to create components");

        $A.createComponents([
            ["c:modalPanelDisplayContent",{
                'recordId' : component.get("v.recordId"),
                'objectApiName' : component.get("v.objectApiName"),
                'layoutType' : component.get("v.layoutType"),
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
                   footer: modalFooter,
                   showCloseButton: true,
                   // cssClass: "my-modal,my-custom-class,my-other-class",
                   closeCallback: function() {
                       console.log("closing modal");
                   }
               })
            }
        }
       );
    }

})
