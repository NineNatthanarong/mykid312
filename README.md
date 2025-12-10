# Hogword - AI-Powered Vocabulary Practice

An interactive vocabulary learning application that helps users master English vocabulary through AI-powered sentence validation.

## Features

- **AI Sentence Validation**: Practice using vocabulary words in context with intelligent feedback
- **Difficulty Levels**: Words categorized by difficulty (easy, intermediate, advance)
- **Progress Tracking**: Track your daily activity and performance
- **Interactive Dashboard**: Visualize your learning progress with charts and statistics
- **Score-based Feedback**: Get detailed suggestions to improve your sentences

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, TailwindCSS 4
- **Charts**: Chart.js with react-chartjs-2
- **Authentication**: JWT-based authentication
- **API Integration**: RESTful API communication

## Getting Started

### Prerequisites

- Node.js 20+ installed
- Backend API running (required for authentication and word generation)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:

Create a `.env.local` file in the root directory (see `.env.example` for required variables):

```env
NEXT_PUBLIC_API_URL=https://api.delete.codes
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

The page auto-updates as you edit files.

### Production Build

Build the application for production:

```bash
npm run build
npm run start
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | Yes |

## Project Structure

```
/app
  /dashboard      - Statistics and progress visualization
  /login          - Authentication page
  page.tsx        - Main practice interface
  layout.tsx      - Root layout
  globals.css     - Global styles
/lib
  api.ts          - API client and authentication
```

## Features Overview

### Practice Page (`/`)
- Generate random vocabulary words by difficulty
- Create sentences using the word
- Get instant AI feedback and scores
- View today's activity history
- Skip words or continue with unsolved words

### Dashboard (`/dashboard`)
- Performance trend charts (last 7 days)
- Score distribution by difficulty level
- Total practice statistics
- Recent vocabulary words

### Login (`/login`)
- Email/password authentication
- Secure token-based sessions

## Deployment

### Vercel (Recommended)

The easiest way to deploy is using the [Vercel Platform](https://vercel.com):

1. Push your code to GitHub
2. Import your repository in Vercel
3. Configure environment variables
4. Deploy

See [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more options.

### Other Platforms

This is a standard Next.js application and can be deployed to any platform that supports Node.js:

- AWS (Amplify, EC2, ECS)
- Google Cloud Platform
- Netlify
- Railway
- Self-hosted with PM2 or Docker

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Chart.js Documentation](https://www.chartjs.org/docs)

## License

This project is part of the AIE312 Final Project.
