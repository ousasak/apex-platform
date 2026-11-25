import React, { useState } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import { memberApi } from '@/services'
import { TURNSTILE_SITE_KEY } from '@/config/appUrls'
import TurnstileWidget from '@/components/common/TurnstileWidget'
import CustomSelect from '@/components/common/CustomSelect'

export default function JoinUsView() {
  const { t } = useTranslation('public')
  const [currentStep, setCurrentStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [openFaq, setOpenFaq] = useState(null)
  const [turnstileToken, setTurnstileToken] = useState('')

  const [form, setForm] = useState({
    name: '',
    email: '',
    role_applied: '',
    skills: '',
    github_url: '',
    linkedin_url: '',
    portfolio_url: '',
    motivation: '',
  })

  const perks = [
    {
      key: 'realProjects',
      title: t('joinUs.whyJoin.perks.realProjects.title'),
      desc: t('joinUs.whyJoin.perks.realProjects.desc'),
      bgClass: 'bg-violet-100 dark:bg-violet-900/20',
      icon: (
        <svg className="w-6 h-6 text-brand-violet" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
        </svg>
      ),
    },
    {
      key: 'mentorship',
      title: t('joinUs.whyJoin.perks.mentorship.title'),
      desc: t('joinUs.whyJoin.perks.mentorship.desc'),
      bgClass: 'bg-cyan-100 dark:bg-cyan-900/20',
      icon: (
        <svg className="w-6 h-6 text-brand-cyan" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
        </svg>
      ),
    },
    {
      key: 'community',
      title: t('joinUs.whyJoin.perks.community.title'),
      desc: t('joinUs.whyJoin.perks.community.desc'),
      bgClass: 'bg-violet-100 dark:bg-violet-900/20',
      icon: (
        <svg className="w-6 h-6 text-brand-violet" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      ),
    },
    {
      key: 'growth',
      title: t('joinUs.whyJoin.perks.growth.title'),
      desc: t('joinUs.whyJoin.perks.growth.desc'),
      bgClass: 'bg-cyan-100 dark:bg-cyan-900/20',
      icon: (
        <svg className="w-6 h-6 text-brand-cyan" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
        </svg>
      ),
    },
  ]

  const lookFor = ['passion', 'learning', 'collaboration', 'language', 'problemSolving'].map((key) => ({
    key,
    title: t(`joinUs.lookFor.items.${key}.title`),
    desc: t(`joinUs.lookFor.items.${key}.desc`),
  }))

  const youGet = ['experience', 'mentorship', 'portfolio', 'networking', 'flexible'].map((key) => ({
    key,
    title: t(`joinUs.youGet.items.${key}.title`),
    desc: t(`joinUs.youGet.items.${key}.desc`),
  }))

  const roles = [
    {
      key: 'frontend',
      title: t('joinUs.roles.items.frontend.title'),
      desc: t('joinUs.roles.items.frontend.desc'),
      tags: ['React', 'TypeScript', 'Tailwind CSS'],
      bgClass: 'bg-violet-50 dark:bg-violet-900/20',
      icon: (
        <svg className="w-6 h-6 text-brand-violet" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
        </svg>
      ),
    },
    {
      key: 'backend',
      title: t('joinUs.roles.items.backend.title'),
      desc: t('joinUs.roles.items.backend.desc'),
      tags: ['Laravel', 'PostgreSQL', 'Docker'],
      bgClass: 'bg-cyan-50 dark:bg-cyan-900/20',
      icon: (
        <svg className="w-6 h-6 text-brand-cyan" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.75 5.1a4.5 4.5 0 013.6-1.85h5.3a4.5 4.5 0 013.6 1.85l2.1 3.45a4.5 4.5 0 01.9 2.7" />
        </svg>
      ),
    },
    {
      key: 'fullStack',
      title: t('joinUs.roles.items.fullStack.title'),
      desc: t('joinUs.roles.items.fullStack.desc'),
      tags: ['React', 'Spring Boot', 'Laravel', 'Docker'],
      bgClass: 'bg-violet-50 dark:bg-violet-900/20',
      icon: (
        <svg className="w-6 h-6 text-brand-violet" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L12 12.75 6.429 9.75m11.142 0l4.179 2.25-9.75 5.25-9.75-5.25 4.179-2.25" />
        </svg>
      ),
    },
    {
      key: 'mobile',
      title: t('joinUs.roles.items.mobile.title'),
      desc: t('joinUs.roles.items.mobile.desc'),
      tags: ['React Native', 'Flutter', t('joinUs.roles.tags.mobile')],
      bgClass: 'bg-cyan-50 dark:bg-cyan-900/20',
      icon: (
        <svg className="w-6 h-6 text-brand-cyan" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
        </svg>
      ),
    },
    {
      key: 'uiUx',
      title: t('joinUs.roles.items.uiUx.title'),
      desc: t('joinUs.roles.items.uiUx.desc'),
      tags: ['Figma', t('joinUs.roles.tags.prototyping'), t('joinUs.roles.tags.research')],
      bgClass: 'bg-violet-50 dark:bg-violet-900/20',
      icon: (
        <svg className="w-6 h-6 text-brand-violet" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
        </svg>
      ),
    },
  ]

  const steps = ['apply', 'review', 'interview', 'welcome'].map((key) => ({
    key,
    title: t(`joinUs.process.steps.${key}.title`),
    desc: t(`joinUs.process.steps.${key}.desc`),
  }))

  const faqs = ['experience', 'paid', 'commitment', 'techStack', 'location', 'reviewTime'].map((key) => ({
    key,
    q: t(`joinUs.faq.items.${key}.q`),
    a: t(`joinUs.faq.items.${key}.a`),
  }))

  function nextStep() {
    if (currentStep === 1 && (!form.name || !form.email || !form.role_applied)) {
      setError(t('joinUs.form.errors.requiredFields'))
      return
    }
    if (currentStep === 2 && !form.skills) {
      setError(t('joinUs.form.errors.skillsRequired'))
      return
    }
    setError('')
    setCurrentStep((prev) => prev + 1)
  }

  function toggleFaq(i) {
    setOpenFaq(openFaq === i ? null : i)
  }

  function resetForm() {
    setSubmitted(false)
    setCurrentStep(1)
    setForm({
      name: '',
      email: '',
      role_applied: '',
      skills: '',
      github_url: '',
      linkedin_url: '',
      portfolio_url: '',
      motivation: '',
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await memberApi.submitApplication({ ...form, turnstile_token: turnstileToken })
      setSubmitted(true)
    } catch (err) {
      setError(err.response?.data?.message || t('joinUs.form.errors.submitFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="join-page">
      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="relative min-h-[70svh] sm:min-h-[75svh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(123, 47, 255, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(123, 47, 255, 0.08) 1px, transparent 1px)',
            backgroundSize: '72px 72px',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white dark:to-dark-900 pointer-events-none" />
        <div className="absolute top-1/4 -left-32 w-[280px] sm:w-[480px] h-[280px] sm:h-[480px] rounded-full bg-brand-violet/12 blur-[100px] sm:blur-[140px] animate-float pointer-events-none" />
        <div
          className="absolute bottom-1/3 -right-32 w-[240px] sm:w-[420px] h-[240px] sm:h-[420px] rounded-full bg-brand-cyan/10 blur-[100px] sm:blur-[140px] animate-float pointer-events-none"
          style={{ animationDelay: '3s' }}
        />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10 pt-20 pb-16">
          <p className="font-display text-sm sm:text-base font-semibold uppercase tracking-[0.35em] text-brand-violet dark:text-brand-cyan mb-6 sm:mb-8">
            {t('joinUs.hero.eyebrow')}
          </p>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tightest mb-5 sm:mb-7 leading-[1.02]">
            <span className="text-gray-900 dark:text-white">{t('joinUs.hero.titleLine1')}</span>
            <br />
            <span className="gradient-text">{t('joinUs.hero.titleLine2')}</span>
          </h1>

          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed mb-8 sm:mb-10">
            {t('joinUs.hero.subtitle')}
          </p>

          <div>
            <a href="#apply" className="btn-primary gap-2 inline-flex items-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              </svg>
              {t('joinUs.hero.applyNow')}
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════════════ WHY JOIN US ═══════════════════ */}
      <section className="pb-14 sm:pb-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-14">
            <span className="section-label">{t('joinUs.whyJoin.label')}</span>
            <h2 className="section-heading text-3xl md:text-4xl lg:text-5xl">
              <Trans
                t={t}
                i18nKey="joinUs.whyJoin.heading"
                components={{ accent: <span className="gradient-text" /> }}
              />
            </h2>
            <p className="section-subheading mx-auto mt-4">
              {t('joinUs.whyJoin.subheading')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {perks.map((perk) => (
              <div
                key={perk.key}
                className="surface-panel p-6 text-center hover:-translate-y-1.5 transition-all duration-300 group"
              >
                <div className={`w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center transition-transform group-hover:scale-110 ${perk.bgClass}`}>
                  {perk.icon}
                </div>
                <h3 className="font-display font-bold text-gray-900 dark:text-white mb-2">{perk.title}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{perk.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ LOOK FOR & GET ═══════════════════ */}
      <section className="pb-14 sm:pb-20 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* What we look for */}
            <div className="surface-panel p-6 sm:p-8">
              <span className="section-label mb-2">{t('joinUs.lookFor.label')}</span>
              <h3 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-6">
                <Trans
                  t={t}
                  i18nKey="joinUs.lookFor.heading"
                  components={{ accent: <span className="gradient-text" /> }}
                />
              </h3>
              <div className="space-y-4">
                {lookFor.map((item) => (
                  <div key={item.key} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-brand-violet/10 dark:bg-brand-violet/20 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-3.5 h-3.5 text-brand-violet" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{item.title}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* What you get */}
            <div className="surface-panel p-6 sm:p-8">
              <span className="section-label mb-2">{t('joinUs.youGet.label')}</span>
              <h3 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-6">
                <Trans
                  t={t}
                  i18nKey="joinUs.youGet.heading"
                  components={{ accent: <span className="gradient-text" /> }}
                />
              </h3>
              <div className="space-y-4">
                {youGet.map((item) => (
                  <div key={item.key} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-brand-cyan/10 dark:bg-brand-cyan/20 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-3.5 h-3.5 text-brand-cyan" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{item.title}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ OPEN ROLES ═══════════════════ */}
      <section className="pb-14 sm:pb-20 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-14">
            <span className="section-label">{t('joinUs.roles.label')}</span>
            <h2 className="section-heading text-3xl md:text-4xl">
              <Trans
                t={t}
                i18nKey="joinUs.roles.heading"
                components={{ accent: <span className="gradient-text" /> }}
              />
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role) => (
              <div
                key={role.key}
                className="surface-panel p-6 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${role.bgClass}`}>
                    {role.icon}
                  </div>
                  <h3 className="font-display font-bold text-gray-900 dark:text-white mb-2">{role.title}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">{role.desc}</p>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-auto">
                  {role.tags.map((tag, tIdx) => (
                    <span key={tIdx} className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-dark-700 text-[11px] font-medium text-gray-600 dark:text-gray-400">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ PROCESS ═══════════════════ */}
      <section className="pb-14 sm:pb-20 relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-14">
            <span className="section-label">{t('joinUs.process.label')}</span>
            <h2 className="section-heading text-3xl md:text-4xl">
              <Trans
                t={t}
                i18nKey="joinUs.process.heading"
                components={{ accent: <span className="gradient-text" /> }}
              />
            </h2>
            <p className="section-subheading mx-auto mt-4">
              {t('joinUs.process.subheading')}
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {steps.map((step, i) => (
              <div key={step.key} className="relative text-center">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-brand-violet/20 dark:from-white/10 to-transparent z-0" />
                )}
                <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-brand flex items-center justify-center mx-auto mb-5 shadow-lg shadow-brand-violet/20">
                  <span className="text-white font-display font-bold text-xl">{i + 1}</span>
                </div>
                <h4 className="font-display font-bold text-gray-900 dark:text-white mb-2 text-sm">{step.title}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ APPLICATION FORM ═══════════════════ */}
      <section id="apply" className="pb-16 sm:pb-24 relative z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="surface-panel overflow-hidden">
            <div className="relative p-5 sm:p-8 md:p-10 pb-0">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-brand" />
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
                    {t('joinUs.form.title')}
                  </h2>
                  <p className="text-xs text-gray-700 dark:text-gray-400">
                    {t('joinUs.form.requiredHint')}
                  </p>
                </div>
              </div>
            </div>

            {submitted ? (
              <div className="p-8 md:p-10">
                <div className="text-center py-10">
                  <div className="relative w-20 h-20 mx-auto mb-6">
                    <div className="absolute inset-0 bg-green-400/20 rounded-full animate-ping" />
                    <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-3">
                    {t('joinUs.form.successTitle')}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6 leading-relaxed">
                    {t('joinUs.form.successMessage')}
                  </p>
                  <button type="button" onClick={resetForm} className="btn-secondary gap-2 text-sm">
                    {t('joinUs.form.submitAnother')}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-6">
                {/* Step indicator */}
                <div className="flex items-center gap-3 mb-2">
                  {[1, 2, 3].map((s) => (
                    <div key={s} className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                            currentStep === s
                              ? 'bg-brand-violet text-white'
                              : currentStep > s
                              ? 'bg-emerald-500 text-white'
                              : 'bg-gray-100 dark:bg-dark-700 text-gray-400'
                          }`}
                        >
                          {currentStep > s ? '✓' : s}
                        </div>
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          {s === 1
                            ? t('joinUs.form.steps.personalInfo')
                            : s === 2
                            ? t('joinUs.form.steps.skillsLinks')
                            : t('joinUs.form.steps.motivation')}
                        </span>
                      </div>
                      <div
                        className={`h-1 rounded-full ${
                          currentStep >= s ? 'bg-brand-violet' : 'bg-gray-200 dark:bg-dark-700'
                        }`}
                      />
                    </div>
                  ))}
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                    {error}
                  </div>
                )}

                {/* Step 1: Personal info */}
                {currentStep === 1 && (
                  <div className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          {t('joinUs.form.nameLabel')} <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          placeholder={t('joinUs.form.namePlaceholder')}
                          className="input-field text-sm text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          {t('joinUs.form.emailLabel')} <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder={t('joinUs.form.emailPlaceholder')}
                          className="input-field text-sm text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        {t('joinUs.form.roleLabel')} <span className="text-red-400">*</span>
                      </label>
                      <CustomSelect
                        value={form.role_applied}
                        onChange={(val) => setForm({ ...form, role_applied: val })}
                        options={[
                          { label: t('joinUs.form.roleOptions.placeholder'), value: '' },
                          { label: t('joinUs.form.roleOptions.frontend'), value: 'Frontend Developer' },
                          { label: t('joinUs.form.roleOptions.backend'), value: 'Backend Developer' },
                          { label: t('joinUs.form.roleOptions.fullStack'), value: 'Full-Stack Developer' },
                          { label: t('joinUs.form.roleOptions.mobile'), value: 'Mobile Developer' },
                          { label: t('joinUs.form.roleOptions.uiUx'), value: 'UI/UX Designer' },
                          { label: t('joinUs.form.roleOptions.devops'), value: 'DevOps Engineer' },
                          { label: t('joinUs.form.roleOptions.other'), value: 'Other' },
                        ]}
                        placeholder={t('joinUs.form.roleOptions.placeholder')}
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Experience */}
                {currentStep === 2 && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        {t('joinUs.form.skillsLabel')} <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={form.skills}
                        onChange={(e) => setForm({ ...form, skills: e.target.value })}
                        placeholder={t('joinUs.form.skillsPlaceholder')}
                        className="input-field text-sm text-gray-900 dark:text-white"
                      />
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                        {t('joinUs.form.skillsHelper')}
                      </p>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          {t('joinUs.form.githubLabel')}
                        </label>
                        <input
                          type="url"
                          value={form.github_url}
                          onChange={(e) => setForm({ ...form, github_url: e.target.value })}
                          placeholder={t('joinUs.form.githubPlaceholder')}
                          className="input-field text-sm text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                          {t('joinUs.form.linkedinLabel')}
                        </label>
                        <input
                          type="url"
                          value={form.linkedin_url}
                          onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })}
                          placeholder={t('joinUs.form.linkedinPlaceholder')}
                          className="input-field text-sm text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        {t('joinUs.form.portfolioLabel')}
                      </label>
                      <input
                        type="url"
                        value={form.portfolio_url}
                        onChange={(e) => setForm({ ...form, portfolio_url: e.target.value })}
                        placeholder={t('joinUs.form.portfolioPlaceholder')}
                        className="input-field text-sm text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Motivation */}
                {currentStep === 3 && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        {t('joinUs.form.motivationLabel')} <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={form.motivation}
                        onChange={(e) => setForm({ ...form, motivation: e.target.value })}
                        placeholder={t('joinUs.form.motivationPlaceholder')}
                        className="input-field resize-none text-sm text-gray-900 dark:text-white"
                      />
                    </div>

                    {TURNSTILE_SITE_KEY && (
                      <TurnstileWidget
                        siteKey={TURNSTILE_SITE_KEY}
                        onVerify={(token) => setTurnstileToken(token)}
                      />
                    )}
                  </div>
                )}

                {/* Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentStep((s) => s - 1)}
                      className="btn-secondary text-xs"
                    >
                      {t('joinUs.form.back')}
                    </button>
                  ) : <div />}

                  {currentStep < 3 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="btn-primary text-xs"
                    >
                      {t('joinUs.form.nextStep')}
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary gap-2 text-xs"
                    >
                      {submitting ? t('joinUs.form.submitting') : t('joinUs.form.submit')}
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════ FAQ ═══════════════════ */}
      <section className="pb-16 sm:pb-24 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-14">
            <span className="section-label">{t('joinUs.faq.label')}</span>
            <h2 className="section-heading text-3xl md:text-4xl">
              <Trans
                t={t}
                i18nKey="joinUs.faq.heading"
                components={{ accent: <span className="gradient-text" /> }}
              />
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={faq.key}
                className="surface-panel overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(i)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-display font-semibold text-gray-900 dark:text-white text-sm"
                >
                  <span>{faq.q}</span>
                  <svg
                    className={`w-4 h-4 text-brand-violet transition-transform duration-200 ${
                      openFaq === i ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 pt-0 text-xs text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-white/5 mt-2 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
