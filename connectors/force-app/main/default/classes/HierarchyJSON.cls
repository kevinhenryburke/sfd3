public with sharing class HierarchyJSON {

    public String id; // a unique id - typically a Salesforce record id
    public String name; // the name of the record
    public Decimal size; // a metric associated with the record (optional)
    public String objectType; // the type of the sObject referenced.
    public Map<String,String> otherFields; // map of additional field names and values passed through to the front end
    public List<HierarchyConfiguration.FieldConfiguration> fields = new List<HierarchyConfiguration.FieldConfiguration> ();
    
    public Integer level; // current level in the structure
    public Integer childDepth; // depth of levels beneath this.
    public List<HierarchyJSON> children;   // child records


    public HierarchyJSON() {

    }
 
    public static HierarchyJSON mapHierarchyStructure (HierarchyStructure hs) {
        HierarchyJSON hj = new HierarchyJSON();
        hj.id = hs.id;
        hj.name = hs.name;
        hj.size = hs.size;
        hj.level = hs.level;
        hj.childDepth = 0;
        hj.objectType = hs.objectType;
        hj.otherFields = hs.otherFields;
        hj.fields = hs.fields;

        if (hs.children != null) {
            hj.children = new List<HierarchyJSON>();
            for (HierarchyStructure hsChild : hs.children) {
                HierarchyJSON hjChild = mapHierarchyStructure(hsChild); 
                hj.children.add(hjChild);
                // if a child has depth equal or greater than current recorded depth then reevaulate the latter
                if (hjChild.childDepth >= hj.childDepth) {
                    hj.childDepth = hjChild.childDepth + 1;
                }
            }
        } 
        return hj;
    }

    // this method initializes the first levels of the chart.
    public static HierarchyJSON retrieveLevels (HierarchyConfiguration hc, ID rootId ) {

        Integer thisLevel = 0;

        // get the top level structure and baseline queries to it.
        HierarchyQuery hqTop = new HierarchyQuery(null, hc, thisLevel);
        HierarchyStructure top = hqTop.createTopStructure(rootId);        

//        thisLevel = 1;
        Set<Id> parentLevelIds = new Set<Id>{rootId}; // the top node id

        for (thisLevel = 0; thisLevel < hc.initialLevelsToRetrieve; thisLevel++ ) {
            // we create the query for each level
            HierarchyQuery hq = new HierarchyQuery(top, hc, thisLevel);

            List<sObject> childObjects = hq.runQuery ( parentLevelIds);

            List<HierarchyStructure> listNextLevelHS = hq.addChildStructures(childObjects); // this should map new level nodes to their parents
            parentLevelIds = new Set<Id>();
            for (HierarchyStructure hs : listNextLevelHS) {
                // make the next level ids the parents for the next iteration to get the level below this
                parentLevelIds.add(hs.id);
            }
        }

        HierarchyJSON hj = HierarchyJSON.mapHierarchyStructure (top);
        System.debug(LoggingLevel.ERROR,JSON.serializePretty(hj,true));
        return hj;
    }

    // Adds new level to the chart
    public static List<HierarchyJSON> createAdoptedChildren (HierarchyConfiguration hc, Set<ID> parentLevelIds, Integer thisLevel ) {

        HierarchyQuery hq = new HierarchyQuery(null, hc, thisLevel); 

        List<HierarchyStructure> lisths = hq.adoptChildren (parentLevelIds);

        List<HierarchyJSON> listhj = new List<HierarchyJSON>();

        for (HierarchyStructure hs : lisths) {
            listhj.add(HierarchyJSON.mapHierarchyStructure (hs));
        }

        return listhj;

    }
    
    public static List<HierarchyJSON> createAdoptedChildren (HierarchyConfiguration hc, List<ID> listParentLevelIds, Integer thisLevel ) {
        Set<Id> parentLevelIds = new Set<Id>();
        for (ID id : listParentLevelIds) {
            parentLevelIds.add(id);
        }
        return createAdoptedChildren (hc, parentLevelIds, thisLevel);
    }



}