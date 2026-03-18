# Fragrance Intelligence Model (FIM)

This document defines the structured "intelligence model" used to describe fragrances, map quiz answers to user profiles, and score fragrances against user profiles.

Goal: provide a single, implementation-ready schema with explicit allowed values and derivation rules that can be used consistently across:
- quiz UI + answer mapping
- recommendation scoring
- editorial/UX layer (identity, role visuals, explanations)

---

## 1. Core Dimensions

Each fragrance is represented as:

```ts
type FragranceIntelligence = {
  id: string; // catalog id (unique)

  // Required dimensions
  scent_family: ScentFamily;     // single value
  accords: AccordToken[];       // multi
  notes: NoteToken[];           // multi
  texture: TextureToken;        // single dominant texture
  vibe: VibeToken;              // single vibe label
  emotional_tone: ToneToken;   // single emotional tone label
  setting: SettingToken[];    // multi (maps to occasions)
  season: SeasonToken[];      // multi

  projection_1_5: 1 | 2 | 3 | 4 | 5; // numeric scale (derived)
  longevity_1_5: 1 | 2 | 3 | 4 | 5; // numeric scale (derived)

  familiarity: FamiliarityToken; // single
  style: StyleToken;            // single

  // Optional helper dimensions for matching/explanations
  gender: "masculine" | "feminine" | "unisex";
  // recommended for internal use:
  style_cluster: StyleCluster; // maps to catalog styleCluster
  price_tier: PriceTier;       // maps to catalog priceTier
}
```

### 1.1 scent_family (single)
Discrete, mutually exclusive families used by quiz + recommendation engine:
- `fresh`
- `sweet`
- `woody`
- `spicy`

These correspond to engine quiz `q1`/`family`.

### 1.2 accords (multi)
Atomic scent-matching tokens used for accord scoring.

Allowed tokens (implementation should treat tokens as strings; tokens may overlap semantically, but they are unique in the set):
- `citrus`
- `fresh`
- `aquatic`
- `green`
- `marine`
- `bergamot`
- `pineapple`
- `apple`
- `melon`
- `vanilla`
- `amber`
- `gourmand`
- `sweet`
- `tonka`
- `caramel`
- `rose`
- `floral`
- `jasmine`
- `tuberose`
- `peach`
- `musk`
- `clean`
- `iris`
- `sandalwood`
- `cedar`
- `vetiver`
- `wood`
- `woody`
- `oud`
- `leather`
- `spicy`
- `pepper`
- `oriental`
- `incense`
- `smoky`
- `leathery`
- `dry`

Notes:
- This set is intentionally "token-like" and supports the existing engine approach which matches via substring includes.
- If your catalog already stores accords using different wording, normalize them into these tokens.

### 1.3 notes (multi)
Notes are a finer-grain label set intended for UI and explanations.

Because your current catalog does not store full note pyramids (top/heart/base), you can derive `notes` from:
1) `profileHint` (split by `-`),
2) `accords` (as a fallback),
3) optionally `category`/`vibe` rules.

Allowed note tokens:
- Use the same token vocabulary as `accords` for now (notes can initially mirror accords).
- Later, you can split into more note-specific values (e.g., `cashmeran`, `rose absolute`) once you store real notes.

Implementation rule:
`notes = unique(profileHintTokens + accordsTokens)` then filter to allowed note tokens.

### 1.4 texture (single)
Dominant perceived texture for UX and explanation. Choose exactly one from:
- `airy`
- `watery`
- `creamy`
- `resinous`
- `dry`
- `powdery`
- `smoky`
- `leathery`
- `musky`

Derivation rules (deterministic):
- `watery`: if accords contain `aquatic` or `marine` or `sea salt`-like tokens (map to `aquatic`/`marine`).
- `creamy`: if accords contain `vanilla`, `milk`/`cashmeran`-like tokens (map those into `vanilla` until explicit tokens exist) or vibe indicates creamy warmth.
- `resinous`: if accords contain `amber`, `oud`, `incense`, `smoky`, or `oriental`.
- `smoky`: if accords contain `smoky`.
- `leathery`: if accords contain `leather` (or `leathery`).
- `powdery`: if accords contain `iris` and vibe is `timeless`/`clean` and accords do not indicate airy/watery.
- `dry`: if accords contain `wood`, `cedar`, `vetiver`, `oud`, `leather` but not `creamy`/`watery`.
- `musky`: if accords contain `musk` or vibe is `clean` with high cleanliness mapping.
- otherwise: use `airy` for fresh/clean leaning and `dry` as fallback.

### 1.5 vibe (single)
Vibe labels used for synonym scoring in `engine.ts`.
Allowed values:
- `clean`
- `fresh`
- `seductive`
- `adventurous`
- `timeless`
- `mysterious`
- `warm`

Disambiguation guidance:
- `clean` = minimal/skin-clean/musky-clean/iris-leaning.
- `fresh` = bright citrus/aquatic/ozonic leaning.

### 1.6 emotional_tone (single)
Emotional tone for editorial copy (what the user "feels" wearing).
Allowed values (mutually exclusive labels):
- `confident`
- `relaxed`
- `bold`
- `intimate`
- `refined`
- `romantic`
- `mysterious`
- `dramatic`
- `playful`

Derivation rules (deterministic, based on catalog attributes):
1. If projection_1_5 is 5 or longevity_1_5 is 5 and (vibe in `seductive`/`mysterious`/`warm`) => `bold` or `dramatic`.
2. Else if vibe in `clean` and texture is `musky` => `intimate` or `relaxed` depending on projection.
3. Else if vibe is `timeless` => `refined`.
4. Else if vibe is `seductive` or `romantic` signals via accords (`vanilla`, `amber`, `rose`) => `romantic` (prefer `romantic` if accords include `rose` and projection != 5).
5. Else if accords include `citrus`/`aquatic` => `relaxed` or `playful` (playful when projection >= 3).
6. Default fallback => `confident`.

### 1.7 setting (multi)
Where the user wears scent, mapped from quiz q5/context and catalog `occasions`.
Allowed values:
- `office`
- `casual`
- `date_night`
- `formal`
- `vacation_travel`
- `weekend`
- `nightlife`
- `summer`

Mapping guidance:
- catalog `occasions` tags already use: `office`, `casual`, `date`, `formal`, `summer`, `evening`.
- Normalize:
  - `date` -> `date_night`
  - `evening` -> `date_night` (or `nightlife` if `vibe` is adventurous/mysterious)
  - `summer` -> `summer`
- For quiz:
  - context_everyday/context_professional -> `office` + `casual`
  - context_dates -> `date_night`
  - context_nightlife -> `nightlife`
  - context_special -> `formal` + `weekend`

### 1.8 season (multi)
Allowed values:
- `spring`
- `summer`
- `fall`
- `winter`
- `all`

Derive from catalog `seasons` field (or `[]` -> empty).
For scoring, if `all` is present, treat as matching everything.

### 1.9 projection_1_5 (numeric)
Your catalog uses `projection` strings: `intimate | moderate | strong | bold | soft`.

Allowed numeric scale:
- `1` = intimate
- `2` = moderate / soft
- `3` = strong
- `4` = bold
- `5` = very bold / maximal (use `strong` or `bold` until you add a "very strong" token)

Derivation:
- if projection is `intimate` => 1
- if projection is `moderate` or `soft` => 2
- if projection is `strong` => 3
- if projection is `bold` => 4
- if projection is missing => 2 (neutral default)

### 1.10 longevity_1_5 (numeric)
Your catalog uses `longevity` strings: `short | moderate | long`.

Allowed numeric scale:
- `1` = short
- `3` = moderate
- `5` = long
- (missing => 3)

If you need a full 1–5 scale later, interpolate (e.g., moderate => 3, long => 5).

### 1.11 familiarity (single)
Used for editorial + "mass appeal" filtering. Choose exactly one:
- `mass_appeal` (broadly recognized / easy buy)
- `distinctive` (recognizable niche with a clear signature)
- `niche_collectable` (artistic/rare; often higher cost)
- `challenging` (polarizing, smoky/oud/incense extremes or very strong personality)

Derivation rules:
- If price_tier in (`designer`, `luxury`) and vibe not `mysterious` => `mass_appeal`
- If price_tier in (`niche`, `ultra-niche`) => `niche_collectable`
- If texture is `smoky` or accords include `oud`/`incense` and projection_1_5 >= 4 => `challenging`
- Otherwise => `distinctive`

### 1.12 style (single)
Editorial style tokens (must be mutually exclusive labels):
- `minimal`
- `luxurious`
- `artistic`
- `bold`

Derivation:
- If style_cluster includes `fresh-clean` and texture is `airy` => `minimal`
- If price_tier in (`luxury`, `niche`, `ultra-niche`) and vibe is `timeless` => `luxurious`
- If vibe is `mysterious` or `adventurous` OR accords include unusual `smoky/incense/oud/leather` => `artistic`
- If projection_1_5 >= 4 OR cluster in (`date-night`, `spicy-oriental`, `dark-woody`) => `bold`

---

## 2. Allowed Values Summary (No duplicates in each set)

This section is a compact index of allowed values.

### 2.1 scent_family
- fresh
- sweet
- woody
- spicy

### 2.2 vibe
- clean
- fresh
- seductive
- adventurous
- timeless
- mysterious
- warm

### 2.3 texture
- airy
- watery
- creamy
- resinous
- dry
- powdery
- smoky
- leathery
- musky

### 2.4 emotional_tone
- confident
- relaxed
- bold
- intimate
- refined
- romantic
- mysterious
- dramatic
- playful

### 2.5 setting
- office
- casual
- date_night
- formal
- vacation_travel
- weekend
- nightlife
- summer

### 2.6 season
- spring
- summer
- fall
- winter
- all

### 2.7 projection_1_5
- 1, 2, 3, 4, 5

### 2.8 longevity_1_5
- 1, 2, 3, 4, 5 (but initial derivation uses 1/3/5)

### 2.9 familiarity
- mass_appeal
- distinctive
- niche_collectable
- challenging

### 2.10 style
- minimal
- luxurious
- artistic
- bold

---

## 3. Quiz Answer Mapping -> Model Categories

This section documents how the existing quiz answers (`q1`..`q9`) map into user profile categories.

The mapping follows `src/lib/quizToEngineMap.ts` and `src/lib/recommendations/userPreferenceProfile.ts`.

### 3.1 Inputs from quiz
- `q1`: environment choice (paris_coffee | soho_gallery | mediterranean | rooftop_night | rainy_bookstore)
- `q2`: presentation choice (clean_minimal | classic_polished | bold_fashion | creative_unconventional | relaxed_effortless)
- `q3`: reaction choice (impression_* values)
- `q4`: projection/presence (presence_aura | presence_subtle | presence_memorable | presence_bold)
- `q5`: social context (context_* values)
- `q6`: climate (climate_* values)
- `q7`: what ruins fragrance (turnoff_sweet | turnoff_powdery | turnoff_heavy | turnoff_sharp | turnoff_loud)
- `q8`: scent direction (scent_* values)
- `q9`: gender leaning (gender_* values)
- `q11`: genderPreference (masculine | feminine | unisex | open) - derived from q9

### 3.2 scent_family mapping
Two signals are used; strongest wins:
1) `q8` (scent direction) maps to family via:
   - citrus/green/clean musks -> `fresh`
   - amber spice/vanilla warmth -> `spicy` or `sweet` (per map)
   - smoky/incense -> `woody`
2) fallback `q1` (environment) maps to family:
   - paris_coffee -> sweet
   - soho_gallery or mediterranean -> fresh
   - rooftop_night -> spicy
   - rainy_bookstore -> woody

### 3.3 setting mapping
`q5` maps to engine `q2`:
- context_everyday/context_professional -> `daily` (engine)
- context_dates -> `date`
- context_special -> `all`
- context_nightlife -> `nightlife`

User profile `setting[]` is then normalized:
- `daily` -> office + casual
- `date` -> date_night
- `nightlife` -> nightlife
- `all` -> formal + weekend + date_night

### 3.4 vibe mapping
`vibe` is derived from:
- `q2` (style/presentation) and `q3` (reaction/impression)

Algorithm (matches `deriveVibe()`):
1. If q3 is set, map impression_* to vibe:
   - impression_clean -> clean
   - impression_intriguing -> adventurous
   - impression_attractive -> seductive
   - impression_expensive -> timeless
   - impression_fresh -> clean
2. Otherwise map q2 to vibe:
   - clean_minimal -> clean
   - classic_polished -> timeless
   - bold_fashion/creative_unconventional -> adventurous
   - relaxed_effortless -> clean
3. Default -> timeless

### 3.5 season mapping
`q6` climate maps to user preferred seasons:
- climate_summer -> [summer]
- climate_spring -> [spring]
- climate_autumn -> [fall]
- climate_winter -> [winter]
- climate_all -> empty (no season scoring boost)

### 3.6 projection mapping
`q4` maps presence to projection (engine `userProjection`):
- presence_aura -> intimate
- presence_subtle -> moderate
- presence_memorable -> strong
- presence_bold -> strong

In the FIM numeric scale:
- intimate => 1
- moderate => 2
- strong => 3

### 3.7 longevity mapping
Initial engine derives longevity preference:
- q7 == turnoff_heavy => short
- otherwise => day (moderate/long boost)

In numeric scale:
- short => 1
- day => target moderate/long depending on catalog

### 3.8 familiarity + style preference mapping (recommended)
Your current engine does not store explicit user familiarity/style preferences.
For implementation, you can derive:
- familiarity preference: if q5 maps to `niche` designerNiche (q5 creative_unconventional),
  increase probability of distinctive/niche_collectable results in editorial role selection.
- style preference: align with vibe and projection:
  - clean/fresh -> minimal
  - warm/seductive -> luxurious
  - adventurous/mysterious -> artistic
  - bold projection -> bold

---

## 4. Constructing a User Profile from Quiz Answers

The current implementation constructs numeric profile scores via `getUserPreferenceProfile()`.

### 4.1 UserPreference profile scores (0–100)
The engine uses this numeric profile for alignment scoring:

```ts
type UserPreferenceProfileScores = {
  freshness: number;     // 0..100
  warmth: number;        // 0..100
  sweetness: number;     // 0..100
  woodiness: number;     // 0..100
  spice: number;         // 0..100
  cleanliness: number;   // 0..100
  sensuality: number;   // 0..100
  versatility: number;  // 0..100
}
```

### 4.2 Numeric dimensions -> Quiz mapping
Matches `src/lib/recommendations/userPreferenceProfile.ts`:
- family controls freshness/warmth/sweetness/woodiness/spice
- vibe controls cleanliness and sensuality (and some freshness/warmth)
- occasion controls versatility and sometimes sensuality
- avoidSweet:
  - sets sweetness=0 and caps warmth at 40

This numeric profile is used by alignment scoring in the engine.

### 4.3 Additional non-numeric preferences used by the engine
Alongside numeric alignment, the engine uses:
- genderPreference (q11)
- userPreferredSeasons (from q6)
- userProjection (from q4)
- userPreferredPriceTiers (from q4 budget; currently set to mid unless you wire in)
- avoidSweet (from q7)
- quizAnswers.q5 to influence style cluster selection for niche role scoring (engine role logic)

---

## 5. Scoring Fragrance vs User Profile

This section documents how `src/lib/recommendations/engine.ts` scores each fragrance candidate.

### 5.1 Inputs
For each fragrance `f` in catalog:
- accords, seasons, occasions, vibe, longevity, projection
- styleCluster
- priceTier
- gender
- category (used to match missing categories)
- sweetness signal from `getFragranceProfile(f)`

User inputs:
- genderPreference
- userAccords (from quiz family)
- userOccasions (from quiz occasion)
- userVibe
- userProjection
- userPreferredSeasons
- userPreferredStyleClusters
- userPreferredPriceTiers
- missingCategories
- avoidSweet
- userPrefProfile numeric scores

### 5.2 Base scoring: "rule points"
The engine starts with `s = 0`, then applies:
1) Gender match:
   - same gender => +SCORE_GENDER
   - non-unisex mismatch => -PENALTY_GENDER_MISMATCH

2) Accord matching:
   - count accord intersections between `userAccords` and `f.accords`
   - score scales by matchCount (capped)

3) Season match:
   - if any f.seasons matches userPreferredSeasons => +SCORE_SEASON

4) Occasions:
   - count intersection between `f.occasions` and userOccasions
   - score scales by matchCount (capped)

5) Vibe matching:
   - exact vibe => +SCORE_VIBE_STRONG
   - synonym vibe => +SCORE_VIBE_SYNONYM

6) Projection:
   - exact => +SCORE_PROJECTION
   - "opposite" adjustments using intimate/strong compatibility => penalties/boosts

7) Longevity:
   - match => +SCORE_LONGEVITY
   - mismatch => penalties (if user wants short)

8) Style cluster:
   - if f.styleCluster in userPreferredStyleClusters => +SCORE_STYLE_CLUSTER

9) Price tier:
   - if f.priceTier in userPreferredPriceTiers => +SCORE_PRICE_TIER

10) Gap category match:
   - if fragrance category matches any missingCategories => +SCORE_GAP_CATEGORY

11) Avoid sweet:
   - if avoidSweet and fragrance sweetness is high => subtract PENALTY_AVOID_SWEET

12) Numeric alignment scoring:
   - compute `fragProfile` (0..100) via `getFragranceProfile(f)`
   - alignment = sum over:
     `freshness, warmth, sweetness, woodiness, spice, cleanliness, sensuality, versatility`
   - per-key alignment uses distance between userPrefProfile and fragProfile:
     `max(0, 5 - abs(diff)/20)`
   - add min(SCORE_ALIGNMENT_MAX, rounded alignment)

Final `s` is the main score used for:
- candidate pool truncation
- role-based selection tie-breaking

### 5.3 Candidate pool and role selection
After scoring, the engine:
- sorts by `s` descending
- keeps top N (current implementation uses a role-aware pool)
- runs diversity/role selection while enforcing:
  - uniqueness
  - not-too-similar fragrances
  - one pick per role

The role selection itself is layered "on top" of scoring, not a replacement.

---

## 6. Implementation Notes / Guarantees

### 6.1 "No duplicates or overlaps" policy
- Allowed values lists in this document contain unique strings (no duplicates).
- For categorical dimensions that are conceptually overlapping (e.g., vibe "clean" vs "fresh"), the document defines **explicit disambiguation rules** so a single allowed label is chosen deterministically.

### 6.2 Derivation is deterministic
- texture, projection_1_5, longevity_1_5, emotional_tone, familiarity, style are derived from existing catalog fields and/or profileHint.

### 6.3 Non-breaking adoption
You can adopt this model incrementally:
1) store/derive only the fields already available in catalog (accords, seasons, vibe, projection, longevity, styleCluster, priceTier)
2) derive missing dimensions (notes, texture, emotional_tone, familiarity, style) as helper fields
3) reuse those derived fields for UI/editorial (identity/roles) without changing recommendation logic

---

## 7. Quick Reference Tables

### 7.1 Projection mapping (string -> numeric)
- intimate => 1
- moderate/soft => 2
- strong => 3
- bold => 4
- missing => 2

### 7.2 Longevity mapping (string -> numeric)
- short => 1
- moderate => 3
- long => 5
- missing => 3

