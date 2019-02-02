/* Class handles the parsing of the chart configuration */

public inherited sharing class HierarchyConfiguration  {

    public HierarchyConfiguration() {
    }

    // allows a SOQL query to be entered that returns an id that will be the root node of the hierarchy. Will only be used if a recordId is not passed into @AuraEnabled method
    public String topIdDeriveSOQL;

    /* Will be used if a recordId is passed into @AuraEnabled method and we wish to root the chart on a different related record. 
    A query can be passed that returns an ID value which references in the passed-in recordId
    */
    public String rootIdRelatedSOQL;
    public String relatedQueryObject; 

    // levels to retrieve in initial query
    public Integer initialLevelsToRetrieve;
    // maps an object name to its configuration object.
    public List<ObjectConfiguration> objectLevels = new List<ObjectConfiguration>();

    public class ObjectConfiguration {

        public String objectType; // the type of the sObject referenced.
        public List<HierarchyConfiguration.FieldConfiguration> fields = new List<HierarchyConfiguration.FieldConfiguration> ();

        public String orderByField = null;

        // recursive = true means we need to the same configuration should be used for all levels below this object level
        public boolean recursive = false;

        // whereClause provide a filter - it should be written in the form "type = 'Prospect' and annualrevenue > 1000"
        public String whereClause = null;

        public ObjectConfiguration() {
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

    // getLevel returns the configuration in the thisLevel position. If the list is of shorter length then returns the final element if that element is marked as recursive
    // otherwise returns null
    // Note: Level 0 is the top element
    public ObjectConfiguration getLevel(Integer thisLevel) {
        Integer arrayMaxIndex = objectLevels.size() -1;

        if (thisLevel > arrayMaxIndex) {
            //gone beyond end of array so check if recursive or return null if not
            ObjectConfiguration lastOC = objectLevels[arrayMaxIndex];
            return lastOC.recursive == true ? lastOC : null;
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
