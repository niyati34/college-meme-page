# College Meme Page

A full-stack web application for sharing, discovering, and interacting with memes, built with React, Node.js, Express, and MongoDB. Features include user authentication, meme uploads (image/video), trending algorithm, category filters, comments, likes, and a minimalist, professional UI.

## Features

- User registration, login, and profile management
- Meme upload (image/video) with aspect ratio selection (normal/reel)
- Trending memes algorithm (likes, views, recency)
- Category and search filters
- Minimalist, responsive UI (React + Tailwind CSS)
- Infinite scroll feed and dedicated Trending page
- Comments, likes, saves, and share functionality
- Admin-only meme upload and moderation
- Cloudinary integration for media storage
- Vercel-ready serverless deployment

## Tech Stack

- **Frontend:** React 18, React Router, Tailwind CSS, Axios
- **Backend:** Node.js, Express, Mongoose (MongoDB)
- **Media:** Cloudinary, Multer
- **Deployment:** Vercel (serverless API + static frontend)


## Live Demo

[college-meme-page.vercel.app](https://college-meme-page.vercel.app)

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account (for media uploads)

### Setup

1. **Clone the repository:**
   ```sh
   git clone https://github.com/niyati34/college-meme-page.git
   cd college-meme-page
   ```
2. **Install dependencies:**
   ```sh
   npm install
   cd server && npm install && cd ..
   ```
3. **Configure environment variables:**
   - Copy `.env.example` to `.env` in the `server/` directory and fill in your MongoDB, JWT, and Cloudinary credentials.
4. **Run locally:**
   ```sh
   npm run dev
   # or, in separate terminals:
   npm start
   cd server && npm start
   ```
5. **Open in browser:**
   - Visit [http://localhost:3000](http://localhost:3000)

### Deployment

- Deploy to Vercel for serverless hosting. The project includes a `vercel.json` for API/static routing.
- Set environment variables in Vercel dashboard for MongoDB, JWT, and Cloudinary.

## Folder Structure

```
college-meme-page/
├── public/                # Static assets
├── src/                   # React frontend
│   ├── api/               # Axios API wrappers
│   ├── components/        # Reusable UI components
│   ├── pages/             # Page-level components (Home, Trending, Upload, etc.)
│   └── styles/            # Custom CSS
├── server/                # Express backend
│   ├── controllers/       # Route controllers
│   ├── middlewares/       # Auth, multer, etc.
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API routes
│   └── utils/             # Utility modules
├── vercel.json            # Vercel routing config
├── package.json           # Project metadata
└── README.md              # Project documentation
```

## Notable Design Decisions

- **Minimalist UI:** All controls use neutral colors, outline buttons, and subtle borders for a clean, modern look.
- **Trending Algorithm:** Combines likes, views, and recency for dynamic trending ranking.
- **Serverless Ready:** Express API is compatible with Vercel serverless deployment.
- **Cloudinary Integration:** Handles large file uploads and video/image optimization.

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](LICENSE)

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
