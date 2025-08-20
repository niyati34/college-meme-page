<div align="center">

# College Meme Page

Share, discover, and trend the funniest campus memes — fast, minimal, and mobile-first.

[![Live Demo](https://img.shields.io/badge/Live_Demo-vercel.app-000?logo=vercel)](https://college-meme-page.vercel.app)
![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=61DAFB&labelColor=000)
![Express](https://img.shields.io/badge/Express-4-fff?logo=express&logoColor=fff&labelColor=000)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=47A248&labelColor=000)
![Cloudinary](https://img.shields.io/badge/Cloudinary-media-1F8ACB?logo=cloudinary&logoColor=white&labelColor=000)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow?labelColor=000)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?labelColor=000)

<br/>

<img alt="App preview" src="screenshots/home.png" width="100%" />

</div>

## Table of Contents

- Features
- Screenshots
- Live Demo
- Quick Start
- Configuration (ENV)
- Available Scripts
- API Overview
- Architecture
- Roadmap
- Contributing
- License

## Features

- Auth: register, login, profile
- Upload memes (image/video) with aspect ratio: normal or reel
- Trending algorithm mixing likes, views, and recency
- Powerful search + category filters, infinite scroll feed
- Minimalist UI (React + Tailwind) and dedicated Trending page
- Comments, likes, saves, and share
- Cloudinary for media storage; Vercel-ready serverless API

## Screenshots

| Home Feed | Trending Page | Upload Meme |
|-----------|---------------|-------------|
| ![Home](screenshots/home.png) | ![Trending](screenshots/trending.png) | ![Upload](screenshots/upload.png) |

> Add your own screenshots to the `screenshots/` folder for more visual documentation.

## Live Demo

https://college-meme-page.vercel.app

## Quick Start

Prerequisites: Node 18+, MongoDB Atlas (or local), Cloudinary account.

1) Clone and install

```bash
git clone https://github.com/niyati34/college-meme-page.git
cd college-meme-page
npm install
cd server && npm install && cd ..
```

2) Configure environment variables

- Copy `server/.env.example` to `server/.env` and fill in your credentials.

3) Run locally (frontend + backend)

```bash
npm run dev
# or in separate terminals
npm start
cd server && npm start
```

## Configuration (ENV)

Create `server/.env` with values like:

| Variable | Description |
|---------|-------------|
| MONGO_URI | MongoDB connection string |
| JWT_SECRET | Secret for signing JWTs |
| CLOUDINARY_CLOUD_NAME | Your Cloudinary cloud name |
| CLOUDINARY_API_KEY | Cloudinary API key |
| CLOUDINARY_API_SECRET | Cloudinary API secret |

## Available Scripts

- `npm start` – start the React app
- `npm run build` – production build of the React app
- `npm test` – run tests
- `npm run dev` – concurrently run client and server (if configured)
- `cd server && npm start` – start the Express API locally

## API Overview

Base URL (local): `http://localhost:5000/api`

- Auth: `POST /auth/register`, `POST /auth/login`
- Memes: `GET /memes?search=&category=&sortBy=&page=&limit=`, `POST /memes` (admin), `GET /memes/:id`
- Comments: `GET /memes/:id/comments`, `POST /memes/:id/comments`

Note: Uploads go to Cloudinary via the backend (Multer). Trending uses weighted likes, views, and time decay.

## Architecture

```mermaid
flowchart LR
   A[React SPA] --Axios--> B[Express API]
   B --Mongoose--> C[(MongoDB)]
   B --SDK--> D[(Cloudinary)]
   A <-Vercel Routes-> B
```

## Roadmap

- Persist filters/search in URL query params
- Accessibility polish (focus traps, keyboard nav)
- Skeleton loading states and optimistic UI
- User profiles and bookmarks
- Notifications for comments/likes

## Contributing

Contributions are welcome! Please open an issue or PR. For larger changes, start a discussion first.

## License

MIT — see `LICENSE` for details.
