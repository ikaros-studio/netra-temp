# Deployment Guide

This guide outlines how to deploy the Nuxt application with the redirected index to `/app/dashboard`.

## Prerequisites

- Node.js (v18.16.0 or higher)
- PNPM (v9.1.0 or higher)

## Deployment Steps

1. **Install dependencies**

```bash
pnpm install
```

2. **Build the application**

```bash
pnpm run deploy
```

This will:
- Build the Nuxt application
- Generate static files in the `.output` directory

3. **Deploy the output**

The built application will be in `apps/web/.output` directory. You can deploy this to any static hosting service like:
- Netlify
- Vercel
- AWS S3 + CloudFront
- GitHub Pages

## Vercel Deployment (Recommended)

A `vercel.json` file has been added to the project for simplified deployment to Vercel:

1. Push your code to a Git repository (GitHub, GitLab, BitBucket)
2. Import your repository in the Vercel dashboard
3. Vercel will automatically detect the Nuxt.js application
4. Set your environment variables in the Vercel dashboard
5. Deploy the application

The deployment will use the `vercel.json` configuration, which includes:
- Proper build command for the monorepo structure
- Output directory configuration
- Routing configuration for SPA

## Environment Variables

Make sure to set up the necessary environment variables in your deployment environment:

- Copy the variables from `.env.local` to your hosting provider's environment variables 
- Ensure all API endpoints and authentication services are properly configured

## Custom Domain Setup

If using a custom domain:

1. Configure your DNS settings to point to your hosting provider
2. Set up HTTPS/SSL certificates
3. Update any CORS configurations if necessary

## Testing Your Deployment

After deployment, verify that:
- The home page (/) redirects to `/app/dashboard`
- The dashboard loads correctly
- Authentication works as expected
- All API calls function properly 