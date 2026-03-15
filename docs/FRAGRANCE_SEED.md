# Fragrance catalog seed

The starter dataset lives in **`src/data/fragranceCatalogSeed.ts`**.

## Structure

Each entry in `FRAGRANCE_SEED` has:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique slug (e.g. `bleu-de-chanel`). Use lowercase, hyphens. |
| `name` | string | Fragrance name |
| `brand` | string | Brand / house name |
| `scentFamily` | ScentFamily | One of: Fresh, Fresh Aquatic, Fresh Citrus, Fresh Woody, Fresh Spicy, Woody, Woody Citrus, Floral, Floral Woody, Amber, Oriental, Leather, Green, Skin Scent |
| `topNotes` | string[] | Top notes (e.g. `["Bergamot", "Citrus"]`) |
| `middleNotes` | string[] | Heart notes |
| `baseNotes` | string[] | Base notes |
| `vibeTags` | string[] | Vibe descriptors (e.g. clean, bold, versatile) |
| `seasonTags` | SeasonTag[] | `spring`, `summer`, `fall`, `winter` |
| `occasionTags` | OccasionTag[] | `office`, `casual`, `date`, `formal`, `summer`, `evening` |
| `priceTier` | PriceTier | `budget`, `mid`, `luxe`, `niche` |
| `designerOrNiche` | DesignerOrNiche | `designer` or `niche` |

## Adding more fragrances

1. Open `src/data/fragranceCatalogSeed.ts`.
2. Copy an existing object inside `FRAGRANCE_SEED`.
3. Give it a new unique `id` (e.g. `my-new-fragrance`).
4. Fill in `name`, `brand`, `scentFamily`, notes arrays, tags, `priceTier`, `designerOrNiche`.
5. Add a trailing comma after the previous entry.

If you add a new **scent family** or **tag** value, extend the exported types at the top of the seed file (`ScentFamily`, `OccasionTag`, etc.) so TypeScript stays in sync.

## Using the seed

- **Recommendation engine:** The current engine in `src/data/fragranceCatalog.ts` uses a slimmer format (id, name, brand, category, occasions, budgetTier, designerNiche, profileHint). You can derive that from the seed (e.g. `scentFamily` → category, `occasionTags` → occasions, `priceTier` → budgetTier) or keep both files and sync manually.
- **Database:** Use `FRAGRANCE_SEED` in a seed script or migration to populate a `fragrances` table.
- **UI:** Import and map the seed for detail pages, filters, or search.
