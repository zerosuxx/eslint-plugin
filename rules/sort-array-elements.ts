import type { JSONSchema4 } from '@typescript-eslint/utils/dist/json-schema';

import { AST_NODE_TYPES } from '@typescript-eslint/utils';

import type { Options } from 'eslint-plugin-perfectionist/dist/rules/sort-array-includes/types';

import {
  partitionByCommentJsonSchema,
  partitionByNewLineJsonSchema,
} from 'eslint-plugin-perfectionist/dist/utils/json-schemas/common-partition-json-schemas';
import {
  MISSED_SPACING_ERROR,
  EXTRA_SPACING_ERROR,
  GROUP_ORDER_ERROR,
  ORDER_ERROR,
} from 'eslint-plugin-perfectionist/dist/utils/report-errors';
import {
  buildUseConfigurationIfJsonSchema,
  buildCommonJsonSchemas,
} from 'eslint-plugin-perfectionist/dist/utils/json-schemas/common-json-schemas';
import {
  buildCommonGroupsJsonSchemas,
} from 'eslint-plugin-perfectionist/dist/utils/json-schemas/common-groups-json-schemas';
import {
  additionalCustomGroupMatchOptionsJsonSchema,
} from 'eslint-plugin-perfectionist/dist/rules/sort-array-includes/types';
import { createEslintRule } from 'eslint-plugin-perfectionist/dist/utils/create-eslint-rule';
import { sortArray } from 'eslint-plugin-perfectionist/dist/rules/sort-array-includes';

/** Cache computed groups by modifiers and selectors for performance. */

const ORDER_ERROR_ID = 'unexpectedArrayIncludesOrder';
const GROUP_ORDER_ERROR_ID = 'unexpectedArrayIncludesGroupOrder';
const EXTRA_SPACING_ERROR_ID = 'extraSpacingBetweenArrayIncludesMembers';
const MISSED_SPACING_ERROR_ID = 'missedSpacingBetweenArrayIncludesMembers';

type MessageId =
  | typeof MISSED_SPACING_ERROR_ID
  | typeof EXTRA_SPACING_ERROR_ID
  | typeof GROUP_ORDER_ERROR_ID
  | typeof ORDER_ERROR_ID

export let defaultOptions: Required<Options[number]> = {
  fallbackSort: { type: 'unsorted' },
  newlinesInside: 'newlinesBetween',
  specialCharacters: 'keep',
  partitionByComment: false,
  partitionByNewLine: false,
  newlinesBetween: 'ignore',
  useConfigurationIf: {},
  type: 'alphabetical',
  groups: ['literal'],
  ignoreCase: true,
  locales: 'en-US',
  customGroups: [],
  alphabet: '',
  order: 'asc',
};

export let jsonSchema: JSONSchema4 = {
  items: {
    properties: {
      ...buildCommonJsonSchemas(),
      ...buildCommonGroupsJsonSchemas({
        additionalCustomGroupMatchProperties:
        additionalCustomGroupMatchOptionsJsonSchema,
      }),
      useConfigurationIf: buildUseConfigurationIfJsonSchema(),
      partitionByComment: partitionByCommentJsonSchema,
      partitionByNewLine: partitionByNewLineJsonSchema,
    },
    additionalProperties: false,
    type: 'object',
  },
  uniqueItems: true,
  type: 'array',
};

export default createEslintRule<Options, MessageId>({
  create: context => ({
    ArrayExpression: node => {
      let elements = node.elements.filter(element => element?.type === AST_NODE_TYPES.Literal);
      sortArray({
        availableMessageIds: {
          missedSpacingBetweenMembers: MISSED_SPACING_ERROR_ID,
          extraSpacingBetweenMembers: EXTRA_SPACING_ERROR_ID,
          unexpectedGroupOrder: GROUP_ORDER_ERROR_ID,
          unexpectedOrder: ORDER_ERROR_ID,
        },
        elements,
        context,
      });
    },
  }),
  meta: {
    messages: {
      [MISSED_SPACING_ERROR_ID]: MISSED_SPACING_ERROR,
      [EXTRA_SPACING_ERROR_ID]: EXTRA_SPACING_ERROR,
      [GROUP_ORDER_ERROR_ID]: GROUP_ORDER_ERROR,
      [ORDER_ERROR_ID]: ORDER_ERROR,
    },
    docs: {
      description: 'Enforce sorted array elements.',
      recommended: true,
    },
    schema: jsonSchema,
    type: 'suggestion',
    fixable: 'code',
  },
  defaultOptions: [defaultOptions],
  name: 'sort-array-elements',
});
