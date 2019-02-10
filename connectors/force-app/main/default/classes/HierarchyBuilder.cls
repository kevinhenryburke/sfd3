public with sharing class HierarchyBuilder {
    public HierarchyBuilder() {

    }

    // this method initializes the first levels of the chart.
    public static HierarchyStructure retrieveStructureLevels (HierarchyConfiguration hc, ID rootId, Integer thisLevel ) {

        // get the top level structure and baseline queries to it.
        HierarchyQuery hqTop = new HierarchyQuery(null, hc, thisLevel);

        List<ID> queryIds = new List<Id>{rootId};

        sObject s = hqTop.runQuery (queryIds, false)[0];
        HierarchyStructure top = new HierarchyStructure(rootId, thisLevel); // to signify top element
        HierarchyStructure.processFieldsToStructure (s, top, hqTop.oc.fields);

        // then work on the lower levels
        List<ID> parentLevelIds = new List<Id>{rootId};

        for (thisLevel = 0; thisLevel < hc.initialLevelsToRetrieve; thisLevel++ ) {
            // we create the query for each level
            HierarchyQuery hq = new HierarchyQuery(top, hc, thisLevel);
            List<sObject> childObjects = hq.runQuery ( parentLevelIds, true);

            List<HierarchyStructure> listNextLevelHS = createChildStructures(hc, childObjects, top, thisLevel); // this should map new level nodes to their parents
            parentLevelIds = new List<Id>();
            for (HierarchyStructure hs : listNextLevelHS) {
                // make the next level ids the parents for the next iteration to get the level below this
                parentLevelIds.add(hs.id);
            }
        }

        return top;

    }



    /* Tenerife 
    createAdoptedChildrenStructure methods are only used in one non-test scenario in DThree class and there is a note there
    that it's not the right way to do it and should use the same technique in returnHierarchyUpdate as for returnHierarchyTop
    Recommend attempting to get rid of these methods completely.
    */

    // Adds new level to the chart
    // We have the parentIds as input... listPotentialParentIds (some may not be parents)
    public static List<HierarchyStructure> createAdoptedChildrenStructure (HierarchyConfiguration hc, List<ID> listPotentialParentIds, Integer thisLevel ) {
        HierarchyQuery hqChildren = new HierarchyQuery(null, hc, thisLevel); 

        // run the query against these ids
        List<sObject> childObjects = hqChildren.runQuery ( listPotentialParentIds, true);

        // group by parentId from the query output (some of the input listPotentialParentIds may not be parents) 

        Map<Id,List<sObject>> childMap = new Map<Id,List<sObject>>();  

        String parentField = hqChildren.oc.getParentFieldApi();

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

            createChildStructures(hc, siblings, top, hqChildren.level + 1); // this should map new level nodes to their parents
            lisths.add(top);
        }

        return lisths;

    }

    private static List<HierarchyStructure> createChildStructures (HierarchyConfiguration hc, List<sObject> childObjects, HierarchyStructure top, Integer thisLevel) {

        HierarchyConfiguration.ObjectConfiguration oc = hc.getLevel(thisLevel);

        List<HierarchyStructure> childStructures = new List<HierarchyStructure>();

        String parentField = oc.getParentFieldApi();
        boolean hasParentField = (parentField != null);

        for (sObject s : childObjects) {
            id parentId;
            HierarchyStructure hsParent;
            HierarchyStructure hs; 

            if (hasParentField) {
                parentId = s.get(parentField).toString();
                hsParent = top.getHierarchyStructureById(parentId);
                hs = new HierarchyStructure(hsParent); 
            }
            else {
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
