# Hermes-First Roadmap

## Product Thesis

We are not rebuilding GithubStarsManager as a new product.

We are turning the existing project into a `Hermes-first developer memory layer`:

- Hermes is the primary UI and interaction surface.
- GithubStarsManager stays the data engine for stars, notes, AI enrichment, and releases.
- New engineering should stay in a thin glue layer unless a missing capability blocks dogfooding.

This keeps the project aligned with two constraints:

- minimum new code
- minimum long-chain infrastructure work

## Value Capture

The commercial wedge is not "another stars dashboard".

The wedge is:

- remember why a repo was starred
- recover the right repo quickly from a large history
- review release activity with lower noise

The preferred monetization path is:

1. Open source distribution and influence through a Hermes skill
2. White-glove services such as setup, taxonomy design, and workflow tuning
3. Optional hosted or premium add-ons only after real repeat usage exists

If monetization does not close quickly, the fallback is still valuable:

- build reputation around a credible Hermes-native workflow
- attract heavy GitHub users for user research
- create a visible open-source artifact that demonstrates product taste

## MVP

The MVP should only cover six user actions:

1. `health`
Confirm the local bridge is available and the data store is reachable.

2. `sync-stars`
Refresh starred repositories from GitHub through the existing backend proxy while preserving existing notes and AI fields.

3. `find`
Search starred repositories using a lightweight reranking pass over existing repo metadata.

4. `annotate`
Update why/status/tags on a starred repository using the existing custom fields.

5. `refresh-releases`
Refresh recent release data for tracked repositories through the existing backend proxy.

6. `digest`
Summarize recent releases for already-tracked repositories using locally stored release data.

## Explicit Non-Goals

The first Hermes-first iteration should not include:

- a rewritten React UI
- a new backend service
- a new schema unless necessary
- embeddings or a vector database
- team workspaces
- OpenClaw support
- Electron repair work

## Secondary-Development Rules

When adding glue code:

- prefer existing API routes over new backend routes
- preserve `custom_description`, `custom_tags`, and `custom_category`
- keep scripts standalone and easy to run with `node`
- treat the existing server as the canonical persistence layer

## Dogfood Loop

Use the skill personally every day for the following loop:

1. Run `sync-stars`
2. Ask Hermes to `find` a repo by intent
3. Add or refine one `annotate` note
4. Run `refresh-releases`
5. Review one `digest`

The first success criteria are behavioral:

- retrieval in under 10 seconds
- at least one useful note added per day
- at least one release-driven revisit per week

## Near-Term Milestones

### Week 1

- create the Hermes skill scaffold
- connect the skill to the existing backend
- verify local health, read, and patch flows

### Week 2

- dogfood with personal data
- refine command wording and output formatting
- interview 5-8 heavy GitHub users

### Week 3-4

- improve sync quality
- publish the skill as an open-source workflow if retention looks promising

## Publish Strategy

If usage is sticky:

- publish the Hermes skill and examples
- write a short narrative around "GitHub memory, not just GitHub stars"
- use the open-source release to recruit heavier users for deeper research

If usage is not sticky:

- keep the project open source
- narrow it further to the most-used command pair
- use it as a portfolio artifact and learning vehicle instead of forcing monetization
