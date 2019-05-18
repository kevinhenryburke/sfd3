import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import CHARTLIBS from '@salesforce/resourceUrl/chartLibs';
import D3 from '@salesforce/resourceUrl/d3js413';

// Example: https://developer.salesforce.com/docs/component-library/documentation/lwc/lwc.create_third_party_library

export default class LwcChart extends LightningElement {
    @api defaultEventType;
    @api componentType;
    @api UserComponentId;
    @api UserControllerComponentId;
    @api Title;
    @api masterConfig;  

    d3Initialized = false;

    renderedCallback() {
        if (this.d3Initialized) {
            return;
        }
        this.d3Initialized = true;


        Promise.all([
            loadScript(this, CHARTLIBS + '/utils.js'),
            loadScript(this, CHARTLIBS + '/chartCommon.js'),
            loadScript(this, CHARTLIBS + '/hierarchy.js'),
            loadScript(this, CHARTLIBS + '/hierarchyCtree.js'),
            loadScript(this, D3),
//            ,
//            loadStyle(this, D3 + '/style.css'),
        ])
            .then(() => {
//                this.initializeD3();
                bzutils.log("LOGGING FROM CHART LIBS - YAAAY");

                let masterConfigObject = JSON.parse(this.masterConfig);


                let componentType = bzutils.getMasterParamWithDefault(masterConfigObject,1,"data","componentType");
                console.log("LOGGING FROM CHART LIBS - componentType" , componentType);
                
        // will need toparse out component type and then choose what to load

            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error loading libs',
                        message: error.message,
                        variant: 'error',
                    }),
                );
            });
    }

     

}