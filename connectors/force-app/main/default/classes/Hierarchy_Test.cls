@IsTest
public inherited sharing class Hierarchy_Test {

    /* Factories */

    public static String TOP_ID = '000000000000000001';
    public static String C1_ID = '000000000000000002';
    public static String C2_ID = '000000000000000003';

    public static HierarchyStructure factoryHS() {
        // create a top node with some attributes
        HierarchyStructure top = new HierarchyStructure(TOP_ID,0);
        top.name = 'Burke.com';
        top.size = 100;

        // create some child nodes
        HierarchyStructure c1 = new HierarchyStructure(top);
        c1.id = C1_ID;
        c1.name = 'Kevin.com';
        c1.size = 50;

        HierarchyStructure c2 = new HierarchyStructure(top);
        c2.id = C2_ID;
        c2.name = 'Henry.com';
        c2.size = 20;

        // add the child nodes to top
        List<HierarchyStructure> newChildren = new List<HierarchyStructure>();
        newChildren.add(c1);
        newChildren.add(c2);
        top.addChildren(newChildren);

        return top;
    }

    public static Account factoryAccount() {
        // build an account hierarchy of four levels
        // number of accounts at each level: 1,2,3,1

        // Level 0 - Child Depth 3
        Account a1 = new Account(name = 'Burke Enterprises', AnnualRevenue = 10000);
        insert a1;
        // Level 1 - Child Depth 2
        Account a2 = new Account(name = 'Small Company', AnnualRevenue = 1, parentid = a1.id);
        insert a2;
        // Level 2 - Child Depth 1
        Account a3 = new Account(name = 'Medium Company', AnnualRevenue = 10, parentid = a2.id);
        insert a3;
        Account a4 = new Account(name = 'Medium-Small Company', AnnualRevenue = 5, parentid = a2.id);
        insert a4;
        // Level 3 - Child Depth 0
        Account a5 = new Account(name = 'Smallish Company 1', AnnualRevenue = 3, parentid = a3.id);
        insert a5;
        Account a6 = new Account(name = 'Smallish Company 2', AnnualRevenue = 4, parentid = a4.id);
        insert a6;
        Account a7 = new Account(name = 'Smallish Company 3', AnnualRevenue = 5, parentid = a4.id);
        insert a7;

        return a1;
    }

    public static String factoryQueryJSON(boolean recursive) {

        String queryJSON = 
        '                {"objectType": "Account",'+
        '                "recursive": ' + recursive + ','+
        '                "fields": ['+
        '                    {'+
        '                         "api" : "AnnualRevenue", '+                                    
        '                         "role" : "size", '+
        '                         "display" : true,'+
        '                         "orderByField" : true '+                                   
        '                    },'+
        '                    {'+
        '                         "api" : "name",'+                                     
        '                         "role" : "name", '+
        '                         "display" : true   '+                                  
        '                     },'+
        '                     {'+
        '                         "api" : "id",'+                                     
        '                         "role" : "id", '+
        '                         "display" : true '+                                    
        '                    },                    '+
        '                    {'+
        '                         "api" : "parentId", '+                                    
        '                         "role" : "parentId", '+
        '                         "display" : true       '+                              
        '                    },                    '+
        '                    {'+
        '                         "api" : "AccountNumber", '+                                    
        '                         "role" : "none", '+
        '                         "display" : true   '+                                  
        '                    }  '+
        '                ]'+
        '            }]'+
        '        }';

        return queryJSON;
    }

    public static String factoryQueryJSONFlat(boolean recursive) {

        String queryJSON = 
        '         {  '+
        '           "whereClause":"parentid != null",'+
        '           "terminal":true,'+
        '                "recursive": ' + recursive + ','+
        '          "fields":[  '+
        '             {  '+
        '               "api":"NumberOfEmployees",'+
        '               "role":"size",'+
        '               "display":true,'+
        '               "measureName":"Employees",'+
        '               "sizeSchemeType":"Linear",'+
        '               "sizeChangesColor":true'+
        '             },'+
        '            {  '+
        '              "api":"name",'+
        '              "role":"name",'+
        '              "display":true'+
        '            },'+
        '            {  '+
        '              "api":"id",'+
        '              "role":"id",'+
        '              "display":false'+
        '            },'+
        '            {  '+
        '              "api":"parentId",'+
        '              "role":"parentId",'+
        '              "display":false'+
        '            }'+
        '          ],'+
        '          "objectType":"Account"'+
        '        }';

        return queryJSON;
    }

    public static HierarchyConfiguration factoryConfig(string baseJSON, Integer initialLevelsToRetrieve, boolean recursive) {
//        HierarchyConfiguration hc = new HierarchyConfiguration('Hierarchy');
        HierarchyConfiguration hc = new HierarchyConfiguration();
        hc.initialLevelsToRetrieve = initialLevelsToRetrieve;
        // Add an Account configuration

        String queryJSON;
        
        if (baseJSON == 'Hierarchy') {
            queryJSON = factoryQueryJSON(recursive);
        }
        if (baseJSON == 'Flat') {
            queryJSON = factoryQueryJSONFlat(recursive);
        }

        HierarchyConfiguration.ObjectConfiguration oc = (HierarchyConfiguration.ObjectConfiguration)JSON.deserialize(queryJSON, HierarchyConfiguration.ObjectConfiguration.class);
        hc.objectLevels.add(oc);
        return hc;        
    }

    /* TESTS */


    @IsTest
    public static void returnHierarchyTop_DerivedSOQL() {
        factoryAccount();
        HierarchyConfiguration hc = factoryConfig('Hierarchy',3, true);
        hc.topIdDeriveSOQL = 'select id from Account where name = \'Burke Enterprises\' LIMIT 1 ';

        String serialized = DataExtract.returnHierarchyTop(JSON.serialize(hc,true), null) ;

        JSON.deserialize(serialized, HierarchyJSON.class);
    }

    @IsTest
    public static void returnHierarchyTop_RelatedSOQL() {
        factoryAccount();
        Account a = [select id, name, Parent.id from Account where name = 'Small Company'];
        HierarchyConfiguration hc = factoryConfig('Hierarchy',3, true);

        ID passedId = a.id; 

        hc.rootIdRelatedSOQL = 'select Parent.id from Account where id = :recordId LIMIT 1 ';
        hc.relatedQueryObject = 'Parent';

        String serialized = DataExtract.returnHierarchyTop(JSON.serialize(hc,true), passedId) ;

        HierarchyJSON hj = (HierarchyJSON) JSON.deserialize(serialized, HierarchyJSON.class);
        System.assertEquals('Burke Enterprises',hj.name);
    }

    @IsTest
    public static void mapHierarchyStructure() {
        HierarchyStructure top = factoryHS();
        HierarchyJSON hj = HierarchyJSON.mapHierarchyStructure (top);
        System.debug(LoggingLevel.ERROR,JSON.serializePretty(hj,true));
        System.debug(LoggingLevel.ERROR,JSON.serialize(hj,true));
        System.assertEquals(2, hj.children.size());
    }
   
    @IsTest
    public static void getHierarchyStructureById() {
        HierarchyStructure top = factoryHS();
        HierarchyStructure hsFound = HierarchyStructure.getHierarchyStructureById(C1_ID);
        System.assertEquals(C1_ID, hsFound.id);
    }

    @IsTest
    public static void addChildById() {
        HierarchyStructure top = factoryHS();
        HierarchyStructure hsFound = HierarchyStructure.getHierarchyStructureById(C1_ID);

        // create some child nodes
        HierarchyStructure newChild = new HierarchyStructure(hsFound);
        newChild.id = '000000000000000004';
        newChild.name = 'Tom.com';
        newChild.size = 50;

        List<HierarchyStructure> newChildren = new List<HierarchyStructure>();
        newChildren.add(newChild);

        Test.startTest();
        hsFound.addChildren(newChildren);
        Test.stopTest();

        // retrieve the node we added and check the structure and above
        HierarchyStructure checkNew = HierarchyStructure.getHierarchyStructureById(newChild.id);
        HierarchyStructure checkNewParent = checkNew.parent;
        HierarchyStructure checkNewTop = checkNew.top;
         

        System.assertEquals(1, checkNewParent.children.size());
        System.assertEquals(newChild.id, checkNewParent.children[0].id);
        System.assertEquals(C1_ID, checkNewParent.id);

        // up to levels to the top
        System.assert(!checkNew.isTop);
        System.assert(!checkNewParent.isTop);
        System.assert(checkNewParent.parent.isTop);
        System.assert(checkNewTop.isTop);

        System.assertEquals(top.id, checkNew.top.id);
        System.assertEquals(top.id, checkNewParent.top.id);
    } 

    @IsTest
    public static void retrieveStructureLevels() {
        Account rootAccount = factoryAccount();

        HierarchyConfiguration hc = factoryConfig('Hierarchy',3, true);
        ID rootId = rootAccount.id;

        Integer thisLevel = 0;
        HierarchyStructure top = HierarchyBuilder.retrieveStructureLevels (hc, new List<Id>{rootId}, thisLevel);
        HierarchyJSON hj = HierarchyJSON.mapHierarchyStructure (top);

        System.assertEquals(3, hj.childDepth);            
        System.assertEquals('Account', hj.objectType);            
        
    }

    @IsTest
    public static void retrieveStructureFlat() {
        Account rootAccount = factoryAccount();

        HierarchyConfiguration hc = factoryConfig('Flat',1, false);
        ID rootId = rootAccount.id;

        Integer thisLevel = 0;
        HierarchyStructure top = HierarchyBuilder.retrieveStructureFlat (hc, new List<Id>{});
        HierarchyJSON hj = HierarchyJSON.mapHierarchyStructure (top);

        System.debug(LoggingLevel.ERROR,JSON.serializePretty(hj,false));

        System.assertEquals(6, hj.children.size());            
        System.assertEquals('Account', hj.children[0].objectType);            
        
    }


    @IsTest
    public static void getLevelRecursive() {
        HierarchyConfiguration hc = factoryConfig('Hierarchy',3, true);
        System.debug(LoggingLevel.ERROR,JSON.serializePretty(hc,false));
        System.assertEquals('Account',hc.getLevel(0).objectType); 
        System.assertEquals('Account',hc.getLevel(1).objectType); 
    }

    @IsTest
    public static void getLevelNonRecursive() {
        HierarchyConfiguration hc = factoryConfig('Hierarchy',3, true);
        hc.objectLevels[0].recursive = false;
        System.debug(LoggingLevel.ERROR,JSON.serializePretty(hc,false));
        System.assertEquals('Account',hc.getLevel(0).objectType); 
        System.assertEquals(null,hc.getLevel(1)); 
    }


    @IsTest
    public static void createAdoptedChildrenStructure() {

        HierarchyConfiguration hc = factoryConfig('Hierarchy',3, true);

        Account rootAccount = factoryAccount();
        ID rootId = rootAccount.id;

        // Pick two accounts to act as parents
        Account a3 = [select id, name, AnnualRevenue, parentid from Account where name = 'Medium Company' LIMIT 1];
        Account a4 = [select id, name, AnnualRevenue, parentid from Account where name = 'Medium-Small Company' LIMIT 1];

        List<ID> parentLevelIds = new List<Id>{a3.id, a4.id};
        Integer thisLevel = 2;

        List<HierarchyStructure> lisths = HierarchyBuilder.createAdoptedChildrenStructure (hc, parentLevelIds, thisLevel );
        List<HierarchyJSON> listhj = HierarchyJSON.convertTo(lisths);


        System.debug(LoggingLevel.ERROR,JSON.serializePretty(listhj,false));
        System.assertEquals(2,listhj.size()); 
        System.assertEquals(2,listhj[0].level); 
        System.assertEquals(3,listhj[0].children[0].level);         
    }
 
    @IsTest
    public static void getFieldType(){
        String stringType = HierarchyConfiguration.getFieldType('Account', 'name');
        System.assertEquals('STRING', stringType);
        String decimalType = HierarchyConfiguration.getFieldType('Account', 'AnnualRevenue');
        System.assertEquals('CURRENCY', decimalType);
        String integerType = HierarchyConfiguration.getFieldType('Account', 'NumberOfEmployees');
        System.assertEquals('INTEGER', integerType);
        String datetimeType = HierarchyConfiguration.getFieldType('Account', 'CreatedDate');
        System.assertEquals('DATETIME', datetimeType);        
    }

}
