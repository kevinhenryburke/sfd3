public inherited sharing class HierarchyConfiguration  {

    public HierarchyConfiguration() {
        System.debug('HierarchyConfiguration constructor');
    }

    public HierarchyConfiguration(String chartType) {
        System.debug('HierarchyConfiguration constructor');
        this.chartType = chartType;
    }

    // allows a SOQL query to be entered that returns an id that will be the root node of the hierarchy. Will only be used if a recordId is not passed into @AuraEnabled method
    public String topIdDeriveSOQL;

    /* Will be used if a recordId is passed into @AuraEnabled method and we wish to root the chart on a different related record. 
    A query can be passed that returns an ID value which references in the passed-in recordId
    */
    public String rootIdRelatedSOQL;
    public String relatedQueryObject; 

    // chartType is required to provide the mandatory fields for every object
    public String chartType;
    // levels to retrieve in initial query
    public Integer initialLevelsToRetrieve;
    // maps an object name to its configuration object.
    public List<ObjectConfiguration> objectLevels = new List<ObjectConfiguration>();

    public class ObjectConfiguration {

        public String objectType; // the type of the sObject referenced.
        public List<HierarchyConfiguration.FieldConfiguration> fields = new List<HierarchyConfiguration.FieldConfiguration> ();

        // Salesforce standard fields like id and name must be included plus other depending on chartType.
        // Some concept of a parent will be needed for hierarchies for example

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
        public Double retrievedDecimal; 
        public Datetime retrievedDatetime; 
        public Date retrievedDate; 
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
        Integer arrayMaxIndex = objectLevels.size() -1;

        System.debug('thisLevel: ' + thisLevel);
        System.debug('arrayMaxIndex: ' + arrayMaxIndex);
        System.debug('objectLevels: ' + objectLevels);

        if (thisLevel > arrayMaxIndex) {
            System.debug('gone beyond end of array so check if recursive');

            // this is not an explicitly configured level but we can still return the final configured level if that level is recursive
            ObjectConfiguration lastOC = objectLevels[arrayMaxIndex];
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
        ObjectConfiguration oc = objectLevels[thisLevel];
        return objectLevels[thisLevel];
    }

    public static String getFieldType(String objectType, String fieldName){
        Schema.SObjectType t = Schema.getGlobalDescribe().get(objectType);    
        Schema.DescribeSObjectResult r = t.getDescribe();
        Schema.DescribeFieldResult f = r.fields.getMap().get(fieldName).getDescribe();
        return f.getType().name(); 
    }


}
