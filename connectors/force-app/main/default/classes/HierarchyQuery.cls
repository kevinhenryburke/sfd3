public inherited sharing class HierarchyQuery {

    // map between the JSON attributes expected in the Chart and the Salesforce field names.
    public HierarchyStructure top; // top node in the hierarchy 
    public HierarchyConfiguration.ObjectConfiguration oc;
    public HierarchyConfiguration hc;
    public Integer level;

    // To run and place an element in a query we need to relate the structure above it, the level it is at and configuration for the related object
    public HierarchyQuery(HierarchyStructure top, HierarchyConfiguration hc, Integer level) {
        this.top = top;
        this.level = level;
        this.hc = hc;
        this.oc = hc.getLevel(level); 
        this.oc.setFieldTypes();
    }

    private String createQueryString (Set<Id> queryIds, boolean queryParents) {

        List<String> selectFields = new List<String>();

        String orderByField;
        String parentField;
        String idField;

        for (HierarchyConfiguration.FieldConfiguration field : oc.fields) {
            selectFields.add(field.api);

            if (field.orderByField != null && field.orderByField == true ) {
                orderByField = field.api;
            }
            if (field.role == 'id') {
                idField = field.api;
            }
            if (field.role == 'parentId') {
                parentField = field.api;
            }
        }
        String queryString = 'select ' + String.join(selectFields,',') + ' from ' + oc.objectType;

        /* Build up where clause - id fields */
        boolean firstClauseIsSet = false;
        if (queryIds != null && queryIds.size() > 0) {
            String idFieldAPI = queryParents ? parentField : idField;
            queryString += ' where ' + idFieldAPI + ' IN : queryIds ' ; // escape single quotes should not be necessary as we are dealing with ids and not expsoing to front end; 
            firstClauseIsSet = true;
        }

        /* Build up where clause - where clause fields */
        if (oc.whereClause != null) {
            queryString += (firstClauseIsSet ? ' and ' : ' where '); 
            queryString += oc.whereClause ; 
            firstClauseIsSet = true;
        }

        /* Order by */
        if (orderByField != null) {
            queryString += ' order by ' + orderByField ;
        }
        System.debug('createQueryString ' + queryString);
        return queryString;
    }

    public List<sObject> runQuery (Set<Id> queryIds, boolean queryParents) {
        String queryString = createQueryString (queryIds, queryParents);
        List<sObject> listso = Database.query(queryString);
        return listso;
    }
    
}
