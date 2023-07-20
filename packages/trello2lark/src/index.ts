import { createReadStream } from 'node:fs';
import { writeFile, unlink } from 'node:fs/promises';
import { setTimeout } from 'node:timers/promises';
import { Card, Trello } from './lib/trello';
import config from './config';
import { Lark } from './lib/lark';

const client = new Trello(config.get('trelloApiKey'), config.get('trelloApiToken'));
const items = await client.allItems(config.get('trelloBoardId'));
const lists = await client.allLists(config.get('trelloBoardId'));

const lark = new Lark(config.get('larkAppId'), config.get('larkAppSecret'));
const records = await lark.listRecords(config.get('larkBitableAppToken'), config.get('larkBitableTableId'));

await lark.updateBitableFieldOptions(config.get('larkBitableAppToken'), config.get('larkBitableTableId'), config.get('larkBitableListField'), lists.map(list => list.name));

const importOne = async (item: Card) => {
  if (records.find(record => record.fields[config.get('larkBitableNameField')] === item.name)) {
    return;
  }
  let fileToken: string | undefined;
  if (item.idAttachmentCover) {
    const attachment = await client.getAttachment(item.id, item.idAttachmentCover);
    await writeFile(`/tmp/${attachment.name}`, Buffer.from(attachment.data));
    fileToken = await lark.uploadBitableImage(config.get('larkBitableAppToken'), createReadStream(`/tmp/${attachment.name}`), attachment.data.byteLength, `${attachment.name}`);
    await unlink(`/tmp/${attachment.name}`);
  }

  await lark.createRecord(config.get('larkBitableAppToken'), config.get('larkBitableTableId'), {
    name: config.get('larkBitableNameField'),
    list: config.get('larkBitableListField'),
    cover: config.get('larkBitableCoverField'),
  }, {
    name: item.name,
    list: lists.find(list => list.id === item.idList)?.name ?? '',
    coverFile: fileToken,
  });
  console.log(`Imported ${item.name}`);
};

for (const item of items) {
  await importOne(item);
  await setTimeout(1000);
}
