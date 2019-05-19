import { LightningElement, api } from 'lwc';

export default class LwcPanelCard extends LightningElement {
    @api recordName;
    @api iconName;
    @api extractedDisplayValues;

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

}