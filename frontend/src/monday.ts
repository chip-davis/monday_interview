import mondaySdk from "monday-sdk-js";
import { SeamlessApiClient } from "@mondaydotcomorg/api";

export const monday = mondaySdk();
export const mondayApi = new SeamlessApiClient();
export const BOARD_ID = "18439913883";

const COLUMNS = {
  firstName: "text",
  lastName: "text6",
  quantity: "numbers",
  inscription: "text5",
  status: "status",
  receivedDate: "date_1",
  scentProfiles: "dropdown",
  candle1: "text_mm97101q",
  candle2: "text_mm9760em",
  candle3: "text_mm97r059",
};

export type NewOrder = {
  firstName: string;
  lastName: string;
  quantity: number;
  candles: { name: string; category: string }[];
  inscription: string;
};

const CREATE_ITEM = `
    mutation CreateOrder($boardId: ID!, $name: String!, $columns: JSON!) {
      create_item(
        board_id: $boardId
        group_id: "topics"
        item_name: $name
        column_values: $columns
        create_labels_if_missing: true
      ) {
        id
      }
    }
  `;

export async function createOrder(order: NewOrder) {
  const today = new Date().toISOString().slice(0, 10);
  const categories = [...new Set(order.candles.map((c) => c.category))];

  const columns = {
    [COLUMNS.firstName]: order.firstName.trim(),
    [COLUMNS.lastName]: order.lastName.trim(),
    [COLUMNS.quantity]: String(order.quantity),
    [COLUMNS.inscription]: order.inscription.trim(),
    [COLUMNS.status]: { label: "New Order" },
    [COLUMNS.receivedDate]: { date: today },
    [COLUMNS.scentProfiles]: { labels: categories },
    [COLUMNS.candle1]: order.candles[0].name,
    [COLUMNS.candle2]: order.candles[1].name,
    [COLUMNS.candle3]: order.candles[2].name,
  };

  const res = await mondayApi.request<{
    data: { data: { create_item: { id: string } } };
  }>(CREATE_ITEM, {
    boardId: BOARD_ID,
    name: `${order.firstName.trim()} ${order.lastName.trim()}`,
    columns: JSON.stringify(columns),
  });

  return res.data.data.create_item.id;
}
