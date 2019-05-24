import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import CHARTLIBS from '@salesforce/resourceUrl/chartLibs';

export default class LwcPanelCardTile extends LightningElement {
    @api recordName;
    @api iconName;
    @api displayData;
    @api extractedDisplayValues;

}