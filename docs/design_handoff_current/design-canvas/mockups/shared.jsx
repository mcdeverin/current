// shared.jsx — design tokens, icons, phone shell (matches Current's real styling)

const DARK = {
  bg: '#0f1219',
  card: '#161b24',
  cardAlt: '#1a2430',
  border: '#232a35',
  text: '#e8eaf0',
  warm: '#f0f2ee',
  muted: '#6a7280',
  accent: '#6E8FA3',
  accentBg: 'rgba(110,143,163,0.15)',
  danger: '#7a2020',
};

const LIGHT = {
  bg: '#f5f4ef',
  card: '#ffffff',
  cardAlt: '#EEF3F6',
  border: '#d5d0c8',
  text: '#1a1a1a',
  warm: '#1a1a1a',
  muted: '#7a7870',
  accent: '#4d7a96',
  accentBg: 'rgba(77,122,150,0.12)',
  danger: '#7a2020',
};

// ── Icons (lucide-style, traced by hand for fidelity) ─────────────────
function Icon({ d, size = 20, stroke = 'currentColor', sw = 1.5, fill = 'none', children }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {d ? <path d={d}/> : children}
    </svg>
  );
}
const SunIcon = (p) => <Icon {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></Icon>;
const MapPinIcon = (p) => <Icon {...p}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0116 0z"/><circle cx="12" cy="10" r="3"/></Icon>;
const UserIcon = (p) => <Icon {...p}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></Icon>;
const ChevronRight = (p) => <Icon {...p}><polyline points="9 18 15 12 9 6"/></Icon>;
const ChevronLeft = (p) => <Icon {...p}><polyline points="15 18 9 12 15 6"/></Icon>;
const PlusIcon = (p) => <Icon {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></Icon>;
const HeartIcon = (p) => <Icon {...p}><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></Icon>;
const PauseIcon = (p) => <Icon {...p}><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></Icon>;
const PhoneIcon = (p) => <Icon {...p}><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.37 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0122 16.92z"/></Icon>;
const SendIcon = (p) => <Icon {...p}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></Icon>;
const MoonIcon = (p) => <Icon {...p}><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></Icon>;
const ShieldIcon = (p) => <Icon {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></Icon>;
const CompassIcon = (p) => <Icon {...p}><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></Icon>;
const SparkleIcon = (p) => <Icon {...p}><path d="M12 3l1.9 5.6L19 10l-5.1 1.4L12 17l-1.9-5.6L5 10l5.1-1.4L12 3z"/></Icon>;
const ListIcon = (p) => <Icon {...p}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="0.5" fill="currentColor"/><circle cx="4" cy="12" r="0.5" fill="currentColor"/><circle cx="4" cy="18" r="0.5" fill="currentColor"/></Icon>;
const MapIcon = (p) => <Icon {...p}><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></Icon>;
const ClockIcon = (p) => <Icon {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></Icon>;
const AnchorIcon = (p) => <Icon {...p}><circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0020 0h-3"/></Icon>;

// ── Header (faux Current GlobalHeader) ────────────────────────────────
function CurrentHeader({ back = false, t = DARK, label = 'current' }) {
  const bg = t === DARK ? 'rgba(15,18,25,0.85)' : 'rgba(245,244,239,0.85)';
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 110, paddingTop: 62, zIndex: 12, background: bg, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderBottom: `1px solid ${t.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', height: 48, padding: '0 20px' }}>
        {back ? (
          <div style={{ color: t.accent, fontSize: 15, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 0 }}>
            <ChevronLeft size={22} stroke={t.accent} sw={2}/>
            <span style={{ marginLeft: -2 }}>Back</span>
          </div>
        ) : (
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 17, fontWeight: 500, color: t.accent, textAlign: 'center', width: '100%', letterSpacing: '0.04em', margin: 0 }}>{label}</p>
        )}
      </div>
    </div>
  );
}

// ── Bottom nav (faux Current BottomNav) ───────────────────────────────
function CurrentBottomNav({ active = 'Today', t = DARK }) {
  const tabs = [
    { name: 'Today', icon: SunIcon },
    { name: 'Spots', icon: MapPinIcon },
    { name: 'You', icon: UserIcon },
  ];
  const bg = t === DARK ? 'rgba(15,18,25,0.88)' : 'rgba(245,244,239,0.88)';
  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 90, paddingBottom: 34, background: bg, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderTop: `1px solid ${t.border}`, display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 12 }}>
      {tabs.map(({ name, icon: I }) => {
        const isActive = name === active;
        const color = isActive ? '#6E8FA3' : '#9AA3A9';
        return (
          <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flex: 1 }}>
            <I size={20} stroke={color} sw={isActive ? 2 : 1.5}/>
            <span style={{ fontSize: 10, fontWeight: 500, color, fontFamily: 'DM Sans, sans-serif' }}>{name}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Phone shell that fills the artboard ───────────────────────────────
function Screen({ children, t = DARK, back = false, tab = 'Today', hideNav = false, hideHeader = false, label }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: t.bg,
      fontFamily: 'DM Sans, sans-serif',
      color: t.text,
      overflow: 'hidden',
    }}>
      {!hideHeader && <CurrentHeader back={back} t={t} label={label}/>}
      <div style={{
        position: 'absolute',
        top: hideHeader ? 60 : 110,
        bottom: hideNav ? 0 : 90,
        left: 0, right: 0,
        overflow: 'hidden',
      }}>
        {children}
      </div>
      {!hideNav && <CurrentBottomNav active={tab} t={t}/>}
    </div>
  );
}

// ── Common bits ───────────────────────────────────────────────────────
function Eyebrow({ children, t = DARK, color, mb = 12, center = true }) {
  return <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 500, color: color || '#6F8FA4', textAlign: center ? 'center' : 'left', margin: 0, marginBottom: mb }}>{children}</p>;
}

function Display({ children, t = DARK, size = 28, italic = false, style = {} }) {
  return <p style={{ fontFamily: "'Playfair Display', serif", fontSize: size, fontWeight: 500, color: t.text, lineHeight: 1.1, margin: 0, fontStyle: italic ? 'italic' : 'normal', letterSpacing: '-0.02em', ...style }}>{children}</p>;
}

function Card({ children, t = DARK, style = {}, alt = false }) {
  return (
    <div style={{ background: alt ? t.cardAlt : t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: 20, ...style }}>
      {children}
    </div>
  );
}

function Pill({ children, t = DARK, active = false, style = {} }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '6px 12px', borderRadius: 999,
      fontSize: 11, fontWeight: 500,
      background: active ? t.accent : t.card,
      color: active ? t.bg : t.muted,
      border: `1px solid ${active ? t.accent : t.border}`,
      ...style,
    }}>{children}</span>
  );
}

Object.assign(window, {
  DARK, LIGHT,
  SunIcon, MapPinIcon, UserIcon, ChevronRight, ChevronLeft, PlusIcon, HeartIcon,
  PauseIcon, PhoneIcon, SendIcon, MoonIcon, ShieldIcon, CompassIcon, SparkleIcon,
  ListIcon, MapIcon, ClockIcon, AnchorIcon,
  CurrentHeader, CurrentBottomNav, Screen,
  Eyebrow, Display, Card, Pill,
});
