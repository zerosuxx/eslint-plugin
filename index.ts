import type { ESLint, Linter } from 'eslint';

import { version as packageVersion, name as packageName } from './package.json';
import sortArrayElements from './rules/sort-array-elements';

interface PluginConfigs extends Record<
  string,
  Linter.LegacyConfig | Linter.Config[] | Linter.Config
> {
  'recommended': Linter.Config;
  'recommended-legacy': Linter.LegacyConfig;
}

interface BaseOptions {
  type: 'alphabetical' | 'line-length' | 'natural' | 'custom';
  order: 'desc' | 'asc';
}

let pluginName = 'zerosuxx';

export let rules = {
  'sort-array-elements': sortArrayElements,
} as unknown as ESLint.Plugin['rules'];

let plugin = {
  meta: {
    version: packageVersion,
    name: packageName,
  },
  rules,
} as unknown as ESLint.Plugin;

function getRules(options: BaseOptions): Linter.RulesRecord {
  return Object.fromEntries(
    Object.keys(plugin.rules!).map(ruleName => [
      `${pluginName}/${ruleName}`,
      ['error', options],
    ]),
  );
}

function createConfig(options: BaseOptions): Linter.Config {
  return {
    plugins: {
      [pluginName]: plugin,
    },
    rules: getRules(options),
  };
}

function createLegacyConfig(options: BaseOptions): Linter.LegacyConfig {
  return {
    rules: getRules(options),
    plugins: [pluginName],
  };
}

export let configs: PluginConfigs = {
  'recommended-legacy': createLegacyConfig({
    type: 'alphabetical',
    order: 'asc',
  }),
  'recommended': createConfig({
    type: 'alphabetical',
    order: 'asc',
  }),
};

export default {
  ...plugin,
  configs,
} as { configs: PluginConfigs } & ESLint.Plugin;
