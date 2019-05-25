import { LightningElement, api, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class FieldFormatter extends NavigationMixin(LightningElement) {
    @track url;
    @api item;

    connectedCallback() {
        // Store the PageReference in a variable to use in handleClick.
        // This is a plain Javascript object that conforms to the
        // PageReference type by including "type" and "attributes" properties.
        // The "state" property is optional.
        this.recordPageRef = {
            type: "standard__recordPage",
            attributes: {
                recordId: this.item.lookupId,
                actionName: 'view'
            }
        };
        this[NavigationMixin.GenerateUrl](this.recordPageRef)
            .then(url => this.url = url);
    }

    goToRecord(evt) {
        // Stop the event's default behavior.
        // Stop the event from bubbling up in the DOM.
        evt.preventDefault();
        evt.stopPropagation();
        // Navigate to the Account Home page.
        this[NavigationMixin.Navigate](this.recordPageRef);
    }    

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

}