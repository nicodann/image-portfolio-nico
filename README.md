# Image Portfolio

A self-hosted image portfolio built with Next.js, deployed on Netlify. Upload and manage artwork through a password-protected admin interface. Content is stored as JSON in the repository and updated via the GitHub API on each change.

## Prerequisites

- [Netlify](https://netlify.com) account
- [Cloudinary](https://cloudinary.com) account
- [GitHub](https://github.com) account and personal access token with `repo` write access

## Setup

### TLDR

1. Clone this repo or Fork if you want to pull future updates.
2. Push to new github repo and create personal access token with `repo` write access.
3. add local .env variables (github, cloudinary).
4. install [Netlify CLI](https://docs.netlify.com/cli/get-started/)

```bash
npm install
netlify dev
```

- Dev Site: localhost:8888.
- Admin: localhost:8888/admin

5. Deploy to Netlify and setup netlify identity

nb. Netlify will build and deploy automatically on each push. Updating data triggers a push/rebuild -> serverless updates.

## Details

### 1. Download & Install

Fork or Clone repo. Add your github and cloudinary vars to '.env'. Run npm install.

### 2. Deploy to Netlify and enable Netlify Identity

Deploy the site as a new Netlify site. In your Netlify site dashboard: **Integrations → Identity → Enable**. Then invite yourself as a user. This controls access to the admin panel at `/admin`.

### 3. Set remote environment variables

In your Netlify site dashboard under **Site configuration → Environment variables**, add:

| Variable                 | Description                                                          |
| ------------------------ | -------------------------------------------------------------------- |
| `GITHUB_TOKEN`           | Personal access token with `repo` write scope                        |
| `GITHUB_REPO`            | Your repo in `owner/repo` format (e.g. `artistpainter/my-portfolio`) |
| `GITHUB_BRANCH`          | Branch to commit content to (default: `main`)                        |
| `CLOUDINARY_CLOUD_NAME`  | From your Cloudinary dashboard                                       |
| `CLOUDINARY_API_KEY`     | From your Cloudinary dashboard                                       |
| `CLOUDINARY_API_SECRET`  | From your Cloudinary dashboard                                       |
| `CLOUDINARY_FOLDER_NAME` | Image files will be saved here in your account                       |

### 4. Seed content files

Copy the example files to create your working content files OR add conent in the UI.

```bash
cp content-examples/artwork-example.json content/artwork.json
cp content-examples/site-info-example.json content/site-info.json
```

### 5. Future updates

To pull updates from the upstream template add a git remote upstream as follows:

```bash
git remote add upstream https://github.com/nicodann/image-portfolio-template.git
```

Then run this once to protect your content files from being overwritten when merging upstream changes:

```bash
git config merge.ours.driver true
```

To pull future updates:

```bash
git fetch upstream
git merge upstream/main
```

Your `content/artwork.json` and `content/site-info.json` files will be preserved automatically.
