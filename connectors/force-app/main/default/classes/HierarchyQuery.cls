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
            id parentId = s.get(oc.parentField).toString();
            // Concern for update - I've lost context with the top node - pass back and forth seems unperfomant
            // also we now have multiple "tops"
            HierarchyStructure hsParent = top.getHierarchyStructureById(parentId);
            HierarchyStructure hs = new HierarchyStructure(hsParent); 

            hs.id = s.get(oc.queryFields.get('id')).toString();
            hs.name = s.get(oc.queryFields.get('name')).toString();
            hs.size = (Decimal) s.get(oc.queryFields.get('size'));
            hs.objectType = s.getSObjectType().getDescribe().getName();
            hs.parent = hsParent;

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

    public HierarchyStructure createTopStructure (Id id) {
        String queryString = 'select ' 
            + String.join(oc.queryFields.values(),',') 
            + ' from '
            + oc.objectType + ' where '
            + oc.queryFields.get('id') + ' = \'' + String.escapeSingleQuotes(id) + '\'';

        List<sObject> listso = Database.query(queryString);
        sObject s = listso[0];

        HierarchyStructure hs = new HierarchyStructure(id, level); // to signify top element
        hs.id = s.get(oc.queryFields.get('id')).toString();
        hs.name = s.get(oc.queryFields.get('name')).toString();
        hs.size = (Decimal) s.get(oc.queryFields.get('size'));
        hs.objectType = s.getSObjectType().getDescribe().getName();

        return hs;
    }

    public List<sObject> runQuery (Set<Id> parentIds) {
        String queryString = 'select ' 
            + String.join(oc.queryFields.values(),',') + ','
            + oc.parentField 
            + ' from '
            + oc.objectType + ' where '
            + oc.parentField + ' IN : parentIds ' ; // escape single quotes should not be necessary as we are dealing with ids and not expsoing to front end

        if (oc.orderByField != null) {
            queryString += ' order by ' + oc.orderByField ;
        }    

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

        for (sObject s : childObjects) {
            id parentId = s.get(oc.parentField).toString();
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


}
