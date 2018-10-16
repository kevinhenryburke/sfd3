public class DThree {

    @AuraEnabled
    public static String returnData(String queryJSON, String recordId) {
        List<StaticResource> docs;
		docs = [select id, name, body from StaticResource where name = 'NVAData']; 
        return docs[0].body.toString();
    }

    @AuraEnabled
    public static String returnDataUpdate(String queryJSON, List<Id> queryLevelIds, Integer thisLevel) {
        List<StaticResource> docs;
		docs = [select id, name, body from StaticResource where name = 'NVADataUpdate']; 
        return docs[0].body.toString();
    }

    @AuraEnabled
    public static String returnDataNodesOnly(String queryJSON, String recordId) {
        List<StaticResource> docs;
		docs = [select id, name, body from StaticResource where name = 'NVANodesOnly']; 
        return docs[0].body.toString();
    }

    // TODO TODO TODO - this version to be deprecated? as has no context but handy for now

    @AuraEnabled
    public static String returnDataPack(String queryJSON, String recordId) {
        if (recordId == null) {
            // TEMP - set a default for testing
            Account a = [select id from Account where name = 'Burke Enterprises' LIMIT 1];
            recordId = a.id;
        }

        HierarchyConfiguration hc = (HierarchyConfiguration)JSON.deserialize(queryJSON, HierarchyConfiguration.class);

        return returnDataPack(hc, recordId);

    }

    public static String returnDataPack(HierarchyConfiguration hc, Id rootId) {
        HierarchyJSON deserialized = HierarchyJSON.retrieveLevels (hc, rootId);
        return JSON.serialize(deserialized, true);
    }


    @AuraEnabled
    public static String returnDataPackUpdate(String queryJSON, List<Id> queryLevelIds, Integer queryLevel) {
        // TODO - use the same techniques as returnDataPack when done
        // TODO - really should be one method not too anyway

        HierarchyConfiguration hc = (HierarchyConfiguration)JSON.deserialize(queryJSON, HierarchyConfiguration.class);

        Integer intQueryLevel = Integer.valueOf(queryLevel);
        List<HierarchyJSON> listhj = HierarchyJSON.createAdoptedChildren (hc, queryLevelIds, intQueryLevel );
        return JSON.serialize(listhj, true);
    }

}