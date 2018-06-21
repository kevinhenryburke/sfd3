@IsTest
public with sharing class Hierarchy_Test {

    public static String TOP_ID = '000000000000000001';
    public static String C1_ID = '000000000000000002';
    public static String C2_ID = '000000000000000003';

    public static HierarchyStructure factory() {
        // create a top node with some attributes
        HierarchyStructure top = new HierarchyStructure(null);
        top.id = TOP_ID;
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

    @IsTest
    public static void mapHierarchyStructure() {
        HierarchyStructure top = factory();
        HierarchyJSON hj = HierarchyJSON.mapHierarchyStructure (top);
        System.debug(LoggingLevel.ERROR,JSON.serializePretty(hj,true));
        System.debug(LoggingLevel.ERROR,JSON.serialize(hj,true));
        System.assertEquals(2, hj.children.size());
    }
   
    @IsTest
    public static void getHierarchyStructureById() {
        HierarchyStructure top = factory();
        HierarchyStructure hsFound = top.getHierarchyStructureById(C1_ID);
        System.assertEquals(C1_ID, hsFound.id);
    }

    @IsTest
    public static void addChildById() {
        HierarchyStructure top = factory();
        HierarchyStructure hsFound = top.getHierarchyStructureById(C1_ID);

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
        HierarchyStructure checkNew = top.getHierarchyStructureById(newChild.id);
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
    public static void deserializeDataPack() {
        String JSONString = DThree.returnDataPack();
        HierarchyJSON deserialized =
          (HierarchyJSON)JSON.deserialize(JSONString, HierarchyJSON.class);
    }


}
