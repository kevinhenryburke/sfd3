// TODO rename this to HierarchyConfiguration and perhaps have an inheritance to an abstract Configuration class
// eg read Configuration in and then factory it out for the implmentation

public abstract class Configuration {
/*
    // chartType is required to provide the mandatory fields for every object
    public String chartType;
    // starting objects of a configuration
    public String initialObjectType;
    // maps an object name to its configuration object.
    public Map<String,ObjectConfiguration> mapObjectConfiguration = new Map<String,ObjectConfiguration> ();

    public Configuration() {
    }

    public Configuration(String chartType) {
        this.chartType = chartType;
    }

    public virtual class ObjectConfiguration {

        public String objectType; // the type of the sObject referenced.

        // Salesforce standard fields like id and name must be included plus other depending on chartType.
        // Some concept of a parent will be needed for hierarchies for example

        public Map<String,String> fields = new Map<String,String>();

        public String childRelationship; // the relationship   

        public ObjectConfiguration() {
            // Salesforce Standard fields
        }        
    }

    public static Configuration deserialize (String JSONString) {
        Configuration deserialized = (Configuration)JSON.deserialize(JSONString, Configuration.class);     
        return deserialized;   
    }

    public string serialize () {
        if (isValid()) {
            return JSON.serialize(this, true);
        }
        return null;
    }



    // Check the chart type and from there the required fields need by all ObjectConfiguration
    // For example for a Hierarchy this might be id, name, size
    // This in implemented in teh subclass
    
    //TOOO Implement
    public abstract boolean isValid ();
*/
}
