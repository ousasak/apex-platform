import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';

export default function PrivacyPolicyView() {
  const { t } = useTranslation('public');

  return (
    <div className="min-h-screen bg-white dark:bg-dark-900">
      {/* Hero */}
      <section className="relative py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-violet/5 via-transparent to-brand-cyan/5"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('privacy.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">{t('privacy.lastUpdated')}</p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {t('privacy.sections.introduction.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              <Trans
                t={t}
                i18nKey="privacy.sections.introduction.content"
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
              {t('privacy.sections.informationWeCollect.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
              {t('privacy.sections.informationWeCollect.intro')}
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
              <li>
                <Trans
                  t={t}
                  i18nKey="privacy.sections.informationWeCollect.items.account"
                  components={{ bold: <strong className="text-gray-900 dark:text-white" /> }}
                />
              </li>
              <li>
                <Trans
                  t={t}
                  i18nKey="privacy.sections.informationWeCollect.items.profile"
                  components={{ bold: <strong className="text-gray-900 dark:text-white" /> }}
                />
              </li>
              <li>
                <Trans
                  t={t}
                  i18nKey="privacy.sections.informationWeCollect.items.usage"
                  components={{ bold: <strong className="text-gray-900 dark:text-white" /> }}
                />
              </li>
              <li>
                <Trans
                  t={t}
                  i18nKey="privacy.sections.informationWeCollect.items.contact"
                  components={{ bold: <strong className="text-gray-900 dark:text-white" /> }}
                />
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {t('privacy.sections.howWeUse.title')}
            </h2>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
              <li>{t('privacy.sections.howWeUse.items.manageAccount')}</li>
              <li>{t('privacy.sections.howWeUse.items.provideServices')}</li>
              <li>{t('privacy.sections.howWeUse.items.respondInquiries')}</li>
              <li>{t('privacy.sections.howWeUse.items.sendUpdates')}</li>
              <li>{t('privacy.sections.howWeUse.items.improveWebsite')}</li>
              <li>{t('privacy.sections.howWeUse.items.protectAbuse')}</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {t('privacy.sections.thirdParty.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {t('privacy.sections.thirdParty.intro')}
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2 mt-3">
              <li>
                <Trans
                  t={t}
                  i18nKey="privacy.sections.thirdParty.items.google"
                  components={{
                    bold: <strong className="text-gray-900 dark:text-white" />,
                    policyLink: (
                      <a
                        href="https://policies.google.com/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-violet dark:text-brand-cyan hover:underline"
                      />
                    ),
                  }}
                />
              </li>
              <li>
                <Trans
                  t={t}
                  i18nKey="privacy.sections.thirdParty.items.github"
                  components={{
                    bold: <strong className="text-gray-900 dark:text-white" />,
                    policyLink: (
                      <a
                        href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-violet dark:text-brand-cyan hover:underline"
                      />
                    ),
                  }}
                />
              </li>
              <li>
                <Trans
                  t={t}
                  i18nKey="privacy.sections.thirdParty.items.cloudflare"
                  components={{
                    bold: <strong className="text-gray-900 dark:text-white" />,
                    policyLink: (
                      <a
                        href="https://www.cloudflare.com/privacypolicy/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-violet dark:text-brand-cyan hover:underline"
                      />
                    ),
                  }}
                />
              </li>
              <li>
                <Trans
                  t={t}
                  i18nKey="privacy.sections.thirdParty.items.cloudinary"
                  components={{ bold: <strong className="text-gray-900 dark:text-white" /> }}
                />
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {t('privacy.sections.dataSecurity.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {t('privacy.sections.dataSecurity.content')}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {t('privacy.sections.dataRetention.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {t('privacy.sections.dataRetention.content')}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {t('privacy.sections.yourRights.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
              {t('privacy.sections.yourRights.intro')}
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-400 space-y-2">
              <li>{t('privacy.sections.yourRights.items.access')}</li>
              <li>{t('privacy.sections.yourRights.items.correction')}</li>
              <li>{t('privacy.sections.yourRights.items.deletion')}</li>
              <li>{t('privacy.sections.yourRights.items.withdrawConsent')}</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {t('privacy.sections.childrenPrivacy.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {t('privacy.sections.childrenPrivacy.content')}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {t('privacy.sections.changes.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {t('privacy.sections.changes.content')}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {t('privacy.sections.contact.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              <Trans
                t={t}
                i18nKey="privacy.sections.contact.content"
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
