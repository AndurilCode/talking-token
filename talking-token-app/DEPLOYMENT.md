# Deploying Talking Token to GitHub Pages

This guide will walk you through the process of deploying the Talking Token application to GitHub Pages.

## Prerequisites

- GitHub account
- Git installed on your local machine
- Node.js and npm installed

## Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and sign in to your account
2. Click on the "+" icon in the top right corner and select "New repository"
3. Name your repository `talking-token`
4. Choose whether to make it public or private
5. Click "Create repository"

## Step 2: Initialize Git in Your Project

If you haven't already initialized Git in your project, do so with the following commands:

```bash
git init
git add .
git commit -m "Initial commit"
```

## Step 3: Connect Your Local Repository to GitHub

Replace `yourusername` with your actual GitHub username:

```bash
git remote add origin https://github.com/yourusername/talking-token.git
git branch -M main
git push -u origin main
```

## Step 4: Update Configuration for GitHub Pages

1. In `package.json`, update the `homepage` field with your GitHub username:

```json
"homepage": "https://yourusername.github.io/talking-token"
```

2. Make sure the `base` path in `vite.config.ts` matches your repository name:

```typescript
base: '/talking-token/',
```

## Step 5: Build and Deploy

Run the deploy script which will build your application and publish it to the `gh-pages` branch:

```bash
npm run deploy
```

This command does two things:
- Runs `npm run build` to create a production build
- Uses the `gh-pages` package to deploy the `dist` folder to the `gh-pages` branch on GitHub

## Step 6: Configure GitHub Pages in Repository Settings

1. Go to your repository on GitHub
2. Click on "Settings"
3. Scroll down to the "GitHub Pages" section
4. For the source, select the `gh-pages` branch
5. Click "Save"

## Step 7: Access Your Deployed Application

After a few minutes, your application will be available at:

```
https://yourusername.github.io/talking-token
```

## Troubleshooting

### 404 Errors

If you're getting 404 errors:
- Make sure the `homepage` in `package.json` is correct
- Verify that the `base` path in `vite.config.ts` matches your repository name
- Check that GitHub Pages is configured to use the `gh-pages` branch

### Blank Page

If you see a blank page:
- Open the browser console to check for errors
- Verify that all paths in your application are relative to the base path

### Updates Not Showing

If your updates aren't showing after deployment:
- Clear your browser cache
- Wait a few minutes as GitHub Pages may take time to update

## Updating Your Deployment

To update your deployment after making changes:

1. Commit your changes:
```bash
git add .
git commit -m "Your update message"
git push origin main
```

2. Redeploy:
```bash
npm run deploy
```

## Custom Domain (Optional)

If you want to use a custom domain:

1. Purchase a domain from a domain registrar
2. Add a CNAME record pointing to `yourusername.github.io`
3. Add your custom domain in the GitHub Pages settings
4. Create a `CNAME` file in the `public` folder with your domain name
5. Update the `homepage` in `package.json` to your custom domain 