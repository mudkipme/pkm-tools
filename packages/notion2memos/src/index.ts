import { Client } from '@notionhq/client';
import type { DatePropertyItemObjectResponse, PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { NotionToMarkdown } from 'notion-to-md';
import { fetch } from 'undici';
import dayjs from 'dayjs';
import config from './config';

async function postToMemos(content: string, date?: string) {
  const resp = await fetch(config.get('memosApi'), {
    method: 'POST',
    body: JSON.stringify({
      content,
    }),
  });

  const data = await resp.json() as any;
  const id = data.data.id;

  if (date) {
    const url = new URL(config.get('memosApi'));
    url.pathname = `${url.pathname}/${id}`;
    await fetch(url.toString(), {
      method: 'PATCH',
      body: JSON.stringify({
        createdTs: dayjs(date).unix()
      })
    });
  }
}

async function run() {
  const notion = new Client({
    auth: config.get('notionToken'),
  });

  const n2m = new NotionToMarkdown({ notionClient: notion });

  let start_cursor: string | undefined;
  while (true) {
    const resp = await notion.databases.query({
      database_id: config.get('notionDatabaseId'),
      start_cursor,
    });

    for (const item of resp.results) {
      const dateProperty = (item as PageObjectResponse).properties[config.get('notionDateProperty')] as DatePropertyItemObjectResponse | undefined;
      const date = dateProperty?.date?.start;

      const mdBlocks = await n2m.pageToMarkdown(item.id);
      const mdString = n2m.toMarkdownString(mdBlocks);

      if (!mdString.trim()) {
        continue;
      }

      await postToMemos(mdString.trim(), date);
    }

    if (!resp.has_more && resp.next_cursor) {
      start_cursor = resp.next_cursor;      
    } else {
      break;
    }
  }
}

run();
