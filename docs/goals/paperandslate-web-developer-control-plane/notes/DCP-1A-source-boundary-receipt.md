# DCP-1A immutable source-boundary receipt

Operation: create the local DCP-1A source identity after the approved capability-planning boundary.
Result: `done` for the exact source-boundary commit only.
`full_outcome_complete: false`

## Identity and scope

- Source commit: `adfc9b7bce10c8340c9b12834729ccf1ce40fbf9`
- Source tree: `b3164882d9c71d7eb8f09cbd8bee7a4ddeb70e06`
- Source parent: `a32604004cbfeeb90e7c114a9c369834bc3bcfa3` (`E`)
- Source branch: `release/v1-closure`
- Remote `origin/release/v1-closure` remained `a32604004cbfeeb90e7c114a9c369834bc3bcfa3`; no push occurred.
- The source commit has no exact tag.
- The source commit contains exactly the 34 DCP-1A owner paths below and no board/evidence receipt path.
- DCP1A_SOURCE is an immutable local source boundary; it is not a provider activation, DCP-1B acceptance, hosted result, release, or production claim.

The source boundary was created under the exclusive Web checkout writer lock after revalidating:

- E/tree/origin: `a32604004cbfeeb90e7c114a9c369834bc3bcfa3` / `743da2ad148d789972041ed734eaa9af774f6f78`
- branch: `release/v1-closure`
- empty index before staging
- exact pre-commit status fingerprint: `4772e4085a22436fab0b6a948004d1185dff888e6be578dbbfbb28f0104d2062`
- exact pre-commit 34-path status/content manifest root: `2e03ee55ae964a7f6f12c3d6e98f016f1ce60d206909e0a294b8416a32490a7e`
- Data T681: commit `d21efabb8550578333fee5f62bf0e822fbca1394`, tree `5c3a56a25f4eb374e94550f89b9ed1dbd52bb66a`, parent `93c8933aee674758fe3586b3f48f79497d1e1aa`, exact nine-path commit
- T008/T010/T011 note bytes and Git blobs listed in the preservation section
- protected RC3/release paths and all 55 WEB-REQ status/blocker pairs

## Exact source-path manifest

The first column is the pre-commit porcelain status. The remaining columns are the committed file byte length, working-copy SHA-256, and resulting Git blob identity.

| Pre-status | Path | Bytes | SHA-256 | Git blob |
| --- | --- | ---: | --- | --- |
| ` M` | `.generated/requirements/developer-control-plane-requirements.json` | 4603 | `0b2b6819247ffbc1c70fbf05e4ad484416a30ae37f86c9def246af28a6dfd329` | `e43e860e120a16012931eae27605af1cac276119` |
| ` M` | `.generated/requirements/requirements.json` | 1010975 | `7b256f673a33f2732c0674268b5ae7ea14367e7f6da031a3fc681bb428ea38a8` | `4d11786b8b1be333e6ecb038cadc64e5a79789a8` |
| ` M` | `.generated/requirements/traceability-check.json` | 2801 | `c173e299bc039af41bc511ac68662018866c3cc6252ea41ffcb52d8f2f1a9db9` | `d675c4c199fd4ed4c8e83efe8eb65a9a6035fbd3` |
| ` M` | `DEVELOPER_CONTROL_PLANE_LEDGER.md` | 5872 | `2fe184eb01e420f4c1c04be3b76c4d0282ffaea871dcad9370988e246b275f2a` | `90f06a307df352d64a50381e88c191063eb3f102` |
| ` M` | `IMPLEMENTATION_LEDGER.md` | 580903 | `6ff769e133b393784a8065586a0e96b5b79fc0e517b5d3881fd1884156f89411` | `fcee7cf939fe2209d63f162d90e902c739159b47` |
| ` M` | `SECURITY.md` | 1212 | `4fb576f6d8f5e18ce247d9e476ea762a27ccfbe2ce72178aa705d0474b9d4030` | `4d9e4ccb8fad3a44d35a657a172caa5694b33aae` |
| ` M` | `config/developer-control-plane-requirements.json` | 4545 | `d14b6533c9e370e605c8c7b0fa9bb3824490d098108102850b965412b5622861` | `bbb1b03b96a1703c4dff8b3c9b0b03606f109f8c` |
| `??` | `docs/decisions/ADR-0015-developer-control-plane-foundation-controls.md` | 4054 | `714334b378a2e75f2e9366595a78d713f696dfefcaab6a512df4199b3bdac1ba` | `177b888581ba11e234118af1365381130e408b76` |
| `??` | `docs/privacy/developer-control-plane-data-handling.md` | 4641 | `de9558ae932cab6a8243cb3a7c5c6e8301fc82a31ccdd143fa8ae1f63f3dd37b` | `7bac9cd2ff6887ee99bbd6a543bfac2d1ae82c09` |
| `??` | `docs/security/developer-control-plane-threat-model.md` | 11893 | `3a14c7e95fcec2a856a7fe65172e5cb6fc13cd14118bfdcef4f0de5f87020d07` | `635b32981fd081338c31dab02a3f4ba192fc3cf9` |
| ` M` | `infrastructure/tower/developer-control-plane.intent.yaml` | 1166 | `c7ede1b3c6bdf256f8b57d20a041180fada5d0d8f5004d50ec5ab5ad85c52009` | `f6744782f5e8c6d66cedaff06958f6406674f439` |
| ` M` | `package.json` | 3739 | `adaf7497b22ef1a33cf2e4068c58d6d30b2807cd6e06c4982779c733cc9e803a` | `e9b5c1ebd11dd317c6ff335702582cfdd006d43f` |
| ` M` | `packages/config/src/env.ts` | 3254 | `65717deb01f86bf1ff653aa5f08b7864bcf4706b7d6d15e45b406a3ec0fc4b9c` | `3a6b94cf907b442382940de4d90c77bdd9a6825e` |
| `??` | `packages/developer-control-plane/migrations/0001_auth_schema.sql` | 4344 | `16e7c42f411d68415b9a5b12150b470d75e16811f8dcbd074f638c36a981fadf` | `0d06a401de736c5873f6f2c256e2ed1a87c9c9f1` |
| `??` | `packages/developer-control-plane/migrations/0002_control_schema.sql` | 4481 | `9d09e3f43dc3260818ae8662138665d0a0b3abf711629fa8eead957017558a9c` | `9569099f32e224272989d5f00eddf3f2d2ea219c` |
| `??` | `packages/developer-control-plane/migrations/0003_least_privilege_roles.sql` | 924 | `017e835ad20cc4986d9fe086b7ad4286e0894988fbbb2d89295314f264f7116f` | `676d896a4639d7bfcf781c00eb63072b0c6dadf0` |
| `??` | `packages/developer-control-plane/package.json` | 507 | `1ba7c6d8d4643f587f08e8782296e9b74eae4e39a36d93151f26cf9eab741ccf` | `20cbdb50d371bec2d590f18185d0b1481331f70a` |
| `??` | `packages/developer-control-plane/src/auth.ts` | 4463 | `005cfdd75f7a0f36cd74e5fb366fcf7e3ccd35a5b39c99b412e698ffba44261d` | `5f5abf1bd209e8772662561323d9226d792401b2` |
| `??` | `packages/developer-control-plane/src/fixtures.ts` | 3831 | `36157f636e8b094e5a88d8ff5a5fec271509996304b2bf45ca6a26866593546d` | `28757f526d954099d6a0bb11c2afd730ba4223db` |
| `??` | `packages/developer-control-plane/src/index.ts` | 129 | `012b8086fc1eb89bfb4f319fa9a9dc97b55d5a7bc9c53a5392c55fc855b029dd` | `0b13891257969985c9b7527e222761f6c0739ea6` |
| `??` | `packages/developer-control-plane/src/model.ts` | 3643 | `76c91ff2987357fc9ad0eb488533636781a5658f655bb849f27ed38be62d63b0` | `2aebe59107c822a520ada4760a89584ba055a81b` |
| `??` | `packages/developer-control-plane/src/rbac.ts` | 1964 | `a817fc3542438aaa68f057f31fa008a48b6d5a6eeae2c36d98cff5e1fc07e681` | `8961076627c251c1e12bb0620da15c5fb504c599` |
| `??` | `packages/developer-control-plane/src/retention.ts` | 1487 | `99121d2f3d19bd4636d52d0b7a321b43c23eae38b267aea0c84beb31f8990dc0` | `14242d22ac9489bc7a428bccc5d78c00e77f2057` |
| `??` | `packages/developer-control-plane/src/service.ts` | 12254 | `f7ab79fd869019dcd3ce437ebd94ec7d8daea8b8b4f7e19440d7f414b126493d` | `0feb94a9a53c789fb3203e1dd3e7ad1c9a90cb8e` |
| `??` | `packages/developer-control-plane/tsconfig.json` | 119 | `65d94a0c35d9c74e2ac623370a66aeb9b2e666e3656c6f6ebcac12a18e7c67e7` | `9bafd523af83884350e9263574a57c1121ba147b` |
| ` M` | `plans/11-implementation/01-phased-implementation-plan.md` | 7590 | `1c70c515c9774607ab4e1580051ca290544e03469280b6f427756dcd9ec1ce19` | `e14e136cd69f2ae5082a49fae4c391e602f4fa51` |
| ` M` | `plans/13-developer-control-plane/01-foundation-and-interface-contract.md` | 6174 | `d37f4fed6d02c9db4be850435b6adf74fddceb322d6f7ac4d07891483d707c8f` | `fe0061665c35e731e9ce177d13f309b330753b71` |
| ` M` | `pnpm-lock.yaml` | 307313 | `a594e85f49bf5fd0fd2cadce11be53c327a9d3cc9ada4af8a00c049a21cf9906` | `7880bbc9b96e9934a73d98ceda8b0c448cb0d1ab` |
| `??` | `scripts/developer-control-plane-architecture.ts` | 2819 | `758b270971cf5aa03ddf1515630dfa77feb5a67ad0279fec31ce9b20039758de` | `00cc2dbdc10f85a16d65acdc4c186a23f855d50b` |
| `??` | `scripts/developer-control-plane-migrations.ts` | 12223 | `ebc4e96ded76be624bba5c4b0688c61311cd1a238050f1498c4a29f12bbdca83` | `5039c035718b5ee4e2a3ad0baf88905f18b0106b` |
| ` M` | `scripts/developer-control-plane-requirements.ts` | 3003 | `adfd7e190579003106d60c2e8c828e1bb217e3c6b8fdeb702213b4b6af021540` | `4477a2bd5a6417e0c78627dce8cbe7daeadf727e` |
| `??` | `tests/developer-control-plane-foundation.test.ts` | 7363 | `8dc26e3db5b974d0bb81e214b5ff39767442d9c0a92b15d227deaffb743ff192` | `684fd2fc5ea87757d35fb9bbd9971137c175024f` |
| ` M` | `tests/developer-control-plane-requirements.test.ts` | 3744 | `51b9d9c841d337dd02f0528ebe912b7be3663b424513e62366abf4c6c3129c9b` | `4d5e6d28014076f1f5807a5c750a49343c414765` |
| `??` | `tests/developer-control-plane-security.test.ts` | 10682 | `1724e8263c7bf11efa381556543644759cc4cf6e2c964bdc1f17e8303c5e6b64` | `24b882e575ec8e65ef3cdd779060abc09ee454ee` |

The canonical source content root over path, committed byte length, SHA-256, and Git blob is `ad44b35d6238fd003f6d239752ffe96b362ba52ddde29e2ded4782223f991f09`.

## Preservation identities

The following historical receipt bytes were rechecked before staging and are unchanged after DCP1A_SOURCE:

| Receipt | SHA-256 | Git blob |
| --- | --- | --- |
| `notes/T008-receipt.md` | `51821FB8E446D00AA74A0F00F816F74CA04D98821F6066DD03A7DC9B9CEFA23C` | `cd9a100f18f456f0705e6a996f3de9668289503f` |
| `notes/T010-repair-receipt.md` | `8404C3435179623EB111528863C12CF6AFF9153D63413C36D6A126B9D8A1B001` | `27781f2c089751b3fc2a307659d917197e2ac1b3` |
| `notes/T011-repair-receipt.md` | `0E7B8EC99EADF650A7BD6EC25A5AC0E73F884FB02CA57FA6342B576B6461D48A` | `f73c5424d663bec6ed30803332850f31c34a8625` |

Protected RC3/release comparison against E was empty for `apps/web`, `.forgejo`, `.tower/project.yaml`, the RC3 goal, `LAUNCH_READINESS.md`, `RELEASE_EVIDENCE_HANDOFF.md`, `config/tower-evidence.json`, `.generated/launch`, visual snapshots, and deployment/release evidence. The 55 WEB-REQ status/blocker pairs remained equal to E: 40 `verified-local`, 4 `partial`, 10 `blocked-external`, and 1 `human-approval-pending`.

## Verification and boundary

- Exact pre-commit source preflight — pass.
- Explicit-path staging check — pass, 34 paths exactly.
- `git diff --cached --check` — pass with expected Windows LF/CRLF notices.
- `git diff-tree --no-commit-id --name-only -r DCP1A_SOURCE` — pass, exactly the 34 paths in this receipt.
- DCP1A_SOURCE parent/tree/identity — pass: parent E, tree `b3164882d9c71d7eb8f09cbd8bee7a4ddeb70e06`.
- Clean worktree and empty index after commit — pass.
- Exact tag check — pass, zero tags at DCP1A_SOURCE.
- Remote verification — pass as a read-only identity check; remote still points to E because no push was authorized.
- No board normalization, T012 creation/activation, provider/package activation, credential, network/provider call, live database, Tower, transport, route/UI, deployment, release, publication, production, or DCP-1B action occurred.

DCP1A_SOURCE is preserved as the authored DCP-1A local identity. The next authorized local step is DCP1A_BOARD: add this receipt, the GoalBuddy normalization receipt, and the normalized state using only those three board/evidence paths. T012 remains contingent on verified DCP1A_SOURCE and DCP1A_BOARD.
