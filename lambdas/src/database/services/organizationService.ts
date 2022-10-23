import { DocumentClient } from "aws-sdk/clients/dynamodb";
import Organization from "../../models/Organization";

class OrganizationService {
  constructor(
    private readonly docClient: DocumentClient,
    private readonly tableName: string
  ) {}

  async getAllOrgs(): Promise<Organization[]> {
    const result = await this.docClient
      .scan({
        TableName: this.tableName,
      })
      .promise();

    return result.Items as Organization[];
  }

  async getOrganization(organizationId: string): Promise<Organization> {
    const result = await this.docClient
      .get({
        TableName: this.tableName,
        Key: { organizationId },
      })
      .promise();

    return result.Item as Organization;
  }

  async createOrganization(organization: Organization): Promise<Organization> {
    await this.docClient
      .put({
        TableName: this.tableName,
        Item: organization,
      })
      .promise();

    return organization;
  }

  async updateOrganization(organizationId: string, partialPost: Partial<Organization>): Promise<Organization> {
    const updated = await this.docClient
      .update({
        TableName: this.tableName,
        Key: { organizationId },
        UpdateExpression:
          "set #orgId = :orgId, name = :name",
        ExpressionAttributeNames: {
          "#image": "image",
        },
        ExpressionAttributeValues: {
          ":orgId": partialPost.orgId,
          ":name": partialPost.name,
          // ":location": partialPost.location,
        },
        ReturnValues: "ALL_NEW",
      })
      .promise();

    return updated.Attributes as Organization;
  }

  async deletePost(organizationId: string) {
    return this.docClient
      .delete({
        TableName: this.tableName,
        Key: { organizationId },
      })
      .promise();
  }
}

export default OrganizationService;