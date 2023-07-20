import convict from 'convict';
import { load } from 'js-yaml';

convict.addParser({
  extension: ['yml', 'yaml'],
  parse: load,
});

const config = convict({
  trelloApiKey: {
    format: 'String',
    env: 'TRELLO_API_KEY',
    default: ''
  },
  trelloApiToken: {
    format: 'String',
    env: 'TRELLO_API_TOKEN',
    default: ''
  },
  trelloBoardId: {
    format: 'String',
    env: 'TRELLO_BOARD_ID',
    default: ''
  },
  larkAppId: {
    format: 'String',
    env: 'LARK_APP_ID',
    default: ''
  },
  larkAppSecret: {
    format: 'String',
    env: 'LARK_APP_SECRET',
    default: ''
  },
  larkBitableAppToken: {
    format: 'String',
    env: 'LARK_BITABLE_APP_TOKEN',
    default: ''
  },
  larkBitableTableId: {
    format: 'String',
    env: 'LARK_BITABLE_TABLE_ID',
    default: ''
  },
  larkBitableNameField: {
    format: 'String',
    env: 'LARK_BITABLE_NAME_FIELD',
    default: ''
  },
  larkBitableListField: {
    format: 'String',
    env: 'LARK_BITABLE_LIST_FIELD',
    default: ''
  },
  larkBitableCoverField: {
    format: 'String',
    env: 'LARK_BITABLE_COVER_FIELD',
    default: ''
  },
});

config.loadFile('config.yaml');

export default config;