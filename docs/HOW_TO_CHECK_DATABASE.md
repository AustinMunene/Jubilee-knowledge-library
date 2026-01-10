# How to Check Which Database You're Connected To

## Option 1: Check Browser Console (Local Development)

1. **Start your local dev server:**
   ```bash
   npm run dev
   ```

2. **Open your browser** and go to `http://localhost:5173`

3. **Open Developer Tools:**
   - **Chrome/Edge:** Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
   - **Firefox:** Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
   - **Safari:** Enable Developer menu first: Preferences → Advanced → Show Develop menu, then `Cmd+Option+C`

4. **Click on the "Console" tab**

5. **Look for this message:**
   ```
   🔗 Connected to Supabase project: [your-project-id]
   📍 Environment: development
   ```
   The project ID is the part before `.supabase.co` in your URL.

## Option 2: Check Local .env File

1. **Open your project folder** in a text editor or terminal

2. **Look for the `.env` file** in the root directory:
   ```
   /Users/austine/Projects/Jubilee Library/.env
   ```

3. **Open it** and check the value of `VITE_SUPABASE_URL`:
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   ```
   The `xxxxx` part is your project ID.

4. **Note:** The `.env` file is hidden (starts with a dot). To see it:
   - **VS Code:** It should show in the file explorer if you enable "Show hidden files"
   - **Terminal:** Use `cat .env` or `open .env`
   - **Finder (Mac):** Press `Cmd+Shift+.` to show hidden files

## Option 3: Check Netlify Environment Variables (Production)

1. **Go to Netlify Dashboard:**
   - Visit https://app.netlify.com
   - Sign in to your account

2. **Select your site:**
   - Click on your site name from the list

3. **Navigate to Environment Variables:**
   - Click **"Site settings"** in the top menu
   - In the left sidebar, click **"Environment variables"**
   - Or use this direct path: `Site settings → Build & deploy → Environment`

4. **Find `VITE_SUPABASE_URL`:**
   - Scroll through the list of environment variables
   - Look for `VITE_SUPABASE_URL`
   - The value shows your Supabase project URL

5. **Compare with local:**
   - Extract the project ID (the part before `.supabase.co`)
   - Compare it with what you see in your local `.env` file or browser console

## Quick Visual Guide

### Browser Console:
```
┌─────────────────────────────────────┐
│ Console  │ Network │ Sources │ ... │
├─────────────────────────────────────┤
│ 🔗 Connected to Supabase project:   │
│    dczebbdgvogvoiphjycx            │
│ 📍 Environment: development         │
└─────────────────────────────────────┘
```

### Local .env file:
```bash
VITE_SUPABASE_URL=https://dczebbdgvogvoiphjycx.supabase.co
#                                  ^^^^^^^^^^^^^^^^^^^^
#                                  This is your project ID
```

### Netlify Dashboard:
```
Site settings → Environment variables
┌──────────────────────────────────────┐
│ Key                │ Value           │
├──────────────────────────────────────┤
│ VITE_SUPABASE_URL  │ https://...     │
│ VITE_SUPABASE_...  │ eyJhbGc...      │
└──────────────────────────────────────┘
```

## What to Look For

- **If the project IDs match:** You're using the same database for localhost and production
- **If they're different:** You have separate databases (safer for development)

## Still Can't Find It?

If you can't see the console message:
1. Make sure your dev server is running (`npm run dev`)
2. Hard refresh the page (`Cmd+Shift+R` or `Ctrl+Shift+R`)
3. Check if there are any errors in the console that might prevent the message from showing

