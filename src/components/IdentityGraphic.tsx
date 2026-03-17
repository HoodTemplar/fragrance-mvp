"use client";

/**
 * Cinematic identity reveal graphic: gradient orbs/blur that match the archetype.
 * Maps archetype id → visual theme (dark, fresh, warm, bold); each theme has its own gradient and glow.
 */

type IdentityVisualTheme = "dark" | "fresh" | "warm" | "bold";

const ARCHETYPE_TO_VISUAL: Record<string, IdentityVisualTheme> = {
  coastal_philosopher: "fresh",
  velvet_alchemist: "warm",
  silver_minimalist: "fresh",
  shadow_poet: "dark",
  modern_aristocrat: "bold",
  sunlit_nomad: "fresh",
  night_architect: "bold",
  quiet_collector: "warm",
};

const THEME_STYLES: Record<
  IdentityVisualTheme,
  {
    orb1: string;
    orb2: string;
    orb3?: string;
    glowColor: string;
  }
> = {
  dark: {
    orb1: "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(88, 28, 135, 0.35) 0%, transparent 60%)",
    orb2: "radial-gradient(ellipse 60% 80% at 70% 60%, rgba(30, 15, 45, 0.5) 0%, transparent 55%)",
    orb3: "radial-gradient(circle at 30% 70%, rgba(75, 0, 130, 0.2) 0%, transparent 50%)",
    glowColor: "rgba(139, 92, 246, 0.15)",
  },
  fresh: {
    orb1: "radial-gradient(ellipse 90% 50% at 50% 20%, rgba(200, 230, 245, 0.5) 0%, transparent 55%)",
    orb2: "radial-gradient(ellipse 70% 70% at 60% 50%, rgba(180, 220, 235, 0.35) 0%, transparent 60%)",
    orb3: "radial-gradient(circle at 25% 60%, rgba(220, 240, 250, 0.25) 0%, transparent 45%)",
    glowColor: "rgba(180, 220, 240, 0.2)",
  },
  warm: {
    orb1: "radial-gradient(ellipse 85% 55% at 50% 25%, rgba(212, 168, 83, 0.25) 0%, transparent 55%)",
    orb2: "radial-gradient(ellipse 65% 75% at 65% 55%, rgba(180, 120, 60, 0.2) 0%, transparent 60%)",
    orb3: "radial-gradient(circle at 35% 65%, rgba(210, 150, 70, 0.15) 0%, transparent 50%)",
    glowColor: "rgba(212, 168, 83, 0.12)",
  },
  bold: {
    orb1: "radial-gradient(ellipse 75% 60% at 50% 35%, rgba(201, 169, 98, 0.2) 0%, transparent 55%)",
    orb2: "radial-gradient(ellipse 60% 70% at 70% 55%, rgba(40, 35, 30, 0.6) 0%, transparent 55%)",
    glowColor: "rgba(201, 169, 98, 0.18)",
  },
};

interface IdentityGraphicProps {
  archetypeId: string;
  className?: string;
}

export default function IdentityGraphic({ archetypeId, className = "" }: IdentityGraphicProps) {
  const theme: IdentityVisualTheme = ARCHETYPE_TO_VISUAL[archetypeId] ?? "dark";
  const style = THEME_STYLES[theme];

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden rounded-2xl ${className}`}
      aria-hidden
    >
      {/* Backdrop glow */}
      <div
        className="absolute inset-0 animate-identity-glow opacity-40"
        style={{
          background: style.orb1,
        }}
      />
      <div
        className="absolute inset-0 animate-identity-float opacity-50"
        style={{
          background: style.orb2,
          animationDelay: "1s",
        }}
      />
      {style.orb3 && (
        <div
          className="absolute inset-0 animate-identity-glow opacity-30"
          style={{
            background: style.orb3,
            animationDelay: "2.5s",
          }}
        />
      )}
      {/* Soft vignette / glow ring */}
      <div
        className="absolute inset-0 animate-identity-glow"
        style={{
          boxShadow: `inset 0 0 120px 60px ${style.glowColor}`,
          animationDuration: "6s",
        }}
      />
    </div>
  );
}
