// features.jsx — 8 feature concept mockups for Current
// Each is a self-contained iPhone-screen-sized React component.

// ─────────────────────────────────────────────────────────────────────
// 1) ANCHOR — Urge tool. One-tap full-screen breath + your reason + reach out.
// ─────────────────────────────────────────────────────────────────────
function AnchorScreen() {
  const t = DARK;
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0b0e14', fontFamily: 'DM Sans, sans-serif', color: t.text, overflow: 'hidden' }}>
      {/* Subtle radial glow */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 38%, rgba(110,143,163,0.22), transparent 60%)' }}/>

      {/* Dismiss */}
      <div style={{ position: 'absolute', top: 70, right: 20, fontSize: 13, color: t.muted, fontWeight: 500 }}>Close</div>

      {/* Title */}
      <div style={{ position: 'absolute', top: 110, left: 0, right: 0, textAlign: 'center' }}>
        <Eyebrow t={t} color={t.accent} mb={10}>Right now</Eyebrow>
        <Display t={t} size={26} italic style={{ color: '#e8eaf0', textAlign: 'center' }}>Just breathe.</Display>
      </div>

      {/* Breath ring */}
      <div style={{ position: 'absolute', top: 215, left: '50%', transform: 'translateX(-50%)', width: 230, height: 230, borderRadius: '50%', border: `1.5px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 178, height: 178, borderRadius: '50%', background: 'rgba(110,143,163,0.10)', border: '1px solid rgba(110,143,163,0.30)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 26, color: t.text, margin: 0 }}>Breathe in</p>
          <p style={{ fontSize: 11, color: t.muted, marginTop: 6, letterSpacing: '0.2em', textTransform: 'uppercase' }}>4 · 7 · 8</p>
        </div>
        {/* progress arc */}
        <svg width="230" height="230" style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
          <circle cx="115" cy="115" r="113" stroke="#6E8FA3" strokeWidth="1.5" fill="none" strokeDasharray="710" strokeDashoffset="190" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Why I'm here */}
      <div style={{ position: 'absolute', top: 478, left: 28, right: 28, padding: '16px 20px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: `1px solid ${t.border}` }}>
        <p style={{ fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '0.2em', color: t.accent, margin: 0, marginBottom: 8 }}>Why you're here</p>
        <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 15, lineHeight: 1.45, color: t.warm, margin: 0 }}>
          "For the mornings. For not flinching when my kid hugs me."
        </p>
      </div>

      {/* Reach out */}
      <div style={{ position: 'absolute', bottom: 60, left: 28, right: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button style={{ padding: '14px 16px', borderRadius: 12, background: t.accent, color: t.bg, fontSize: 14, fontWeight: 500, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <PhoneIcon size={15} stroke={t.bg} sw={2}/> Text Mom
        </button>
        <button style={{ padding: '12px 16px', borderRadius: 12, background: 'transparent', color: t.muted, fontSize: 13, border: `1px solid ${t.border}`, fontWeight: 500 }}>
          Move — go outside for 5
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 2) EVENING REFLECTION — 9pm prompt, 3 taps, 1 line.
// ─────────────────────────────────────────────────────────────────────
function ReflectionScreen() {
  const t = DARK;
  const choices = ['A small win', 'A person', 'Just made it through'];
  return (
    <Screen t={t} tab="Today" back>
      <div style={{ padding: '24px 24px 0', maxWidth: 380, margin: '0 auto' }}>
        <Eyebrow t={t} mb={14}>Tonight · 9:24 pm</Eyebrow>
        <Display t={t} size={28} style={{ textAlign: 'center', marginBottom: 10 }}>
          What kept you here today?
        </Display>
        <p style={{ fontSize: 13, color: t.muted, textAlign: 'center', margin: 0, marginBottom: 28 }}>
          One word, one breath, one tap. That's it.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
          {choices.map((c, i) => (
            <button key={c} style={{
              padding: '14px 18px', borderRadius: 12,
              background: i === 0 ? t.accentBg : t.card,
              border: `1px solid ${i === 0 ? t.accent : t.border}`,
              color: i === 0 ? t.text : t.warm,
              fontSize: 14, textAlign: 'left', fontWeight: 400,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span>{c}</span>
              {i === 0 && <div style={{ width: 6, height: 6, borderRadius: 999, background: t.accent }}/>}
            </button>
          ))}
        </div>

        <div style={{ padding: '14px 16px', borderRadius: 12, background: t.card, border: `1px solid ${t.border}` }}>
          <p style={{ fontSize: 10, color: t.muted, margin: 0, marginBottom: 6, letterSpacing: '0.1em', textTransform: 'uppercase' }}>What was it (optional)</p>
          <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 15, color: t.warm, margin: 0, lineHeight: 1.5 }}>
            Finished the kitchen at 8. Lit a candle.<span style={{ borderLeft: `1.5px solid ${t.accent}`, marginLeft: 2, height: 14, display: 'inline-block', verticalAlign: 'middle' }}/>
          </p>
        </div>

        <p style={{ fontSize: 11, color: t.muted, textAlign: 'center', marginTop: 14 }}>
          Saved to your thread. Only you ever see it.
        </p>
      </div>
    </Screen>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 3) PRESENCE MAP — heat grid of days you showed up
// ─────────────────────────────────────────────────────────────────────
function PresenceMapScreen() {
  const t = DARK;
  // 26 cols × 7 rows ≈ 6 months
  const cols = 22, rows = 7;
  const cells = [];
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      // density: weekday-skewed and rising over time
      const x = (c * 7 + r);
      const noise = ((x * 9301 + 49297) % 233280) / 233280;
      let lvl = 0;
      if (c > cols - 4) lvl = noise < 0.15 ? 0 : noise < 0.4 ? 2 : 3;
      else if (c > cols / 2) lvl = noise < 0.25 ? 0 : noise < 0.55 ? 1 : noise < 0.85 ? 2 : 3;
      else lvl = noise < 0.5 ? 0 : noise < 0.85 ? 1 : 2;
      cells.push({ c, r, lvl });
    }
  }
  const lvlColor = ['#1a2230', 'rgba(110,143,163,0.30)', 'rgba(110,143,163,0.60)', '#6E8FA3'];

  return (
    <Screen t={t} tab="You" back>
      <div style={{ padding: '20px 24px 0' }}>
        <Eyebrow t={t} center={false} mb={6}>Presence</Eyebrow>
        <Display t={t} size={28} style={{ marginBottom: 4 }}>
          84 days present
        </Display>
        <p style={{ fontSize: 13, color: t.muted, margin: 0, marginBottom: 22 }}>
          this year, in your own quiet way.
        </p>

        {/* Heat grid */}
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: '18px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <p style={{ fontSize: 11, color: t.muted, margin: 0, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Jun → Nov</p>
            <p style={{ fontSize: 11, color: t.accent, margin: 0, fontWeight: 500 }}>this week +5</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gridAutoFlow: 'column', gridTemplateRows: `repeat(${rows}, 1fr)`, gap: 3 }}>
            {cells.map(({ c, r, lvl }) => (
              <div key={`${c}-${r}`} style={{
                aspectRatio: '1', borderRadius: 2,
                background: lvlColor[lvl],
              }}/>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 5, marginTop: 14 }}>
            <span style={{ fontSize: 10, color: t.muted }}>quieter</span>
            {lvlColor.map((c, i) => <div key={i} style={{ width: 8, height: 8, borderRadius: 2, background: c }}/>)}
            <span style={{ fontSize: 10, color: t.muted }}>fuller</span>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          <Card t={t} style={{ flex: 1, padding: '14px 14px' }}>
            <p style={{ fontSize: 9.5, color: t.muted, margin: 0, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Longest weave</p>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: t.text, margin: 0, marginTop: 4 }}>23 <span style={{ fontSize: 11, color: t.muted, fontFamily: 'DM Sans' }}>days</span></p>
          </Card>
          <Card t={t} style={{ flex: 1, padding: '14px 14px' }}>
            <p style={{ fontSize: 9.5, color: t.muted, margin: 0, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Quiet days</p>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: t.text, margin: 0, marginTop: 4 }}>41</p>
          </Card>
        </div>

        <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 14, color: t.muted, textAlign: 'center', marginTop: 22, lineHeight: 1.5 }}>
          Not every day is loud.<br/>The blanks count too.
        </p>
      </div>
    </Screen>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 4) PAUSE / SHIELD — gentle tracker pause, no reset
// ─────────────────────────────────────────────────────────────────────
function PauseScreen() {
  const t = DARK;
  const opts = [
    { label: 'One day', sub: 'Travel, an off day' },
    { label: 'Three days', sub: 'Sick, or moving' },
    { label: 'A week', sub: 'Holiday, big trip' },
    { label: 'Until I come back', sub: 'No countdown' },
  ];
  return (
    <Screen t={t} tab="You" back>
      <div style={{ padding: '22px 24px 0' }}>
        <Eyebrow t={t} center={false} color={t.accent} mb={6}>Quiet pause</Eyebrow>
        <Display t={t} size={26} style={{ marginBottom: 8 }}>
          Take a breath.<br/>Your days stay yours.
        </Display>
        <p style={{ fontSize: 13, color: t.muted, lineHeight: 1.55, margin: 0, marginBottom: 22 }}>
          Pause the tracker for as long as you need. Pausing isn't restarting. Your number is waiting where you left it.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {opts.map((o, i) => (
            <button key={o.label} style={{
              padding: '14px 16px', borderRadius: 12,
              background: t.card,
              border: `1px solid ${i === 1 ? t.accent : t.border}`,
              color: t.text, textAlign: 'left',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, margin: 0, color: t.text }}>{o.label}</p>
                <p style={{ fontSize: 11.5, color: t.muted, margin: 0, marginTop: 2 }}>{o.sub}</p>
              </div>
              {i === 1
                ? <div style={{ width: 18, height: 18, borderRadius: 999, border: `5px solid ${t.accent}`, boxSizing: 'border-box' }}/>
                : <div style={{ width: 18, height: 18, borderRadius: 999, border: `1.5px solid ${t.border}` }}/>}
            </button>
          ))}
        </div>

        <button style={{ width: '100%', marginTop: 18, padding: '14px 16px', borderRadius: 12, background: t.accent, color: t.bg, border: 'none', fontSize: 14, fontWeight: 500 }}>
          Begin pause
        </button>
        <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 13, color: t.muted, textAlign: 'center', marginTop: 16 }}>
          You can come back whenever.
        </p>
      </div>
    </Screen>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 5) LETTERS — anonymous one-a-day notes from others
// ─────────────────────────────────────────────────────────────────────
function LettersScreen() {
  const t = DARK;
  const letters = [
    { from: 'someone on day 47', body: 'Today the coffee was good and the light through the window felt new. That used to be invisible to me.' },
    { from: 'someone on day 312', body: 'Three years ago I would have laughed at this. Now it\'s the thing that keeps me here. Anyway. You\'re doing it.' },
    { from: 'someone on day 6', body: 'I don\'t know if I can do this. Reading this app on the bus. I think I can do this.' },
  ];
  return (
    <Screen t={t} tab="Today" back>
      <div style={{ padding: '20px 24px 0' }}>
        <Eyebrow t={t} center={false} mb={6}>Letters</Eyebrow>
        <Display t={t} size={28} style={{ marginBottom: 6 }}>From strangers,<br/>who are also here.</Display>
        <p style={{ fontSize: 12.5, color: t.muted, margin: 0, marginBottom: 22, lineHeight: 1.5 }}>
          Anonymous. Read-only. One delivered each morning.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {letters.map((l, i) => (
            <div key={i} style={{
              padding: 18, borderRadius: 12,
              background: i === 0 ? t.cardAlt : t.card,
              border: `1px solid ${t.border}`,
              position: 'relative',
            }}>
              {i === 0 && <div style={{ position: 'absolute', top: 14, right: 14, fontSize: 9, color: t.accent, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Today</div>}
              <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 15, lineHeight: 1.55, color: t.warm, margin: 0 }}>
                "{l.body}"
              </p>
              <p style={{ fontSize: 11, color: t.muted, marginTop: 12, marginBottom: 0, letterSpacing: '0.05em' }}>— {l.from}</p>
            </div>
          ))}
        </div>

        <button style={{ marginTop: 18, width: '100%', padding: '14px', borderRadius: 12, background: 'transparent', border: `1.5px dashed ${t.border}`, color: t.muted, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <SendIcon size={14} stroke={t.muted}/> Leave one yourself
        </button>
      </div>
    </Screen>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 6) MOCKTAILS — Going out tonight? Bar scripts + home recipes
// ─────────────────────────────────────────────────────────────────────
function MocktailsScreen() {
  const t = DARK;
  const chips = ['All', 'Bar order', 'Home', 'Zero-proof beer', '15-second'];
  const drinks = [
    { name: 'Phony Negroni', sub: 'Bar order · most bars do this', tag: 'Bar', accent: true },
    { name: 'Soda + lime, tall glass', sub: 'The classic. No questions asked.', tag: 'Bar' },
    { name: 'Smoked maple sour', sub: 'Home · 4 min · 5 ingredients', tag: 'Home' },
    { name: 'Bittered ginger spritz', sub: 'Home · 2 min · pantry-grade', tag: 'Home' },
  ];
  return (
    <Screen t={t} tab="Today" back>
      <div style={{ padding: '20px 24px 0' }}>
        <Eyebrow t={t} center={false} mb={6}>Going out tonight?</Eyebrow>
        <Display t={t} size={26} style={{ marginBottom: 18 }}>Something to hold.</Display>

        {/* hero */}
        <div style={{ borderRadius: 14, padding: 18, background: 'linear-gradient(135deg, rgba(110,143,163,0.18), rgba(110,143,163,0.05))', border: `1px solid ${t.border}`, marginBottom: 18 }}>
          <p style={{ fontSize: 10, color: t.accent, margin: 0, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Last-minute</p>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: t.text, margin: '6px 0 4px' }}>Order with confidence</p>
          <p style={{ fontSize: 13, color: t.warm, fontStyle: 'italic', fontFamily: "'Playfair Display', serif", margin: 0, lineHeight: 1.4 }}>
            "Soda water, fresh lime, two drops of bitters, in a rocks glass."
          </p>
          <p style={{ fontSize: 11, color: t.muted, marginTop: 10, marginBottom: 0 }}>
            Reads like a real order. Tastes like one too.
          </p>
        </div>

        {/* chips */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 14, overflow: 'hidden' }}>
          {chips.map((c, i) => <Pill key={c} t={t} active={i === 0}>{c}</Pill>)}
        </div>

        {/* list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {drinks.map(d => (
            <div key={d.name} style={{ padding: '14px 16px', borderRadius: 12, background: t.card, border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 500, color: t.text, margin: 0 }}>{d.name}</p>
                <p style={{ fontSize: 11.5, color: t.muted, margin: 0, marginTop: 3 }}>{d.sub}</p>
              </div>
              <span style={{ fontSize: 9.5, color: t.accent, padding: '3px 8px', borderRadius: 999, border: `1px solid ${t.accent}`, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{d.tag}</span>
            </div>
          ))}
        </div>
      </div>
    </Screen>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 7) SOBER BUDGET — money saved becomes a goal jar
// ─────────────────────────────────────────────────────────────────────
function BudgetScreen() {
  const t = DARK;
  const saved = 3420;
  const goal = 5000;
  const pct = saved / goal;
  return (
    <Screen t={t} tab="You" back>
      <div style={{ padding: '22px 24px 0' }}>
        <Eyebrow t={t} center={false} mb={6}>Quiet gains</Eyebrow>
        <p style={{ fontSize: 13, color: t.muted, margin: 0, marginBottom: 24 }}>
          228 days × $15/day, give or take.
        </p>

        {/* Hero number */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 60, fontWeight: 500, color: t.text, margin: 0, letterSpacing: '-0.03em', lineHeight: 1 }}>
            $3,420
          </p>
          <p style={{ fontSize: 11, color: t.muted, marginTop: 6, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
            Not spent · 228 days
          </p>
        </div>

        {/* Jar */}
        <div style={{ position: 'relative', height: 180, borderRadius: 14, background: t.card, border: `1px solid ${t.border}`, padding: 18, marginBottom: 14, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: `${pct * 100}%`, background: 'linear-gradient(180deg, rgba(110,143,163,0.18), rgba(110,143,163,0.28))', borderTop: `1px solid ${t.accent}` }}/>
          <div style={{ position: 'relative' }}>
            <p style={{ fontSize: 10, color: t.accent, margin: 0, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Saving toward</p>
            <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 22, color: t.text, margin: '6px 0 4px' }}>A week in Lisbon</p>
            <p style={{ fontSize: 12.5, color: t.muted, margin: 0 }}>$3,420 of $5,000 · ~ 105 days to go</p>
          </div>
        </div>

        {/* Could-be list */}
        <div style={{ borderRadius: 12, background: t.cardAlt, border: `1px solid ${t.border}`, overflow: 'hidden' }}>
          {[
            ['114', 'good paperbacks'],
            ['28', 'dinners out, with a friend'],
            ['3', 'rounds of therapy'],
          ].map(([n, l], i, arr) => (
            <div key={l} style={{ padding: '14px 16px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', borderBottom: i < arr.length - 1 ? `1px solid ${t.border}` : 'none' }}>
              <span style={{ fontSize: 13, color: t.text }}>{l}</span>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: t.accent }}>{n}</span>
            </div>
          ))}
        </div>
      </div>
    </Screen>
  );
}

// ─────────────────────────────────────────────────────────────────────
// 8) QUIET HOURS — auto-active late at night, calmer UI
// ─────────────────────────────────────────────────────────────────────
function QuietHoursScreen() {
  const t = { ...DARK, bg: '#070a10', card: '#10141c', cardAlt: '#161b24', border: '#1b222d', muted: '#5a6270' };
  return (
    <div style={{ position: 'absolute', inset: 0, background: t.bg, color: t.text, fontFamily: 'DM Sans, sans-serif', overflow: 'hidden' }}>
      {/* faint top moon glow */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 80% -10%, rgba(110,143,163,0.10), transparent 50%)' }}/>

      <CurrentHeader t={t}/>

      <div style={{ position: 'absolute', top: 110, bottom: 90, left: 0, right: 0, padding: '28px 28px 0', overflow: 'hidden' }}>
        {/* time + state */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 26, color: t.accent }}>
          <MoonIcon size={15} stroke={t.accent}/>
          <span style={{ fontSize: 10.5, letterSpacing: '0.22em', textTransform: 'uppercase' }}>Quiet hours · 1:14 am</span>
        </div>

        <Display t={t} size={36} italic style={{ marginBottom: 14, lineHeight: 1.15 }}>
          It's late.<br/>Just rest.
        </Display>
        <p style={{ fontSize: 14, color: t.muted, lineHeight: 1.6, margin: 0, marginBottom: 36, maxWidth: 300 }}>
          Spots, stats, suggestions — all paused until morning. Nothing tonight needs your attention.
        </p>

        {/* Breath */}
        <div style={{ padding: '22px 20px', borderRadius: 14, background: t.card, border: `1px solid ${t.border}`, marginBottom: 14 }}>
          <Eyebrow t={t} center={false} color={t.accent} mb={10}>One breath</Eyebrow>
          <p style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: 18, color: t.warm, margin: 0, lineHeight: 1.45 }}>
            "In for four. Out for eight.<br/>That's enough for now."
          </p>
        </div>

        {/* Hidden by quiet hours */}
        <div style={{ padding: '14px 16px', borderRadius: 12, border: `1px dashed ${t.border}`, color: t.muted, fontSize: 12, textAlign: 'center', lineHeight: 1.5 }}>
          Discover, Spots, and Today's Move<br/>are tucked away. Back at sunrise.
        </div>
      </div>

      <CurrentBottomNav active="Today" t={t}/>
    </div>
  );
}

Object.assign(window, {
  AnchorScreen, ReflectionScreen, PresenceMapScreen, PauseScreen,
  LettersScreen, MocktailsScreen, BudgetScreen, QuietHoursScreen,
});
