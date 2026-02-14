# Supabase Auth Setup Guide

Follow these steps to enable social login (Magic Link, Google, GitHub, Apple) in your Supabase project.

## 1. Magic Link (Email OTP)
Magic Link is enabled by default in Supabase, but you should verify the settings:
1. Go to **Authentication** > **Providers** > **Email**.
2. Ensure **Confirm email** is enabled if you want users to verify their email (optional but recommended).
3. Ensure **OTP** is enabled.

## 2. GitHub Authentication
1. Go to your [GitHub Developer Settings](https://github.com/settings/developers).
2. Click **New OAuth App**.
3. Set **Homepage URL** to your App URL (e.g., `https://your-app.vercel.app`).
4. Set **Authorization callback URL** to the URL provided in Supabase (**Authentication** > **Providers** > **GitHub**).
5. Copy the **Client ID** and **Client Secret**.
6. Paste them into the Supabase GitHub configuration page and click **Save**.

## 3. Google Authentication
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. Search for **APIs & Services** > **Credentials**.
4. Click **Create Credentials** > **OAuth client ID**.
5. Select **Web application**.
6. Add the Supabase callback URL to **Authorized redirect URIs**.
7. Copy the **Client ID** and **Client Secret**.
8. Paste them into the Supabase Google configuration page and click **Save**.

## 4. Apple Authentication (Advanced)
Apple requires a paid Developer Account.
1. Follow the [Supabase Apple Auth Guide](https://supabase.com/docs/guides/auth/social-login/auth-apple) for a step-by-step walkthrough of creating App IDs, Service IDs, and Private Keys.
2. Configure the **Services ID**, **Team ID**, **Key ID**, and **Private Key** in your Supabase dashboard.

## 5. Site URL and Redirects
Ensure your site URL is correctly configured:
1. Go to **Authentication** > **URL Configuration**.
2. Set **Site URL** to your production URL.
3. Add `http://localhost:5173/**` (or your dev port) to **Redirect URLs** for local development.
