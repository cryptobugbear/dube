import createDynamoDBClient from "../db";
import InventoryService from "./inventoryService";
import OrganizationService from "./organizationService";

export const inventoryService = new InventoryService(createDynamoDBClient(), process.env.DYNAMODB_TABLE_ASSETS||"");
export const organizationService = new OrganizationService(createDynamoDBClient(), process.env.DYNAMODB_TABLE_ORGS||"");