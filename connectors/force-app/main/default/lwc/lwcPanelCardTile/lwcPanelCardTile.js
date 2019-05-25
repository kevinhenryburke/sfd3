import { LightningElement, api, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { CurrentPageReference } from 'lightning/navigation';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import { registerListener, unregisterAllListeners, fireEvent } from 'c/pubsub';
import CHARTLIBS from '@salesforce/resourceUrl/chartLibs';

export default class lwcPanelCardTile extends LightningElement {

    @wire(CurrentPageReference) pageRef;

    @track recordName = "Hover chart for details";
    @api iconName;
    @api displayData;
    @api masterConfig;
    @api layoutStyle;
    recordId;

    @track extractedDisplayValues;

    renderedCallbackRun = false;
    masterConfigObject;
    objectIcons;

    get isCardTile() {
        return this.layoutStyle === "cardTile";
    }    

    get isCard() {
        return this.layoutStyle === "card";
    }    

    connectedCallback() {
        this.masterConfigObject = JSON.parse(this.masterConfig);
        this.objectIcons = this.extractObjectIcons();
        registerListener('evt_sfd3', this.handleCustomEvent, this);
    }

    handleCustomEvent(eventData) {
        console.log("lwcPanelCardTile: handleCustomEvent enter");
        let topic = eventData.topic;
        let parameters = eventData.parameters;

        console.log("lwcPanelCardTile: handleCustomEvent topic = ", topic);

        if (topic == "ChartMouseOver")
        {
            let displayData = parameters["data"];
            this.recordId = this.extractRecordRoleField(displayData, "id");
            this.recordName = this.extractRecordRoleField(displayData, "name");
            this.extractedDisplayValues = this.extractDisplayValuesImpl(displayData); 

            let objectType = displayData["objectType"];

            if (objectType != null && this.objectIcons[objectType] != null) {
                this.iconName = this.objectIcons[objectType];
            }
            else {
                this.iconName = "standard:account";
            }
        }
    }

    disconnectedCallback() {
        unregisterAllListeners(this);
    }


    renderedCallback() {
        if (this.renderedCallbackRun) {
            return;
        }
        this.renderedCallbackRun = true;

        Promise.all([
            loadScript(this, CHARTLIBS + '/utils.js'),
        ])
            .then(() => {
                bzutils.log("lwcPanelCardTile: bzutils: loaded common libs");
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error loading common libs',
                        message: error.message,
                        variant: 'error',
                    }),
                );
            });
    }


    handleFade(event) {
        console.log("lwc: handleFade");
        // 1. Prevent default behavior of anchor tag click which is to navigate to the href url
        event.preventDefault();
        // 2. Create a custom event that bubbles. Read about event best practices at http://developer.salesforce.com/docs/component-library/documentation/lwc/lwc.events_best_practices
        const fadeEvent = new CustomEvent('handlefade', {
            // detail: { contactId: event.currentTarget.dataset.contactId }
        });
        // 3. Fire the custom event
        this.dispatchEvent(fadeEvent);
    }

    handleClose(event) {
        console.log("lwc: handleClose");
        // 1. Prevent default behavior of anchor tag click which is to navigate to the href url
        event.preventDefault();
        // 2. Create a custom event that bubbles. Read about event best practices at http://developer.salesforce.com/docs/component-library/documentation/lwc/lwc.events_best_practices
        const closeEvent = new CustomEvent('handleclose', {
            // detail: { contactId: event.currentTarget.dataset.contactId }
        });
        // 3. Fire the custom event
        this.dispatchEvent(closeEvent);
    }

    extractDisplayValuesImpl (data) {

        console.log("lwcPanelCardTile.extractDisplayValuesImpl",JSON.stringify(data));

        if (data != null && data["fields"] != null) {

            let fields = data["fields"];
            let displayValuesArray = [];
        
            for (let i = 0; i < fields.length; i++) {
                let field = fields[i];
                console.log("lwcPanelCardTile field.api: " + field.api + " " + field.display + " " + field.fieldType + " /field:  " , field);
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
                        default: formatAs = "STRING";
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
                    console.log("rf7s formatAs: " + formatAs);
        
                    displayValuesArray.push({"value" : rv, "api" : field.api, "fieldType" : field.fieldType, "formatAs" : formatAs, "lookupId" : field.lookupId, "displayPrefix" : field.displayPrefix });
                }    
            }
            this.extractedDisplayValues = displayValuesArray;
            console.log("lwcPanelCardTile.extractDisplayValuesImpl returning",displayValuesArray);

            return displayValuesArray;
        }
        this.extractedDisplayValues = {};
        return {};
    }

    extractRecordRoleField (data, role) {

        console.log("lwcPanelCardTile.extractRecordRoleField",JSON.stringify(data));

        let fields = data["fields"];
        for (var i = 0; i < fields.length; i++) {
            var field = fields[i];
            if (field.role == role) {
                return field.retrievedValue;
            }
        }
    }

    extractObjectIcons () {
        // There are currently two formats for mouseover
        // a SIMPLE style (not currently linked to any real Apex implementation) and a FIELDS style (real implementations and the ultimate long-term format)

        let objectIcons;

        if (this.masterConfigObject["panels"] != null) {
            objectIcons = this.masterConfigObject["panels"]["InfoPanel"]["objectIcons"];
        }
        else {
            objectIcons = {};  
        }
        return objectIcons;
    }

/*

            var displayData = parameters["data"];
            component.set("v.displayData", displayData);

            var lwcPanelCardTile = component.find("lwcPanelCardTile");

            var extractedDisplayValues;
            // TEMPORARY TILL DOING BOTH TILE TYPES
            if (lwcPanelCardTile != null) {
                // LWC Method update
                console.log("panelDisplayController.lwcPanelCardTile",lwcPanelCardTile);
//                extractedDisplayValues = lwcPanelCardTile.extractDisplayValuesImpl(displayData);    
            }
            else {
                extractedDisplayValues = helper.extractDisplayValues (displayData);
                component.set("v.extractedDisplayValues", extractedDisplayValues);  
            }


            var objectType = displayData["objectType"];
            component.set("v.objectType", objectType);

            component.set("v.iconName", "standard:account");

            if (objectType != null && objectIcons[objectType] != null) {
                component.set("v.iconName", objectIcons[objectType]);
            }
            else {
                component.set("v.iconName", "standard:account");
            }
        }

*/    

}