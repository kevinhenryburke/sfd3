public with sharing class HierarchyQuery {

    // map between the JSON attributes expected in the Chart and the Salesforce field names.
    public HierarchyStructure top; // top node in the hierarchy 
    public HierarchyConfiguration.ObjectConfiguration oc;

    public HierarchyQuery(HierarchyStructure top, HierarchyConfiguration.ObjectConfiguration oc) {
        this.oc = oc; 
        this.top = top;
    }

    public List<HierarchyStructure> mapSObject (Set<Id> ids) {
        String queryString = 'select ' 
            + String.join(oc.queryFields.values(),',') + ','
            + oc.parentField 
            + ' from '
            + oc.objectType + ' where '
            + oc.parentField + ' IN : ids' ; // escape single quotes should not be necessary as we are dealing with ids and not expsoing to front end

        List<sObject> listso = Database.query(queryString);
        List<HierarchyStructure> lisths = new List<HierarchyStructure>();

        for (sObject s : listso) {
            id parentId = s.get(oc.parentField).toString();
            HierarchyStructure hsParent = top.getHierarchyStructureById(parentId);
            HierarchyStructure hs = new HierarchyStructure(hsParent); 

            hs.id = s.get(oc.queryFields.get('id')).toString();
            hs.name = s.get(oc.queryFields.get('name')).toString();
            hs.size = (Decimal) s.get(oc.queryFields.get('size'));
            hs.parent = hsParent;
            hs.objectType = s.getSObjectType().getDescribe().getName();

            lisths.add(hs);
        }

        System.debug('mapSObject loop start:' + lisths.size());

        // This is not at all efficient - should group into common parents and add children that way
        // currently is taking 0.06 seconds for 120 iterations - so 1700 per second. Good enough probably
        for (HierarchyStructure hs : lisths) {
            List<HierarchyStructure> newChildren = new List<HierarchyStructure>{hs};
            hs.parent.addChildren(newChildren);
        }

        System.debug('mapSObject loop end:' + lisths.size());
        return lisths;
    }

    public HierarchyStructure mapSObjectTop (Id id) {
        String queryString = 'select ' 
            + String.join(oc.queryFields.values(),',') 
            + ' from '
            + oc.objectType + ' where '
            + oc.queryFields.get('id') + ' = \'' + String.escapeSingleQuotes(id) + '\'';

        List<sObject> listso = Database.query(queryString);
        sObject s = listso[0];

        HierarchyStructure hs = new HierarchyStructure(id); // to signify top element
        hs.id = s.get(oc.queryFields.get('id')).toString();
        hs.name = s.get(oc.queryFields.get('name')).toString();
        hs.size = (Decimal) s.get(oc.queryFields.get('size'));
        hs.objectType = s.getSObjectType().getDescribe().getName();

        return hs;
    }


}
