public class DThree {

    @AuraEnabled
    public static String returnData() {
        List<StaticResource> docs;
		docs = [select id, name, body from StaticResource where name = 'NVAData']; 
        return docs[0].body.toString();
//		return D3Data.render();
    }

    @AuraEnabled
    public static String returnDataUpdate() {
        List<StaticResource> docs;
		docs = [select id, name, body from StaticResource where name = 'NVADataUpdate']; 
        return docs[0].body.toString();
//		return D3Data.render();
    }

    @AuraEnabled
    public static String returnDataNodesOnly() {
        List<StaticResource> docs;
		docs = [select id, name, body from StaticResource where name = 'NVANodesOnly']; 
        return docs[0].body.toString();
//		return D3Data.render();
    }

    @AuraEnabled
    public static String returnDataPack() {
        // TODO - will be replaced by realtime data
        // remove the string phase and create the HierarchyJSON obejct from scratch

// STATIC RESOURCE VERSION STILL HAS VALUE - uncommnet to revert
// List<StaticResource> docs;
// String JSONString = [select id, name, body from StaticResource where name = 'NVAPack'].body.toString(); 

// HierarchyJSON deserialized =
//   (HierarchyJSON)JSON.deserialize(JSONString, HierarchyJSON.class);


        // TODO TODO TODO - change this obviously!!!!!!

        Account a = [select id from Account where name = 'Burke Enterprises' LIMIT 1];
        Id rootId = a.id;
        Integer intLevelsToRetrieve = 3;
        HierarchyJSON deserialized = HierarchyJSON.retrieveLevels (rootId, intLevelsToRetrieve );
  

        return JSON.serialize(deserialized, true);
    }


    @AuraEnabled
    public static String returnDataPackUpdate() {
        // TODO - use the same techniques as returnDataPack when done
        // TODO - really should be one method not too anyway
        List<StaticResource> docs;
		docs = [select id, name, body from StaticResource where name = 'NVAPackUpdate']; 
        return docs[0].body.toString();
//		return D3Data.render();
    }





/* Not Used */
    @AuraEnabled
    public static String returnConfig() {
        List<StaticResource> docs;
//		docs = [select id, name, body from StaticResource where name = 'testdata']; 
		docs = [select id, name, body from StaticResource where name = 'config']; 
        return docs[0].body.toString();
//		return D3Data.render();
    }

}