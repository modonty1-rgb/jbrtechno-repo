# Business Plan Presentation Website

Professional bilingual (Arabic/English) website to present SEO SaaS platform business plans for headquarters review.

## Features

- **Bilingual Support**: Seamless switching between Arabic and English
- **Modern UI**: Built with Next.js 15, TypeScript, and shadcn/ui
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **RTL/LTR Support**: Proper text direction for Arabic and English
- **Print-Friendly**: Optimized styles for printing documents
- **Dark Mode**: Theme toggle for better viewing experience

## Project Structure

- **General Plan**: Complete business feasibility and strategy
- **Hiring Plan**: Detailed 10-position team structure with salaries
- **Timeline**: 4-month launch roadmap with milestones

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (install via `npm install -g pnpm`)

### Installation

1. Install dependencies:

\`\`\`bash
pnpm install
\`\`\`

2. Run the development server:

\`\`\`bash
pnpm dev
\`\`\`

3. Open [http://localhost:3000](http://localhost:3000) in your browser

The site will default to Arabic. Toggle to English using the language button in the navigation.

### Building for Production

\`\`\`bash
pnpm build
pnpm start
\`\`\`

## Deployment

### Deploy to Vercel

1. Install Vercel CLI (if not already installed):

\`\`\`bash
pnpm add -g vercel
\`\`\`

2. Deploy:

\`\`\`bash
vercel
\`\`\`

3. Follow the prompts to deploy

Alternatively, connect your GitHub repository to Vercel for automatic deployments.

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Internationalization**: next-intl
- **Markdown**: react-markdown with remark-gfm

## Documents Location

Business plan documents are located in the `doc/` directory:
- `general.md` - General business plan
- `hiring-plan-detailed.md` - Hiring and team structure
- `4-month-launch-timeline.md` - Launch timeline

## License

© 2024 JBRtechno. All rights reserved.

# jbrtechno.com
# jbrtechno-homepage
# jbrtechno
