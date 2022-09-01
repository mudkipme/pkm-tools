import convict from 'convict';
import { load } from 'js-yaml';

convict.addParser({
  extension: ['yml', 'yaml'],
  parse: load,
});

const config = convict({
  notionToken: {
    format: 'String',
    env: 'NOTION_TOKEN',
    default: ''
  },
  notionDatabaseId: {
    format: 'String',
    env: 'NOTION_DATABASE_ID',
    default: ''
  },
  notionDateProperty: {
    format: 'String',
    default: 'Created At'
  },
  memosApi: {
    format: 'String',
    ENV: 'MEMOS_API',
    default: ''
  },
});

config.loadFile('config.yaml');

export default config;