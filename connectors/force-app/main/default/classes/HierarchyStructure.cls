// Represents a Hierarchical data structure. A record of each type represents a node in reality (and the structure beneath that node)

// TODO - poor name, consider a refactor, this is a HierarchyStructureElement or Node rather than the structure

public inherited sharing class HierarchyStructure {

    /* 
        High Level - a query is run that returns ids, a parent id and some data fields
        The parent id is presumed to already exist in the structure
        This is searched for in a list that is maintained against the top node.
        In order to facilitate this search a reference to the top node needs to be maintained at all times
        Once the parent node is available the children are added to its data structure and the sum of child nodes is computed
    */


    /* Store a static Map of ids to HierarchyStructure objects against the top node of the hierarchy */
    public static Map<Id,HierarchyStructure> mapIdHierarchyStructure = new Map<Id,HierarchyStructure>(); // only populated on the top node

    /* Data returned from the output structure */
 
    public String id; // a unique id - typically a Salesforce record id
    public String parentId; // a unique id - typically a Salesforce record id
    public String name; // the name of the record
    public Decimal size; // a metric associated with the record (optional)
    public String objectType; // the type of the sObject referenced.
    public Integer level; // level down we have reached in teh structure

    // the value retrieved for this record
    public String retrievedValue; 
    public String lookupId; 

    public List<HierarchyStructure> children;   // child records

    public List<HierarchyConfiguration.FieldConfiguration> fields;
    
    /* Computational structures */
    public HierarchyStructure top; // top node in the hierarchy 
    public HierarchyStructure parent; // node containing this in the hierarchy 
    public boolean isTop = false; // is this the top node of the hierarchy

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
        this.top = parent != null ? parent.top : null;
        this.parent = parent;
        this.level = parent != null ? parent.level + 1 : 1;
    }


    public void addChildren (List<HierarchyStructure> newChildren) {        
        // add the children to the top node map
        HierarchyStructure.addReferences (newChildren);
        // bulk add the nodes to the structure
        if (this.children != null) {
            this.children.addAll(newChildren);
        }
        else {
            this.children = newChildren;
        }
    }

    public static HierarchyStructure getHierarchyStructureById (String id) {        
        return mapIdHierarchyStructure.get(id);
    }

    /* Private Helper Methods */

    private static void addReferences (List<HierarchyStructure> listHierarchyStructure) {        
        for(HierarchyStructure hs : listHierarchyStructure ) {
            mapIdHierarchyStructure.put(hs.id, hs);
        }
    }

    private static String[] mapRetrievedValues (sObject s, HierarchyConfiguration.FieldConfiguration field) {
        Object o;

        // handle parent object fields 
        if (field.api.contains('.')) {
            // For now, assume we are only dealing with parent object, not higher
            List<String> lstAlpha = field.api.split('\\.'); // need to escape a fullstop to use it as a regular expression in split
            Map<String,Object> populatedFieldsAsMap = s.getPopulatedFieldsAsMap();

            Object parentObj = populatedFieldsAsMap.get(lstAlpha[0]);
            if (parentObj == null) {return new String[]{field.api, null};} // the lookup is null, therefore don't try to inspect the object, just exit

            String parentJson = JSON.serialize(parentObj);
            Map<String, Object> m = (Map<String, Object>) JSON.deserializeUntyped(parentJson);

            field.retrievedValue = (String) m.get(lstAlpha[1]);
            o = m.get(lstAlpha[1]);
        }
        else {
            o = s.get(field.api);
        }

        if (o != null) {
            // convert data types to strings
            if (field.fieldType == 'STRING' || field.fieldType == 'ID' || field.fieldType == 'REFERENCE' || field.fieldType == 'PICKLIST' || field.fieldType == 'EMAIL' || field.fieldType == 'PHONE' || field.fieldType == 'URL') {
                field.retrievedValue = o.toString();
            }
            if (field.fieldType == 'DATETIME' || field.fieldType == 'DATE' || field.fieldType == 'CURRENCY' || field.fieldType == 'INTEGER') {
                field.retrievedValue = String.valueOf(o);
            }
        }
        return new String[]{field.api,field.retrievedValue};
    }

    private static void mapKeyFields (sObject s, HierarchyConfiguration.FieldConfiguration fc, HierarchyStructure hs) {
        System.debug('mapKeyFields: ' + s);
        if (!fc.api.contains('.') && s.get(fc.api) != null) {
            if (fc.role == 'id') {
                hs.id = s.get(fc.api).toString();
            }
            if (fc.role == 'parentId') {
                hs.parentId = s.get(fc.api).toString();
            }
            if (fc.role == 'name') {
                hs.name = s.get(fc.api).toString();
            }
            if (fc.role == 'size') {
                if (hs.size == null) { // set the first size field to be the returned value
                    hs.size = (Decimal) s.get(fc.api);
                }
            }
        }
    }


    public static void processFieldsToStructure (sObject s, HierarchyStructure hs, List<HierarchyConfiguration.FieldConfiguration> listfc) {
        hs.fields = new List<HierarchyConfiguration.FieldConfiguration>();
        Map<String,String> mapAPIRetrievedValue = new Map<String,String>(); 
        Integer index = 0;
        Map<Integer,String> mapIndexAPI = new Map<Integer,String>(); 

        for (HierarchyConfiguration.FieldConfiguration fc : listfc) {
            

            HierarchyConfiguration.FieldConfiguration field = new HierarchyConfiguration.FieldConfiguration();

            field.api = fc.api;
            field.role = fc.role;
            field.display = fc.display;

            field.lookupIdField = fc.lookupIdField;
            field.orderByField = fc.orderByField;
            field.fieldType = fc.fieldType;

            // System.debug('field.role: ' + field.role);

            /* Set the key fields like id, size, name */
            mapKeyFields (s, fc, hs);

            /* Set the appropriate retrieved value field */
            String[] thisMapAPIRetrievedValue = mapRetrievedValues (s, field);
            mapAPIRetrievedValue.put(thisMapAPIRetrievedValue[0],thisMapAPIRetrievedValue[1]);

            hs.fields.add(field);

            if (fc.lookupIdField != null) {
                mapIndexAPI.put(index,fc.lookupIdField);
            }
            index++;
        }

        for (Integer lookupIndex : mapIndexAPI.keySet()) {
            String lookupAPI = mapIndexAPI.get(lookupIndex);
            String lookupId = mapAPIRetrievedValue.get(lookupAPI);
            hs.fields[lookupIndex].lookupId = lookupId;
        }

        hs.objectType = s.getSObjectType().getDescribe().getName();            
    }

}
