/**
 * Canonical seed list of 12 mocktail recipes, from spec §6.10.
 *
 * Two uses:
 *  1. UI fallback — Mocktails.jsx shows these when the MocktailRecipes
 *     entity is empty/unreachable, so the page never looks dead during
 *     development or pre-seed.
 *  2. One-off seed — scripts/seed-mocktails.mjs imports this list and
 *     creates approved MocktailRecipes rows via the Base44 SDK.
 *
 * Field shape matches base44/entities/MocktailRecipes.jsonc exactly.
 * `id` is a stable client-side key so fallback rows can be used in lists
 * without React-key warnings; Base44 ignores it on create.
 */

export const MOCKTAIL_SEEDS = [
  {
    id: "seed-phony-negroni",
    name: "Phony Negroni",
    category: "bar_order",
    one_liner: "Most good bars stock Ghia.",
    order_script: "Ghia and soda, fresh orange peel, rocks glass.",
    flavor_profile: "Bitter, herbal, looks like a Negroni.",
    status: "approved",
    sort_order: 10,
  },
  {
    id: "seed-soda-lime",
    name: "Soda, lime, tall glass",
    category: "bar_order",
    one_liner: "The classic. No questions asked.",
    order_script: "Soda water, fresh lime, tall glass.",
    flavor_profile: "Clean, neutral.",
    status: "approved",
    sort_order: 20,
  },
  {
    id: "seed-bitters-soda",
    name: "Bitters and soda",
    category: "bar_order",
    one_liner: "An old-bartender move.",
    order_script: "Soda water, three dashes Angostura, lime twist.",
    flavor_profile: "Spiced, faintly bitter.",
    status: "approved",
    sort_order: 30,
  },
  {
    id: "seed-athletic-free-wave",
    name: "Athletic Free Wave",
    category: "na_beer",
    one_liner: "Hoppy NA IPA.",
    order_script: "Any non-alc beer? Athletic Free Wave if you've got it.",
    flavor_profile: "Hoppy, citrus, convincing.",
    status: "approved",
    sort_order: 40,
  },
  {
    id: "seed-heineken-zero",
    name: "Heineken 0.0",
    category: "na_beer",
    one_liner: "Universal fallback.",
    order_script: "Heineken Zero, in a glass with a lime.",
    flavor_profile: "Lager, light, familiar.",
    status: "approved",
    sort_order: 50,
  },
  {
    id: "seed-ghia-soda",
    name: "Ghia and soda",
    category: "bar_order",
    one_liner: "Made for this.",
    order_script: "Ghia and soda, with a lime — like a spritz.",
    flavor_profile: "Bitter, carbonated, looks like a spritz.",
    status: "approved",
    sort_order: 60,
  },
  {
    id: "seed-smoked-maple-sour",
    name: "Smoked maple sour",
    category: "home",
    one_liner: "Bourbon-glass energy. No bourbon.",
    ingredients: [
      "1.5 oz apple cider",
      "0.5 oz maple syrup",
      "0.75 oz lemon",
      "dash liquid smoke",
      "1 egg white",
      "ice",
    ],
    steps: [
      "Dry-shake egg white 15s",
      "Add ice, shake 20s",
      "Strain into rocks glass",
      "Three drops bitters",
    ],
    time_minutes: 4,
    flavor_profile: "Foamy, smoky, looks expensive.",
    status: "approved",
    sort_order: 70,
  },
  {
    id: "seed-bittered-ginger-spritz",
    name: "Bittered ginger spritz",
    category: "home",
    one_liner: "Pantry-grade.",
    ingredients: [
      "3 oz ginger beer",
      "1 oz lime",
      "3 dashes Angostura",
      "ice",
      "lime wedge",
    ],
    steps: [
      "Fill with ice",
      "Lime then ginger beer",
      "Top with bitters",
      "Stir once",
    ],
    time_minutes: 2,
    flavor_profile: "Spicy, dry, like a Dark and Stormy.",
    status: "approved",
    sort_order: 80,
  },
  {
    id: "seed-cucumber-mint",
    name: "Cucumber-mint cooler",
    category: "fifteen_sec",
    one_liner: "Tastes like more.",
    ingredients: [
      "sparkling water",
      "3 cucumber slices",
      "4 mint leaves",
      "lime",
      "ice",
    ],
    steps: [
      "Slap the mint",
      "Everything in a glass",
      "Top with sparkling water",
    ],
    time_minutes: 1,
    flavor_profile: "Garden, light, like a G&T.",
    status: "approved",
    sort_order: 90,
  },
  {
    id: "seed-salted-grapefruit",
    name: "Salted grapefruit soda",
    category: "fifteen_sec",
    one_liner: "Least-bad gas-station option.",
    ingredients: ["grapefruit Lacroix", "pinch salt", "lime"],
    steps: ["Pour over ice", "Pinch of salt", "Squeeze lime"],
    time_minutes: 1,
    flavor_profile: "Bitter-sweet, mineral.",
    status: "approved",
    sort_order: 100,
  },
  {
    id: "seed-seedlip-garden",
    name: "Seedlip Garden 108",
    category: "bar_order",
    one_liner: "If the bar has Seedlip.",
    order_script: "Seedlip Garden 108 and tonic, with cucumber.",
    flavor_profile: "Herbal, dry, very G&T.",
    status: "approved",
    sort_order: 110,
  },
  {
    id: "seed-earl-grey-tonic",
    name: "Earl Grey tonic",
    category: "home",
    one_liner: "Sounds fussy. Isn't.",
    ingredients: [
      "chilled strong Earl Grey (4 oz)",
      "3 oz tonic",
      "lemon",
      "ice",
    ],
    steps: [
      "Brew strong, chill",
      "Over ice",
      "Top with tonic, finish lemon",
    ],
    time_minutes: 3,
    flavor_profile: "Bergamot, dry.",
    status: "approved",
    sort_order: 120,
  },
];
