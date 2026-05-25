# @cosmotech/superset-plugin-{{PACKAGE_NAME}}

{{DESCRIPTION}}

## Overview

This plugin was scaffolded using `yarn plugin:init` and follows the cosmotech-viz plugin conventions.

## Usage

Add this plugin to your Superset preset:

```ts
import { {{PLUGIN_CLASS_NAME}}Plugin } from '@cosmotech/superset-plugin-{{PACKAGE_NAME}}';

const plugin = new {{PLUGIN_CLASS_NAME}}Plugin();
plugin.configure({ key: '{{PACKAGE_NAME}}' }).register();
```

## Development

```bash
# Build
yarn workspace @cosmotech/superset-plugin-{{PACKAGE_NAME}} build

# Test
yarn workspace @cosmotech/superset-plugin-{{PACKAGE_NAME}} test

# Lint
yarn workspace @cosmotech/superset-plugin-{{PACKAGE_NAME}} lint
```

## License

Apache-2.0
