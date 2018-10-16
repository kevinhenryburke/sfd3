declare module "@salesforce/apex/DThree.returnNetworkInitial" {
  export default function returnNetworkInitial(param: {queryJSON: any, recordId: any}): Promise<any>;
}
declare module "@salesforce/apex/DThree.returnNetworkUpdate" {
  export default function returnNetworkUpdate(param: {queryJSON: any, queryLevelIds: any, thisLevel: any}): Promise<any>;
}
declare module "@salesforce/apex/DThree.returnUnlinkedData" {
  export default function returnUnlinkedData(param: {queryJSON: any, recordId: any}): Promise<any>;
}
declare module "@salesforce/apex/DThree.returnHierarchyTop" {
  export default function returnHierarchyTop(param: {queryJSON: any, recordId: any}): Promise<any>;
}
declare module "@salesforce/apex/DThree.returnHierarchyLevels" {
  export default function returnHierarchyLevels(param: {queryJSON: any, queryLevelIds: any, queryLevel: any}): Promise<any>;
}
