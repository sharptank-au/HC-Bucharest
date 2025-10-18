# Authentication Setup Guide

## 🔐 **Environment Variables Required**

Create a `.env.local` file in your project root with:

```bash
# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-convex-url.deployment.convex.cloud

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## 🔧 **Google OAuth Setup**

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/
   - Create a new project or select existing one

2. **Enable Google+ API:**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it

3. **Create OAuth Credentials:**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (development)
     - `https://yourdomain.com/api/auth/callback/google` (production)

4. **Copy Credentials:**
   - Copy the Client ID and Client Secret
   - Add them to your `.env.local` file

## 🚀 **Testing Authentication**

1. **Start your development servers:**
   ```bash
   # Terminal 1: Convex
   pnpm convex:dev
   
   # Terminal 2: Next.js
   pnpm dev
   ```

2. **Test the flow:**
   - Open `http://localhost:3000`
   - Click "Sign in" button
   - You should be redirected to Google OAuth
   - After signing in, you should see your user info in the header

## ✅ **What's Now Working**

- ✅ **Google OAuth** authentication
- ✅ **User profile** display in header
- ✅ **Real user voting** (no more fake user IDs)
- ✅ **User session** management
- ✅ **Sign out** functionality

## 🔄 **Next Steps**

1. **Connect Submit Page** to Convex mutations
2. **Connect Favorites** to user-specific data
3. **Connect Settings** to user profile management
4. **Add Search functionality**

Your authentication system is now fully integrated! 🎉
