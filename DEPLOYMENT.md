# Deploying to Render

Follow these steps to deploy your Ludo Simulator to Render!

## Prerequisites
- Your code is pushed to GitHub (already done!)
- You have a Render account (sign up at https://render.com)

## Step-by-Step Deployment

### 1. Create a New Static Site on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **Static Site**
3. Connect your GitHub repository: `https://github.com/Md-Aadil-ops/Ludo-simulator-.git`
4. Select your repository and the `main` branch

### 2. Configure Your Site

Render will automatically detect the `render.yaml` file and use the configuration!

If it doesn't auto-detect, use these settings:
- **Name**: `ludo-simulator` (or anything you like)
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **Branch**: `main`

### 3. Deploy!

1. Click **Create Static Site**
2. Wait for Render to build and deploy your site (this usually takes 1-2 minutes)
3. Once deployed, you'll get a URL like: `https://ludo-simulator-xxxxx.onrender.com`

## Your Site is Live! 🎉

That's it! Your Ludo Simulator will be live and accessible to everyone!

## Automatic Deployments

Every time you push changes to the `main` branch on GitHub, Render will automatically rebuild and redeploy your site!

## Troubleshooting

- **Build fails?** Check the build logs in Render dashboard - make sure all dependencies are installed correctly
- **Site not loading?** Verify the publish directory is set to `dist`
- **Need to redeploy manually?** Go to your site dashboard → **Manual Deploy** → **Deploy latest commit**
