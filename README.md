<div align="center">

# Apex Platform

**A modern full-stack portfolio & CMS platform**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Laravel](https://img.shields.io/badge/Laravel-11-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

[Features](#-features) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [Architecture](#-architecture) · [API Reference](#-api-reference)

</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🌐 Public Website
- **Home** — Hero section with animated starfield & galaxy background
- **Projects** — Portfolio showcase with tag filtering & slug-based URLs
- **Blog** — Full CMS with categories, syntax-highlighted code blocks
- **Skills & Stack** — Tech skills with categories and proficiency levels
- **Experience** — Work & education timeline
- **Services** — Offered services showcase
- **Resume / CV** — PDF resume upload & public download
- **Contact** — Message submission with admin inbox

</td>
<td width="50%">

### 🛡️ Admin Dashboard
- **Analytics** — Real-time dashboard with Chart.js statistics
- **Content Management** — Full CRUD for projects, blog posts & categories
- **Rich Text Editor** — Tiptap editor with image upload, video embed & code blocks
- **Media Library** — Upload, browse & manage media files
- **User Management** — Role-based access control (Admin / Member)
- **Activity Logs** — Complete audit trail of all admin actions
- **Portfolio Management** — Manage Skills, Experience, Services & Resume

</td>
</tr>
<tr>
<td>

### 🎨 Design & UX
- **Dark / Light Mode** — Smooth theme toggle with persistence
- **Space Theme** — Animated starfield, galaxy effects & glassmorphism
- **Fully Responsive** — Mobile-first design across all pages
- **Animations** — AOS scroll animations & custom keyframes
- **Toast Notifications** — Auto-dismiss notification system

</td>
<td>

### 🔐 Authentication & Security
- **Sanctum Token Auth** — Secure SPA authentication
- **Role-Based Access** — Admin & Member route guards
- **Password Reset** — Complete forgot/reset password flow
- **Profile Management** — Avatar upload & password change
- **Real-Time Notifications** — Polling for unread count

</td>
</tr>
</table>

---

## 🛠 Tech Stack

### Frontend

| Technology | Version | Purpose |
|:-----------|:--------|:--------|
| [React](https://react.dev/) | 19.x | UI library (Hooks, Context API) |
| [Vite](https://vitejs.dev/) | 5.x | Build tool & dev server |
| [React Router](https://reactrouter.com/) | 7.x | Client-side routing with lazy loading |
| [Tailwind CSS](https://tailwindcss.com/) | 3.4 | Utility-first CSS framework |
| [Tiptap](https://tiptap.dev/) | 3.22 | Rich text editor (20+ extensions) |
| [Chart.js](https://www.chartjs.org/) | 4.x | Dashboard analytics charts |
| [AOS](https://michalsnik.github.io/aos/) | 2.3 | Scroll reveal animations |
| [Axios](https://axios-http.com/) | 1.6 | HTTP client with interceptors |
| [i18next](https://www.i18next.com/) | — | Internationalization (EN / KM) |

### Backend

| Technology | Version | Purpose |
|:-----------|:--------|:--------|
| [Laravel](https://laravel.com/) | 11.x | PHP API framework |
| [PHP](https://www.php.net/) | 8.3 | Server-side runtime |
| [Sanctum](https://laravel.com/docs/sanctum) | 4.x | Token-based SPA authentication |
| [PostgreSQL](https://www.postgresql.org/) | 16 | Relational database |
| [Eloquent ORM](https://laravel.com/docs/eloquent) | — | Database abstraction |

### DevOps

| Technology | Purpose |
|:-----------|:--------|
| [Docker](https://www.docker.com/) | Containerized development & deployment |
| [Docker Compose](https://docs.docker.com/compose/) | Multi-container orchestration |
| [pgAdmin 4](https://www.pgadmin.org/) | Database GUI management |

---

## 🚀 Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) 20+ (for local webclient dev)

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/ousasak/apex-platform.git
cd apex-platform
```

**2. Configure environment**

```bash
cp backend/.env.example backend/.env
```

**3. Start all services**

```bash
docker-compose up -d
```

**4. Initialize the backend**

```bash
docker exec -it apex_backend bash

# Inside the container:
composer install
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
exit
```

**5. Access the application**

| Service | URL | Credentials |
|:--------|:----|:------------|
| 🌐 Frontend | [`localhost:3000`](http://localhost:3000) | — |
| ⚡ Backend API | [`localhost:8003/api`](http://localhost:8003/api) | — |
| 🗄️ pgAdmin | [`localhost:5050`](http://localhost:5050) | `admin@apex.dev` / `admin123` |
| 🔑 Admin Panel | [`localhost:3000/auth/login`](http://localhost:3000/auth/login) | `admin@apex.dev` / `password` |

### Webclient local scripts

```bash
cd webclient

# Development server
npm run dev

# Production build
npm run build

# Preview production output
npm run preview
```

### Webclient environment variables

Set these in `webclient/.env`:

```bash
VITE_API_URL=http://localhost:8003/api
VITE_SITE_URL=http://localhost:3000
```

### Useful Commands

```bash
# Stop all services
docker-compose down

# Rebuild after dependency changes
docker-compose build --no-cache webclient
docker-compose up -d -V webclient

# View logs
docker-compose logs -f backend
docker-compose logs -f webclient

# Run artisan commands
docker exec -it apex_backend php artisan migrate:fresh --seed

# Access database shell
docker exec -it apex_postgres psql -U apex_user -d apex_db
```

---

## 🏗 Architecture

### Container Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    Docker Compose Network                     │
│                      (apex_network)                           │
│                                                              │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │  Webclient  │  │   Backend    │  │     PostgreSQL       │ │
│  │  React +    │  │  Laravel 11  │  │     16-alpine        │ │
│  │  Vite       │──│  PHP 8.3 FPM │──│                     │ │
│  │  :3000      │  │  :8003       │  │  :5432              │ │
│  │  Node 20    │  │  Sanctum     │  │  apex_db            │ │
│  └─────────────┘  └──────────────┘  └─────────────────────┘ │
│                                       │                      │
│                    ┌──────────────┐    │                      │
│                    │   pgAdmin 4  │────┘                      │
│                    │   :5050      │                           │
│                    └──────────────┘                           │
└──────────────────────────────────────────────────────────────┘
```

### Project Structure

```
apex-platform/
├── docker-compose.yml          # Container orchestration
│
├── webclient/                  # React + Vite frontend
│   ├── src/
│   │   ├── api/                # Axios client & interceptors
│   │   ├── assets/             # Styles, fonts, images
│   │   ├── components/         # Reusable React components
│   │   ├── contexts/           # React Context providers
│   │   ├── pages/              # Route page components
│   │   │   ├── public/         # Public pages (Home, About, Blog...)
│   │   │   ├── admin/          # Admin dashboard pages
│   │   │   ├── skills/         # Skills admin page
│   │   │   ├── experience/     # Experience admin page
│   │   │   ├── services/       # Services admin page
│   │   │   └── resume/         # Resume admin page
│   │   ├── routes/             # AppRoutes with lazy loading
│   │   ├── services/           # API service layer
│   │   └── lib/                # i18n, utilities
│   ├── Dockerfile
│   ├── vite.config.js
│   └── package.json
│
├── backend/                    # Laravel 11 API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/    # API controllers
│   │   │   ├── Middleware/     # Auth & role middleware
│   │   │   ├── Requests/       # Form validation
│   │   │   └── Resources/      # JSON API resources
│   │   ├── Models/             # Eloquent models
│   │   └── Notifications/      # Email & push notifications
│   ├── database/
│   │   ├── migrations/         # Database migrations
│   │   └── seeders/            # Sample data seeders
│   ├── routes/
│   │   └── api/                # RESTful API routes
│   ├── Dockerfile
│   └── composer.json
│
└── pgadmin/
    └── servers.json            # Pre-configured DB connection
```

---

## 📡 API Reference

### Public Endpoints

```
POST   /api/auth/login              # User login
POST   /api/auth/register           # User registration
POST   /api/auth/forgot-password    # Request password reset
POST   /api/auth/reset-password     # Reset password with token

GET    /api/projects                # List all projects
GET    /api/projects/{slug}         # Get project by slug
GET    /api/blog/posts              # List blog posts
GET    /api/blog/posts/{slug}       # Get blog post by slug
GET    /api/blog/categories         # List blog categories
GET    /api/skills                  # List skills
GET    /api/experiences             # List experiences
GET    /api/services                # List services
GET    /api/team                    # List team members
GET    /api/tags                    # List all tags
GET    /api/settings/public         # Public site settings
GET    /api/resume/download         # Download resume PDF

POST   /api/contact                 # Send contact message
POST   /api/applications            # Submit application
```

### Authenticated Endpoints

```
POST   /api/auth/logout             # Logout (revoke token)
GET    /api/auth/me                 # Current user profile

GET    /api/member/profile          # Get member profile
PUT    /api/member/profile          # Update member profile
PUT    /api/member/password         # Change password
POST   /api/member/avatar           # Upload avatar
```

### Admin Endpoints

```
GET    /api/admin/dashboard/stats       # Dashboard statistics
GET    /api/admin/dashboard/activity    # Recent activity feed

       /api/admin/users                 # Users CRUD
       /api/admin/projects              # Projects CRUD
       /api/admin/blog/posts            # Blog Posts CRUD
       /api/admin/blog/categories       # Categories CRUD
       /api/admin/team                  # Team Members CRUD
       /api/admin/tags                  # Tags CRUD
       /api/admin/roles                 # Roles CRUD
       /api/admin/skills                # Skills CRUD + reorder
       /api/admin/experiences           # Experiences CRUD
       /api/admin/services              # Services CRUD

GET    /api/admin/resume/status         # Resume upload status
POST   /api/admin/resume/upload         # Upload resume PDF

GET    /api/admin/applications          # List applications
GET    /api/admin/messages              # List messages
POST   /api/admin/media/upload          # Upload media file
GET    /api/admin/settings              # Get all settings
PUT    /api/admin/settings              # Update settings
GET    /api/admin/activity-logs         # View audit logs
GET    /api/admin/search                # Global admin search
```

---

## 🎨 Design System

### Color Palette

| Color | Hex | Usage |
|:------|:----|:------|
| 🟣 Violet | `#7b2fff` | Primary brand color |
| 🔵 Cyan | `#00d4ff` | Accent & highlights |
| ⚫ Deep Space | `#020024` | Dark mode background |
| 🔵 Nebula | `#2a2570` | Dark mode surfaces |

### Typography

| Font | Usage |
|:-----|:------|
| **Plus Jakarta Sans** | Body text, headings, UI |
| **Fira Code** | Code blocks, monospace |

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow [React best practices](https://react.dev/learn) for frontend code
- Follow [Laravel Best Practices](https://github.com/alexeymezenin/laravel-best-practices) for backend code
- Write meaningful commit messages
- Keep PRs focused and concise

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

[![Made with React](https://img.shields.io/badge/Made_with-React-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Powered by Laravel](https://img.shields.io/badge/Powered_by-Laravel-FF2D20?style=flat-square&logo=laravel)](https://laravel.com/)
[![Runs on Docker](https://img.shields.io/badge/Runs_on-Docker-2496ED?style=flat-square&logo=docker)](https://www.docker.com/)

⭐ Star this repo if you find it useful!

</div>
