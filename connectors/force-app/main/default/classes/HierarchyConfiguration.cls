public with sharing class HierarchyConfiguration  {

    public HierarchyConfiguration() {
        System.debug('HierarchyConfiguration constructor');
    }

    public HierarchyConfiguration(String chartType) {
        System.debug('HierarchyConfiguration constructor');
        this.chartType = chartType;
    }



    // chartType is required to provide the mandatory fields for every object
    public String chartType;
    // levels to retrieve in initial query
    public Integer initialLevelsToRetrieve;
    // maps an object name to its configuration object.
    public List<ObjectConfiguration> loc = new List<ObjectConfiguration>();

    public class ObjectConfiguration {

        public String objectType; // the type of the sObject referenced.
        public List<HierarchyConfiguration.FieldConfiguration> fields = new List<HierarchyConfiguration.FieldConfiguration> ();

        // Salesforce standard fields like id and name must be included plus other depending on chartType.
        // Some concept of a parent will be needed for hierarchies for example


/*
Tenerife notes on otherFields 

This is just a list of fields
Parsed in from config and parsed in HierarchyConfiguration as part of an ObjectConfiguration
This then gets added to a HierarchyStructure for output - it is no longer used at all to construct queries etc.
And then gets passed to javascript: chartHierarchyHelper and panelDisplayController

How to refactor?
1) - stop referencing otherFields in the component configuration and use component display fields in the newer configuraiton mechanims
In HierarchyQuery use the new configuration to push the fields instead of the old config - simplest might be just to push them all and forget about dispaly parameter first

2) - where we d.data.otherFields we should be having d.data.fields. This would need to reflect in both javascript and apex
Add members - retrievedValue, retrievedInteger etc - to FieldConfiguration
So HierarchyStructure references could then utilise "fields" member rather than "otherFields" member.

2a) - populate both otherFields and fields.retrievedValue on HierarchyStructure initially
Then migrate chartHierarcnyHelper to refer to fields rather than otherFields

2b) need to stop passing the otherFields through to display component - need to use fields and let the display components determine what they should show in their configuration!!

2c) - migrate away completely from otherFields

3) add a filtering on the "Display parameter" 


STATUS - 1 is done.



*/

        public String orderByField = null;

        // recursive = true means we need to the same configuration should be used for all levels below
        public boolean recursive = false;

        // terminal means no more queries, we've reached the bottom.
        // TODO not implemented yet
        public boolean terminal = false;

        public ObjectConfiguration() {
            // Salesforce Standard fields
        }        

        // Check the chart type and from there the required fields need by all ObjectConfiguration
        // For example for a Hierarchy this might be id, name, size
        public boolean isValid () {
            return true;
        }

        public void setFieldTypes(){
            for (HierarchyConfiguration.FieldConfiguration field : this.fields) {
                field.fieldType = HierarchyConfiguration.getFieldType(this.objectType, field.api);
                System.debug('oc.setFieldTypes field.fieldType: ' + this.objectType + '.' + field.api + '=' + field.fieldType);
            }
        }

    }

    public class FieldConfiguration {
        public String api;
        public String role;
        public boolean display;
        public boolean orderByField = false;

        public String fieldType; // not part of the configuratiom but computed

        // not part of the configuration but returned from the queries
        public String retrievedValue; 
        public Integer retrievedInteger; 
        public Double retrievedCurrency; 
        public Datetime retrievedDatetime; 
    }

    public static HierarchyConfiguration deserialize (String JSONString) {
        HierarchyConfiguration deserialized = (HierarchyConfiguration)JSON.deserialize(JSONString, HierarchyConfiguration.class);     
        return deserialized;   
    }

    public string serialize () {
        return JSON.serialize(this, true);
    }

    // Note: Level 0 is the top element
    // returns the configuration in the ith position. If the list is of shorter length then returns the final element if that element is marked as recursive
    // otherwise returns null
    public ObjectConfiguration getLevel(Integer thisLevel) {
        Integer arrayMaxIndex = loc.size() -1;

        System.debug('thisLevel: ' + thisLevel);
        System.debug('arrayMaxIndex: ' + arrayMaxIndex);
        System.debug('loc: ' + loc);

        if (thisLevel > arrayMaxIndex) {
            System.debug('gone beyond end of array so check if recursive');

            // this is not an explicitly configured level but we can still return the final configured level if that level is recursive
            ObjectConfiguration lastOC = loc[arrayMaxIndex];
            System.debug('lastOC: ' + lastOC);
            if (lastOC.recursive == true) {
                System.debug('recursive');
                return lastOC;
            }
            else {
                return null;
            }
        }
        // this is an explicitly configured level so we return
        ObjectConfiguration oc = loc[thisLevel];
        return loc[thisLevel];
    }

    public static String getFieldType(String objectType, String fieldName){
        Schema.SObjectType t = Schema.getGlobalDescribe().get(objectType);    
        Schema.DescribeSObjectResult r = t.getDescribe();
        Schema.DescribeFieldResult f = r.fields.getMap().get(fieldName).getDescribe();
        return f.getType().name(); 
    }


}
