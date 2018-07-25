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

            hs.id = s.get(oc.requiredFields.get('id')).toString();
            hs.name = s.get(oc.requiredFields.get('name')).toString();
            hs.size = (Decimal) s.get(oc.requiredFields.get('size'));
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

        // SELECT
        
        // temporary construct to bring together various lists of fields to create the select part of our query
        List<List<String>> listlist = new List<List<String>>{oc.requiredFields.values()};

        String otherFieldsString = '';
        if (oc.otherFields != null && oc.otherFields.size() > 0) {
            listlist.add(oc.otherFields);
        }

        if (queryParents)  {
            listlist.add(new List<String>{oc.parentField});
        } 

        List<String> selectFields = mergeDedupe (listlist); 

        String queryString = 'select ' 
            + String.join(selectFields,',');
        
        
        // WHERE
        queryString += ' from ' + oc.objectType + ' where ';

        if (queryParents)  {
            queryString += oc.parentField + ' IN : queryIds ' ; // escape single quotes should not be necessary as we are dealing with ids and not expsoing to front end; 
        } 
        else {
            queryString += oc.requiredFields.get('id') +  ' IN : queryIds ';
        }

        // ORDER BY
        if (oc.orderByField != null) {
            queryString += ' order by ' + oc.orderByField ;
        }

        return queryString;    


    }


    public HierarchyStructure createTopStructure (Id id) {

        Set<ID> queryIds = new Set<Id>{id};
        String queryString = createQueryString (queryIds, false);

        List<sObject> listso = Database.query(queryString);
        sObject s = listso[0];

        HierarchyStructure hs = new HierarchyStructure(id, level); // to signify top element
        hs.id = s.get(oc.requiredFields.get('id')).toString();
        hs.name = s.get(oc.requiredFields.get('name')).toString();
        hs.size = (Decimal) s.get(oc.requiredFields.get('size'));
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
