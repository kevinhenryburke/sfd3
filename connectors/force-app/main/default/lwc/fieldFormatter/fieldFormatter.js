import { LightningElement, api } from 'lwc';

export default class FieldFormatter extends LightningElement {
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

    get localURL() {
        return "/" + this.item.lookupId;
    }

}