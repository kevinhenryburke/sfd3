import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import CHARTLIBS from '@salesforce/resourceUrl/chartLibs';
import D3 from '@salesforce/resourceUrl/d3js413';

// Example: https://developer.salesforce.com/docs/component-library/documentation/lwc/lwc.create_third_party_library

export default class LwcChart extends LightningElement {
    @api defaultEventType;
    @api UserComponentId;
    @api UserControllerComponentId;
    @api Title;
    @api masterConfig;  

    @api recordId;    
    
    storeObject;    
    componentReference;  
    @api pathToolTipDivId;  
    @api chartAreaDivId;

    renderedCallbackRun = false;

    renderedCallback() {
        if (this.renderedCallbackRun) {
            console.log("lwcChart: not first renderedCallback");
            return;
        }
        console.log("lwcChart: first renderedCallback");

        this.renderedCallbackRun = true;


        Promise.all([
            loadScript(this, CHARTLIBS + '/utils.js'),
            loadScript(this, CHARTLIBS + '/lwcSpecific.js'),
            loadScript(this, CHARTLIBS + '/chartCommon.js'),
            loadScript(this, D3),
//            ,
//            loadStyle(this, D3 + '/style.css'),
        ])
            .then(() => {

                bzutils.log("lwcChart: loaded common libs");

                let masterConfigObject = JSON.parse(this.masterConfig);
                let componentType = bzutils.getMasterParamWithDefault(masterConfigObject,1,"data","componentType");

                Promise.all([
                    loadScript(this, CHARTLIBS + '/hierarchy.js'),
                    loadScript(this, CHARTLIBS + '/hierarchyCtree.js'),
                ])
                    .then(() => {
                        bzutils.log("lwcChart: loaded specific libs");
                        bzutils.log("lwcChart: recordId: " , this.recordId);
                        this.storeObject = bzlwc.startInitialize(this.recordId);

                        this.chartAreaDivId = bzchart.getStore (this.storeObject, "chartAreaDivId");   
                        this.componentReference = bzchart.getStore (this.storeObject, "componentReference");
                        this.pathToolTipDivId = this.componentReference + 'pathToolTip';
                        console.log("lwcChart: testing getStore", this.storeObject, this.chartAreaDivId);


                    })
                    .catch(error => {
                        this.dispatchEvent(
                            new ShowToastEvent({
                                title: 'Error loading specific libs',
                                message: error.message,
                                variant: 'error',
                            }),
                        );
                    });
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

     

}