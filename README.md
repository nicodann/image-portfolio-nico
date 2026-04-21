# Image Portfolio

A self-hosted image portfolio built with Next.js, deployed on Netlify. Upload and manage artwork through a password-protected admin interface. Content is stored as JSON in the repository and updated via the GitHub API on each change.

## Prerequisites

- [Netlify](https://netlify.com) account
- [Cloudinary](https://cloudinary.com) account
- [GitHub](https://github.com) account and personal access token with `repo` write access

## Setup

###TLDR: Fork or clone this repo, npm install, add local .env variables (github, cloudinary). Deploy to Netlify, setup netlify auth. install netlify cli >> run "netlify dev". Site is served at localhost:8888.

dev site localhost:8888
dev admin site localhost:8888/admin

Netlify will build and deploy automatically on each push. Updating data triggers a push/rebuild ----> serverless updates.

### 1. Download & Install

Fork or Clone repo. Add your github and cloudinary vars to '.env'. Run npm install.

### 2. Deploy to Netlify and enable Netlify Identity

Deploy the site as a new Netlify site. In your Netlify site dashboard: **Integrations → Identity → Enable**. Then invite yourself as a user. This controls access to the admin panel at `/admin`.

### 3. Set remote environment variables

In your Netlify site dashboard under **Site configuration → Environment variables**, add:

| Variable                | Description                                                     |
| ----------------------- | --------------------------------------------------------------- |
| `GITHUB_TOKEN`          | Personal access token with `repo` write scope                   |
| `GITHUB_REPO`           | Your repo in `owner/repo` format (e.g. `nicodann/my-portfolio`) |
| `GITHUB_BRANCH`         | Branch to commit content to (default: `main`)                   |
| `CLOUDINARY_CLOUD_NAME` | From your Cloudinary dashboard                                  |
| `CLOUDINARY_API_KEY`    | From your Cloudinary dashboard                                  |
| `CLOUDINARY_API_SECRET` | From your Cloudinary dashboard                                  |

### 4. Seed content files

Copy the example files to create your working content files:

```bash
cp content-examples/artwork-example.json content/artwork.json
cp content-examples/site-info-example.json content/site-info.json
```
