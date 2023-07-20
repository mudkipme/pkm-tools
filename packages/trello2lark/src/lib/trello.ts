import { fetch } from 'undici';

export interface Card {
  id: string;
  name: string;
  idAttachmentCover: string | null;
  idList: string;
}

export interface Attachment {
  name: string;
  data: ArrayBuffer;
}

export class Trello {
  #apiKey: string;
  #apiToken: string;

  constructor(apiKey: string, apiToken: string) {
    this.#apiKey = apiKey;
    this.#apiToken = apiToken;
  }

  async allItems(boardId: string) {
    const response = await fetch(`https://api.trello.com/1/boards/${boardId}/cards?key=${this.#apiKey}&token=${this.#apiToken}`);

    const json = await response.json() as Card[];
    return json;
  }

  async allLists(boardId: string) {
    const response = await fetch(`https://api.trello.com/1/boards/${boardId}/lists?key=${this.#apiKey}&token=${this.#apiToken}`);

    const json = await response.json() as Card[];
    return json;
  }

  async getAttachment(cardId: string, attachmentId: string): Promise<Attachment> {
    const response = await fetch(`https://api.trello.com/1/cards/${cardId}/attachments/${attachmentId}?key=${this.#apiKey}&token=${this.#apiToken}`);

    const data = await response.json() as { url: string, fileName: string };
    const buffer = await (await fetch(data.url, {
      headers: {
        'Authorization': `OAuth oauth_consumer_key="${this.#apiKey}", oauth_token="${this.#apiToken}"`,
      },
    })).arrayBuffer();
    return { name: data.fileName, data: buffer };
  }
}