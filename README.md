# Jubilee Knowledge Library

Internal library management system scaffold (React + Vite + Supabase).

Getting started

1. Install dependencies

```bash
npm install
```

# Jubilee Knowledge Library

Internal library management system scaffold (React + Vite + Supabase).

## Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn
- A Supabase account (free tier works)
- (Optional) SendGrid account for overdue notifications

### Setup

**1. Clone and install dependencies**

```bash
cd /path/to/Jubilee\ Library
npm install
cd server && npm install && cd ..
```

**2. Create a `.env` file in the project root**

```bash
# Get these from Supabase Dashboard → Settings → API
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**3. Set up Supabase Storage**

Run the storage setup script in your Supabase SQL Editor:

```bash
# Copy and run the contents of db/storage_setup.sql in Supabase SQL Editor
```

This creates two storage buckets:
- `book-covers` - for book cover images (public read access)
- `profile-photos` - for user profile photos (public read access)

**4. (Optional) Create a `.env` file in the `server/` folder for scheduled jobs**

```bash
# For scheduled overdue job
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: for overdue email notifications
SENDGRID_API_KEY=your-sendgrid-key
SENDGRID_FROM_EMAIL=noreply@jubilee-library.local
```

**5. Run the development server**

```bash
npm run dev
```

Visit `http://localhost:5173` to see your app.

## Deployment to Netlify

### Prerequisites
- A GitHub account with your code pushed to a repository
- A Netlify account (free tier works)
- Your Supabase project set up

### Steps

**1. Push your code to GitHub**

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/jubilee-library.git
git push -u origin main
```

**2. Deploy to Netlify**

Option A: Via Netlify Dashboard
1. Go to [Netlify](https://app.netlify.com) and sign in
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub account and select your repository
4. Configure build settings (should auto-detect from `netlify.toml`):
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Add environment variables:
   - `VITE_SUPABASE_URL` - Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key
6. Click "Deploy site"

Option B: Via Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize and deploy
netlify init
# Follow the prompts, then:
netlify deploy --prod
```

**3. Set up environment variables in Netlify**

In your Netlify site dashboard:
1. Go to **Site settings** → **Environment variables**
2. Add the following:
   - `VITE_SUPABASE_URL` = `https://your-project-id.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `your-anon-key-here`

**4. Trigger a new deploy**

After adding environment variables, go to **Deploys** → **Trigger deploy** → **Deploy site** to rebuild with the new variables.

**5. (Optional) Set up custom domain**

1. Go to **Domain settings** → **Add custom domain**
2. Follow Netlify's DNS configuration instructions
3. SSL certificate is automatically provisioned

### Important Notes

- The `netlify.toml` file is already configured with SPA routing redirects
- All routes will redirect to `index.html` for client-side routing
- Environment variables must start with `VITE_` to be accessible in the build
- The build output directory is `dist` (Vite's default)

**4. Setup Supabase**

1. In your Supabase project, go to **SQL Editor** and run:
   - First, run all SQL from `db/schema.sql`
   - Then, run all SQL from `db/storage_setup.sql` to create storage buckets
2. Create test users via **Auth > Users** or through the app's sign-up page
3. To set admin role via SQL:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE id = 'your-user-uuid';
   ```

**5. Run the development server**

```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Running Tests

**E2E Tests (Playwright)**

```bash
npm run test:e2e
```

Tests verify:
- Basic page navigation
- Protected route behavior
- Book listings and search
- Request/approval workflow

### Scheduled Overdue Job

Run the overdue marking + email notification job:

```bash
cd server
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node mark_overdue.js
```

For production, integrate this into a cron service, GitHub Actions, or Supabase Edge Functions.

## Project Layout

- `src/app` – App-level providers, routes, layouts
- `src/features` – Feature modules (auth, books, dashboard, requests)
- `src/components` – Reusable UI components (buttons, cards, skeletons, empty states)
- `src/services` – Third-party clients (Supabase, Storage)
- `src/hooks` – React Query hooks for data fetching
- `src/types` – TypeScript types
- `server/` – Upload server, overdue job, email service
- `db/` – SQL schema, RLS policies, helper RPCs
- `tests/e2e/` – Playwright end-to-end tests

## Features

### Authentication & Authorization
- Email/password login via Supabase Auth
- Role-based access control (admin vs user)
- Protected routes and RLS policies

### Books Management
- Admin CRUD (create, read, update, delete) with bulk delete
- Supabase Storage for book covers and profile photos
- Track total and available copies
- Real-time availability status

### Request & Approval Workflow
- Users submit book requests
- Admins approve/reject requests
- Approved requests create borrow records
- Auto-decrement book availability

### Borrow Tracking
- Track issued date, due date, return date
- Auto-increment availability on return
- Overdue status calculation
- Email notifications for overdue items

### Dashboards
- Admin dashboard with stats
- User dashboard showing current borrows and history

### UI/UX
- Loading skeletons
- Empty states
- Responsive design
- Accessibility features (ARIA labels, semantic HTML)

## Key Technologies

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **State**: React Query, React Router
- **Backend**: Supabase (Auth, PostgreSQL, RLS)
- **Storage**: Supabase Storage (images)
- **Email**: SendGrid (optional)
- **Testing**: Playwright
- **Storage**: Supabase Storage (no separate upload server needed)

## Notes

- All RLS policies default to denying access unless explicitly allowed.
- Users can only see their own requests and borrow records.
- Admins can see and manage all records.
- The service role key is used server-side only for scheduled jobs.
- Overdue emails are sent when the scheduled job runs (set up your cron separately).
Project layout

- `src/app` app-level providers and routes
- `src/features` feature folders: `auth`, `books`, `dashboard`
- `src/services` third-party clients (Supabase, Storage)
- `db/schema.sql` SQL schema + RLS policies

Next steps

- Wire React Query for data fetching
- Implement admin flows (approve/reject requests, issue/receive books)
- Storage buckets configured via `db/storage_setup.sql`
- Harden RLS policies and test with Supabase JWT claims
