public with sharing class HierarchyJSON {

    public String id; // a unique id - typically a Salesforce record id
    public String name; // the name of the record
    public Decimal size; // a metric associated with the record (optional)
    public List<HierarchyJSON> children;   // child records

    public HierarchyJSON() {

    }
 
    public static HierarchyJSON mapHierarchyStructure (HierarchyStructure hs) {
        HierarchyJSON hj = new HierarchyJSON();
        hj.id = hs.id;
        hj.name = hs.name;
        hj.size = hs.size;

        if (hs.children != null) {
            hj.children = new List<HierarchyJSON>();
            for (HierarchyStructure hsChild : hs.children) {
                HierarchyJSON hjChild = mapHierarchyStructure(hsChild); 
                hj.children.add(hjChild);
            }
        }
        return hj;
    }

}