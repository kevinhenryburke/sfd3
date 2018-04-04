<aura:application extends="force:slds">
    <div class="slds" style="margin-top:10px;margin-left:10px;"> 
        <div class="slds-grid slds-gutters">
            <div class="slds-col slds-size_1-of-2">
                <c:d3comp />
            </div>
            <div class="slds-col slds-size_1-of-2">
                <c:chartArea chartAreaDivId="" />
            </div> 
        </div>
        <div class="slds-grid slds-gutters">
            <div class="slds-col slds-size_1-of-2">
                <c:chartArea chartAreaDivId="chartArea2"  />
            </div> 
        </div>
    </div>
</aura:application>