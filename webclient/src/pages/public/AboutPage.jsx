import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { publicApi } from '@/services';
import { resolveMediaUrl } from '@/utils/media';

const DIFF_ROW_H = 22;

const teamCodeLines = [
  "const developer = {",
  "  name: 'Khat Vanna',",
  "  role: 'Senior Full-Stack Software Engineer',",
  "  location: 'Phnom Penh, Cambodia',",
  "  university: 'Norton University',",
  "  stack: ['React', 'Laravel', 'TypeScript', 'PostgreSQL', 'Docker'],",
  "  focus: 'Architecture, Clean Code, Scalable Systems',",
  "  passion: Infinity,",
  "};",
  "",
  "developer.build('the future'); // 🚀",
];

const diffRows = teamCodeLines.map((text, i) => ({
  num: 10 + i,
  kind: 'add',
  text,
}));

function highlightCodeLine(line) {
  if (!line) return '&nbsp;';
  let html = line
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  html = html.replace(/\b(const)\b/g, '<span class="text-[#ff7eb6]">$1</span>');
  html = html.replace(
    /^(\s*)(name|role|founded|location|university|mission|focus|stack|passion)(\s*:)/g,
    '$1<span class="text-[#ff9f6b]">$2</span><span class="text-gray-500">$3</span>'
  );
  html = html.replace(/('[^']*')/g, '<span class="text-[#7dd3fc]">$1</span>');
  html = html.replace(/\b(2024|Infinity)\b/g, '<span class="text-[#fdba74]">$1</span>');
  html = html.replace(/\.(build)\(/, '.<span class="text-[#60a5fa]">$1</span>(');
  html = html.replace(/(\/\/.*)$/, '<span class="text-gray-500">$1</span>');
  return html;
}

const miniStats = [
  { key: 'members', valueKey: 'about.story.miniStats.membersValue', labelKey: 'about.story.miniStats.membersLabel' },
  { key: 'founded', valueKey: 'about.story.miniStats.foundedValue', labelKey: 'about.story.miniStats.foundedLabel' },
  { key: 'university', valueKey: 'about.story.miniStats.universityValue', labelKey: 'about.story.miniStats.universityLabel' },
];

const values = [
  {
    key: 'innovation',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
      </svg>
    ),
    bgClass: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
  {
    key: 'qualityCode',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
    ),
    bgClass: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
  },
  {
    key: 'collaboration',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    bgClass: 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400',
  },
  {
    key: 'communityImpact',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 003 12c0-1.605.42-3.113 1.157-4.418" />
      </svg>
    ),
    bgClass: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400',
  },
  {
    key: 'continuousLearning',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
      </svg>
    ),
    bgClass: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400',
  },
  {
    key: 'openSource',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    bgClass: 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
  },
];

const timelineKeys = ['early2024', 'mid2024', 'late2024', 'year2025', 'future'];

const differentiators = [
  {
    key: 'studentDriven',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
  },
  {
    key: 'fullStack',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L12 12.75 6.429 9.75m11.142 0l4.179 2.25L12 17.25 2.25 12l4.179-2.25m11.142 0l4.179 2.25-4.179 2.25M6.429 14.25L2.25 16.5 12 21.75l9.75-5.25-4.179-2.25" />
      </svg>
    ),
  },
  {
    key: 'modernStack',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
  {
    key: 'dedicatedPassion',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
  },
];

export default function AboutView() {
  const { t } = useTranslation('public');
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamLoading, setTeamLoading] = useState(true);
  const [siteSettings, setSiteSettings] = useState({});

  const cardRefs = useRef({});

  // Code window animated state
  const aboutCodeWindowRef = useRef(null);
  const [agentProgress, setAgentProgress] = useState(0);
  const [showReadFile, setShowReadFile] = useState(false);
  const [showScan, setShowScan] = useState(false);
  const [scanDone, setScanDone] = useState(false);
  const [showThought, setShowThought] = useState(false);
  const [thoughtSeconds, setThoughtSeconds] = useState(0);
  const [showEditHeader, setShowEditHeader] = useState(false);
  const [showThinkingHint, setShowThinkingHint] = useState(false);
  const [activeDiffIndex, setActiveDiffIndex] = useState(-1);
  const [typedChars, setTypedChars] = useState('');
  const [revealedDiffCount, setRevealedDiffCount] = useState(0);

  const diffDisplayRows = useMemo(() => {
    return diffRows.map((row, i) => {
      const visible = i < revealedDiffCount;
      const active = activeDiffIndex === i;
      let text = '';
      if (active) text = typedChars;
      else if (visible) text = row.text;

      return {
        ...row,
        visible,
        active,
        html: text ? highlightCodeLine(text) : '',
      };
    });
  }, [revealedDiffCount, activeDiffIndex, typedChars]);

  function handleCardTilt(e, i) {
    const el = cardRefs.current[i];
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotateX = ((y - cy) / cy) * -8;
    const rotateY = ((x - cx) / cx) * 8;
    el.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
  }

  function resetCardTilt(i) {
    const el = cardRefs.current[i];
    if (!el) return;
    el.style.transform = '';
  }

  useEffect(() => {
    async function fetchAboutData() {
      setTeamLoading(true);
      const [teamRes, settingsRes] = await Promise.allSettled([
        publicApi.getTeam(),
        publicApi.getSettings(),
      ]);

      if (teamRes.status === 'fulfilled') {
        setTeamMembers(teamRes.value.data?.data || []);
      } else {
        setTeamMembers([]);
      }

      if (settingsRes.status === 'fulfilled') {
        setSiteSettings(settingsRes.value.data?.data || {});
      }
      setTeamLoading(false);
    }
    fetchAboutData();
  }, []);

  // Agent animation loop
  useEffect(() => {
    let running = true;
    let timers = [];

    const delay = (ms) =>
      new Promise((res) => {
        const id = setTimeout(res, ms);
        timers.push(id);
      });

    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduce) {
      setShowReadFile(true);
      setShowScan(true);
      setScanDone(true);
      setShowThought(true);
      setThoughtSeconds(2.8);
      setShowEditHeader(true);
      setRevealedDiffCount(diffRows.length);
      setAgentProgress(100);
      return;
    }

    async function runLoop() {
      while (running) {
        setAgentProgress(0);
        setShowReadFile(false);
        setShowScan(false);
        setScanDone(false);
        setShowThought(false);
        setThoughtSeconds(0);
        setShowEditHeader(false);
        setShowThinkingHint(false);
        setActiveDiffIndex(-1);
        setTypedChars('');
        setRevealedDiffCount(0);

        setShowThinkingHint(true);
        await delay(350);
        if (!running) break;

        setShowReadFile(true);
        setAgentProgress(8);
        await delay(450);
        if (!running) break;

        setShowScan(true);
        setAgentProgress(16);
        await delay(500);
        if (!running) break;

        setScanDone(true);
        setAgentProgress(28);
        await delay(350);
        if (!running) break;

        setShowThought(true);
        for (let s = 0; s < 10; s++) {
          if (!running) break;
          setThoughtSeconds(Number(((s + 1) * 0.28).toFixed(1)));
          setAgentProgress(Math.min(42, 30 + s));
          await delay(85);
        }

        setShowEditHeader(true);
        setShowThinkingHint(false);
        setAgentProgress(48);
        await delay(300);
        if (!running) break;

        for (let i = 0; i < diffRows.length; i++) {
          if (!running) break;
          const row = diffRows[i];
          setActiveDiffIndex(i);
          setTypedChars('');

          if (!row.text) {
            await delay(180);
            setRevealedDiffCount(i + 1);
            setActiveDiffIndex(-1);
            setTypedChars('');
            setAgentProgress((p) => Math.min(96, p + 2));
            continue;
          }

          for (let c = 0; c < row.text.length; c++) {
            if (!running) break;
            setTypedChars(row.text.slice(0, c + 1));
            setAgentProgress((p) => Math.min(96, p + 0.28));
            await delay(14 + Math.random() * 16);
          }
          await delay(220);
          setRevealedDiffCount(i + 1);
          setActiveDiffIndex(-1);
          setTypedChars('');
        }

        setAgentProgress(100);
        await delay(2800);
      }
    }

    runLoop();

    return () => {
      running = false;
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="about-page">
      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="relative min-h-[70svh] sm:min-h-[75svh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 about-hero-grid opacity-[0.04] dark:opacity-[0.06]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white dark:to-dark-900 pointer-events-none" />
        <div className="absolute top-1/4 -left-32 w-[280px] sm:w-[480px] h-[280px] sm:h-[480px] rounded-full bg-brand-violet/12 blur-[100px] sm:blur-[140px] animate-float pointer-events-none" />
        <div
          className="absolute bottom-1/3 -right-32 w-[240px] sm:w-[420px] h-[240px] sm:h-[420px] rounded-full bg-brand-cyan/10 blur-[100px] sm:blur-[140px] animate-float pointer-events-none"
          style={{ animationDelay: '3s' }}
        />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10 pt-20 pb-16">
          <p className="font-display text-sm sm:text-base font-semibold uppercase tracking-[0.35em] text-brand-violet dark:text-brand-cyan mb-6 sm:mb-8">
            {t('about.hero.eyebrow')}
          </p>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold tracking-tightest mb-4 sm:mb-6 leading-[1.02]">
            <span className="text-gray-900 dark:text-white">{t('about.hero.titleLine1')}</span>
            <br />
            <span className="gradient-text">{t('about.hero.titleLine2')}</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-3 sm:mb-4 leading-relaxed px-2 sm:px-0">
            {t('about.hero.subtitle')}
          </p>
          <p className="text-sm text-brand-violet/70 dark:text-brand-cyan/70 italic">
            {t('about.hero.quote')}
          </p>
        </div>
      </section>

      {/* ═══════════════════ OUR STORY ═══════════════════ */}
      <section className="py-14 sm:py-18 lg:py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left: text content */}
            <div>
              <span className="section-label">{t('about.story.label')}</span>
              <h2 className="section-heading text-2xl sm:text-3xl md:text-4xl mb-4 sm:mb-6">
                <Trans
                  t={t}
                  i18nKey="about.story.heading"
                  components={{ br: <br />, accent: <span className="gradient-text" /> }}
                />
              </h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                <p>{t('about.story.paragraph1')}</p>
                <p>
                  <Trans
                    t={t}
                    i18nKey="about.story.paragraph2"
                    components={{ bold: <strong className="text-gray-900 dark:text-white" /> }}
                  />
                </p>
              </div>

              {/* Mini stats */}
              <div className="grid grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-10">
                {miniStats.map((s) => {
                  let displayValue = t(s.valueKey);
                  if (s.key === 'members') {
                    displayValue = teamLoading ? '—' : `${teamMembers.length}`;
                  } else if (s.key === 'founded' && siteSettings.founded_year) {
                    displayValue = String(siteSettings.founded_year);
                  } else if (s.key === 'university' && siteSettings.university) {
                    displayValue = String(siteSettings.university);
                  }
                  return (
                    <div key={s.key}>
                      <p className="text-xl sm:text-2xl md:text-3xl font-sans font-bold gradient-text">
                        {displayValue}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">
                        {t(s.labelKey)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: animated agent / diff window */}
            <div className="relative">
              <div
                ref={aboutCodeWindowRef}
                className="about-code-window relative overflow-hidden rounded-xl border border-white/[0.1] bg-[#0a0a0b] text-[#e8e8ed] shadow-[0_12px_48px_rgba(0,0,0,0.45)]"
              >
                {/* Title bar */}
                <div className="flex items-center gap-3 px-4 py-2.5 border-b border-white/[0.07]">
                  <div className="flex items-center gap-1.5 shrink-0" aria-hidden="true">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                  </div>
                  <span className="flex-1 text-center text-[11px] font-code text-gray-500 truncate">
                    apex/main
                  </span>
                  <div className="flex items-center gap-2 shrink-0 min-w-[72px] justify-end">
                    <div className="w-14 h-1 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-violet to-brand-cyan transition-[width] duration-300 ease-out"
                        style={{ width: `${agentProgress}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-code text-gray-500 tabular-nums w-10 text-right">
                      {agentProgress.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Fixed-height body */}
                <div className="font-code text-[11px] sm:text-[12px] p-3.5 sm:p-4 h-[420px] sm:h-[460px] overflow-hidden flex flex-col">
                  <div className="shrink-0 space-y-1.5 min-h-[88px]">
                    <div
                      className={`flex items-center gap-2 h-5 text-gray-400 transition-opacity duration-300 ${
                        showReadFile ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <span className="text-brand-cyan shrink-0">▸</span>
                      <span className="text-gray-500">read_file</span>
                      <span className="text-gray-300">src/team/profile.js</span>
                      <span className="ml-auto text-gray-600 shrink-0">
                        {t('about.codeWindow.linesCount', { count: 42 })}
                      </span>
                    </div>

                    <div
                      className={`flex items-center gap-2 h-5 text-gray-400 border-l-2 border-emerald-500/70 pl-2.5 transition-opacity duration-300 ${
                        showScan ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <span className="flex-1 truncate">{t('about.codeWindow.scanProfile')}</span>
                      <span className="text-gray-600 hidden sm:inline">{t('about.codeWindow.exploreTag')}</span>
                      <span
                        className={`text-[10px] uppercase tracking-wide shrink-0 ${
                          scanDone ? 'text-emerald-400' : 'text-sky-400'
                        }`}
                      >
                        [{scanDone ? t('about.codeWindow.statusDone') : t('about.codeWindow.statusRunning')}]
                      </span>
                    </div>

                    <div
                      className={`flex items-center gap-2 h-5 text-[#c4b5fd] transition-opacity duration-300 ${
                        showThought ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <span className="text-brand-violet">◆</span>
                      <span>{t('about.codeWindow.thoughtFor', { seconds: thoughtSeconds.toFixed(1) })}</span>
                    </div>

                    <div
                      className={`flex items-center gap-2 h-5 transition-opacity duration-300 ${
                        showEditHeader ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <span className="text-brand-violet">◆</span>
                      <span className="font-semibold text-white">{t('about.codeWindow.editAction')}</span>
                      <span className="text-emerald-400/90">src/team/profile.js</span>
                    </div>
                  </div>

                  {/* Full team code */}
                  <div
                    className="mt-2 rounded-md overflow-hidden border border-white/[0.08] bg-[#0e0e10] shrink-0"
                    style={{ height: `${DIFF_ROW_H * diffRows.length}px` }}
                  >
                    {diffDisplayRows.map((row, i) => (
                      <div
                        key={`diff-${i}`}
                        className={`flex items-stretch ${
                          row.kind === 'add' && (row.visible || row.active) ? 'bg-emerald-500/[0.12]' : ''
                        }`}
                        style={{ height: `${DIFF_ROW_H}px` }}
                      >
                        <span
                          className={`w-9 shrink-0 text-right pr-2 select-none border-r border-white/[0.04] tabular-nums ${
                            row.kind === 'add' && (row.visible || row.active)
                              ? 'text-emerald-400'
                              : 'text-gray-600'
                          }`}
                          style={{ lineHeight: `${DIFF_ROW_H}px` }}
                        >
                          {row.num}
                        </span>
                        <span
                          className="flex-1 px-2.5 whitespace-pre overflow-hidden"
                          style={{ lineHeight: `${DIFF_ROW_H}px` }}
                        >
                          {row.visible || row.active ? (
                            <>
                              <span dangerouslySetInnerHTML={{ __html: row.html || '&nbsp;' }} />
                              {row.active && <span className="about-code-caret" aria-hidden="true" />}
                            </>
                          ) : (
                            <>&nbsp;</>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex-1 min-h-2" />

                  {/* Prompt */}
                  <div className="shrink-0 flex items-center gap-2 pt-2 text-gray-200">
                    <span className="text-brand-cyan shrink-0">❯</span>
                    <span>{t('about.codeWindow.prompt')}</span>
                  </div>
                  <div
                    className={`shrink-0 h-4 mt-1 text-[10px] text-gray-600 transition-opacity ${
                      showThinkingHint ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    {t('about.codeWindow.thinking')}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/[0.08] bg-black/40">
                  <span className="text-[11px] font-medium text-gray-300">{t('about.codeWindow.footerBuild')}</span>
                  <Link
                    to="/projects"
                    className="text-[11px] font-medium text-gray-300 hover:text-white transition-colors"
                  >
                    {t('about.codeWindow.footerExplore')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ MISSION & VISION ═══════════════════ */}
      <section className="py-14 sm:py-18 lg:py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <span className="section-label">{t('about.purpose.label')}</span>
            <h2 className="section-heading text-2xl sm:text-3xl md:text-5xl">
              <Trans
                t={t}
                i18nKey="about.purpose.heading"
                components={{ accent: <span className="gradient-text" /> }}
              />
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {/* Mission */}
            <div className="group relative surface-panel p-6 sm:p-8 md:p-10 hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-glow/10">
              <div className="mission-icon-wrap relative w-14 h-14 rounded-2xl mb-6 flex items-center justify-center bg-brand-violet/10 dark:bg-brand-cyan/10 text-brand-violet dark:text-brand-cyan transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                <svg
                  className="w-7 h-7 mission-rocket"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
                  />
                </svg>
                <span className="mission-glow absolute inset-0 rounded-2xl" />
              </div>
              <h3 className="text-xl font-sans font-bold text-gray-900 dark:text-white mb-3">
                {t('about.purpose.mission.title')}
              </h3>
              <p className="text-gray-700 dark:text-gray-400 leading-relaxed mb-4">
                {t('about.purpose.mission.description')}
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-gray-700 dark:text-gray-400 text-sm">
                  <span className="mt-0.5 text-brand-violet dark:text-brand-cyan font-bold shrink-0">💎</span>
                  <span>
                    <Trans
                      t={t}
                      i18nKey="about.purpose.mission.pillar1"
                      components={{ bold: <span className="font-semibold text-gray-800 dark:text-gray-200" /> }}
                    />
                  </span>
                </li>
                <li className="flex items-start gap-2 text-gray-700 dark:text-gray-400 text-sm">
                  <span className="mt-0.5 text-brand-violet dark:text-brand-cyan font-bold shrink-0">💎</span>
                  <span>
                    <Trans
                      t={t}
                      i18nKey="about.purpose.mission.pillar2"
                      components={{ bold: <span className="font-semibold text-gray-800 dark:text-gray-200" /> }}
                    />
                  </span>
                </li>
                <li className="flex items-start gap-2 text-gray-700 dark:text-gray-400 text-sm">
                  <span className="mt-0.5 text-brand-violet dark:text-brand-cyan font-bold shrink-0">💎</span>
                  <span>
                    <Trans
                      t={t}
                      i18nKey="about.purpose.mission.pillar3"
                      components={{ bold: <span className="font-semibold text-gray-800 dark:text-gray-200" /> }}
                    />
                  </span>
                </li>
              </ul>
            </div>

            {/* Vision */}
            <div className="group relative surface-panel p-6 sm:p-8 md:p-10 hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-glow/10">
              <div className="vision-icon-wrap relative w-14 h-14 rounded-2xl mb-6 flex items-center justify-center bg-brand-violet/10 dark:bg-brand-cyan/10 text-brand-violet dark:text-brand-cyan transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                <svg
                  className="w-7 h-7 vision-eye"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                  />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="vision-glow absolute inset-0 rounded-2xl" />
              </div>
              <h3 className="text-xl font-sans font-bold text-gray-900 dark:text-white mb-3">
                {t('about.purpose.vision.title')}
              </h3>
              <p className="text-gray-700 dark:text-gray-400 leading-relaxed">
                {t('about.purpose.vision.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ TEAM MEMBERS ═══════════════════ */}
      <section className="py-14 sm:py-18 lg:py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-10 sm:mb-16">
            <span className="section-label">{t('about.team.label')}</span>
            <h2 className="section-heading text-2xl sm:text-3xl md:text-5xl">
              <Trans
                t={t}
                i18nKey="about.team.heading"
                components={{ accent: <span className="gradient-text" /> }}
              />
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-4 max-w-lg mx-auto text-sm leading-relaxed">
              {t('about.team.subtitle')}
            </p>
          </div>

          {teamLoading ? (
            <div className={teamMembers.length === 1 ? "max-w-md mx-auto" : "grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"}>
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className="rounded-2xl sm:rounded-[2rem] border border-black/[0.08] dark:border-white/[0.08] bg-white/92 dark:bg-dark-800/60 p-6 animate-pulse"
                >
                  <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-dark-700 mx-auto mb-4" />
                  <div className="h-4 bg-gray-200 dark:bg-dark-700 rounded w-2/3 mx-auto mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-dark-700 rounded w-1/2 mx-auto" />
                </div>
              ))}
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400 text-sm">
              {t('about.team.subtitle')}
            </div>
          ) : (
          <div className={teamMembers.length === 1 ? "max-w-md mx-auto" : "grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"}>
            {teamMembers.map((member, i) => (
              <div
                key={member.id || i}
                className="team-card group relative text-center"
                onMouseMove={(e) => handleCardTilt(e, i)}
                onMouseLeave={() => resetCardTilt(i)}
              >
                <div
                  ref={(el) => {
                    if (el) cardRefs.current[i] = el;
                  }}
                  className="team-card-inner relative rounded-2xl sm:rounded-[2rem] border border-black/[0.08] dark:border-white/[0.08] bg-white/92 dark:bg-dark-800/60 backdrop-blur-sm p-4 sm:p-6 lg:p-8 transition-all duration-500 hover:border-black/[0.16] dark:hover:border-white/20"
                >
                  <div className="relative w-20 h-20 sm:w-28 sm:h-28 lg:w-36 lg:h-36 mx-auto mb-3 sm:mb-4 lg:mb-6">
                    <div className="w-full h-full rounded-full bg-gradient-brand p-1 overflow-hidden shadow-lg">
                      <div className="w-full h-full rounded-full overflow-hidden bg-dark-800 flex items-center justify-center">
                        {resolveMediaUrl(member.avatar) ? (
                          <img
                            src={resolveMediaUrl(member.avatar)}
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-white text-2xl sm:text-4xl font-bold">
                            {member.name?.charAt(0)}
                          </span>
                        )}
                      </div>
                    </div>
                    {member.is_founder && (
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gradient-brand text-white shadow-glow whitespace-nowrap">
                        {t('about.team.founderBadge')}
                      </div>
                    )}
                  </div>

                  <h3 className="text-sm sm:text-base lg:text-lg font-sans font-bold text-gray-900 dark:text-white mb-0.5 sm:mb-1 transition-all duration-500 group-hover:text-brand-cyan">
                    {member.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-brand-violet dark:text-brand-cyan mb-2 sm:mb-3 font-semibold transition-all duration-300">
                    {member.title || (member.roleKey ? t(member.roleKey) : member.role)}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-700 dark:text-gray-400 leading-relaxed mb-3 sm:mb-5 line-clamp-2 sm:line-clamp-3 transition-all duration-500 group-hover:text-gray-800 dark:group-hover:text-gray-300">
                    {member.bio || (member.specialtyKey ? t(member.specialtyKey) : member.specialty)}
                  </p>

                  <div className="flex items-center justify-center gap-2 sm:gap-3">
                    {member.github_url && (
                      <a
                        href={member.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={t('shared.social.github')}
                        title={t('shared.social.github')}
                        className="team-social-btn w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 border border-black/[0.08] dark:border-white/[0.08] hover:text-white hover:bg-brand-violet hover:border-brand-violet transition-all duration-300 hover:scale-110"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                      </a>
                    )}
                    {member.linkedin_url && (
                      <a
                        href={member.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={t('shared.social.linkedin')}
                        title={t('shared.social.linkedin')}
                        className="team-social-btn w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 border border-black/[0.08] dark:border-white/[0.08] hover:text-white hover:bg-brand-violet hover:border-brand-violet transition-all duration-300 hover:scale-110"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      </a>
                    )}
                    {member.telegram_url && (
                      <a
                        href={member.telegram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={t('shared.social.telegram')}
                        title={t('shared.social.telegram')}
                        className="team-social-btn w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 border border-black/[0.08] dark:border-white/[0.08] hover:text-white hover:bg-brand-cyan hover:border-brand-cyan transition-all duration-300 hover:scale-110"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                        </svg>
                      </a>
                    )}
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        aria-label={t('shared.social.email')}
                        title={t('shared.social.email')}
                        className="team-social-btn w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 border border-black/[0.08] dark:border-white/[0.08] hover:text-white hover:bg-brand-cyan hover:border-brand-cyan transition-all duration-300 hover:scale-110"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </section>

      {/* ═══════════════════ CORE VALUES ═══════════════════ */}
      <section className="py-14 sm:py-18 lg:py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-16">
            <div>
              <span className="section-label">{t('about.values.label')}</span>
              <h2 className="section-heading text-2xl sm:text-3xl md:text-5xl">
                <Trans
                  t={t}
                  i18nKey="about.values.heading"
                  components={{ accent: <span className="gradient-text" /> }}
                />
              </h2>
            </div>
            <p className="text-gray-500 dark:text-gray-400 max-w-md text-sm leading-relaxed">
              {t('about.values.subtitle')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {values.map((val) => (
              <div
                key={val.key}
                className="group relative surface-panel p-8 hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-glow/10"
              >
                <div
                  className={`w-14 h-14 rounded-2xl mb-6 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 ${val.bgClass}`}
                >
                  {val.icon}
                </div>
                <h3 className="text-lg font-sans font-bold text-gray-900 dark:text-white mb-2 group-hover:text-brand-violet dark:group-hover:text-brand-cyan transition-colors">
                  {t(`about.values.items.${val.key}.title`)}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {t(`about.values.items.${val.key}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ TIMELINE ═══════════════════ */}
      <section className="py-14 sm:py-18 lg:py-24 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <span className="section-label">{t('about.timeline.label')}</span>
            <h2 className="section-heading text-2xl sm:text-3xl md:text-5xl">
              <Trans
                t={t}
                i18nKey="about.timeline.heading"
                components={{ accent: <span className="gradient-text" /> }}
              />
            </h2>
          </div>

          <div className="space-y-8 relative before:absolute before:inset-0 before:left-4 md:before:left-1/2 before:-translate-x-px before:w-0.5 before:bg-gradient-to-b before:from-brand-violet before:via-brand-cyan before:to-transparent">
            {timelineKeys.map((key, i) => (
              <div
                key={key}
                className={`relative flex items-center md:justify-between ${
                  i % 2 === 0 ? 'md:flex-row-reverse' : ''
                }`}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-brand text-white shadow-glow absolute left-0 md:left-1/2 -translate-x-1/2 z-10">
                  <span className="w-2.5 h-2.5 rounded-full bg-white" />
                </div>
                <div className="ml-12 md:ml-0 md:w-[calc(50%-2rem)] surface-panel p-6 hover:-translate-y-1">
                  <span className="text-xs font-bold text-brand-violet dark:text-brand-cyan uppercase tracking-wider mb-1 block">
                    {t(`about.timeline.items.${key}.date`)}
                  </span>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
                    {t(`about.timeline.items.${key}.title`)}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {t(`about.timeline.items.${key}.description`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ WHY CHOOSE US ═══════════════════ */}
      <section className="py-14 sm:py-18 lg:py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-16">
            <span className="section-label">{t('about.differentiators.label')}</span>
            <h2 className="section-heading text-2xl sm:text-3xl md:text-5xl">
              <Trans
                t={t}
                i18nKey="about.differentiators.heading"
                components={{ accent: <span className="gradient-text" /> }}
              />
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {differentiators.map((item) => (
              <div
                key={item.key}
                className="group text-center surface-panel p-8 hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-glow/10"
              >
                <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center bg-brand-violet/10 dark:bg-brand-cyan/10 text-brand-violet dark:text-brand-cyan group-hover:scale-110 transition-transform duration-500">
                  {item.icon}
                </div>
                <h3 className="text-base font-sans font-bold text-gray-900 dark:text-white mb-2 group-hover:text-brand-violet dark:group-hover:text-brand-cyan transition-colors">
                  {t(`about.differentiators.items.${item.key}.title`)}
                </h3>
                <p className="text-xs text-gray-700 dark:text-gray-400 leading-relaxed">
                  {t(`about.differentiators.items.${item.key}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
