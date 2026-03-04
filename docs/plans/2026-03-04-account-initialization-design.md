# Account Initialization Design

## Purpose
Provide a secure way for sales-driven new users to initialize their tenant (salon) accounts without opening public registration.

## Approach
**Supabase Dashboard + Setup Route**
Admin creates the user in the Supabase Dashboard. When the user logs in for the first time, the system detects they don't have a tenant and redirects them to a setup page to initialize their salon.

## Architecture & Flow

1. **Authentication & Middleware**
   - User logs in via existing `/login` page (OTP or Email).
   - User is redirected to `/admin`.
   - A middleware checks if the authenticated user has a corresponding record in `tenant_users`.
   - If no tenant is found, redirect to `/setup`.
   - If a tenant is found, proceed to `/admin`.

2. **Setup Page (`/setup`)**
   - Protected route (requires authentication, but no tenant).
   - Form fields:
     - Salon Name (Arabic) - Required
     - Salon Name (English) - Optional
     - Phone Number - Required
     - URL Slug - Required (must be unique)
   - UI built with Nuxt UI components.

3. **API Endpoint (`/api/setup.post.ts`)**
   - **Auth Check:** Uses `serverSupabaseUser` to ensure the request is from an authenticated user.
   - **Validation:** Checks if the user already has a tenant (prevents multiple tenants per user for now).
   - **Database Operations (Transaction/Sequential):**
     1. Insert into `tenants` (slug, name, name_en, phone).
     2. Insert into `tenant_users` (user_id, tenant_id).
     3. Insert into `tenant_settings` (tenant_id, default settings).
   - Returns success status.

4. **Post-Setup**
   - Frontend redirects the user to `/admin` upon successful setup.
   - The user can now access all admin features.