// Represents a Hierarchical data structure. A record of each type represents a node in reality (and the structure beneath that node)

public with sharing class HierarchyStructure {

    /* 
        High Level - a query is run that returns ids, a parent id and some data fields
        The parent id is presumed to already exist in the structure
        This is searched for in a list that is maintained against the top node.
        In order to facilitate this search a reference to the top node needs to be maintained at all times
        Once the parent node is available the children are added to its data structure and the sum of child nodes is computed
    */

    /* Data returned from the output structure */
 
    public String id; // a unique id - typically a Salesforce record id
    public String name; // the name of the record
    public Decimal size; // a metric associated with the record (optional)
    public String objectType; // the type of the sObject referenced.
    public Integer level; // level down we have reached in teh structure

    public Map<String,String> otherFields; // map of additional field names and values passed through to the front end

    public List<HierarchyStructure> children;   // child records

    public List<HierarchyConfiguration.FieldConfiguration> fields;
    
    /* Computational structures */
    public HierarchyStructure top; // top node in the hierarchy 
    public HierarchyStructure parent; // node containing this in the hierarchy 
    public boolean isTop = false; // is this the top node of the hierarchy
    /* Store a list of Map of ids to HierarchyStructure objects against the top node of the hierarchy */
    public Map<Id,HierarchyStructure> mapIdHierarchyStructure = new Map<Id,HierarchyStructure>(); // only populated on the top node


    /* Class Constructor for top element */    
    public HierarchyStructure(Id Id, Integer level) {
        isTop = true;
        this.top = this;
        this.parent = this;
        this.level = level;
        mapIdHierarchyStructure.put(id, this);
    }

    /* Class Constructor for child elements */    
    public HierarchyStructure(HierarchyStructure parent) {
        isTop = false;
        this.top = parent.top;
        this.parent = parent;
        this.level = parent.level + 1;
    }


    public void addChildren (List<HierarchyStructure> newChildren) {        
        // add the children to the top node map
        addReferences (newChildren);
        // bulk add the nodes to the structure
        if (this.children != null) {
            this.children.addAll(newChildren);
        }
        else {
            this.children = newChildren;
        }
    }

    private void addReferences (List<HierarchyStructure> listHierarchyStructure) {        
        // retrieve the map from the top node 
        Map<Id,HierarchyStructure> mapIdHierarchyStructure = this.top.mapIdHierarchyStructure;

        for(HierarchyStructure hs : listHierarchyStructure ) {
            mapIdHierarchyStructure.put(hs.id, hs);
        }
    }

    public HierarchyStructure getHierarchyStructureById (String id) {        
        // retrieve the map from the top node 
        Map<Id,HierarchyStructure> mapIdHierarchyStructure = this.top.mapIdHierarchyStructure;
        return mapIdHierarchyStructure.get(id);
    }


}
