public with sharing class DataExtract {

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

    // Hierarchy Methods - full implementation

    @AuraEnabled
    public static String returnHierarchyTop(String queryJSON, String recordId) {
        HierarchyConfiguration hc = (HierarchyConfiguration)JSON.deserialize(queryJSON, HierarchyConfiguration.class);
        return returnHierarchyTop(hc, recordId);
    }

    public static String returnHierarchyTop(HierarchyConfiguration hc, Id rootId) {
        if (rootId == null) {
            sObject s = Database.query(hc.topIdDeriveSOQL);
            rootId = (ID) s.get('id');
        }
        HierarchyJSON deserialized = HierarchyJSON.retrieveLevels (hc, rootId);
        return JSON.serialize(deserialized, true);
    }


    @AuraEnabled
    public static String returnHierarchyLevels(String queryJSON, List<Id> queryLevelIds, Integer queryLevel) {
        // TODO - use the same techniques as returnHierarchyTop when done
        // TODO - really should be one method not too anyway

        HierarchyConfiguration hc = (HierarchyConfiguration)JSON.deserialize(queryJSON, HierarchyConfiguration.class);

        Integer intQueryLevel = Integer.valueOf(queryLevel);
        List<HierarchyJSON> listhj = HierarchyJSON.createAdoptedChildren (hc, queryLevelIds, intQueryLevel );
        return JSON.serialize(listhj, true);
    }

}