import React, { Suspense, lazy, useEffect } from 'react'
import { Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'

// Layouts
import PublicLayout from '../components/layout/PublicLayout'
import AuthLayout from '../components/layout/AuthLayout'
import AdminLayout from '../components/layout/AdminLayout'

// ── Fallback Loader ──────────────────────────────────────────────────────────
export function PageFallback() {
  const { t } = useTranslation('common')
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-2 border-brand-violet/20 border-t-brand-violet animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse" />
        </div>
      </div>
      <p className="mt-4 text-xs font-medium text-gray-400 uppercase tracking-widest animate-pulse">
        {t('actions.loading')}
      </p>
    </div>
  )
}

// ── Route Guards ─────────────────────────────────────────────────────────────
export function ProtectedRoute({
  children,
  adminOnly = false,
  superAdminOnly = false,
  resource,
  action,
}) {
  const { isAuthenticated, isAdmin, isSuperAdmin, canDo, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <PageFallback />
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  if (superAdminOnly && !isSuperAdmin) {
    return <Navigate to="/admin" replace />
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />
  }

  if (resource && action && !canDo(resource, action)) {
    return <Navigate to="/admin" replace />
  }

  return children
}

export function PublicRoute({ children, guestOnly = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <PageFallback />
  }

  if (guestOnly && isAuthenticated) {
    const from = location.state?.from?.pathname || (isAdmin ? '/admin' : '/')
    return <Navigate to={from} replace />
  }

  return children
}

export function AdminRoute({ children, resource, action }) {
  return (
    <ProtectedRoute adminOnly resource={resource} action={action}>
      {children}
    </ProtectedRoute>
  )
}

export function SuperAdminRoute({ children }) {
  return <ProtectedRoute superAdminOnly>{children}</ProtectedRoute>
}

// ── Lazy-loaded Public Pages ─────────────────────────────────────────────────
const HomePage = lazy(() => import('../pages/public/HomePage'))
const AboutPage = lazy(() => import('../pages/public/AboutPage'))
const PublicProjectsPage = lazy(() => import('../pages/projects/PublicProjectsPage'))
const ProjectDetailPage = lazy(() => import('../pages/projects/ProjectDetailPage'))
const BlogPage = lazy(() => import('../pages/blog/BlogPage'))
const BlogPostPage = lazy(() => import('../pages/blog/BlogPostPage'))
const PublicUserProfilePage = lazy(() => import('../pages/users/PublicUserProfilePage'))
const PublicSeriesDetailPage = lazy(() => import('../pages/series/PublicSeriesDetailPage'))
const PublicCollectionDetailPage = lazy(() => import('../pages/collections/PublicCollectionDetailPage'))
const JoinUsPage = lazy(() => import('../pages/public/JoinUsPage'))
const ContactPage = lazy(() => import('../pages/public/ContactPage'))
const PrivacyPolicyPage = lazy(() => import('../pages/public/PrivacyPolicyPage'))
const TermsOfServicePage = lazy(() => import('../pages/public/TermsOfServicePage'))
const PublicDocsPage = lazy(() => import('../pages/docs/PublicDocsPage'))
const NotFoundPage = lazy(() => import('../pages/public/NotFoundPage'))

// ── Lazy-loaded Auth Pages ───────────────────────────────────────────────────
const LoginPage = lazy(() => import('../pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('../pages/auth/ResetPasswordPage'))
const GoogleCallbackPage = lazy(() => import('../pages/auth/GoogleCallbackPage'))
const GitHubCallbackPage = lazy(() => import('../pages/auth/GitHubCallbackPage'))

// ── Lazy-loaded Member Pages ─────────────────────────────────────────────────
const ProfilePage = lazy(() => import('../pages/profile/ProfilePage'))
const MemberSettingsPage = lazy(() => import('../pages/settings/MemberSettingsPage'))
const NotificationsPage = lazy(() => import('../pages/notifications/NotificationsPage'))

// ── Lazy-loaded Admin Pages ──────────────────────────────────────────────────
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage'))
const UsersPage = lazy(() => import('../pages/users/UsersPage'))
const UserEditPage = lazy(() => import('../pages/users/UserEditPage'))
const ProjectsPage = lazy(() => import('../pages/projects/ProjectsPage'))
const ProjectFormPage = lazy(() => import('../pages/projects/ProjectFormPage'))
const SkillsAdminPage = lazy(() => import('../pages/skills/SkillsAdminPage'))
const ExperienceAdminPage = lazy(() => import('../pages/experience/ExperienceAdminPage'))
const ServicesAdminPage = lazy(() => import('../pages/services/ServicesAdminPage'))
const ResumeAdminPage = lazy(() => import('../pages/resume/ResumeAdminPage'))
const CollectionsPage = lazy(() => import('../pages/collections/CollectionsPage'))
const BlogPostsAdminPage = lazy(() => import('../pages/blog/BlogPostsAdminPage'))
const BlogPostFormPage = lazy(() => import('../pages/blog/BlogPostFormPage'))
const SeriesPage = lazy(() => import('../pages/series/SeriesPage'))
const CategoriesPage = lazy(() => import('../pages/categories/CategoriesPage'))
const TagsPage = lazy(() => import('../pages/tags/TagsPage'))
const ApplicationsPage = lazy(() => import('../pages/applications/ApplicationsPage'))
const MessagesPage = lazy(() => import('../pages/messages/MessagesPage'))
const TeamPage = lazy(() => import('../pages/team/TeamPage'))
const MediaPage = lazy(() => import('../pages/media/MediaPage'))
const SettingsPage = lazy(() => import('../pages/settings/SettingsPage'))
const ActivityLogsPage = lazy(() => import('../pages/logs/ActivityLogsPage'))
const RolesPage = lazy(() => import('../pages/roles/RolesPage'))
const ApprovalRequestsPage = lazy(() => import('../pages/approvals/ApprovalRequestsPage'))
const DocsPage = lazy(() => import('../pages/docs/DocsPage'))
const DocsReorderPage = lazy(() => import('../pages/docs/DocsReorderPage'))
const DocFormPage = lazy(() => import('../pages/docs/DocFormPage'))
const DocMenusPage = lazy(() => import('../pages/docs/DocMenusPage'))
const DocCategoriesPage = lazy(() => import('../pages/docs/DocCategoriesPage'))

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function LegacyDocRedirect() {
  const { slug } = useParams()
  return <Navigate to={`/docs/${slug || ''}`} replace />
}

export default function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="services" element={<Navigate to="/#services" replace />} />
            <Route path="projects" element={<PublicProjectsPage />} />
            <Route path="projects/:slug" element={<ProjectDetailPage />} />
            <Route path="blog" element={<BlogPage />} />
            <Route path="blog/:slug" element={<BlogPostPage />} />
            <Route path="team" element={<AboutPage />} />
            <Route path="join" element={<JoinUsPage />} />
            <Route path="join-us" element={<JoinUsPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="privacy" element={<PrivacyPolicyPage />} />
            <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="terms" element={<TermsOfServicePage />} />
            <Route path="terms-of-service" element={<TermsOfServicePage />} />

            {/* Public User Profile & scoped series/collections */}
            <Route path="author/:username" element={<PublicUserProfilePage />} />
            <Route path="series/:username/:slug" element={<PublicSeriesDetailPage />} />
            <Route path="collections/:username/:slug" element={<PublicCollectionDetailPage />} />
            <Route path="u/:username" element={<PublicUserProfilePage />} />
            <Route path="u/:username/series/:slug" element={<PublicSeriesDetailPage />} />
            <Route path="u/:username/collections/:slug" element={<PublicCollectionDetailPage />} />

            {/* Documentation */}
            <Route path="docs" element={<PublicDocsPage />} />
            <Route path="docs/:slug" element={<PublicDocsPage />} />
            <Route path="documentation" element={<Navigate to="/docs" replace />} />
            <Route path="documentation/:slug" element={<LegacyDocRedirect />} />

            {/* Member Profile & Settings (Authenticated users) */}
            <Route
              path="member/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="member/settings"
              element={
                <ProtectedRoute>
                  <MemberSettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="settings"
              element={
                <ProtectedRoute>
                  <MemberSettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="member/notifications"
              element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="notifications"
              element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route
              path="auth/login"
              element={
                <PublicRoute guestOnly>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="login"
              element={<Navigate to="/auth/login" replace />}
            />
            <Route
              path="auth/register"
              element={
                <PublicRoute guestOnly>
                  <RegisterPage />
                </PublicRoute>
              }
            />
            <Route
              path="register"
              element={<Navigate to="/auth/register" replace />}
            />
            <Route
              path="auth/forgot-password"
              element={
                <PublicRoute guestOnly>
                  <ForgotPasswordPage />
                </PublicRoute>
              }
            />
            <Route
              path="auth/reset-password"
              element={
                <PublicRoute guestOnly>
                  <ResetPasswordPage />
                </PublicRoute>
              }
            />
            <Route
              path="auth/reset-password/:token"
              element={
                <PublicRoute guestOnly>
                  <ResetPasswordPage />
                </PublicRoute>
              }
            />
            <Route path="auth/google/callback" element={<GoogleCallbackPage />} />
            <Route path="auth/github/callback" element={<GitHubCallbackPage />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="dashboard" element={<Navigate to="/admin" replace />} />
            <Route path="users" element={<SuperAdminRoute><UsersPage /></SuperAdminRoute>} />
            <Route path="users/:id" element={<SuperAdminRoute><UserEditPage /></SuperAdminRoute>} />
            <Route path="users/:id/edit" element={<SuperAdminRoute><UserEditPage /></SuperAdminRoute>} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="projects/create" element={<ProjectFormPage />} />
            <Route path="projects/:id/edit" element={<ProjectFormPage />} />
            <Route path="skills" element={<SkillsAdminPage />} />
            <Route path="experience" element={<ExperienceAdminPage />} />
            <Route path="services" element={<ServicesAdminPage />} />
            <Route path="resume" element={<ResumeAdminPage />} />
            <Route path="collections" element={<CollectionsPage />} />
            <Route path="blog" element={<BlogPostsAdminPage />} />
            <Route path="blog/posts" element={<BlogPostsAdminPage />} />
            <Route path="blog/create" element={<BlogPostFormPage />} />
            <Route path="blog/posts/create" element={<BlogPostFormPage />} />
            <Route path="blog/:id/edit" element={<BlogPostFormPage />} />
            <Route path="blog/posts/:id/edit" element={<BlogPostFormPage />} />
            <Route path="series" element={<SeriesPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="tags" element={<TagsPage />} />
            <Route path="applications" element={<ApplicationsPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="team" element={<TeamPage />} />
            <Route path="media" element={<MediaPage />} />
            <Route path="settings" element={<SuperAdminRoute><SettingsPage /></SuperAdminRoute>} />
            <Route path="activity-logs" element={<SuperAdminRoute><ActivityLogsPage /></SuperAdminRoute>} />
            <Route path="roles" element={<SuperAdminRoute><RolesPage /></SuperAdminRoute>} />
            <Route path="approvals" element={<SuperAdminRoute><ApprovalRequestsPage /></SuperAdminRoute>} />
            <Route path="approval-requests" element={<SuperAdminRoute><ApprovalRequestsPage /></SuperAdminRoute>} />
            <Route path="docs" element={<DocsPage />} />
            <Route path="docs/reorder" element={<DocsReorderPage />} />
            <Route path="docs/create" element={<DocFormPage />} />
            <Route path="docs/:id/edit" element={<DocFormPage />} />
            <Route path="doc-menus" element={<DocMenusPage />} />
            <Route path="docs/menus" element={<DocMenusPage />} />
            <Route path="doc-categories" element={<DocCategoriesPage />} />
            <Route path="docs/categories" element={<DocCategoriesPage />} />
          </Route>

          {/* 404 Catch All */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  )
}
