import createDynamoDBClient from "../db";
import InventoryService from "./inventoryService";

const inventoryService = new InventoryService(createDynamoDBClient(), process.env.DYNAMODB_TABLE);

export default inventoryService;