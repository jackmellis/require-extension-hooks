# Change Log

## 0.3.3
- Added required engine version to package.json

## 0.3.2
- Fixed incompatible syntax for use with node v6. [#8](https://github.com/jackmellis/require-extension-hooks/pull/8)

## 0.3.1
- Include should be either-y.

## 0.3.0
- Fixed a bug where the plugin option did not pass configuration options [5](https://github.com/jackmellis/require-extension-hooks/issues/5)
- Added `include` and `exclude` options so you can easily filter out irrelevant files [4](https://github.com/jackmellis/require-extension-hooks/issues/4)
- Plugins are automatically pushed when registered [3](https://github.com/jackmellis/require-extension-hooks/issues/3)
- Added source map optimisations for codebases that do not use them. [2](https://github.com/jackmellis/require-extension-hooks/issues/2)
- Added `hook` method to the hook parameter, allows you to trigger another extension. i.e. `hooks('ts').push({hook} => hook('js'))` [1](https://github.com/jackmellis/require-extension-hooks/issues/1)
