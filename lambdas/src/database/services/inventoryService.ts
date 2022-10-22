import { DocumentClient } from "aws-sdk/clients/dynamodb";
import Inventory from "../../models/Inventory";

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
          ":image": partialPost.image,
          ":name": partialPost.name,
          ":location": partialPost.location,
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