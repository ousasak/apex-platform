import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';

export default function TermsOfServiceView() {
  const { t } = useTranslation('public');

  return (
    <div className="min-h-screen bg-white dark:bg-dark-900">
      {/* Hero */}
      <section className="relative py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-violet/5 via-transparent to-brand-cyan/5"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('terms.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">{t('terms.lastUpdated')}</p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {t('terms.sections.acceptance.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              <Trans
                t={t}
                i18nKey="terms.sections.acceptance.content"
                components={{
                  siteLink: (
                    <a
                      href="https://www.apex-team.space"
                      className="text-brand-violet dark:text-brand-cyan hover:underline"
                    />
                  ),
                }}
              />
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {t('terms.sections.description.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {t('terms.sections.description.content')}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {t('terms.sections.userAccounts.title')}
            </h2>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
              <li>{t('terms.sections.userAccounts.items.register')}</li>
              <li>{t('terms.sections.userAccounts.items.confidentiality')}</li>
              <li>{t('terms.sections.userAccounts.items.accurateInfo')}</li>
              <li>{t('terms.sections.userAccounts.items.activities')}</li>
              <li>{t('terms.sections.userAccounts.items.termination')}</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {t('terms.sections.userContent.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
              {t('terms.sections.userContent.intro')}
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
              <li>{t('terms.sections.userContent.items.ownership')}</li>
              <li>{t('terms.sections.userContent.items.license')}</li>
              <li>{t('terms.sections.userContent.items.acceptableUse')}</li>
              <li>{t('terms.sections.userContent.items.removal')}</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {t('terms.sections.intellectualProperty.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {t('terms.sections.intellectualProperty.content')}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {t('terms.sections.prohibitedConduct.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
              {t('terms.sections.prohibitedConduct.intro')}
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
              <li>{t('terms.sections.prohibitedConduct.items.unlawful')}</li>
              <li>{t('terms.sections.prohibitedConduct.items.unauthorizedAccess')}</li>
              <li>{t('terms.sections.prohibitedConduct.items.disrupt')}</li>
              <li>{t('terms.sections.prohibitedConduct.items.maliciousCode')}</li>
              <li>{t('terms.sections.prohibitedConduct.items.impersonate')}</li>
              <li>{t('terms.sections.prohibitedConduct.items.scrape')}</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {t('terms.sections.thirdParty.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {t('terms.sections.thirdParty.content')}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {t('terms.sections.disclaimer.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {t('terms.sections.disclaimer.content')}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {t('terms.sections.liability.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {t('terms.sections.liability.content')}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {t('terms.sections.changes.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {t('terms.sections.changes.content')}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {t('terms.sections.contact.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              <Trans
                t={t}
                i18nKey="terms.sections.contact.content"
                components={{
                  contactLink: (
                    <Link to="/contact" className="text-brand-violet dark:text-brand-cyan hover:underline" />
                  ),
                }}
              />
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
