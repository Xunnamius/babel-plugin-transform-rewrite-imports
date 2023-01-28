# Changelog

All notable changes to this project will be documented in this auto-generated
file. The format is based on [Conventional Commits][1];
this project adheres to [Semantic Versioning][2].

### [1.0.1][3] (2023-01-28)

#### 🪄 Fixes

- Use console.log for output, retire debug log function, improve type usage ([70e4053][4])

#### ⚙️ Build System

- Reorganize output distributables ([cb4346d][5])

## [1.0.0][6] (2023-01-27)

#### ✨ Features

- Add drone ci test pipeline ([ae66e28][7])
- Add github action to lint and test ([dafd93f][8])
- Add support for exports ([32188ab][9])
- Add tests and update plugin version ([948baea][10])
- Automate package publishing ([2fd6c22][11])
- Handle ../ paths ([470b358][12])
- Skip type-only imports and exports ([49fdd96][13])
- Support ExportAllDeclaration ([8a39cf6][14])

#### 🪄 Fixes

- ✅replace "false" extension value to "undefined" for default value tests ([054921e][15])
- 🐛replace extension properly ([0609c35][16])
- Add linter(standardjs) ([db0f337][17])
- Don't exclude relative paths ([99668ab][18])
- Make drone use npm ci instead of npm install ([1c2c16f][19])
- Missing import ([3aa9d12][20])

#### ⚙️ Build System

- **readme:** update maintenance badge ([4d47b6e][21])
- Update tooling ([74a87dd][22])

[1]: https://conventionalcommits.org
[2]: https://semver.org
[3]: https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/compare/v1.0.0...v1.0.1
[4]: https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/commit/70e405373905799a7cc565d841f585fe87f12a26
[5]: https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/commit/cb4346dc02e9df632acf7ac734f85c5c76c6d51d
[6]: https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/compare/32188ab1317f1936e364d98658ff915f5d4dafd3...v1.0.0
[7]: https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/commit/ae66e28d2ff61c1207bfa65c37a6541031c9504d
[8]: https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/commit/dafd93fd33a5aab03734e64619ec84161ac42d73
[9]: https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/commit/32188ab1317f1936e364d98658ff915f5d4dafd3
[10]: https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/commit/948baeab189090375faf956397c370b62abc555a
[11]: https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/commit/2fd6c22cf181baa83e8c6eac2fbdd6653f57b423
[12]: https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/commit/470b358a0d749c1cee3ab0f3f5b649d3f05490ed
[13]: https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/commit/49fdd9684668b8437bd11c4c5f03b40c1af50acd
[14]: https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/commit/8a39cf60884d430c70be94183e70d11e25bb4ecd
[15]: https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/commit/054921ee3cacd13a60a1837c4ab302310a5c1422
[16]: https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/commit/0609c3524352763f743f9d3994f9e22847c28971
[17]: https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/commit/db0f337812e99cfd58c56d5f1fe3a320e60892e7
[18]: https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/commit/99668ab304703adcb329b60ff3ef29a88f5d3aad
[19]: https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/commit/1c2c16f27e37a8376acd50799f07e8ae00e88d73
[20]: https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/commit/3aa9d12066bd8469beee641a9d79007bacc1dd41
[21]: https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/commit/4d47b6e0b2e9892aa563a525ed61e9a5087c59bf
[22]: https://github.com/Xunnamius/babel-plugin-transform-rewrite-imports/commit/74a87ddcaeb6a3fae6ebeb0376910e1ad4408784
