# Fixonest Customer Website

**Fixonest** is a home-services marketplace. Customers find and book
repair or household services (plumbing, electrical work, cleaning and so
on), or book a technician by the hour. Admins run each service area, and
technicians ("providers") carry out the jobs. This repository is the
**customer-facing website**, built with React 19 and Vite.

> MCA Semester IV project, Amity University Online, by Subhankar Bhattacharyya.

## The Fixonest platform

The project is split across three repositories, all on the `development` branch:

| Repository                                                                                          | What it is                                             | Used by                                   |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ----------------------------------------- |
| [fixonest_backend](https://github.com/subhankar-bhattacharyya-amity/fixonest_backend)               | Node.js + Express 5 + MongoDB REST API (349 endpoints) | Both front ends                           |
| [fixonest_frontend](https://github.com/subhankar-bhattacharyya-amity/fixonest_frontend) (this repo) | React customer website                                 | Customers and visitors                    |
| [fixonest_admin](https://github.com/subhankar-bhattacharyya-amity/fixonest_admin)                   | React panel with one login for three roles             | Super Admin, Admin, Provider (Technician) |

```text
 Customer website (this repo) ─┐
                               ├──►  Fixonest API (Express 5)  ──►  MongoDB
 Admin panel ──────────────────┘
```

The website only talks to the backend's **customer API** (`/api/...`).
The backend must be running first.

## What a customer can do

| Area           | Pages and features                                                                                                                                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Explore**    | Home page with hero, featured services, testimonials and FAQs; About page with the team; Services list and a detail page for each service; Technicians list and detail pages; Blog list and articles, with comments |
| **Account**    | Register, then verify the email with a one-time code (OTP); log in; reset a forgotten password; edit the profile; manage saved addresses                                                                            |
| **Book**       | Book a listed service (`/book/service/:slug`) or hire a technician by the hour (`/book/worker/:workerId`): choose a date, a free timeslot and a saved address                                                       |
| **Track**      | **My Bookings**: booking stats, lists filtered by status (pending, upcoming, in progress, completed, cancelled), cancelling a booking, and invoices                                                                 |
| **Contact**    | A contact form that sends a message to the team                                                                                                                                                                     |
| **Experience** | Light and dark theme, responsive layout, toast messages and protected routes that ask the visitor to log in first                                                                                                   |

### Routes

| URL                                                        | Page                               | Login needed     |
| ---------------------------------------------------------- | ---------------------------------- | ---------------- |
| `/`, `/home`                                               | Home                               | No               |
| `/about`                                                   | About and team                     | No               |
| `/services`, `/services/:slug`                             | Services and service details       | No               |
| `/workers`, `/workers/:workerId`                           | Technicians and technician details | No               |
| `/blog`, `/blog/:postId`                                   | Blog and article                   | No               |
| `/contact`                                                 | Contact form                       | No               |
| `/login`, `/register`, `/verify-email`, `/forgot-password` | Authentication                     | No (guests only) |
| `/profile`                                                 | Profile and saved addresses        | Yes              |
| `/book/service/:slug`, `/book/worker/:workerId`            | Booking                            | Yes              |
| `/my-bookings`                                             | My Bookings                        | Yes              |

## Tech stack

| Purpose                 | Library                                          |
| ----------------------- | ------------------------------------------------ |
| UI                      | React 19, Vite 8                                 |
| Styling                 | Tailwind CSS v4, with the Plus Jakarta Sans font |
| Routing                 | react-router-dom 7                               |
| State and API calls     | Redux Toolkit (`createAsyncThunk`) and axios     |
| Forms and validation    | react-hook-form and Zod                          |
| Notifications           | Sonner toasts                                    |
| Icons                   | lucide-react                                     |
| Animation and carousels | framer-motion and Embla Carousel                 |
| Phone input             | react-phone-number-input                         |
| Linting                 | Oxlint                                           |

## Getting started

### 1. Prerequisites

- Node.js 24 or newer
- The [backend](https://github.com/subhankar-bhattacharyya-amity/fixonest_backend), seeded and running (by default on `http://localhost:7055`)

### 2. Install and configure

```bash
git clone -b development https://github.com/subhankar-bhattacharyya-amity/fixonest_frontend.git
cd fixonest_frontend
npm install
```

Create `.env.development` in the project root. It is git-ignored.

```ini
VITE_API_BASE_URL=http://localhost:7055
```

### 3. Run

```bash
npm run dev -- --port 5173   # start the dev server
npm run build                # production build → dist/
npm run preview              # preview the production build
npm run lint                 # Oxlint
```

Open `http://localhost:5173`. Register a new customer account and verify
it with the code sent by email. You can then book a service.

## How the code is organised

### Application flow

```text
index.html
  -> src/main.jsx             starts React, mounts AppProviders
     -> src/app/AppProviders  Redux Provider, BrowserRouter, AuthBootstrap, ThemeBootstrap, Sonner <Toaster />
        -> src/app/App.jsx    renders the route system
           -> src/routes      public / open / private route groups and guards
              -> layouts      Header + page Outlet + Footer
                 -> pages     compose features and reusable components
```

### What belongs where

| Folder              | Purpose                                                                                                                                                                                                                |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app`               | Bootstrap: `App.jsx`, provider composition, the Redux store                                                                                                                                                            |
| `assets`            | Images and other imported static files                                                                                                                                                                                 |
| `components/common` | Small reusable UI: buttons, badges, modals and so on                                                                                                                                                                   |
| `features`          | Domain modules (`auth`, `services`, `workers`, `bookings`, `addresses`, `blog`, `faq`, `team`, `testimonials`, `contact`, `theme`). Each has its own components, hooks and Redux slice, exposed through one `index.js` |
| `hooks`             | Reusable React hooks shared across features                                                                                                                                                                            |
| `layouts`           | Page shells: header, footer                                                                                                                                                                                            |
| `lib`               | `config.js` (app settings) and `httpClient.js` (the single axios instance, with global error toasts)                                                                                                                   |
| `pages`             | Route-level screens, each with a `<name>.routes.jsx` file and page-only `components/` and `definitions/` folders                                                                                                       |
| `routes`            | URL constants (`constants.js`), route groups (`config/`) and guards (`AuthGuard`, `AuthGatedLink`)                                                                                                                     |
| `styles`            | Global stylesheets                                                                                                                                                                                                     |
| `utils`             | Small, framework-independent helpers                                                                                                                                                                                   |

### Conventions

- **Pages and features.** Pages only compose. Logic and state live in `features/`, and other code imports a feature only through its `index.js`.
- **API calls.** Every API call is a `createAsyncThunk` in the owning feature's slice, using the `lib/httpClient.js` helpers. `httpClient` shows any API error as a toast, once, for the whole app.
- **Validation.** Zod schemas live in `definitions/` folders and mirror the backend's Joi rules.
- **Imports.** The `@` alias points at `src`, for example `import { useAuth } from "@/features/auth/index.js"`.
- **URLs.** URLs are never hard-coded. Use `ROUTES` and helpers such as `getServiceDetailsPath(slug)` from `routes/constants.js`.

## Contact

If you have any problem setting up or running the project, please contact
**Subhankar Bhattacharyya** (Amity University Online, MCA).
