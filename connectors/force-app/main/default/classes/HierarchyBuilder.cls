public with sharing class HierarchyBuilder {
    public HierarchyBuilder() {

    }

    // this method initializes the first levels of the chart.
    public static HierarchyStructure retrieveStructureLevels (HierarchyConfiguration hc, List<ID> queryIds, Integer thisLevel ) {

        // get the top level structure and baseline queries to it.
        HierarchyQuery hq = new HierarchyQuery(null, hc, thisLevel);
        sObject s = hq.runQuery (queryIds, false)[0];

// REFACTOR DEVIATION.. first level
        ID rootId = queryIds[0];

        HierarchyStructure top = new HierarchyStructure(rootId, thisLevel); // to signify top element
        HierarchyStructure.processFieldsToStructure (s, top, hq.oc.fields);

        // then work on the lower levels


//TODO I'm really not sure this is right, level 0 should be root node?

        for (thisLevel = 0; thisLevel < hc.initialLevelsToRetrieve; thisLevel++ ) {
            // we create the query for each level
            hq = new HierarchyQuery(top, hc, thisLevel);
            List<sObject> childObjects = hq.runQuery ( queryIds, true);

            List<HierarchyStructure> listNextLevelHS = createChildStructures(hc, childObjects, top, thisLevel); // this should map new level nodes to their parents
            queryIds = new List<Id>();
            for (HierarchyStructure hs : listNextLevelHS) {
                // make the next level ids the parents for the next iteration to get the level below this
                queryIds.add(hs.id);
            }
        }

        return top;

    }



    /* Tenerife 
    createAdoptedChildrenStructure methods are only used in one non-test scenario in DThree class and there is a note there
    that it's not the right way to do it and should use the same technique in returnHierarchyUpdate as for returnHierarchyTop
    Recommend attempting to get rid of these methods completely.
    
    Key difference between the methods is that the initial method builds up a Structure
    This means that the structure is available when we go through the loop
    However the update one does not and has to reference ids that do not belong to a structure that it knows
    This get pinned to the correct parent in the front end


    */

    // Adds new level to the chart
    public static List<HierarchyStructure> createAdoptedChildrenStructure (HierarchyConfiguration hc, List<ID> listPotentialParentIds, Integer thisLevel ) {
        HierarchyQuery hq = new HierarchyQuery(null, hc, thisLevel); 

        // We have the parentIds as input... listPotentialParentIds (some may not be parents but leaf nodes but we don't know till we query)
        List<sObject> childObjects = hq.runQuery ( listPotentialParentIds, true);

        // The query does not group children
        // We group by parentId from the query output (some of the input listPotentialParentIds may not be parents) 

        Map<Id,List<sObject>> childMap = new Map<Id,List<sObject>>();  
        String parentField = hq.oc.getParentFieldApi();
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

        // create a list to hold a structure for each of these parents, it will be 1:1 with the childMap keyset
        List<HierarchyStructure> lisths = new List<HierarchyStructure> ();

        for (Id parentId : childMap.keyset()) {
            List<sObject> siblings = childMap.get(parentId);

            HierarchyStructure parent = new HierarchyStructure(parentId, hq.level); // to signify top element
            parent.id = parentId;      

            createChildStructures(hc, siblings, parent, hq.level + 1); // this should map new level nodes to their parents
            lisths.add(parent);
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
