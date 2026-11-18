import mondaySdk from "monday-sdk-js";
import { SeamlessApiClient } from "@mondaydotcomorg/api";

export const monday = mondaySdk();
export const mondayApi = new SeamlessApiClient();
export const BOARD_ID = "18439913883"

export async function testViewBoard() {
  const query = `query { boards (ids: [${BOARD_ID}]) {name state permissions items_page {items {id name}}}}`
  const response = await mondayApi.request(query);
  console.log(response)
}
