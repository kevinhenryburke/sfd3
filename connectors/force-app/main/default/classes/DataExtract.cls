public inherited sharing class DataExtract {

    // Network Methods - from Static Resources

    @AuraEnabled
    public static String returnNetworkInitial(String queryJSON, String recordId) {
        List<StaticResource> docs;
		docs = [select id, name, body from StaticResource where name = 'NVAData']; 
        return docs[0].body.toString();
    }

    @AuraEnabled
    public static String returnNetworkUpdate(String queryJSON, List<Id> queryLevelIds, Integer thisLevel) {
        List<StaticResource> docs;
		docs = [select id, name, body from StaticResource where name = 'NVADataUpdate']; 
        return docs[0].body.toString();
    }

    @AuraEnabled
    public static String returnUnlinkedData(String queryJSON, String recordId) {
        List<StaticResource> docs;
		docs = [select id, name, body from StaticResource where name = 'NVANodesOnly']; 
        return docs[0].body.toString();
    }

    /* Flat Structure Methods - full implementation */

    @AuraEnabled
    /* arguments are split into configuration and into context */
    public static String returnHierarchyFlat(String queryJSON, String recordId) {
        HierarchyConfiguration hc = (HierarchyConfiguration)JSON.deserialize(queryJSON, HierarchyConfiguration.class);
        return returnHierarchyFlat(hc, recordId);
    }

    public static String returnHierarchyFlat(HierarchyConfiguration hc, Id recordId) {
        // topId is the highest point of the chart to be rendered
        // It may be recordId but is may also be higher up under conditions below
        // we may also have no top element, for example if a where clause is used instead
        List<Id> topIDs = getTopIds(hc, recordId);

        HierarchyStructure top = HierarchyBuilder.retrieveStructureFlat (hc, topIDs);
        HierarchyJSON deserialized = HierarchyJSON.mapHierarchyStructure (top);
        deserialized.initialHighlightId = recordId;
        return JSON.serialize(deserialized, true);
    }

    /* Hierarchy Methods - full implementation */

    @AuraEnabled
    /* arguments are split into configuration and into context */
    public static String returnHierarchyTop(String queryJSON, String recordId) {
        HierarchyConfiguration hc = (HierarchyConfiguration)JSON.deserialize(queryJSON, HierarchyConfiguration.class);
        return returnHierarchyTop(hc, recordId);
    }

    public static String returnHierarchyTop(HierarchyConfiguration hc, Id recordId) {
        // topId is the highest point of the chart to be rendered
        // It may be recordId but is may also be higher up under conditions below
        // we may also have no top element, for example if a where clause is used instead

        List<Id> topIDs = getTopIds(hc, recordId);

        Integer thisLevel = 0;
        HierarchyStructure top = HierarchyBuilder.retrieveStructureLevels (hc, topIDs, thisLevel);
        HierarchyJSON deserialized = HierarchyJSON.mapHierarchyStructure (top);
        deserialized.initialHighlightId = recordId;
        return JSON.serialize(deserialized, true);
    }



    @AuraEnabled
    public static String returnHierarchyUpdate(String queryJSON, List<Id> queryLevelIds, Integer queryLevel) {
        // TODO - use the same techniques as returnHierarchyTop when done
        // TODO - really should be one method not too anyway

        HierarchyConfiguration hc = (HierarchyConfiguration)JSON.deserialize(queryJSON, HierarchyConfiguration.class);

        Integer intQueryLevel = Integer.valueOf(queryLevel);

        List<HierarchyStructure> lisths = HierarchyBuilder.createAdoptedChildrenStructure (hc, queryLevelIds, intQueryLevel );
        List<HierarchyJSON> listhj = HierarchyJSON.convertTo(lisths);

        return JSON.serialize(listhj, true);
    }

    /* PRIVATE METHODS */


    private static List<Id> getTopIds(HierarchyConfiguration hc, Id recordId) {
        List<Id> topIDs = new List<Id>();

        Id topId = recordId;
        if (recordId == null) {
            if (hc.topIdDeriveSOQL != null) {
                List<sObject> lists = Database.query(hc.topIdDeriveSOQL);
                for (sObject s : lists) {
                    topIDs.add( (ID) s.get('id'));
                }
            }
            // otherwise we are using only the whereClause to define context and topId is null
        }
        if (recordId != null && hc.rootIdRelatedSOQL != null) {
            sObject s = Database.query(hc.rootIdRelatedSOQL);
            sObject p = s.getSObject(hc.relatedQueryObject);
            if (p != null) {
                topId = (ID) p.get('id'); 
                topIDs.add(topId);
            }
            else {
                topIDs.add(recordId);
            }
        }

        return topIDs;
    }



}
