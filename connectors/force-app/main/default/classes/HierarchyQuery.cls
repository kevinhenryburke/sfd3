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
        this.oc.setFieldTypes();
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


    public List<HierarchyStructure> createChildStructures (List<sObject> childObjects) {

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

            processFieldsToStructure (s, hs, oc.fields);

            hs.parent = hsParent;

            childStructures.add(hs);
        }

        System.debug('createChildStructures loop start:' + childStructures.size());

        // This is not at all efficient - should group into common parents and add children that way
        // currently is taking 0.06 seconds for 120 iterations - so 1700 per second. Good enough probably
        for (HierarchyStructure hs : childStructures) {
            List<HierarchyStructure> newChildren = new List<HierarchyStructure>{hs};
            hs.parent.addChildren(newChildren);
        }

        System.debug('createChildStructures loop end:' + childStructures.size());
        return childStructures;
    }


    public HierarchyStructure createTopStructure (Id id) {

        Set<ID> queryIds = new Set<Id>{id};
        String queryString = createQueryString (queryIds, false);

        List<sObject> listso = Database.query(queryString);
        sObject s = listso[0];

        HierarchyStructure hs = new HierarchyStructure(id, level); // to signify top element

        // using the full field configuration
        System.debug('oc.fields.length() ' + oc.fields.size());

        processFieldsToStructure (s, hs, oc.fields);

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
            List<HierarchyStructure> listNextLevelHS = hq.createChildStructures(siblings); // this should map new level nodes to their parents

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

    public static void mapRetrievedValues (sObject s, HierarchyConfiguration.FieldConfiguration field) {
        if (s.get(field.api) != null) {
            if (field.fieldType == 'STRING' || field.fieldType == 'ID' || field.fieldType == 'REFERENCE' || field.fieldType == 'PICKLIST') {
                field.retrievedValue = s.get(field.api).toString();
            }
            if (field.fieldType == 'DATETIME') {
                field.retrievedDatetime = (Datetime) s.get(field.api);
            }
            if (field.fieldType == 'CURRENCY') {
                field.retrievedCurrency = (Decimal) s.get(field.api);
            }
            if (field.fieldType == 'INTEGER') {
                field.retrievedInteger = (Integer) s.get(field.api);
            }
        }
    }

    public static void mapKeyFields (sObject s, HierarchyConfiguration.FieldConfiguration fc, HierarchyStructure hs) {
        if (s.get(fc.api) != null) {
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
                hs.size = (Decimal) s.get(fc.api);
            }
        }
    }


    public static void processFieldsToStructure (sObject s, HierarchyStructure hs, List<HierarchyConfiguration.FieldConfiguration> listfc) {
        hs.fields = new List<HierarchyConfiguration.FieldConfiguration>();

        for (HierarchyConfiguration.FieldConfiguration fc : listfc) {

            HierarchyConfiguration.FieldConfiguration field = new HierarchyConfiguration.FieldConfiguration();

            field.api = fc.api;
            field.role = fc.role;
            field.display = fc.display;
            field.orderByField = fc.orderByField;
            field.fieldType = fc.fieldType;

            System.debug('field.role: ' + field.role);

            /* Set the key fields like id, size, name */
            mapKeyFields (s, fc, hs);

            /* Set the appropriate retrieved value field */
            mapRetrievedValues (s, field);

            hs.fields.add(field);

        }
        hs.objectType = s.getSObjectType().getDescribe().getName();            

    }




}
