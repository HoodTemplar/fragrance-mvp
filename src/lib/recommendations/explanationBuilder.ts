/**
 * Builds "why this for you" explanations tied to real catalog data:
 * accords, profileHint, notes, and taxonomy enrichment—not generic copy.
 */

import type { CatalogFragrance } from "@/data/fragranceCatalog";
import { getWeightedAccordsForCatalog } from "@/data/fragranceCatalog";
import { ACCORDS, PRIMARY_FAMILIES } from "@/data/taxonomy";
import type { FragranceProfileScores } from "./fragranceProfile";
import { getFragranceTaxonomyFeatures } from "./taxonomyEnrichment";

export interface UserContext {
  family: string;
  occasion: string;
  vibe: string;
  userProjection?: string;
  missingCategories: string[];
}

function norm(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

function oxfordJoin(items: string[]): string {
  const x = items.filter(Boolean);
  if (x.length === 0) return "";
  if (x.length === 1) return x[0]!;
  if (x.length === 2) return `${x[0]} and ${x[1]}`;
  return `${x.slice(0, -1).join(", ")}, and ${x[x.length - 1]}`;
}

/** Short note line for prose (avoid dumping long JSON-ish strings). */
function clipNoteLine(raw: string, max = 48): string {
  const t = raw.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}

function dedupeSimilarLabels(labels: string[]): string[] {
  const out: string[] = [];
  for (const lab of labels) {
    const n = norm(lab);
    if (!n) continue;
    const dup = out.some((o) => {
      const on = norm(o);
      if (on === n) return true;
      if (on.length >= 4 && (n.includes(on) || on.includes(n))) return true;
      return false;
    });
    if (!dup) out.push(lab);
  }
  return out.slice(0, 5);
}

type ScentEvidence = {
  /** Human labels for sentence (taxonomy preferred, then catalog strings). */
  accordLabels: string[];
  noteSnippets: string[];
  profileHint: string;
  taxonomyFamilies: string[];
  hasTaxonomy: boolean;
  noteDerived: boolean;
};

function gatherScentEvidence(f: CatalogFragrance): ScentEvidence {
  const rawHint = (f.profileHint ?? "").replace(/\s+/g, " ").trim();
  const profileHint = rawHint ? clipNoteLine(rawHint, 80) : "";
  const notes = (f.notes ?? [])
    .map((x) => clipNoteLine(String(x ?? "")))
    .filter((x) => x.length > 2 && !/^[\[{]/.test(x));

  const weighted = [...getWeightedAccordsForCatalog(f)].sort((a, b) => b.weight - a.weight);
  const rawAccordLabels = weighted
    .map((w) => w.label.trim())
    .filter((x) => x.length > 0)
    .slice(0, 6);

  const tax = getFragranceTaxonomyFeatures(f);
  const taxLabels: string[] = [];
  let noteDerived = false;
  if (tax?.accordActivations?.length) {
    noteDerived = tax.hasNoteDerivedAccords;
    for (const a of tax.accordActivations.slice(0, 6)) {
      const def = ACCORDS[a.accordId];
      if (def?.label) taxLabels.push(def.label);
    }
  }

  const merged =
    tax && tax.confidence >= 0.22 && taxLabels.length > 0
      ? dedupeSimilarLabels([...taxLabels, ...rawAccordLabels])
      : dedupeSimilarLabels([...rawAccordLabels, ...taxLabels]);

  const taxonomyFamilies: string[] = [];
  if (tax?.primaryFamilyIds?.length) {
    for (const id of tax.primaryFamilyIds.slice(0, 2)) {
      const fam = PRIMARY_FAMILIES[id];
      if (fam?.label) taxonomyFamilies.push(fam.label);
    }
  }

  return {
    accordLabels: merged.slice(0, 4),
    noteSnippets: notes.slice(0, 2),
    profileHint,
    taxonomyFamilies: dedupeSimilarLabels(taxonomyFamilies).slice(0, 2),
    hasTaxonomy: !!(tax && tax.confidence >= 0.22),
    noteDerived,
  };
}

function categoryBroadFamily(cat: string): string | null {
  const c = norm(cat);
  if (!c) return null;
  if (/fresh|aquatic|citrus|green|marine/.test(c)) return "Fresh";
  if (/wood|woody|cedar|vetiver|sandal|oud/.test(c)) return "Woody";
  if (/floral|rose|iris|jasmine/.test(c)) return "Floral";
  if (/amber|gourmand|vanilla|sweet/.test(c)) return "Amber";
  if (/oriental|spice|leather|incense/.test(c)) return "Oriental";
  return null;
}

function missingTouchesFragrance(missing: string[], cat: string): string | null {
  const broad = categoryBroadFamily(cat);
  if (!broad) return null;
  for (const m of missing) {
    const n = norm(m);
    if (n.includes("fresh") && broad === "Fresh") return "Fresh";
    if ((n.includes("wood") || n.includes("woody")) && broad === "Woody") return "Woody";
    if (n.includes("floral") && broad === "Floral") return "Floral";
    if ((n.includes("amber") || n.includes("oriental") || n.includes("gourmand")) && (broad === "Amber" || broad === "Oriental"))
      return broad;
    if (n.includes("oriental") && broad === "Oriental") return "Oriental";
  }
  return null;
}

function dominantProfileAxis(p: FragranceProfileScores): keyof FragranceProfileScores {
  const keys: (keyof FragranceProfileScores)[] = [
    "freshness",
    "warmth",
    "woodiness",
    "spice",
    "sweetness",
    "cleanliness",
    "sensuality",
  ];
  let best: keyof FragranceProfileScores = "versatility";
  let v = -1;
  for (const k of keys) {
    if (p[k] > v) {
      v = p[k];
      best = k;
    }
  }
  return best;
}

function axisPhrase(axis: keyof FragranceProfileScores, ev: ScentEvidence): string | null {
  const [a1, a2] = ev.accordLabels;
  const hint = ev.profileHint ? ` (${ev.profileHint})` : "";
  switch (axis) {
    case "freshness":
      return a1
        ? `The fresh side here is carried by ${a1}${a2 ? ` and ${a2}` : ""}, not just a vague “clean” label.`
        : null;
    case "warmth":
      return a1
        ? `Warmth shows up in ${oxfordJoin(ev.accordLabels.slice(0, 2))}${hint}.`
        : null;
    case "woodiness":
      return a1
        ? `Wood and structure read through ${oxfordJoin(ev.accordLabels.slice(0, 2))}.`
        : null;
    case "spice":
      return a1
        ? `Spice and depth come from ${oxfordJoin(ev.accordLabels.slice(0, 2))}.`
        : null;
    case "sweetness":
      return a1
        ? `Sweetness is anchored in ${a1}${a2 ? ` and ${a2}` : ""} rather than generic sugar.`
        : null;
    case "cleanliness":
      return a1
        ? `It stays tidy on skin: ${oxfordJoin(ev.accordLabels.slice(0, 2))} keep the silhouette crisp.`
        : null;
    case "sensuality":
      return a1
        ? `Skin-close presence leans on ${oxfordJoin(ev.accordLabels.slice(0, 2))}.`
        : null;
    default:
      return null;
  }
}

/**
 * Why this fragrance for this user: cites accords, profileHint, notes, taxonomy;
 * user hooks name quiz inputs only when tied to those facts.
 */
export function buildRecommendationExplanation(
  user: UserContext,
  f: CatalogFragrance,
  fragranceProfile: FragranceProfileScores
): string {
  const name = f.name;
  const category = (f.category ?? "").trim();
  const catNorm = norm(category);
  const ev = gatherScentEvidence(f);
  const fragVibe = norm(f.vibe ?? "");
  const fragProj = norm(f.projection ?? "");

  const sentences: string[] = [];

  // 1) This bottle, specifically — accords / hint / notes / taxonomy
  const accordPhrase = oxfordJoin(ev.accordLabels.slice(0, 3));
  const notePhrase = oxfordJoin(ev.noteSnippets);
  const famPhrase = oxfordJoin(ev.taxonomyFamilies);

  if (accordPhrase && ev.profileHint) {
    sentences.push(
      `${name} is structured around ${accordPhrase}, with our notes marking it as ${ev.profileHint}.`
    );
  } else if (accordPhrase && notePhrase) {
    const noteSource = ev.noteDerived ? "note-derived mapping" : "listed notes";
    sentences.push(
      `${name} centers on ${accordPhrase}; ${noteSource} also highlight ${notePhrase}.`
    );
  } else if (accordPhrase) {
    sentences.push(`${name} is built around ${accordPhrase}.`);
  } else if (ev.profileHint) {
    sentences.push(`${name} is catalogued as ${ev.profileHint}${category ? ` under ${category}` : ""}.`);
  } else if (notePhrase) {
    sentences.push(`${name} lists ${notePhrase} among its note lines${category ? ` (${category})` : ""}.`);
  } else if (famPhrase && ev.hasTaxonomy) {
    sentences.push(
      `${name} maps most closely to ${famPhrase} in our accord taxonomy${category ? ` (${category})` : ""}.`
    );
  } else if (category) {
    sentences.push(`${name} is classified as ${category} in the catalog${ev.taxonomyFamilies.length ? `, leaning ${famPhrase}` : ""}.`);
  }

  // 2) Dominant axis from scored profile + accord anchor (differentiates similar SKUs)
  const axis = dominantProfileAxis(fragranceProfile);
  if (fragranceProfile[axis] >= 52) {
    const ax = axisPhrase(axis, ev);
    if (ax) sentences.push(ax);
  }

  // 3) Collection gap — only when fragrance actually fills that family, with named accords
  const gap = missingTouchesFragrance(user.missingCategories, category);
  if (gap && ev.accordLabels.length > 0) {
    sentences.push(
      `You’re light on ${gap} in the current lineup; ${ev.accordLabels[0]}${ev.accordLabels[1] ? ` and ${ev.accordLabels[1]}` : ""} push this pick in that direction.`
    );
  } else if (gap && ev.profileHint) {
    sentences.push(
      `You’re light on ${gap}; this bottle’s ${ev.profileHint} profile helps cover that hole without duplicating what you already own.`
    );
  }

  // 4) Occasion — tie to catalog occasions + concrete materials
  const occ = user.occasion;
  const occHook = ev.accordLabels[0] ?? ev.profileHint;
  if (occ === "date" && (f.occasions.includes("date") || f.occasions.includes("evening"))) {
    if (fragranceProfile.sensuality > 52 && occHook) {
      sentences.push(
        `For dates and evenings, ${occHook} gives it presence without reading as a generic “club” bomb.`
      );
    } else if (occHook) {
      sentences.push(`For dates, ${occHook} keeps it memorable but still controlled on skin.`);
    }
  } else if (occ === "daily" && (f.occasions.includes("office") || f.occasions.includes("casual"))) {
    if (occHook) {
      sentences.push(
        `For daily and office wear, ${occHook} keeps the wearing experience straightforward—easy to repeat without fatigue.`
      );
    }
  } else if (occ === "nightlife" && f.occasions.includes("evening")) {
    if (occHook) {
      sentences.push(`For nights out, ${occHook} carries enough weight to read past crowded air.`);
    }
  }

  // 5) Projection — only with fragrance projection field + scent anchor
  const userProj = user.userProjection;
  if (userProj && fragProj && occHook) {
    if (userProj === "intimate" && (fragProj === "intimate" || fragProj === "soft" || fragProj === "moderate")) {
      sentences.push(
        `You asked for softer projection; this one is labeled ${f.projection}, and ${occHook} tends to sit closer than loud amber-leather blockbusters.`
      );
    } else if (userProj === "strong" && (fragProj === "strong" || fragProj === "bold")) {
      sentences.push(
        `You wanted more trail; catalog projection is ${f.projection}, and ${occHook} is what people actually smell past arm’s length.`
      );
    } else if (fragProj === "moderate" && occHook) {
      sentences.push(`Projection is marked ${f.projection}, so ${occHook} stays noticeable without filling a whole room.`);
    }
  }

  // 6) Quiz family / vibe — must cite a concrete catalog signal, not “your vibe” alone
  const vibe = user.vibe;
  const family = user.family;
  if (vibe === "clean" && (fragranceProfile.cleanliness > 52 || fragVibe.includes("clean") || fragVibe.includes("fresh"))) {
    if (ev.accordLabels.length) {
      sentences.push(
        `Your quiz skews clean; here that shows up as ${oxfordJoin(ev.accordLabels.slice(0, 2))}${fragVibe ? ` (${f.vibe})` : ""}, not a blank “fresh” placeholder.`
      );
    } else if (fragVibe) {
      sentences.push(`Your quiz skews clean; the bottle’s “${f.vibe}” character matches that brief.`);
    }
  } else if (vibe === "seductive" && (fragranceProfile.sensuality > 52 || fragranceProfile.warmth > 52)) {
    if (ev.accordLabels.length) {
      sentences.push(
        `You leaned seductive/warm; ${oxfordJoin(ev.accordLabels.slice(0, 2))} supply the heat and skin presence.`
      );
    }
  } else if (vibe === "timeless" && (fragVibe.includes("classic") || fragVibe.includes("refined") || fragranceProfile.versatility > 58)) {
    if (ev.accordLabels.length) {
      sentences.push(
        `For a timeless brief, ${oxfordJoin(ev.accordLabels.slice(0, 2))} keeps the shape familiar and wearable year over year.`
      );
    } else if (fragVibe) {
      sentences.push(`The “${f.vibe}” styling here matches a timeless, non-trend-chasing brief.`);
    }
  } else if (family === "fresh" && fragranceProfile.freshness > 58 && ev.accordLabels.length) {
    sentences.push(`Fresh family preference lines up with ${oxfordJoin(ev.accordLabels.slice(0, 2))} in this formula.`);
  } else if (family === "woody" && fragranceProfile.woodiness > 52 && ev.accordLabels.length) {
    sentences.push(`Wood-forward taste matches ${oxfordJoin(ev.accordLabels.slice(0, 2))} here.`);
  } else if (family === "sweet" && fragranceProfile.warmth > 50 && fragranceProfile.sweetness > 42 && ev.accordLabels.length) {
    sentences.push(`Gourmand-leaning taste tracks to ${oxfordJoin(ev.accordLabels.slice(0, 2))} in the blend.`);
  } else if (family === "spicy" && fragranceProfile.spice > 52 && ev.accordLabels.length) {
    sentences.push(`Spice-forward preference shows up in ${oxfordJoin(ev.accordLabels.slice(0, 2))}.`);
  }

  if (sentences.length === 0) {
    const tail = category ? `${category}` : "this style lane";
    return `${name} is slotted as ${tail} from catalog metadata; add accords or notes to the record for richer, bottle-specific copy.`;
  }

  return sentences.join(" ");
}
