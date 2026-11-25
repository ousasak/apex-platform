import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function NotFoundView() {
  const { t } = useTranslation('public');

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center" data-aos="fade-up">
        <h1 className="text-8xl font-sans font-bold gradient-text mb-4">{t('notFound.code')}</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">{t('notFound.message')}</p>
        <Link to="/" className="btn-primary">{t('notFound.backHome')}</Link>
      </div>
    </div>
  );
}
