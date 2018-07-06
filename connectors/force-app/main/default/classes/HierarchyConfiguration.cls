public with sharing class HierarchyConfiguration  {

    public HierarchyConfiguration() {

    }

    public HierarchyConfiguration(String chartType) {
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

        // Salesforce standard fields like id and name must be included plus other depending on chartType.
        // Some concept of a parent will be needed for hierarchies for example
        public Map<String,String> queryFields = new Map<String,String>();
        public String parentField;

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
        return loc[thisLevel];
    }


}
