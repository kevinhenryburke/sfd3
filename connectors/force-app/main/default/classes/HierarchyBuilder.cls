public with sharing class HierarchyBuilder {
    public HierarchyBuilder() {

    }

    // this method initializes the first levels of the chart.
    public static HierarchyStructure retrieveStructureFlat (HierarchyConfiguration hc, List<ID> queryIds) {

        // to match hierarchy format, create a top level structure which does not hold elements and baseline queries to it.
        Integer thisLevel = 0;
        HierarchyStructure parent = new HierarchyStructure(null, thisLevel); // to signify parent element
        HierarchyQuery hq = new HierarchyQuery(hc, thisLevel);
        List<sObject> childObjects = hq.runQuery ( queryIds, true);
        List<HierarchyStructure> listNextLevelHS = createChildStructuresOneParent(hc, childObjects, parent, thisLevel); // this should map new level nodes to their parents

        return parent;
    }



    // this method initializes the first levels of the chart.
    public static HierarchyStructure retrieveStructureLevels (HierarchyConfiguration hc, List<ID> queryIds, Integer thisLevel ) {

        HierarchyStructure top;
        // get the top level structure and baseline queries to it.
        HierarchyQuery hq = new HierarchyQuery(hc, thisLevel);
        List<sObject> topObjects = hq.runQuery (queryIds, false);

        sObject s;
        HierarchyStructure parent; 
        if (topObjects.size() == 1) {
            s = topObjects[0];                        
            parent = new HierarchyStructure(s.id, thisLevel); // to signify parent element
            HierarchyStructure.processFieldsToStructure (s, parent, hq.oc.fields);
            top = parent;
        }
        else {
            // Case where more than one top node - **** not fully implemented ****
            boolean first = true;
            HierarchyStructure falseTop = new HierarchyStructure(null, -1); // to signify parent element
            top = falseTop;

            for (sObject sloop : topObjects) {
                if (first) {
                    s = sloop;
                    parent = new HierarchyStructure(s.id, thisLevel); // to signify parent element
                    HierarchyStructure.processFieldsToStructure (s, parent, hq.oc.fields);
                    falseTop.addChildren(new List<HierarchyStructure>{parent});
                    top = parent;
                    first = false;
                }
            }
        }

        //TODO I'm really not sure this is right, level 0 should be root node?

        for (thisLevel = 0; thisLevel < hc.initialLevelsToRetrieve; thisLevel++ ) {
            // we create the query for each level
            hq = new HierarchyQuery(hc, thisLevel);
            List<sObject> childObjects = hq.runQuery ( queryIds, true); // queryIds are parent ids
            List<HierarchyStructure> listNextLevelHS = createChildStructures(hc, childObjects, null, thisLevel); // this should map new level nodes to their parents
            queryIds = new List<Id>();

            Boolean lastRun = (hc.initialLevelsToRetrieve - thisLevel == 1) ? true : false;
            // make the next level ids the parents for the next iteration to get the level below this
           if (!lastRun) { // no point in update queryId list is no further queries are to be run.
                for (HierarchyStructure hs : listNextLevelHS) {
                    queryIds.add(hs.id);
                }
           }
        }
//TODO return list of parents
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
        HierarchyQuery hq = new HierarchyQuery(hc, thisLevel); 

        // We have the parentIds as input... listPotentialParentIds (some may not be parents but leaf nodes but we don't know till we query)
        List<sObject> childObjects = hq.runQuery ( listPotentialParentIds, true);

        // The raw query does not group children
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

            HierarchyStructure parent = new HierarchyStructure(parentId, hq.level); // to signify parent element
            parent.id = parentId;      

            createChildStructures(hc, siblings, null, hq.level + 1); // this should map new level nodes to their parents
            lisths.add(parent);
        }

        return lisths;

    }

    private static List<HierarchyStructure> createChildStructures (HierarchyConfiguration hc, List<sObject> childObjects, HierarchyStructure parent, Integer thisLevel) {

        HierarchyConfiguration.ObjectConfiguration oc = hc.getLevel(thisLevel);
        List<HierarchyStructure> childStructures = new List<HierarchyStructure>();

        String parentField = oc.getParentFieldApi();

        for (sObject s : childObjects) {
            id parentId;
            // we need to retrieve or create a parent structure so the front end knows where to place the new elenents
            HierarchyStructure hsParent;
            HierarchyStructure hs; 

            boolean hasParentFieldConfig = (parentField != null);
            boolean hasParentFieldStructure = false; // if there is a parent structure then we will map to it

            if (hasParentFieldConfig) {
                boolean hasParentFieldValue = (s.get(parentField) != null);
                if (hasParentFieldValue) {
                    parentId = s.get(parentField).toString();
                    hsParent = HierarchyStructure.getHierarchyStructureById(parentId);
                    hasParentFieldStructure = (hsParent != null);
                    if (hasParentFieldStructure) {
                        hs = new HierarchyStructure(hsParent); 
                    }
                }
            }

            if (!hasParentFieldStructure) { // if there's no parent structure deriveable then we use the input structure
                hsParent = parent;
                hs = new HierarchyStructure(null); 
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

    private static List<HierarchyStructure> createChildStructuresOneParent (HierarchyConfiguration hc, List<sObject> childObjects, HierarchyStructure parent, Integer thisLevel) {

        HierarchyConfiguration.ObjectConfiguration oc = hc.getLevel(thisLevel);
        List<HierarchyStructure> childStructures = new List<HierarchyStructure>();

        String parentField = oc.getParentFieldApi();

        for (sObject s : childObjects) {
            id parentId;
            // we need to retrieve or create a parent structure so the front end knows where to place the new elenents
            HierarchyStructure hsParent;
            HierarchyStructure hs; 

            hsParent = parent;
            hs = new HierarchyStructure(null); 

            HierarchyStructure.processFieldsToStructure (s, hs, oc.fields);
            hs.parent = hsParent;
            childStructures.add(hs);
        }

        parent.addChildren(childStructures);
        return childStructures;
    }




}
