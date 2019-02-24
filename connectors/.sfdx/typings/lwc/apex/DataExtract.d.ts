declare module "@salesforce/apex/DataExtract.returnNetworkInitial" {
  export default function returnNetworkInitial(param: {queryJSON: any, recordId: any}): Promise<any>;
}
declare module "@salesforce/apex/DataExtract.returnNetworkUpdate" {
  export default function returnNetworkUpdate(param: {queryJSON: any, queryLevelIds: any, thisLevel: any}): Promise<any>;
}
declare module "@salesforce/apex/DataExtract.returnUnlinkedData" {
  export default function returnUnlinkedData(param: {queryJSON: any, recordId: any}): Promise<any>;
}
declare module "@salesforce/apex/DataExtract.returnHierarchyTop" {
  export default function returnHierarchyTop(param: {queryJSON: any, recordId: any}): Promise<any>;
}
declare module "@salesforce/apex/DataExtract.returnHierarchyLevels" {
  export default function returnHierarchyLevels(param: {queryJSON: any, queryLevelIds: any, queryLevel: any}): Promise<any>;
}
