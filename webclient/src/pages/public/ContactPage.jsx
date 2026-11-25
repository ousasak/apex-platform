import React, { useState, useEffect, useMemo } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import { publicApi } from '@/services'
import { TURNSTILE_SITE_KEY } from '@/config/appUrls'
import TurnstileWidget from '@/components/common/TurnstileWidget'

export default function ContactView() {
  const { t } = useTranslation('public')
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    company: '',
    project_type: 'Full-Stack Web App',
    budget_range: '$1,000 - $3,000',
    contact_method: 'Email',
    message: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [error, setError] = useState('')
  const [siteSettings, setSiteSettings] = useState({})

  useEffect(() => {
    publicApi
      .getSettings()
      .then((res) => setSiteSettings(res.data?.data || {}))
      .catch(() => {})
  }, [])

  const contactInfo = useMemo(() => {
    const email = siteSettings.contact_email || ''
    const githubUrl = siteSettings.github_url || ''
    const githubHandle = githubUrl ? githubUrl.replace(/^https?:\/\/(www\.)?github\.com\/?/i, '') : ''
    const items = []

    if (email) {
      items.push({
        key: 'email',
        label: t('contact.info.emailLabel'),
        value: email,
        href: `mailto:${email}`,
        bgClass: 'bg-violet-100 dark:bg-violet-900/20',
        icon: (
          <svg className="w-5 h-5 text-brand-violet" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        ),
      })
    }

    items.push({
      key: 'location',
      label: t('contact.info.locationLabel'),
      value: siteSettings.location || t('contact.info.locationValue'),
      href: null,
      bgClass: 'bg-cyan-100 dark:bg-cyan-900/20',
      icon: (
        <svg className="w-5 h-5 text-brand-cyan" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
      ),
    })

    if (githubUrl) {
      items.push({
        key: 'github',
        label: t('contact.info.githubLabel'),
        value: githubHandle || siteSettings.site_name || 'GitHub',
        href: githubUrl,
        bgClass: 'bg-violet-100 dark:bg-violet-900/20',
        icon: (
          <svg className="w-5 h-5 text-brand-violet" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
        ),
      })
    }

    items.push({
      key: 'availability',
      label: t('contact.info.availabilityLabel'),
      value: t('contact.info.availabilityValue'),
      href: null,
      bgClass: 'bg-cyan-100 dark:bg-cyan-900/20',
      icon: (
        <svg className="w-5 h-5 text-brand-cyan" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    })

    return items
  }, [siteSettings, t])

  const socials = useMemo(() => {
    const list = []
    if (siteSettings.github_url) {
      const handle = siteSettings.github_url.replace(/^https?:\/\/(www\.)?github\.com\/?/i, '')
      list.push({
        name: t('shared.social.github'),
        handle: handle ? `@${handle}` : 'GitHub',
        url: siteSettings.github_url,
        bgClass: 'bg-gray-100 dark:bg-dark-600',
        icon: (
          <svg className="w-4 h-4 text-gray-700 dark:text-gray-300" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
        ),
      })
    }
    if (siteSettings.telegram_url) {
      const handle = siteSettings.telegram_url.replace(/^https?:\/\/(www\.)?t\.me\/?/i, '')
      list.push({
        name: t('shared.social.telegram'),
        handle: handle ? `@${handle}` : 'Telegram',
        url: siteSettings.telegram_url,
        bgClass: 'bg-sky-50 dark:bg-sky-900/20',
        icon: (
          <svg className="w-4 h-4 text-sky-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="m20.665 3.717-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.787l3.019-14.228c.309-1.239-.473-1.8-1.282-1.432z" />
          </svg>
        ),
      })
    }
    if (siteSettings.facebook_url) {
      list.push({
        name: t('shared.social.facebook'),
        handle: siteSettings.site_name || 'Facebook',
        url: siteSettings.facebook_url,
        bgClass: 'bg-blue-50 dark:bg-blue-900/20',
        icon: (
          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        ),
      })
    }
    return list
  }, [siteSettings, t])

  function resetForm() {
    setSubmitted(false)
    setForm({
      name: '',
      email: '',
      subject: '',
      company: '',
      project_type: 'Full-Stack Web App',
      budget_range: '$1,000 - $3,000',
      contact_method: 'Email',
      message: '',
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await publicApi.sendContact({ ...form, turnstile_token: turnstileToken })
      setSubmitted(true)
    } catch (err) {
      setError(err.response?.data?.message || t('contact.form.errorFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="contact-page">
      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="relative min-h-[70svh] sm:min-h-[75svh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06] pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(123, 47, 255, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(123, 47, 255, 0.08) 1px, transparent 1px)',
          backgroundSize: '72px 72px'
        }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white dark:to-dark-900 pointer-events-none" />
        <div className="absolute top-1/4 -left-32 w-[280px] sm:w-[480px] h-[280px] sm:h-[480px] rounded-full bg-brand-violet/12 blur-[100px] sm:blur-[140px] animate-float pointer-events-none" />
        <div className="absolute bottom-1/3 -right-32 w-[240px] sm:w-[420px] h-[240px] sm:h-[420px] rounded-full bg-brand-cyan/10 blur-[100px] sm:blur-[140px] animate-float pointer-events-none" style={{ animationDelay: '3s' }} />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10 pt-20 pb-16">
          <p className="font-display text-sm sm:text-base font-semibold uppercase tracking-[0.35em] text-brand-violet dark:text-brand-cyan mb-6 sm:mb-8">
            {t('contact.hero.eyebrow')}
          </p>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tightest mb-5 sm:mb-7 leading-[1.02]">
            <span className="text-gray-900 dark:text-white">
              <Trans
                t={t}
                i18nKey="contact.hero.heading"
                components={{ accent: <span className="gradient-text" /> }}
              />
            </span>
          </h1>

          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            {t('contact.hero.subtitle')}
          </p>
        </div>
      </section>

      {/* ═══════════════════ CONTACT CARDS ═══════════════════ */}
      <section className="pb-10 sm:pb-14 relative z-10 -mt-4">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="mb-8 text-center">
            <span className="section-label">{t('contact.info.label')}</span>
            <h2 className="section-heading text-3xl md:text-4xl">
              <Trans
                t={t}
                i18nKey="contact.info.heading"
                components={{ accent: <span className="gradient-text" /> }}
              />
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {contactInfo.map((info) => (
              <div
                key={info.key}
                className="group relative surface-panel p-6 text-center hover:-translate-y-1.5 hover:shadow-xl dark:hover:shadow-glow/10 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center transition-transform duration-500 ease-premium group-hover:scale-105 ${info.bgClass}`}>
                  {info.icon}
                </div>
                <h3 className="text-xs font-display font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-1.5">
                  {info.label}
                </h3>
                {info.href ? (
                  <a
                    href={info.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-brand-violet dark:hover:text-brand-cyan transition-colors break-all"
                  >
                    {info.value}
                  </a>
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-400">{info.value}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ FORM + SIDEBAR ═══════════════════ */}
      <section className="pb-20 sm:pb-28 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-[1fr_400px] gap-6 lg:gap-8">
            {/* Form */}
            <div className="surface-panel overflow-hidden">
              <div className="relative p-5 sm:p-8 md:p-10 pb-0">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-brand" />
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                      {t('contact.form.title')}
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('contact.form.subtitle')}
                    </p>
                  </div>
                </div>
              </div>

              {submitted ? (
                <div className="p-8 md:p-10">
                  <div className="text-center py-10">
                    <div className="relative w-20 h-20 mx-auto mb-6">
                      <div className="absolute inset-0 bg-green-400/20 rounded-full animate-ping" />
                      <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-3">
                      {t('contact.form.successTitle')}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6 leading-relaxed">
                      {t('contact.form.successMessage')}
                    </p>
                    <button type="button" className="btn-secondary text-sm" onClick={resetForm}>
                      {t('contact.form.sendAnother')}
                    </button>
                  </div>
                </div>
              ) : (
                <form className="p-5 sm:p-8 md:p-10 space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        {t('contact.form.nameLabel')} <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                        <input
                          type="text"
                          required
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          placeholder={t('contact.form.namePlaceholder')}
                          className="input-field pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        {t('contact.form.emailLabel')} <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                        </svg>
                        <input
                          type="email"
                          required
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder={t('contact.form.emailPlaceholder')}
                          className="input-field pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Company / Organization <span className="text-gray-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={form.company}
                        onChange={(e) => setForm({ ...form, company: e.target.value })}
                        placeholder="Your company or startup"
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Preferred Contact Method
                      </label>
                      <select
                        value={form.contact_method}
                        onChange={(e) => setForm({ ...form, contact_method: e.target.value })}
                        className="input-field"
                      >
                        <option value="Email">Email</option>
                        <option value="Telegram">Telegram</option>
                        <option value="WhatsApp">WhatsApp</option>
                        <option value="Phone">Phone</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Project Type
                      </label>
                      <select
                        value={form.project_type}
                        onChange={(e) => setForm({ ...form, project_type: e.target.value })}
                        className="input-field"
                      >
                        <option value="Full-Stack Web App">Full-Stack Web Application</option>
                        <option value="Backend API & Microservices">Backend API & Microservices</option>
                        <option value="Mobile Application">Mobile Application (Flutter)</option>
                        <option value="Architecture & DevOps">System Architecture & DevOps</option>
                        <option value="Consultation / Code Review">Technical Consultation / Review</option>
                        <option value="Other">Other Project</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Estimated Budget Range
                      </label>
                      <select
                        value={form.budget_range}
                        onChange={(e) => setForm({ ...form, budget_range: e.target.value })}
                        className="input-field"
                      >
                        <option value="< $1,000">&lt; $1,000</option>
                        <option value="$1,000 - $3,000">$1,000 - $3,000</option>
                        <option value="$3,000 - $5,000">$3,000 - $5,000</option>
                        <option value="$5,000+">$5,000+</option>
                        <option value="Negotiable / Hourly">Negotiable / Hourly</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      {t('contact.form.subjectLabel')} <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                      </svg>
                      <input
                        type="text"
                        required
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        placeholder={t('contact.form.subjectPlaceholder')}
                        className="input-field pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      {t('contact.form.messageLabel')} <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder={t('contact.form.messagePlaceholder')}
                      className="input-field resize-none"
                    />
                  </div>

                  {TURNSTILE_SITE_KEY && (
                    <TurnstileWidget
                      siteKey={TURNSTILE_SITE_KEY}
                      onVerify={(token) => setTurnstileToken(token)}
                    />
                  )}

                  {error && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                      {error}
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary gap-2 w-full sm:w-auto"
                    >
                      {submitting ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          {t('contact.form.sending')}
                        </>
                      ) : (
                        <>
                          {t('contact.form.submit')}
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              <div className="surface-panel p-6 sm:p-8">
                <h3 className="font-display text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {t('contact.community.title')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                  {t('contact.community.description')}
                </p>
                <div className="space-y-3">
                  {socials.map((social, idx) => (
                    <a
                      key={idx}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] hover:bg-brand-violet/5 dark:hover:bg-brand-violet/10 border border-gray-100 dark:border-white/5 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${social.bgClass}`}>
                          {social.icon}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-brand-violet dark:group-hover:text-brand-cyan transition-colors">
                            {social.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{social.handle}</p>
                        </div>
                      </div>
                      <svg className="w-4 h-4 text-gray-400 group-hover:text-brand-violet dark:group-hover:text-brand-cyan transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  )
}
