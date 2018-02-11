({
    formatButtons : function (component, arrayNames, idprefix, maxbuttons)
    {
        var arrayNamesLength = arrayNames.length; 
        var index = 0;

        arrayNames.forEach(function(filtertype) {
            if (index < arrayNamesLength)
            {
                index++;
                var cmpTarget = component.find(idprefix + index);
                cmpTarget.set("v.label",filtertype);
            }
        });
        // clean up unused buttons
        for (; index < maxbuttons; )
        {
            index++;
            var cmpTarget = component.find(idprefix + index);
            cmpTarget.set("v.show","false");
        }
        filterGraph();
        
    },
        
    setConnectionLevel : function(component, d) {
        levels = d;
        filterGraph() ;
        var elementid = 'l' + d;
        var cmpTarget = component.find(elementid);
        $A.util.toggleClass(cmpTarget, 'slds-button--neutral');
        $A.util.toggleClass(cmpTarget, 'slds-button--brand');
        this.clearOtherLevels(component,elementid);
    },

    setConnectionLevelLess : function(component) {
        if (levels > 1)
        {
            levels--;
	        filterGraph() ;
        }
        var cmpTargetMore = component.find("more");
        cmpTargetMore.set("v.disabled", "false");
        if (levels == 1)
        {
	        var cmpTargetLess = component.find("less");
			cmpTargetLess.set("v.disabled", "true");
        }
        
    },
    
    setConnectionLevelMore : function(component) {
        if (levels < 4)
        {
            levels++;
	        filterGraph() ;
        }
        var cmpTargetLess = component.find("less");
        cmpTargetLess.set("v.disabled", "false");
        if (levels == 4)
        {
	        var cmpTargetMore = component.find("more");
			cmpTargetMore.set("v.disabled", "true");
        }
    },
    
    setNodeSize : function(d) {
        measure = d;
        filterGraph() ;
	},

    setThisRelationshipType : function(component, indexer) {
        var cmpTarget = component.find('b' + indexer);
        $A.util.toggleClass(cmpTarget, 'slds-button--neutral');
        $A.util.toggleClass(cmpTarget, 'slds-button--brand');
        var isClicked = $A.util.hasClass(cmpTarget, 'slds-button--brand');
        var thisType = datajson.filtertypes[indexer - 1];
		this.setRelationshipType(thisType,isClicked);
    },

    setMeasure : function(component, indexer) {
        var idprefix = 'v' + indexer;
        var cmpTarget = component.find(idprefix);
        var thisMeasure = datajson.measures[indexer - 1];

		this.setNodeSize(thisMeasure);
        var cmpTarget = component.find(idprefix);
        $A.util.toggleClass(cmpTarget, 'slds-button--neutral');
        $A.util.toggleClass(cmpTarget, 'slds-button--brand');
        this.clearOtherSizes(component,idprefix);
    },
    
    setRelationshipType : function(thisType, isClicked) {
        if (isClicked)
        {
            clickedfilters.push(thisType);
        }
        else
        {
            var index = $.inArray(thisType, clickedfilters);
            if (index > -1) {
                clickedfilters.splice(index, 1);
            }
        }
        filterGraph();
	},
    
    clearOtherLevels: function(cmp,b)  {
    	if (b != 'l1')
    	{
	        var cmpTarget = cmp.find('l1');
            $A.util.addClass(cmpTarget, 'slds-button--neutral');
            $A.util.removeClass(cmpTarget, 'slds-button--brand');
		}
    	if (b != 'l2')
    	{
	        var cmpTarget = cmp.find('l2');
            $A.util.addClass(cmpTarget, 'slds-button--neutral');
            $A.util.removeClass(cmpTarget, 'slds-button--brand');
		}
    	if (b != 'l3')
    	{
	        var cmpTarget = cmp.find('l3');
            $A.util.addClass(cmpTarget, 'slds-button--neutral');
            $A.util.removeClass(cmpTarget, 'slds-button--brand');
		}
    	if (b != 'l4')
    	{
	        var cmpTarget = cmp.find('l4');
            $A.util.addClass(cmpTarget, 'slds-button--neutral');
            $A.util.removeClass(cmpTarget, 'slds-button--brand');
		}
    },
    
    clearOtherSizes: function(cmp,b)  {
    	if (b != 'v1')
    	{
	        var cmpTarget = cmp.find('v1');
            $A.util.addClass(cmpTarget, 'slds-button--neutral');
            $A.util.removeClass(cmpTarget, 'slds-button--brand');
		}
    	if (b != 'v2')
    	{
	        var cmpTarget = cmp.find('v2');
            $A.util.addClass(cmpTarget, 'slds-button--neutral');
            $A.util.removeClass(cmpTarget, 'slds-button--brand');
		}
    	if (b != 'v3')
    	{
	        var cmpTarget = cmp.find('v3');
            $A.util.addClass(cmpTarget, 'slds-button--neutral');
            $A.util.removeClass(cmpTarget, 'slds-button--brand');
		}
    	if (b != 'v4')
    	{
	        var cmpTarget = cmp.find('v4');
            $A.util.addClass(cmpTarget, 'slds-button--neutral');
            $A.util.removeClass(cmpTarget, 'slds-button--brand');
		}
    	if (b != 'v5')
    	{
	        var cmpTarget = cmp.find('v5');
            $A.util.addClass(cmpTarget, 'slds-button--neutral');
            $A.util.removeClass(cmpTarget, 'slds-button--brand');
		}
    }  

})