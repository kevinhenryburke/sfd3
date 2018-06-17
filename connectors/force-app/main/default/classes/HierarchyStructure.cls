// Represents a Hierarchical data structure. A record of each type represents a node in reality (and the structure beneath that node)

public with sharing class HierarchyStructure {

    /* 
        High Level - a query is run that returns ids, a parent id and some data fields
        The parent id is presumed to already exist in the structure
        This is searched for in a list that is maintained against the top node.
        In order to facilitate this search a reference to the top node needs to be maintained at all times
        Once the parent node is available the children are added to its data structure and the sum of child nodes is computed
    */

    //TODO sumOfChildren - needed - not complete at moment as doesn't bubble up

    /* Data returned from the output structure */
 
    public String id; // a unique id - typically a Salesforce record id
    public String name; // the name of the record
    public Decimal size; // a metric associated with the record (optional)
    // Decimal sumOfChildren = 0; // a metric associated with the record (optional)
    public List<HierarchyStructure> children;   // child records


    /* Computational structures */
    public HierarchyStructure top; // top node in the hierarchy 
    public HierarchyStructure parent; // node containing this in the hierarchy 
    public boolean isTop = false; // is this the top node of the hierarchy
    /* Store a list of Map of ids to HierarchyStructure objects against the top node of the hierarchy */
    public Map<Id,HierarchyStructure> mapIdHierarchyStructure = new Map<Id,HierarchyStructure>(); // only populated on the top node

    /* Class Constructor */    
    public HierarchyStructure(HierarchyStructure parent) {
        if (parent == null) {
            isTop = true;
            this.top = this;
            this.parent = this;
        } 
        else {
            isTop = false;
            this.top = parent.top;
            this.parent = parent;
        }
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
        // update the sum of child nodes
        // if (sumOfChildren != null) {
        //     sumOfChildren += computeSumOfChildren(newChildren);
        // }
        // else {
        //     sumOfChildren = computeSumOfChildren(newChildren);            
        // }
    }

    private void addReferences (List<HierarchyStructure> listHierarchyStructure) {        
        // retrieve the map from the top node 
        Map<Id,HierarchyStructure> mapIdHierarchyStructure = this.top.mapIdHierarchyStructure;

        for(HierarchyStructure hs : listHierarchyStructure ) {
            mapIdHierarchyStructure.put(hs.id, hs);
        }
    }

    // public void computeSumOfChildren (List<HierarchyStructure> listHierarchyStructure) {        
    //     Decimal sum = 0;
    //     for(HierarchyStructure hs : HierarchyStructure ) {
    //         if (size != null) {
    //             sum += size; 
    //         }
    //     }
    //     return sum;
    // }


    public HierarchyStructure getHierarchyStructureById (String id) {        
        // retrieve the map from the top node 
        Map<Id,HierarchyStructure> mapIdHierarchyStructure = this.top.mapIdHierarchyStructure;
        return mapIdHierarchyStructure.get(id);
    }


}
