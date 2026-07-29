# Posterverse — Shopify Theme

The production storefront theme for **Posterverse** (stickers, posters, creative cards, brand labels).

Built on [Shopify Dawn](https://github.com/Shopify/dawn) 15.5.0 — see [LICENSE.md](LICENSE.md).

> **Theme files live at the repository root on purpose.** Shopify's GitHub integration
> can only connect branches whose root matches the default theme folder structure.
> Do not move them into a subdirectory.

## Related repository

| Repo | Contents |
|---|---|
| [posterverse](https://github.com/kartik1605/posterverse) | Static design prototype, original sticker artwork, product catalog, design tokens |
| **posterverse-theme** (this repo) | The live Shopify theme |

## Local development

Requires the Shopify CLI and an interactive login to your store:

```bash
shopify theme dev --store your-store.myshopify.com
```

## Connecting to Shopify

Shopify admin → **Online Store → Themes → Add theme → Connect from GitHub**, then pick
this repository and the `main` branch.

The integration is **bidirectional**: edits made in Shopify's theme editor are committed
back to the connected branch. Pull before starting local work:

```bash
git pull origin main
```

## Design system

Tokens and conventions are documented in the prototype repo's `CLAUDE.md`. Summary:

```
--cream #FAF4EB   --ink #17130E    --orange #FF5C1F
--violet #6C3BF4  --teal #0FA3A3   --yellow #FFC229   --pink #FF8FC7
Display: Unbounded (700/800)   Body: Space Grotesk
```

Dark surfaces use `#120E18`–`#221338` gradients with violet/orange radial glows.
Cards use a 3px ink border with a hard offset shadow — never soft-only shadows.

**Original artwork only.** No competitor designs, no third-party trademarked IP.

## Upstream Dawn docs

Dawn's own documentation, contribution guide and release notes live at
[Shopify/dawn](https://github.com/Shopify/dawn). Upstream CI and issue templates were
removed from this repo since they target Shopify's own project, not this store.
