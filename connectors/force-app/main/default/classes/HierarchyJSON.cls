public with sharing class HierarchyJSON {

    public String id; // a unique id - typically a Salesforce record id
    public String name; // the name of the record
    public Decimal size; // a metric associated with the record (optional)
    public String objectType; // the type of the sObject referenced.
    
    public Integer childDepth; // depth of levels beneath this.
    public List<HierarchyJSON> children;   // child records

    public HierarchyJSON() {

    }
 
    public static HierarchyJSON mapHierarchyStructure (HierarchyStructure hs) {
        HierarchyJSON hj = new HierarchyJSON();
        hj.id = hs.id;
        hj.name = hs.name;
        hj.size = hs.size;
        hj.childDepth = 0;
        hj.objectType = hs.objectType;

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

    public static HierarchyJSON retrieveLevels (ID rootId, Integer intLevelsToRetrieve ) {

        Integer thisLevel = 0;
        HierarchyQuery hqTop = new HierarchyQuery(null);

        // get the top level structure and baseline queries to it.
        HierarchyStructure top = hqTop.mapSObjectTop(rootId);        
        HierarchyQuery hq = new HierarchyQuery(top);
        thisLevel = 1;
        Set<Id> parentLevelIds = new Set<Id>{rootId}; // the top node id

        for (thisLevel = 1; thisLevel <= intLevelsToRetrieve; thisLevel++ ) {
            List<HierarchyStructure> listNextLevelHS = hq.mapSObject(parentLevelIds); // this should map new level nodes to their parents
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


}