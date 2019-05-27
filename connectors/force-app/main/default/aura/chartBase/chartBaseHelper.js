({
    // first method called after all resources are ready
    doneRenderLoad: function (component) {
        let _this = this;
        let storeObject = component.get("v.storeObject");
        let componentReference = bzchart.getStore (storeObject, "componentReference") ;  
        
        bzchart.setStore (storeObject, "componentType", component.get("v.componentType") ) ;
        bzchart.setStore (storeObject, "componentEvent", component.getEvent("evt_bzc")) ;        
        bzchart.setStore (storeObject, "defaultEventType", component.get("v.defaultEventType")) ;        
        bzchart.setStore (storeObject, "appEvents",  []) ;
        bzchart.setStore (storeObject, "masterConfig", component.get("v.masterConfig") ) ;

        bzchart.setStore (storeObject, "UserComponentId", component.get("v.UserComponentId") ) ;
        bzchart.setStore (storeObject, "UserControllerComponentId", component.get("v.UserControllerComponentId") ) ;

        bzchart.setStore (storeObject, "lastTouch", new Date().getTime()) ;
        bzchart.setStore (storeObject, "width", Math.min(screen.width, screen.height)) ; // review this
        bzchart.setStore (storeObject, "height", Math.min(screen.width, screen.height)) ; // review this

        bzchart.setStore (storeObject, "filtersConfigured", false);

		var margin = {top: 20, right: 90, bottom: 30, left: 50}; // this should probably be flexi-ed too
        bzchart.setStore (storeObject, "margin", margin) ;  
        
        // Differing strategies for computing Width and Height
        // Width depends on width of the container

        var divComponent = component.find("container1"); // this should be ok as it's an internal search, need to prefix with a unique id is required outside of lightning context
        var divElement = divComponent.getElement();
        var clientWidth = divElement.clientWidth;        
        bzchart.setStore (storeObject, "width", clientWidth) ; 

        // Height we hard code depending on the flexible page width 
        var flexiWidth = component.get("v.flexiWidth");

        if (flexiWidth == null) {
            // this is the case when not embedded in a Lightning Page - e.g. in aura preview
            flexiWidth = "MEDIUM";
        }

        if (flexiWidth == "SMALL")
        {
            bzchart.setStore (storeObject, "height", 800) ;                 
        }

        if (flexiWidth == "MEDIUM")
        {
            bzchart.setStore (storeObject, "height", 800) ;                 
        }

        if (flexiWidth == "LARGE")
        {
            bzchart.setStore (storeObject, "height", 1000) ;                 
        }
        
        d3.select(bzutils.getDivId("chartArea", componentReference, true))
            .append("svg")
            .attr("id", bzutils.getDivId("svg", componentReference, false)) // If putting more than one chart on a page we need to provide unique ids for the svg elements   
            .attr("width", bzchart.getStore (storeObject, "width") )
            .attr("height", bzchart.getStore (storeObject, "height") );

        console.log("chartArea: svg attached ");

        var agent = navigator.userAgent.toLowerCase();
        if(agent.indexOf('iphone') >= 0 || agent.indexOf('ipad') >= 0){
            bzchart.setStore (storeObject, "isiOS", true) ;                 
        }
        else {
            bzchart.setStore (storeObject, "isiOS", false) ;                 
        }
        
        var eventParameters = { 
            "componentReference" : componentReference
        }    
        var preppedEvent = bzchart.prepareEvent(storeObject, "ChartRendered", eventParameters);
        bzaura.publishPreppedEvent(storeObject,preppedEvent,$A.get("e.c:evt_sfd3"));

        console.log("chartArea: ChartRendered event published ");
 
        // build up a cache for mouseover events - may be a better way to do this!
        bzchart.setStore (storeObject, "appEvents",  []) ;
        _this.restockCache(component);

        var panelDisplayEmbedded = component.find("panelDisplayEmbedded"); // this should be ok as it's an internal search, need to prefix with a unique id is required outside of lightning context
        bzchart.setStore (storeObject, "panelDisplayEmbedded", panelDisplayEmbedded) ; 

        var panelDisplayEmbeddedOuter = component.find("panelDisplayEmbeddedOuter"); // this should be ok as it's an internal search, need to prefix with a unique id is required outside of lightning context
        bzchart.setStore (storeObject, "panelDisplayEmbeddedOuter", panelDisplayEmbeddedOuter) ; 
    },

    handleScaleChange: function(component,csf){
        let storeObject = component.get("v.storeObject");
        bzchart.setStore (storeObject, "ChartScaleFactor", csf) ;

       let variantsMixin = bzchart.getStore (storeObject, "chartMixin") ;
       variantsMixin.reScale(storeObject,csf); 
    },

    // reset cache of events for mouseover events to publish - may be a better way to do this!
    // the issue is that only the top orginally created nodes have lightning context, not sure why
    // alternative would be to pass in a parameter for these nodes and push events only when the attribute is set

    restockCache : function(component) {
        let storeObject = component.get("v.storeObject");

        var appEvents = bzchart.getStore (storeObject, "appEvents") ;

        var defaultEventType = component.get("v.defaultEventType");
        console.log("chartArea: restockCache: push new cache events of event type: " + defaultEventType);

        if (appEvents == null) {
            appEvents = [];
        }

        if (appEvents.length < 200) { // keep a cap on number of cached events
            for (var i = 0; i < 100; i++) {

                var appEvent;
            
                if (defaultEventType == "Application") {
                    appEvent = $A.get("e.c:evt_sfd3");
                } 
                else {
                    appEvent = component.getEvent("evt_bzc");
                }
            
                appEvents.push(appEvent);
            }
            bzchart.setStore (storeObject, "appEvents",  appEvents) ;
        }
    }, 

    simpleHash : function(s) {
        var hash = 0;
        if (s.length == 0) {
            return hash;
        }
        for (var i = 0; i < s.length; i++) {
            var char = s.charCodeAt(i);
            hash = ((hash<<5)-hash)+char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    },


})