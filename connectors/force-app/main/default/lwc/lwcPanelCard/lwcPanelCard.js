import { LightningElement, api } from 'lwc';

export default class LwcPanelCard extends LightningElement {
    @api recordName;
    @api iconName;
    @api extractedDisplayValues;
}