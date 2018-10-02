public with sharing class HierarchyQuery {

    // map between the JSON attributes expected in the Chart and the Salesforce field names.
    public HierarchyStructure top; // top node in the hierarchy 
    public HierarchyConfiguration.ObjectConfiguration oc;
    public HierarchyConfiguration hc;
    public Integer level;

    public HierarchyQuery(HierarchyStructure top, HierarchyConfiguration hc, Integer level) {
        this.top = top;
        this.level = level;
        this.hc = hc;
        this.oc = hc.getLevel(level); 
    }


    public List<HierarchyStructure> addChildStructures (List<sObject> childObjects) {

        List<HierarchyStructure> childStructures = new List<HierarchyStructure>();

        for (sObject s : childObjects) {
            id parentId;
            HierarchyStructure hsParent;
            HierarchyStructure hs; 

            for (HierarchyConfiguration.FieldConfiguration field : oc.fields) {
                if (field.role == 'parentId') {
                    System.debug('it is a parentId field');
                    parentId = s.get(field.api).toString();
                    hsParent = top.getHierarchyStructureById(parentId);
                    hs = new HierarchyStructure(hsParent); 
                }
            }

            // using the full field configuration
            System.debug('oc.fields.length() ' + oc.fields.size());

            for (HierarchyConfiguration.FieldConfiguration field : oc.fields) {
                if (field.role == 'id') {
                    System.debug('it is an id field');
                    hs.id = s.get(field.api).toString();
                    System.debug('it is an id value: ' + hs.id);
                }
                if (field.role == 'name') {
                    System.debug('it is a name field');
                    hs.name = s.get(field.api).toString();

                }
                if (field.role == 'size') {
                    System.debug('it is a size field');
                    hs.size = (Decimal) s.get(field.api);

                }
                System.debug(field);
            }

            hs.objectType = s.getSObjectType().getDescribe().getName();            
            hs.parent = hsParent;

            if (oc.otherFields != null) {
                hs.otherFields = new Map<String,String>();
                for (String sof : oc.otherFields) {
                    hs.otherFields.put(sof, s.get(sof).toString());
                }
            }

            childStructures.add(hs);
        }

        System.debug('addChildStructures loop start:' + childStructures.size());

        // This is not at all efficient - should group into common parents and add children that way
        // currently is taking 0.06 seconds for 120 iterations - so 1700 per second. Good enough probably
        for (HierarchyStructure hs : childStructures) {
            List<HierarchyStructure> newChildren = new List<HierarchyStructure>{hs};
            hs.parent.addChildren(newChildren);
        }

        System.debug('addChildStructures loop end:' + childStructures.size());
        return childStructures;
    }

    public String createQueryString (Set<Id> queryIds, boolean queryParents) {

        // using the full field configuration
        System.debug('createQueryString ' + oc.fields.size());
        List<String> selectFields = new List<String>();

        String orderByField;
        String parentField;
        String idField;

        for (HierarchyConfiguration.FieldConfiguration field : oc.fields) {
            selectFields.add(field.api);

            if (field.orderByField != null && field.orderByField == true ) {
                System.debug('it is an ordorderByField er field');
                orderByField = field.api;
            }
            if (field.role == 'id') {
                idField = field.api;
            }
            if (field.role == 'parentId') {
                parentField = field.api;
            }
        }
        String queryString = 'select ' + String.join(selectFields,',');                
        System.debug('createQueryString ' + queryString);
        queryString += ' from ' + oc.objectType;

        if (queryParents)  {
            queryString += ' where ' + parentField + ' IN : queryIds ' ; // escape single quotes should not be necessary as we are dealing with ids and not expsoing to front end; 
        } 
        else {
            queryString += ' where ' + idField +  ' IN : queryIds ';
        }

        if (orderByField != null) {
            queryString += ' order by ' + orderByField ;

        }
        System.debug('createQueryString ' + queryString);
        return queryString;


    }


    public HierarchyStructure createTopStructure (Id id) {

        Set<ID> queryIds = new Set<Id>{id};
        String queryString = createQueryString (queryIds, false);

        List<sObject> listso = Database.query(queryString);
        sObject s = listso[0];

        HierarchyStructure hs = new HierarchyStructure(id, level); // to signify top element

        // using the full field configuration
        System.debug('oc.fields.length() ' + oc.fields.size());

        for (HierarchyConfiguration.FieldConfiguration field : oc.fields) {
            if (field.role == 'id') {
                System.debug('it is an id field');
                hs.id = s.get(field.api).toString();
                System.debug('it is an id value: ' + hs.id);
            }
            if (field.role == 'name') {
                System.debug('it is a name field');
                hs.name = s.get(field.api).toString();

            }
            if (field.role == 'size') {
                System.debug('it is a size field');
                hs.size = (Decimal) s.get(field.api);

            }
            System.debug(field);
        }

        hs.objectType = s.getSObjectType().getDescribe().getName();

        if (oc.otherFields != null) {
            hs.otherFields = new Map<String,String>();
            for (String sof : oc.otherFields) {
                hs.otherFields.put(sof, s.get(sof).toString());
            }
        }

        return hs;
    }

    public List<sObject> runQuery (Set<Id> queryIds) {

        String queryString = createQueryString (queryIds, true);

        List<sObject> listso = Database.query(queryString);
        return listso;
    }

    /* we may children to a lightweight parent before pushing it to the main chart */

    public List<HierarchyStructure> adoptChildren (Set<ID> potentialParentIds) {

        // We have the parentIds as input... potentialParentIds (some may not be parents)
        // run the query against these ids
        List<sObject> childObjects = runQuery ( potentialParentIds);

        // group by parentId from the query output (some of the input potentialParentIds may not be parents) 

        Map<Id,List<sObject>> childMap = new Map<Id,List<sObject>>();  

        String parentField;

        for (HierarchyConfiguration.FieldConfiguration field : oc.fields) {
            if (field.role == 'parentId') {
                System.debug('it is a parentId field');
                parentField = field.api;
                break;
            }
        }

        for (sObject s : childObjects) {
            id parentId = s.get(parentField).toString();
            if (childMap.keyset().contains(parentId)) {
                List<sObject> siblings = childMap.get(parentId);
                siblings.add(s);
            } 
            else {
                childMap.put(parentId, new List<sObject>{s});
            }
        }

        // create a list to hold a structure for each of these parents, it will be 1:1
        List<HierarchyStructure> topStructures = new List<HierarchyStructure> ();

        for (Id parentId : childMap.keyset()) {

            List<sObject> siblings = childMap.get(parentId);

            HierarchyQuery hqTop = new HierarchyQuery(null, hc, level);

            HierarchyStructure top = new HierarchyStructure(parentId, level); // to signify top element
            top.id = parentId;      

            HierarchyQuery hq = new HierarchyQuery(top, hc, level + 1);
            List<HierarchyStructure> listNextLevelHS = hq.addChildStructures(siblings); // this should map new level nodes to their parents

            HierarchyJSON hj = HierarchyJSON.mapHierarchyStructure (top);

            topStructures.add(top);
        }

        return topStructures;
    }

    public static List<String> mergeDedupe (List<List<String>> listlist) {
        List<String> retList = new List<String>();
        Set<String> setter = new Set<String>();

        for (List<String> oneList : listlist) {
            setter.addAll(oneList);
        }
        
        retList.addAll(setter);
        return retList;

    }


}
