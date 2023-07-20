import { ReadStream } from 'node:fs';
import { AppType, Client, Domain } from '@larksuiteoapi/node-sdk';

export class Lark {
  #client: Client;

  constructor(appId: string, appSecret: string) {
    this.#client = new Client({
      appId,
      appSecret,
      appType: AppType.SelfBuild,
      domain: Domain.Feishu,
    });
  }

  async listRecords(appToken: string, tableId: string) {
    const response = await this.#client.bitable.appTableRecord.list({
      path: {
        app_token: appToken,
        table_id: tableId,
      },
      params: {
        page_size: 500,
      }
    });
    return response.data?.items ?? [];
  }

  async uploadBitableImage(appToken: string, file: ReadStream, size: number, fileName: string) {
    const response = await this.#client.drive.media.uploadAll({
      data: {
        file,
        parent_type: 'bitable_image',
        parent_node: appToken,
        file_name: fileName,
        size: size,
      }
    });
    return response?.file_token ?? '';
  }

  async getBitableField(appToken: string, tableId: string, fieldName: string) {
    const response = await this.#client.bitable.appTableField.list({
      path: {
        app_token: appToken,
        table_id: tableId,
      },
      params: {
        page_size: 500,
      }
    });
    return response.data?.items?.find(item => item.field_name === fieldName);
  }

  async updateBitableFieldOptions(appToken: string, tableId: string, fieldName: string, options: string[]) {
    const field = await this.getBitableField(appToken, tableId, fieldName);

    const newOptions = options.filter(option => {
      return !field?.property?.options?.find(item => item.name === option);
    });

    if (field && field.field_id && newOptions.length > 0) {
      await this.#client.bitable.appTableField.update({
        path: {
          app_token: appToken,
          table_id: tableId,
          field_id: field.field_id,
        },
        data: {
          field_name: field.field_name,
          type: field.type,
          property: {
            options: [
              ...field.property?.options ?? [],
              ...newOptions.map(option => ({ name: option })),
            ]
          }
        }
      });
    }
  }

  async createRecord(
    appToken: string,
    tableId: string,
    fields: { name: string, list: string, cover: string },
    data: { name: string, list: string, coverFile?: string }
  ) {
    const response = await this.#client.bitable.appTableRecord.create({
      path: {
        app_token: appToken,
        table_id: tableId,        
      },
      data: {
        fields: {
          [fields.name]: data.name,
          [fields.list]: data.list,
          [fields.cover]: data.coverFile ? [{
            file_token: data.coverFile,
          }] : [],
        }
      }
    });
    return response.data?.record;
  }
}