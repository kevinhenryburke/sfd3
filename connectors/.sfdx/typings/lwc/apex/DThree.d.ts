declare module "@apex/DThree.returnData" {
  export function returnData(param: {queryJSON: any}): Promise<any>;
}
declare module "@apex/DThree.returnDataUpdate" {
  export function returnDataUpdate(param: {queryJSON: any, queryLevelIds: any, thisLevel: any}): Promise<any>;
}
declare module "@apex/DThree.returnDataNodesOnly" {
  export function returnDataNodesOnly(param: {queryJSON: any}): Promise<any>;
}
declare module "@apex/DThree.returnDataPack" {
  export function returnDataPack(param: {queryJSON: any}): Promise<any>;
}
declare module "@apex/DThree.returnDataPackUpdate" {
  export function returnDataPackUpdate(param: {queryJSON: any, queryLevelIds: any, queryLevel: any}): Promise<any>;
}
