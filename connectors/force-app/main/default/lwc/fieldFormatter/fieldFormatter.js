import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class FieldFormatter extends NavigationMixin(LightningElement) {
    @api item;

    get isPhone() { 
        return (this.item.formatAs === "PHONE") ? true : false;
    }

    get isEmail() { 
        return (this.item.formatAs === "EMAIL") ? true : false;
    }

    get isURL() { 
        return (this.item.formatAs === "URL") ? true : false;
    }

    get isNumber() { 
        return (this.item.formatAs === "CURRENCY" || this.item.formatAs === "DECIMAL" || this.item.formatAs === "INTEGER") ? true : false;
    }

    get isDateTime() { 
        return (this.item.formatAs === "DATE") ? true : false;
    }

    get isPhotoURL() { 
        return (this.item.formatAs === "PHOTOURL") ? true : false;
    }

    get isString() { 
        // console.log("xxxxx: LWC String: ",this.item.api,this.item.lookupId);
        return (this.item.formatAs === "STRING") ? true : false;
    }

    get isName() { 
        return (this.item.formatAs === "NAME") ? true : false;
    }

    get isLookup() { 
        return (this.item.formatAs === "LOOKUP") ? true : false;
    }

    get isTextArea() { 
        return (this.item.formatAs === "TEXTAREA") ? true : false;
    }

    get localURL() {
        return "/" + this.item.lookupId;
    }

    // this is the official way to naviage but it does not seem to work

    /*
    navigateToRecordViewPage() {
        // // View a custom object record.

        // console.log("xxxxx: nav to " , this.item.lookupId);

        // this[NavigationMixin.Navigate]({
        //     type: 'standard__recordPage',
        //     attributes: {
        //         recordId: this.item.lookupId,
        //         objectApiName: 'Account',
        //         actionName: 'view'
        //     }
        // });

        // OR 

        // // Generate a URL to a User record page
        // this[NavigationMixin.GenerateUrl]({
        //     type: 'standard__recordPage',
        //     attributes: {
        //         recordId: this.item.lookupId,
        //         actionName: 'view',
        //     },
        // }).then(url => {
        //     this.recordPageUrl = url;
        // });        
    }    
    */
}