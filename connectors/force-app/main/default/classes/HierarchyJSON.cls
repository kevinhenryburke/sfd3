public inherited sharing class HierarchyJSON {

    /* 
    This class represents data structures that are passed back to the front end via serialization.
    It bears a huge similarity to the HierarchyStructure and most of the code herein is mapping HS to HJ
    
    Is it worth seeing if this could be got rid of - the original reason was that there were structures
    that the front end could not interpret properly. Is it worth trying to see if those could be nulled before serializing?

    */

    public String id; // a unique id - typically a Salesforce record id
    public String name; // the name of the record
    public Decimal size; // a metric associated with the record (optional)
    public String objectType; // the type of the sObject referenced.
    public List<HierarchyConfiguration.FieldConfiguration> fields = new List<HierarchyConfiguration.FieldConfiguration> ();
    
    public Integer level; // current level in the structure
    public Integer childDepth; // depth of levels beneath this.
    public List<HierarchyJSON> children;   // child records

    public String initialHighlightId; // a unique id - typically a Salesforce record id

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

    public static List<HierarchyJSON> convertTo (List<HierarchyStructure> lisths) {
        List<HierarchyJSON> listhj = new List<HierarchyJSON>();
        for (HierarchyStructure hs : lisths) {
            listhj.add(HierarchyJSON.mapHierarchyStructure (hs));
        }
        return listhj;
    }



}