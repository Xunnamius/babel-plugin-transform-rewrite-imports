# Changelog

All notable changes to this project will be documented in this auto-generated
file. The format is based on [Conventional Commits][1];
this project adheres to [Semantic Versioning][2].

### [1.5.3][3] (2024-10-30)

#### ⚙️ Build System

- **package:** update dependencies ([104d939][4])

### [1.5.2][5] (2024-10-30)

#### 🪄 Fixes

- **readme:** use proper debug activation syntax, improve structure ([bc746a2][6])

### [1.5.1][7] (2024-10-29)

#### 🪄 Fixes

- **src:** use proper destructuring for rewrite report ([30352bc][8])

## [1.5.0][9] (2024-10-28)

#### ✨ Features

- Allow explicitly disabling arbitrary dynamic import support via `injectDynamicRewriter` ([0db9c4c][10])

## [1.4.0][11] (2024-10-28)

#### ✨ Features

- **src:** add support for `requireLikeFunctions` ([eafe348][12])

#### 🪄 Fixes

- **src:** use more robust specifier scanning for `CallExpression`s ([34eb5f4][13])

### [1.3.1][14] (2024-10-27)

#### 🪄 Fixes

- Ensure debug output is consistent and meaningful ([19e1588][15])

## [1.3.0][16] (2024-10-27)

#### ✨ Features

- Make `filepath` available in replacer context and add support for `TSImportType` replacements ([0be1eda][17])

#### ⚙️ Build System

- **husky:** update commit hooks ([5719706][18])

## [1.2.0][19] (2023-02-02)

#### ✨ Features

- `appendExtension` and `replaceExtensions` accept callbacks for advanced functionality ([618f4c3][20])

## [1.1.0][21] (2023-01-29)

#### ✨ Features

- **src:** use more aesthetically appealing output format ([7390e3a][22])

### [1.0.1][23] (2023-01-28)

#### 🪄 Fixes

- Use console.log for output, retire debug log function, improve type usage ([70e4053][24])

#### ⚙️ Build System

- Reorganize output distributables ([cb4346d][25])

## [1.0.0][26] (2023-01-27)

#### ✨ Features

- Add drone ci test pipeline ([ae66e28][27])
- Add github action to lint and test ([dafd93f][28])
- Add support for exports ([32188ab][29])
- Add tests and update plugin version ([948baea][30])
- Automate package publishing ([2fd6c22][31])
- Handle ../ paths ([470b358][32])
- Skip type-only imports and exports ([49fdd96][33])
- Support ExportAllDeclaration ([8a39cf6][34])

#### 🪄 Fixes

- ✅replace "false" extension value to "undefined" for default value tests ([054921e][35])
- 🐛replace extension properly ([0609c35][36])
- Add linter(standardjs) ([db0f337][37])
- Don't exclude relative paths ([99668ab][38])
- Make drone use npm ci instead of npm install ([1c2c16f][39])
- Missing import ([3aa9d12][40])

#### ⚙️ Build System

- **readme:** update maintenance badge ([4d47b6e][41])
- Update tooling ([74a87dd][42])

[1]: https://conventionalcommits.org
[2]: https://semver.org
[3]: https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/compare/v1.5.2...v1.5.3
[4]: https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/commit/104d9392d84542d4b67a7e90a78e9aac61aadac8
[5]: https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/compare/v1.5.1...v1.5.2
[6]: https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/commit/bc746a21e0690faa47b9d98ed4abf9ff41a1b71d
[7]: https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/compare/v1.5.0...v1.5.1
[8]: https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/commit/30352bcb473f6670b4d32e875f44ed5a58c989d4
[9]: https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/compare/v1.4.0...v1.5.0
[10]: https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/commit/0db9c4c9e970eff7f8163f80446cbbfd7a6d287f
[11]: https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/compare/v1.3.1...v1.4.0
[12]: https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/commit/eafe34854380e6d047cf3e785a59a8da7630093a
[13]: https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/commit/34eb5f476d6ab5e523a705589f6f7579694a233a
[14]: https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/compare/v1.3.0...v1.3.1
[15]: https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/commit/19e1588c04e6526fdd6fd5327755da13326abcaa
[16]: https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/compare/v1.2.0...v1.3.0
[17]: https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/commit/0be1eda4a2b30709c0755c0ffd994f51ba295498
[18]: https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/commit/5719706662031be27d19e940d41b502973d329fa
[19]: https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/compare/v1.1.0...v1.2.0
[20]: https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/commit/618f4c3a161b526b09bcb5ba5f0eee81058a75bd
[21]: https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/compare/v1.0.1...v1.1.0
[22]: https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/commit/7390e3adfea60a3ff0dc03b23f01d15467bc0ef2
[23]: https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/compare/v1.0.0...v1.0.1
[24]: https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/commit/70e405373905799a7cc565d841f585fe87f12a26
[25]: https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/commit/cb4346dc02e9df632acf7ac734f85c5c76c6d51d
[26]: https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/compare/32188ab1317f1936e364d98658ff915f5d4dafd3...v1.0.0
[27]: https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/commit/ae66e28d2ff61c1207bfa65c37a6541031c9504d
[28]: https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/commit/dafd93fd33a5aab03734e64619ec84161ac42d73
[29]: https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/commit/32188ab1317f1936e364d98658ff915f5d4dafd3
[30]: https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/commit/948baeab189090375faf956397c370b62abc555a
[31]: https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/commit/2fd6c22cf181baa83e8c6eac2fbdd6653f57b423
[32]: https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/commit/470b358a0d749c1cee3ab0f3f5b649d3f05490ed
[33]: https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/commit/49fdd9684668b8437bd11c4c5f03b40c1af50acd
[34]: https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/commit/8a39cf60884d430c70be94183e70d11e25bb4ecd
[35]: https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/commit/054921ee3cacd13a60a1837c4ab302310a5c1422
[36]: https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/commit/0609c3524352763f743f9d3994f9e22847c28971
[37]: https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/commit/db0f337812e99cfd58c56d5f1fe3a320e60892e7
[38]: https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/commit/99668ab304703adcb329b60ff3ef29a88f5d3aad
[39]: https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/commit/1c2c16f27e37a8376acd50799f07e8ae00e88d73
[40]: https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/commit/3aa9d12066bd8469beee641a9d79007bacc1dd41
[41]: https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/commit/4d47b6e0b2e9892aa563a525ed61e9a5087c59bf
[42]: https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/commit/74a87ddcaeb6a3fae6ebeb0376910e1ad4408784
