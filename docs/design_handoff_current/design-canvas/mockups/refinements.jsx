// refinements.jsx — 4 reworks of existing Current screens

// ─────────────────────────────────────────────────────────────────────
// 9) HOME v2 — Adds quick "Anchor" chip, evening prompt pill, tighter rhythm
// ─────────────────────────────────────────────────────────────────────
function HomeV2Screen() {
  const t = DARK;
  return (
    <Screen t={t} tab="Today">
      <div style={{ padding: '20px 24px 0', maxWidth: 380, margin: '0 auto' }}>
        {/* Quick anchor chip */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, color: t.text, margin: 0 }}>
            Good evening, Sam.
          </p>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 999, background: t.accentBg, border: `1px solid ${t.accent}`, color: t.accent, fontSize: 11, fontWeight: 500 }}>
            <AnchorIcon size={12} stroke={t.accent}/> Anchor
          </button>
        </div>

        {/* Ring */}
        <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', marginBottom: 4 }}>
          <RingSVG days={228} size={200} t={t}/>
        </div>
        <p style={{ fontSize: 11, fontWeight: 500, color: t.text, textAlign: 'center', marginTop: 6, marginBottom: 2 }}>228 clear days</p>
        <p style={{ fontSize: 11, color: t.muted, textAlign: 'center', margin: 0 }}>Since March 28, 2025</p>

        {/* Mood */}
        <div style={{ marginTop: 20, marginBottom: 14 }}>
          <Eyebrow t={t} mb={10}>How are you right now?</Eyebrow>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
            {['Steady', 'Getting by', 'Tough'].map((m, i) => (
              <button key={m} style={{ padding: '7px 14px', borderRadius: 999, fontSize: 11.5, fontWeight: 500, background: i === 0 ? t.accent : t.card, color: i === 0 ? t.bg : t.muted, border: `1px solid ${i === 0 ? t.accent : t.border}` }}>{m}</button>
            ))}
          </div>
        </div>

        {/* Today's Moment */}
        <Card t={t} alt style={{ padding: 16, marginTop: 14, textAlign: 'center' }}>
          <Eyebrow t={t} mb={8}>Today's Moment</Eyebrow>
          <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 15, color: t.warm, margin: 0, lineHeight: 1.45 }}>
            Slow down enough to notice the light.
          </p>
          <p style={{ fontSize: 12.5, color: t.warm, margin: '8px 0 0', lineHeight: 1.45 }}>
            Walk out, even for two minutes. That's the move.
          </p>
        </Card>

        {/* Evening prompt pill */}
        <button style={{ width: '100%', marginTop: 10, padding: '12px 14px', borderRadius: 999, background: 'transparent', border: `1px solid ${t.border}`, color: t.muted, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <SparkleIcon size={12} stroke={t.accent}/>
            <span>Tonight's reflection · 1 minute</span>
          </span>
          <ChevronRight size={12} stroke={t.muted}/>
        </button>
      </div>
    </Screen>
  );
}

// Small SVG ring helper used in HomeV2 and StreakRingV2
function RingSVG({ days, size, t, showMilestone = false, milestone = null }) {
  const stroke = 4;
  const r = (size - stroke * 2) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(days / 365, 1);
  const off = c - pct * c;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} stroke={t.border} strokeWidth={stroke} fill="none"/>
        <circle cx={size/2} cy={size/2} r={r} stroke="#6E8FA3" strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}/>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: size * 0.32, fontWeight: 500, color: t.text, lineHeight: 1 }}>{days.toLocaleString()}</span>
        <span style={{ fontSize: 11, color: '#6F8FA4', letterSpacing: '0.22em', marginTop: 6, fontVariant: 'small-caps' }}>Days</span>
        {showMilestone && milestone && (
          <span style={{ fontSize: 9.5, color: t.muted, letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 10 }}>
            {milestone} away from {365 - days <= milestone ? '1 year' : 'next'}
          </span>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 10) STREAK RING v2 — bigger weight, breath halo, milestone hint
// ─────────────────────────────────────────────────────────────────────
function StreakRingV2Screen() {
  const t = DARK;
  return (
    <Screen t={t} tab="Today">
      <div style={{ padding: '28px 24px 0', maxWidth: 380, margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, color: t.text, margin: 0, marginBottom: 32 }}>
          Good evening, Sam.
        </p>

        {/* Ring + halo + side stats */}
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', height: 280 }}>
          {/* outer halo */}
          <div style={{ position: 'absolute', width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(110,143,163,0.10), transparent 70%)' }}/>
          <RingV2 days={359} t={t}/>
          {/* side: since date — top right of ring */}
        </div>

        {/* Caption */}
        <p style={{ fontSize: 11, color: t.muted, marginTop: 14, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Since March 28 · 2025</p>

        {/* Milestone strip */}
        <div style={{ marginTop: 30, padding: '14px 18px', borderRadius: 12, background: t.cardAlt, border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ textAlign: 'left' }}>
            <Eyebrow t={t} center={false} color={t.accent} mb={4}>Next milestone</Eyebrow>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, color: t.text, margin: 0 }}>One Year · in 6 days</p>
          </div>
          <div style={{ width: 50, height: 50, borderRadius: '50%', border: `1.5px solid ${t.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.accent, fontFamily: "'Playfair Display', serif", fontSize: 17 }}>
            6
          </div>
        </div>

        <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 14, color: t.muted, marginTop: 22, lineHeight: 1.55 }}>
          Three hundred and fifty-nine choices.<br/>All of them yours.
        </p>
      </div>
    </Screen>
  );
}

function RingV2({ days, t }) {
  const size = 240;
  const stroke = 5;
  const r = (size - stroke * 2) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(days / 365, 1);
  const off = c - pct * c;
  // Position of progress head (so we can place a glowing dot)
  const angle = -90 + pct * 360;
  const rad = angle * Math.PI / 180;
  const hx = size / 2 + r * Math.cos(rad);
  const hy = size / 2 + r * Math.sin(rad);
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#5b7d92"/>
            <stop offset="100%" stopColor="#8aa9bd"/>
          </linearGradient>
        </defs>
        <circle cx={size/2} cy={size/2} r={r} stroke={t.border} strokeWidth={1} fill="none"/>
        <circle cx={size/2} cy={size/2} r={r} stroke="url(#ringGrad)" strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}/>
      </svg>
      {/* Glowing head dot */}
      <div style={{ position: 'absolute', left: hx - 6, top: hy - 6, width: 12, height: 12, borderRadius: '50%', background: '#a8c5d8', boxShadow: '0 0 16px 4px rgba(168,197,216,0.6)' }}/>
      {/* center */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 86, fontWeight: 500, color: t.text, lineHeight: 0.9, letterSpacing: '-0.03em' }}>{days}</span>
        <span style={{ fontSize: 10.5, color: '#6F8FA4', letterSpacing: '0.3em', marginTop: 10, fontVariant: 'small-caps' }}>Clear days</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 11) MOOD SCALE — gentle 5-stop scale + 7-day waveform
// ─────────────────────────────────────────────────────────────────────
function MoodScaleScreen() {
  const t = DARK;
  // 7-day mood points (0..1)
  const series = [0.55, 0.40, 0.35, 0.50, 0.65, 0.45, 0.60];
  const W = 320, H = 90, P = 8;
  const stepX = (W - P * 2) / (series.length - 1);
  const pts = series.map((v, i) => [P + i * stepX, P + (1 - v) * (H - P * 2)]);
  const path = pts.reduce((acc, [x, y], i) => {
    if (i === 0) return `M${x},${y}`;
    const [px, py] = pts[i - 1];
    const cx1 = px + stepX / 2;
    const cx2 = x - stepX / 2;
    return `${acc} C${cx1},${py} ${cx2},${y} ${x},${y}`;
  }, '');

  return (
    <Screen t={t} tab="Today">
      <div style={{ padding: '32px 24px 0', maxWidth: 380, margin: '0 auto' }}>
        <Eyebrow t={t} mb={18}>How are you right now?</Eyebrow>

        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: t.text, textAlign: 'center', margin: 0, marginBottom: 22, lineHeight: 1.2 }}>
          Steady, today.
        </p>

        {/* Scale */}
        <div style={{ position: 'relative', height: 56, marginBottom: 16, padding: '0 12px' }}>
          {/* Track */}
          <div style={{ position: 'absolute', left: 12, right: 12, top: 26, height: 2, background: t.border, borderRadius: 2 }}/>
          <div style={{ position: 'absolute', left: 12, top: 26, height: 2, width: '62%', background: t.accent, borderRadius: 2 }}/>
          {/* Stops */}
          {[0, 1, 2, 3, 4].map(i => {
            const left = `calc(12px + ${i * 25}%)`;
            const active = i === 2;
            const past = i < 2;
            return (
              <div key={i} style={{ position: 'absolute', top: 14, left, transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: active ? 26 : 10, height: active ? 26 : 10,
                  borderRadius: '50%',
                  background: active ? t.accent : (past ? t.accent : t.border),
                  boxShadow: active ? '0 0 0 4px rgba(110,143,163,0.18)' : 'none',
                  border: active ? `2px solid ${t.bg}` : 'none',
                  transition: 'all 0.3s',
                }}/>
              </div>
            );
          })}
          {/* Labels */}
          <div style={{ position: 'absolute', top: 46, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', fontSize: 10, color: t.muted, padding: '0 4px' }}>
            <span>struggling</span>
            <span>steady</span>
            <span>good</span>
          </div>
        </div>

        {/* Response */}
        <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 15, color: t.warm, textAlign: 'center', margin: 0, marginTop: 20, marginBottom: 30, lineHeight: 1.5 }}>
          That's worth something.
        </p>

        {/* Waveform */}
        <div style={{ borderRadius: 12, background: t.card, border: `1px solid ${t.border}`, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <Eyebrow t={t} center={false} mb={0}>This week</Eyebrow>
            <span style={{ fontSize: 11, color: t.muted }}>7 days</span>
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
            <path d={path} stroke={t.accent} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            <path d={`${path} L${W-P},${H-P} L${P},${H-P} Z`} fill="rgba(110,143,163,0.10)"/>
            {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i === pts.length - 1 ? 4 : 2.5} fill={i === pts.length - 1 ? '#a8c5d8' : t.accent}/>)}
          </svg>
          <p style={{ fontSize: 11, color: t.muted, margin: 0, marginTop: 4, textAlign: 'center' }}>
            Mostly steady. One harder Tuesday.
          </p>
        </div>
      </div>
    </Screen>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 12) SPOTS v2 — photo cards + map tab
// ─────────────────────────────────────────────────────────────────────
function SpotsV2Screen() {
  const t = DARK;
  const places = [
    { name: 'Hekate Cafe', neigh: 'East Village · Café', open: true, dist: '0.4 mi', tag: 'Sober Friendly', hue: 210 },
    { name: 'Listen Bar', neigh: 'Lower East Side · Mocktails', open: true, dist: '0.7 mi', tag: 'No-Proof Bar', hue: 24 },
    { name: 'Mister Paradise', neigh: 'East Village · Spots', open: false, dist: '0.9 mi', tag: 'Mocktail Menu', hue: 168 },
  ];
  return (
    <Screen t={t} tab="Spots">
      <div style={{ padding: '20px 0 0' }}>
        <div style={{ padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 500, color: t.text, margin: 0 }}>Spots</p>
          {/* Tab toggle */}
          <div style={{ display: 'inline-flex', padding: 3, borderRadius: 999, background: t.card, border: `1px solid ${t.border}` }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 999, background: t.accent, color: t.bg, fontSize: 11, fontWeight: 500, border: 'none' }}>
              <ListIcon size={11} stroke={t.bg} sw={2}/> List
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 999, background: 'transparent', color: t.muted, fontSize: 11, fontWeight: 500, border: 'none' }}>
              <MapIcon size={11} stroke={t.muted}/> Map
            </button>
          </div>
        </div>

        {/* City + chips */}
        <div style={{ padding: '0 24px', display: 'flex', gap: 6, marginBottom: 10 }}>
          <Pill t={t} active>NYC</Pill>
          <Pill t={t}>LA</Pill>
          <div style={{ width: 1, background: t.border, margin: '4px 4px' }}/>
          <Pill t={t}>Open now</Pill>
          <Pill t={t}>Tonight</Pill>
        </div>

        <div style={{ padding: '0 24px 0', display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14 }}>
          {places.map(p => (
            <div key={p.name} style={{ display: 'flex', gap: 14, padding: 10, borderRadius: 12, background: t.card, border: `1px solid ${t.border}` }}>
              {/* photo placeholder */}
              <div style={{
                width: 80, height: 80, borderRadius: 8,
                background: `linear-gradient(135deg, hsl(${p.hue}, 18%, 22%), hsl(${p.hue}, 22%, 32%))`,
                border: `1px solid ${t.border}`,
                position: 'relative', flexShrink: 0,
              }}>
                <span style={{ position: 'absolute', top: 6, left: 6, fontSize: 8, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'ui-monospace, monospace' }}>photo</span>
              </div>
              <div style={{ flex: 1, padding: '2px 0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{ fontSize: 14, fontWeight: 500, color: t.text, margin: 0 }}>{p.name}</p>
                    <span style={{ fontSize: 9.5, padding: '2px 6px', borderRadius: 999, background: p.open ? 'rgba(110,143,163,0.18)' : 'transparent', color: p.open ? t.accent : t.muted, border: `1px solid ${p.open ? t.accent : t.border}`, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500 }}>{p.open ? 'Open' : 'Closed'}</span>
                  </div>
                  <p style={{ fontSize: 11.5, color: t.muted, margin: '3px 0 0' }}>{p.neigh}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                  <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 999, background: t.cardAlt, color: t.accent, fontWeight: 500, letterSpacing: '0.05em' }}>{p.tag}</span>
                  <span style={{ fontSize: 10.5, color: t.muted, marginLeft: 'auto' }}>{p.dist}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Screen>
  );
}

Object.assign(window, { HomeV2Screen, StreakRingV2Screen, MoodScaleScreen, SpotsV2Screen });
