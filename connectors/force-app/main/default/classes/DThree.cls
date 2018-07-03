public class DThree {

    @AuraEnabled
    public static String returnData(String queryJSON) {
        List<StaticResource> docs;
		docs = [select id, name, body from StaticResource where name = 'NVAData']; 
        return docs[0].body.toString();
//		return D3Data.render();
    }

    @AuraEnabled
    public static String returnDataUpdate(String queryJSON) {
        List<StaticResource> docs;
		docs = [select id, name, body from StaticResource where name = 'NVADataUpdate']; 
        return docs[0].body.toString();
//		return D3Data.render();
    }

    @AuraEnabled
    public static String returnDataNodesOnly(String queryJSON) {
        List<StaticResource> docs;
		docs = [select id, name, body from StaticResource where name = 'NVANodesOnly']; 
        return docs[0].body.toString();
//		return D3Data.render();
    }

    // TODO TODO TODO - this version to be deprecated? as has no context but handy for now

    private static String returnDataPack() {
        // STATIC RESOURCE VERSION STILL HAS VALUE but eventually delete
        List<StaticResource> docs;
        String JSONString = [select id, name, body from StaticResource where name = 'NVAPack'].body.toString(); 
        HierarchyJSON deserialized =
        (HierarchyJSON)JSON.deserialize(JSONString, HierarchyJSON.class);
        return JSON.serialize(deserialized, true);
    }


    @AuraEnabled
    public static String returnDataPack(String queryJSON) {
        String whichVersion = 'StaticResource';
        if (whichVersion == 'Database') {
            // STATIC RESOURCE VERSION STILL HAS VALUE but eventually delete
            return returnDataPack();
        }

        Account a = [select id from Account where name = 'Burke Enterprises' LIMIT 1];
        Id rootId = a.id;

        HierarchyConfiguration hc = (HierarchyConfiguration)JSON.deserialize(queryJSON, HierarchyConfiguration.class);

        return returnDataPack(hc, rootId);

    }

    public static String returnDataPack(HierarchyConfiguration hc, Id rootId) {
        HierarchyJSON deserialized = HierarchyJSON.retrieveLevels (hc, rootId);
        return JSON.serialize(deserialized, true);
    }


    @AuraEnabled
    public static String returnDataPackUpdate(String queryJSON) {
        // TODO - use the same techniques as returnDataPack when done
        // TODO - really should be one method not too anyway
        List<StaticResource> docs;
		docs = [select id, name, body from StaticResource where name = 'NVAPackUpdate']; 
        return docs[0].body.toString();
//		return D3Data.render();
    }

}