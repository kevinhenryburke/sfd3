public with sharing class HierarchyBuilder {
    public HierarchyBuilder() {

    }

    // this method initializes the first levels of the chart.
    public static HierarchyJSON retrieveLevels (HierarchyConfiguration hc, ID rootId, Integer thisLevel ) {
        HierarchyStructure top = retrieveStructureLevels(hc, rootId, thisLevel);     
        HierarchyJSON hj = HierarchyJSON.mapHierarchyStructure (top);
        System.debug(LoggingLevel.ERROR,JSON.serializePretty(hj,true));
        return hj;
    }

    /* Tenerife 
    createAdoptedChildrenStructure methods are only used in one non-test scenario in DThree class and there is a note there
    that it's not the right way to do it and should use the same technique in returnHierarchyLevels as for returnHierarchyTop
    Recommend attempting to get rid of these methods completely.
    */

    // Adds new level to the chart
    public static List<HierarchyStructure> createAdoptedChildrenStructure (HierarchyConfiguration hc, List<ID> listPotentialParentIds, Integer thisLevel ) {
        HierarchyQuery hqChildren = new HierarchyQuery(null, hc, thisLevel); 

        // We have the parentIds as input... listPotentialParentIds (some may not be parents)
        Set<Id> potentialParentIds = new Set<Id>();
        for (ID id : listPotentialParentIds) {
            potentialParentIds.add(id);
        }

        // run the query against these ids
        List<sObject> childObjects = hqChildren.runQuery ( potentialParentIds, true);

        // group by parentId from the query output (some of the input potentialParentIds may not be parents) 

        Map<Id,List<sObject>> childMap = new Map<Id,List<sObject>>();  

        String parentField;

        for (HierarchyConfiguration.FieldConfiguration field : hqChildren.oc.fields) {
            if (field.role == 'parentId') {
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
        List<HierarchyStructure> lisths = new List<HierarchyStructure> ();

        for (Id parentId : childMap.keyset()) {
            List<sObject> siblings = childMap.get(parentId);

            HierarchyStructure top = new HierarchyStructure(parentId, hqChildren.level); // to signify top element
            top.id = parentId;      

            createChildStructures(siblings, top, hc.getLevel(hqChildren.level + 1)); // this should map new level nodes to their parents
            lisths.add(top);
        }

        return lisths;

    }




    // this method initializes the first levels of the chart.
    public static HierarchyStructure retrieveStructureLevels (HierarchyConfiguration hc, ID rootId, Integer thisLevel ) {

        // get the top level structure and baseline queries to it.
        HierarchyQuery hqTop = new HierarchyQuery(null, hc, thisLevel);

        Set<ID> queryIds = new Set<Id>{};
        if (rootId != null) {
            queryIds.add(rootId);
        }

        sObject s = hqTop.runQuery (queryIds, false)[0];
        HierarchyStructure top = new HierarchyStructure(rootId, thisLevel); // to signify top element
        HierarchyStructure.processFieldsToStructure (s, top, hqTop.oc.fields);

        // then work on the lower levels
        Set<ID> parentLevelIds = new Set<Id>{};
        if (rootId != null) { // the top node id
            parentLevelIds.add(rootId);
        }

        for (thisLevel = 0; thisLevel < hc.initialLevelsToRetrieve; thisLevel++ ) {
            // we create the query for each level
            HierarchyQuery hq = new HierarchyQuery(top, hc, thisLevel);
            List<sObject> childObjects = hq.runQuery ( parentLevelIds, true);

            List<HierarchyStructure> listNextLevelHS = createChildStructures(childObjects, top, hc.getLevel(thisLevel)); // this should map new level nodes to their parents
            parentLevelIds = new Set<Id>();
            for (HierarchyStructure hs : listNextLevelHS) {
                // make the next level ids the parents for the next iteration to get the level below this
                parentLevelIds.add(hs.id);
            }
        }

        return top;

    }

    private static List<HierarchyStructure> createChildStructures (List<sObject> childObjects, HierarchyStructure top, HierarchyConfiguration.ObjectConfiguration oc) {

        List<HierarchyStructure> childStructures = new List<HierarchyStructure>();

        for (sObject s : childObjects) {
            id parentId;
            HierarchyStructure hsParent;
            HierarchyStructure hs; 

            boolean hasParentField = false;

            for (HierarchyConfiguration.FieldConfiguration field : oc.fields) {
                if (field.role == 'parentId') {
                    hasParentField = true;
                    parentId = s.get(field.api).toString();
                    hsParent = top.getHierarchyStructureById(parentId);
                    hs = new HierarchyStructure(hsParent); 
                }
            }

            if (!hasParentField) {
                hsParent = top;
                hs = new HierarchyStructure(hsParent); 
            }

            HierarchyStructure.processFieldsToStructure (s, hs, oc.fields);
            hs.parent = hsParent;
            childStructures.add(hs);
        }

        // This is not at all efficient - should group into common parents and add children that way
        // currently is taking 0.06 seconds for 120 iterations - so 1700 per second. Good enough probably
        for (HierarchyStructure hs : childStructures) {
            List<HierarchyStructure> newChildren = new List<HierarchyStructure>{hs};
            hs.parent.addChildren(newChildren);
        }
        return childStructures;
    }




}
