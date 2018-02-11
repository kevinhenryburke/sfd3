public class DThree {
    @AuraEnabled
    public static String returnData() {
        List<StaticResource> docs;
//		docs = [select id, name, body from StaticResource where name = 'testdata']; 
		docs = [select id, name, body from StaticResource where name = 'NVAData']; 
        return docs[0].body.toString();
//		return D3Data.render();
    }
}