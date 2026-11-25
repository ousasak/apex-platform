import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import enCommon from '../locales/en/common.json'
import enAuth from '../locales/en/auth.json'
import enDashboard from '../locales/en/dashboard.json'
import enNavigation from '../locales/en/navigation.json'
import enPublic from '../locales/en/public.json'
import enBlog from '../locales/en/blog.json'
import enProjects from '../locales/en/projects.json'
import enDocs from '../locales/en/docs.json'
import enUsers from '../locales/en/users.json'
import enManagement from '../locales/en/management.json'
import enOperations from '../locales/en/operations.json'

import kmCommon from '../locales/km/common.json'
import kmAuth from '../locales/km/auth.json'
import kmDashboard from '../locales/km/dashboard.json'
import kmNavigation from '../locales/km/navigation.json'
import kmPublic from '../locales/km/public.json'
import kmBlog from '../locales/km/blog.json'
import kmProjects from '../locales/km/projects.json'
import kmDocs from '../locales/km/docs.json'
import kmUsers from '../locales/km/users.json'
import kmManagement from '../locales/km/management.json'
import kmOperations from '../locales/km/operations.json'

const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    dashboard: enDashboard,
    navigation: enNavigation,
    public: enPublic,
    blog: enBlog,
    projects: enProjects,
    docs: enDocs,
    users: enUsers,
    management: enManagement,
    operations: enOperations,
  },
  km: {
    common: kmCommon,
    auth: kmAuth,
    dashboard: kmDashboard,
    navigation: kmNavigation,
    public: kmPublic,
    blog: kmBlog,
    projects: kmProjects,
    docs: kmDocs,
    users: kmUsers,
    management: kmManagement,
    operations: kmOperations,
  },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'km'],
    defaultNS: 'common',
    ns: [
      'common',
      'navigation',
      'auth',
      'dashboard',
      'public',
      'blog',
      'projects',
      'docs',
      'users',
      'management',
      'operations',
    ],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

export default i18n
