public with sharing class HierarchyQuery {

    // map between the JSON attributes expected in the Chart and the Salesforce field names.
    public Map<String,String> hm = new Map<String,String>();
    public String objectName;

    public HierarchyStructure top; // top node in the hierarchy 

    public HierarchyQuery(HierarchyStructure top) {
        //TODO need to pass in the field and object names dynamically of course via some configuration mechanism
        hm.put('id', 'id');
        hm.put('name', 'name');
        hm.put('size', 'AnnualRevenue');
        hm.put('parentId', 'parentId');
        objectName = 'Account';
        this.top = top;
    }

    public List<HierarchyStructure> mapSObject (Set<Id> ids) {
        String queryString = 'select ' 
            + hm.get('id') + ',' 
            + hm.get('parentId') + ',' 
            + hm.get('name') + ',' 
            + hm.get('size') + ' from '
            + objectName + ' where '
            + hm.get('parentId') + ' IN : ids' ;

        List<sObject> listso = Database.query(queryString);
        List<HierarchyStructure> lisths = new List<HierarchyStructure>();

        for (sObject s : listso) {
            id parentId = s.get(hm.get('parentId')).toString();
            HierarchyStructure hsParent = top.getHierarchyStructureById(parentId);
            HierarchyStructure hs = new HierarchyStructure(hsParent); 

            hs.id = s.get(hm.get('id')).toString();
            hs.name = s.get(hm.get('name')).toString();
            hs.size = (Decimal) s.get(hm.get('size'));
            hs.parent = hsParent;
            lisths.add(hs);
        }

        // TODO - this is not at all efficient - should group into common parents and add children that way
        for (HierarchyStructure hs : lisths) {
            List<HierarchyStructure> newChildren = new List<HierarchyStructure>{hs};
            System.debug(hs);
            hs.parent.addChildren(newChildren);
        }

        System.debug(lisths);

        return lisths;
    }

    public HierarchyStructure mapSObjectTop (Id id) {
        String queryString = 'select ' 
            + hm.get('id') + ',' 
            + hm.get('name') + ',' 
            + hm.get('size') + ' from '
            + objectName + ' where '
            + hm.get('id') + ' = \'' + id + '\'';

        System.debug(queryString);

        List<sObject> listso = Database.query(queryString);
        sObject s = listso[0];

        HierarchyStructure hs = new HierarchyStructure(id); // to signify top element
        hs.id = s.get(hm.get('id')).toString();
        hs.name = s.get(hm.get('name')).toString();
        hs.size = (Decimal) s.get(hm.get('size'));

        System.debug(hs);

        return hs;
    }


}
