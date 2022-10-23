import { DocumentClient } from "aws-sdk/clients/dynamodb";
import Inventory from "../../models/Inventory";
import WorkOrder from "../../models/WorkOrder";

class InventoryService {
  constructor(
    private readonly docClient: DocumentClient,
    private readonly tableName: string
  ) {}

  async getAllInventorys(): Promise<Inventory[]> {
    const result = await this.docClient
      .scan({
        TableName: this.tableName,
      })
      .promise();

    return result.Items as Inventory[];
  }

  async getInventory(inventoryId: string): Promise<Inventory> {
    const result = await this.docClient
      .get({
        TableName: this.tableName,
        Key: { inventoryId },
      })
      .promise();

    return result.Item as Inventory;
  }

  async createInventory(inventory: Inventory): Promise<Inventory> {
    await this.docClient
      .put({
        TableName: this.tableName,
        Item: inventory,
      })
      .promise();

    return inventory;
  }

  async updateInventory(inventoryId: string, partialPost: Partial<Inventory>): Promise<Inventory> {
    const updated = await this.docClient
      .update({
        TableName: this.tableName,
        Key: { inventoryId },
        UpdateExpression:
          "set #image = :image, name = :name, location = :location",
        ExpressionAttributeNames: {
          "#image": "image",
        },
        ExpressionAttributeValues: {
          ":image": partialPost.imageS3,
          ":name": partialPost.name,
          ":location": partialPost.location,
          ":workorder": partialPost.workOrders,
        },
        ReturnValues: "ALL_NEW",
      })
      .promise();

    return updated.Attributes as Inventory;
  }

  async createWorkOrder(inventoryId: string, partialPost: Partial<WorkOrder>): Promise<Inventory> {
    const updated = await this.docClient
      .update({
        TableName: this.tableName,
        Key: { inventoryId },
        UpdateExpression:
          "set #workOrders = list_append(if_not_exists(#workOrders, :empty_list), :partialPost)",
        ExpressionAttributeNames: {
          "#workOrders": "workOrders",
        },
        ExpressionAttributeValues: {
          ":workOrders": [partialPost],
          ":empty_list": []
        },
        ReturnValues: "ALL_NEW",
      })
      .promise();

    return updated.Attributes as Inventory;
  }

  async deletePost(inventoryId: string) {
    return this.docClient
      .delete({
        TableName: this.tableName,
        Key: { inventoryId },
      })
      .promise();
  }
}

export default InventoryService;