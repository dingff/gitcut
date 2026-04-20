# Changelog

## [2.1.6](https://github.com/dingff/gitcut/compare/v2.1.5...v2.1.6) (2026-04-20)

### Bug Fixes

- **rules:** update rule descriptions to use uppercase MUST ([51f972d](https://github.com/dingff/gitcut/commit/51f972de101e4888045cba5803c0f4503007c74c))

## [2.1.5](https://github.com/dingff/gitcut/compare/v2.1.4...v2.1.5) (2026-04-16)

### Bug Fixes

- **index:** correct error messages and spinner text ([d2f43f6](https://github.com/dingff/gitcut/commit/d2f43f68861c2b0b4f60db277409109e0aa54989))

## [2.1.4](https://github.com/dingff/gitcut/compare/v2.1.3...v2.1.4) (2026-04-16)

### Bug Fixes

- **core:** handle unstaged changes and improve error handling ([08935e9](https://github.com/dingff/gitcut/commit/08935e9505f1fe4ddc56d8abfbb501dde5b4fbb3))
- **index:** add think field to exclude qwen models ([9232547](https://github.com/dingff/gitcut/commit/9232547359fccf830bd39230a7a2999daa34a336))

## [2.1.3](https://github.com/dingff/gitcut/compare/v2.1.2...v2.1.3) (2026-04-14)

### Bug Fixes

- **ui:** improve prompt messages and validation ([482828d](https://github.com/dingff/gitcut/commit/482828d7ea965bb19c5c2091ba120551f14d5401))

### Features

- **ui:** improve selector prompt messages ([dff35f2](https://github.com/dingff/gitcut/commit/dff35f22f0910b4f8a6f0427477109a6aba083e3))
- **utils:** add error handling and utility functions for prompt and spawn operations ([4fe561b](https://github.com/dingff/gitcut/commit/4fe561b2aae20e051ba8a35b4eb764d2ef28fc9d))

## [2.1.2](https://github.com/dingff/gitcut/compare/v2.1.1...v2.1.2) (2026-04-13)

## [2.1.1](https://github.com/dingff/gitcut/compare/v2.1.0...v2.1.1) (2026-04-13)

### Features

- **core:** introduce local LLM support to enhance commit message generation ([7a2b236](https://github.com/dingff/gitcut/commit/7a2b2364c1bfcb5b2a820f1aa3b515cef6a912fa))

# [2.1.0](https://github.com/dingff/gitcut/compare/v2.0.1...v2.1.0) (2026-04-08)

### Features

- **cli:** remove config file and emoji support, simplify initialization flow ([5035a89](https://github.com/dingff/gitcut/commit/5035a898384b2cac749b8aff596e2a820b45e8d7))
- **core:** add ollama integration to generate commit messages ([99827fe](https://github.com/dingff/gitcut/commit/99827fe25aaeb69b7123257e81c4d477b23ed284))
- **ui:** fix commit message language selection display logic ([b157a75](https://github.com/dingff/gitcut/commit/b157a75a1084f395c86ea0cf01b002c5dbcc9514))

## [2.0.1](https://github.com/dingff/gitcut/compare/v2.0.0...v2.0.1) (2026-03-24)

### Bug Fixes

- use more reasonable preset name in default config ([2018acc](https://github.com/dingff/gitcut/commit/2018acc7bb3b3813f238e509fb1c4bd2c6d21d86))

# [2.0.0](https://github.com/dingff/gitcut/compare/v1.15.4...v2.0.0) (2026-03-11)

### Features

- move to esm and update all dependencies ([e885674](https://github.com/dingff/gitcut/commit/e885674a6e11b15d176a59a5058ce0b6e1892e9e))
- show commits in stats ([5210486](https://github.com/dingff/gitcut/commit/5210486aebf0ead61368086b149cd4409b3688f5))
- update description ([713d49c](https://github.com/dingff/gitcut/commit/713d49cdd86e25f71d12aca53cab628f1038538f))

## [1.15.4](https://github.com/dingff/gitcut/compare/v1.15.3...v1.15.4) (2025-08-07)

### Features

- hide loading when fetch ([34a3111](https://github.com/dingff/gitcut/commit/34a3111af9ed9ae3841a494d5a9dcc19506045bb))
- include all branch data in stats ([06e4ba6](https://github.com/dingff/gitcut/commit/06e4ba620d9142bdc3c4c60cfd32d7f8d3528b42))

## [1.15.3](https://github.com/dingff/gitcut/compare/v1.15.2...v1.15.3) (2025-06-17)

### Bug Fixes

- update author stats sorting to include total contributions ([585159c](https://github.com/dingff/gitcut/commit/585159c1b7f4f54b921782c281bd9a48de9ea1a2))

## [1.15.2](https://github.com/dingff/gitcut/compare/v1.15.1...v1.15.2) (2025-04-23)

### Bug Fixes

- update package.json description for clarity and add missing files field ([c595235](https://github.com/dingff/gitcut/commit/c59523551dcad6aa82c8e2b56d3183cb8f432c9b))

## [1.15.1](https://github.com/dingff/gitcut/compare/v1.15.0...v1.15.1) (2025-04-23)

### Bug Fixes

- remove unused demo GIF file ([54a439b](https://github.com/dingff/gitcut/commit/54a439b1b6c1aedbeeb736ebd92ca1b7eda1cc68))
- update repository field format in package.json ([fcd8c06](https://github.com/dingff/gitcut/commit/fcd8c0663d520bf108e22b06217eb456b4725290))

# [1.15.0](https://github.com/dingff/gitcut/compare/v1.14.2...v1.15.0) (2025-04-23)

### Bug Fixes

- handles undefined cmdType in command execution ([eb098af](https://github.com/dingff/gitcut/commit/eb098af11a5454e46dc4b5ce2dad8e7c1c3ab858))
- inquirer version ([e9e5895](https://github.com/dingff/gitcut/commit/e9e58954afe3f9d29dafb9d401f1b5c51e2d4dce))
- remove unnecessary code ([1ebdaee](https://github.com/dingff/gitcut/commit/1ebdaee8dad39d203de2c4eb5163b84da60fbe18))

### Features

- support stats ([9176cc9](https://github.com/dingff/gitcut/commit/9176cc974fc3f4819793e8b7653edddd9437a94a))

## [1.14.2](https://github.com/dingff/gitcut/compare/v1.14.1...v1.14.2) (2024-08-21)

### Bug Fixes

- **cp:** should reverse the selected hashes ([cceebe1](https://github.com/dingff/gitcut/commit/cceebe10f0c241676ac9803fe0aa99437895ab8b))

## [1.14.1](https://github.com/dingff/gitcut/compare/v1.14.0...v1.14.1) (2024-07-29)

### Bug Fixes

- empty space can not be branch name ([ae22d48](https://github.com/dingff/gitcut/commit/ae22d48fa4e9ca7ca265949581584a443fd9079c))

# [1.14.0](https://github.com/dingff/gitcut/compare/v1.13.2...v1.14.0) (2024-07-29)

### Features

- add emoji in branch name ([0aace13](https://github.com/dingff/gitcut/commit/0aace139d2aeec829880079f249063e18a4161c8))

## [1.13.2](https://github.com/dingff/gitcut/compare/v1.13.1...v1.13.2) (2024-06-12)

## [1.13.1](https://github.com/dingff/gitcut/compare/v1.13.0...v1.13.1) (2024-04-28)

### Bug Fixes

- rename silence config ([cd54d13](https://github.com/dingff/gitcut/commit/cd54d13961fedb724c4c9ba447a7a3ad548b2b38))
- use pipe for fetch ([d44a910](https://github.com/dingff/gitcut/commit/d44a9101e6feca4433bdeb5f1499c883fc3043a8))

# [1.13.0](https://github.com/dingff/gitcut/compare/v1.12.3...v1.13.0) (2024-04-28)

### Features

- add mg ([6aa1c88](https://github.com/dingff/gitcut/commit/6aa1c88fef151eb608cfb4e609728642f4eb8694))

## [1.12.3](https://github.com/dingff/gitcut/compare/v1.12.2...v1.12.3) (2024-03-28)

### Bug Fixes

- **cp:** should use origin branch to fetch commits ([94fc430](https://github.com/dingff/gitcut/commit/94fc4301c5c57366017f2b6629a6a843cc5850e7))

## [1.12.2](https://github.com/dingff/gitcut/compare/v1.12.1...v1.12.2) (2024-03-28)

### Features

- **cp:** add index for commits ([801c3b6](https://github.com/dingff/gitcut/commit/801c3b68d9d882a2fa8a83ff2f47c861cacc7f35))

## [1.12.1](https://github.com/dingff/gitcut/compare/v1.12.0...v1.12.1) (2024-03-28)

### Bug Fixes

- bug ([921c9e7](https://github.com/dingff/gitcut/commit/921c9e7fc7ca98b9b4392d0f850e53856317dc5c))

# [1.12.0](https://github.com/dingff/gitcut/compare/v1.11.0...v1.12.0) (2024-03-28)

### Features

- add bh -l ([223e3b9](https://github.com/dingff/gitcut/commit/223e3b92c4ec2a4c6fdf065754523c6ea698140c))
- add cp ([3aafb10](https://github.com/dingff/gitcut/commit/3aafb10cc80990bb9f7a45f24a2a95238e01d5f7))
- enhance query with inquirer ([537efb2](https://github.com/dingff/gitcut/commit/537efb2b959dd9ed912faa645f83661d45f04488))

# [1.11.0](https://github.com/dingff/gitcut/compare/v1.10.0...v1.11.0) (2024-03-25)

### Features

- use inquirer to enhance bh ([394d678](https://github.com/dingff/gitcut/commit/394d678dab52c67ce215095151c4ae5457c27897))

# [1.10.0](https://github.com/dingff/gitcut/compare/v1.9.0...v1.10.0) (2024-03-15)

### Features

- add an alias to submit ([23d431a](https://github.com/dingff/gitcut/commit/23d431a7982fc4869a816cc112a417eb0d7c5fdf))

# [1.9.0](https://github.com/dingff/gitcut/compare/v1.8.1...v1.9.0) (2023-12-04)

### Features

- add bh ([722cdfe](https://github.com/dingff/gitcut/commit/722cdfe653239fbb707b7aaf810b303294e43da9))

## [1.8.1](https://github.com/dingff/gitcut/compare/v1.8.0...v1.8.1) (2023-09-14)

### Bug Fixes

- excludePaths should not have prefix ([05e8dfe](https://github.com/dingff/gitcut/commit/05e8dfe7ed97bc363c313aef7e9dbe46859ca224))

# [1.8.0](https://github.com/dingff/gitcut/compare/v1.7.2...v1.8.0) (2023-09-14)

### Features

- support to exclude some paths ([0fd986f](https://github.com/dingff/gitcut/commit/0fd986fe309f468a0c3552bc4d82ca99a27206a0))

## [1.7.2](https://github.com/dingff/gitcut/compare/v1.7.1...v1.7.2) (2023-04-15)

### Features

- add demo.gif ([66d8088](https://github.com/dingff/gitcut/commit/66d80880345804c9fe05e715b49a0c07ac0b6825))

## [1.7.1](https://github.com/dingff/gitcut/compare/v1.7.0...v1.7.1) (2023-03-28)

### Bug Fixes

- **query:** should not remove remote when using exist ([4585ff3](https://github.com/dingff/gitcut/commit/4585ff3fb0ad4c7fed987b496bbd8b481dbf1bde))

# [1.7.0](https://github.com/dingff/gitcut/compare/v1.6.5...v1.7.0) (2023-03-28)

### Features

- **query:** support remote name ([fca1c0c](https://github.com/dingff/gitcut/commit/fca1c0c3ae63cc1b3b82f378d8f48a8d09e7636c))

## [1.6.5](https://github.com/dingff/gitcut/compare/v1.6.4...v1.6.5) (2023-03-28)

### Bug Fixes

- add description in readme ([1b2d830](https://github.com/dingff/gitcut/commit/1b2d830a446714acea3422e1ee43cf782c39ecad))

## [1.6.4](https://github.com/dingff/gitcut/compare/v1.6.3...v1.6.4) (2023-03-27)

## [1.6.3](https://github.com/dingff/gitcut/compare/v1.6.2...v1.6.3) (2023-03-27)

### Features

- **submit:** add build type ([294b125](https://github.com/dingff/gitcut/commit/294b125056448eb466903a87bbb6ae5c20e54846))

## [1.6.2](https://github.com/dingff/gitcut/compare/v1.6.1...v1.6.2) (2023-03-09)

### Features

- add rc ([03d8837](https://github.com/dingff/gitcut/commit/03d8837f6a0ce90b545c1a2858133d8c04edd398))

## [1.6.1](https://github.com/dingff/gitcut/compare/v1.6.0...v1.6.1) (2023-03-09)

### Reverts

- recommend global config pull.rebase ([c83a972](https://github.com/dingff/gitcut/commit/c83a97205f633a0815f9c00f5689e3222699e16e))

# [1.6.0](https://github.com/dingff/gitcut/compare/v1.5.5...v1.6.0) (2023-03-09)

### Bug Fixes

- remove unused return ([4ae7b37](https://github.com/dingff/gitcut/commit/4ae7b37b809c3f1af77768fce4a5d532f2c9e8fe))

### Features

- **submit:** use --rebase for pull ([4f79194](https://github.com/dingff/gitcut/commit/4f7919474b8978f6e119d63c6b12935881b67be8))

## [1.5.5](https://github.com/dingff/gitcut/compare/v1.5.4...v1.5.5) (2023-03-07)

### Bug Fixes

- **type:** remove rm ([ac5bf0b](https://github.com/dingff/gitcut/commit/ac5bf0b191da08f529b361cc815bd6c947798b83))

## [1.5.4](https://github.com/dingff/gitcut/compare/v1.5.3...v1.5.4) (2023-03-06)

### Bug Fixes

- get version from package ([b6c5f43](https://github.com/dingff/gitcut/commit/b6c5f4336756baaea00d376386b87ddf9f623052))
