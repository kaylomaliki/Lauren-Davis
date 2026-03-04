# Next.js + Sanity CMS Template

A production-ready template for building modern websites with Next.js 14, Sanity CMS, and Tailwind CSS. Perfect for blogs, portfolios, marketing sites, and more.

## Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **CMS:** [Sanity](https://www.sanity.io/)
- **Deployment:** Ready for [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/)

## Folder Structure

```
project-name/
├── app/
│   ├── (site)/              # Main site routes
│   │   ├── layout.tsx       # Root layout with metadata
│   │   └── page.tsx         # Homepage
│   ├── studio/              # Sanity Studio admin interface
│   │   └── [[...index]]/
│   │       └── page.tsx
│   ├── robots.txt/          # Robots.txt route
│   ├── sitemap.xml/         # Sitemap route
│   └── globals.css          # Global styles
├── components/
│   ├── layout/              # Layout components
│   └── ui/                  # Reusable UI components
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── OptimizedImage.tsx
│       └── VisuallyHidden.tsx
├── lib/
│   ├── sanity.client.ts     # Sanity client configuration
│   ├── queries.ts           # Sanity data queries
│   ├── image.ts             # Image optimization utilities
│   ├── seo.ts               # SEO metadata utilities
│   └── utils.ts             # General utilities
├── sanity/
│   ├── sanity.config.ts     # Sanity Studio configuration
│   └── schemaTypes/         # Sanity content schemas
│       ├── homepage.ts
│       ├── post.ts          # Blog posts / articles
│       ├── page.ts           # Static pages
│       ├── globalSettings.ts
│       ├── imageWithAlt.ts
│       └── navigation.ts
├── public/
│   └── fonts/               # Local font files
└── styles/
    └── variables.css         # CSS custom properties
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Sanity account and project

### Installation

1. Use this template:
   - Click "Use this template" on GitHub, or
   - Clone the repository:
```bash
git clone <repository-url>
cd <your-project-name>
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Edit `.env.local` with your Sanity credentials:
   - Get your Project ID from [sanity.io/manage](https://sanity.io/manage)
   - Create an API token in your Sanity project settings
   - Add your site URL (optional, for SEO)

5. Run the development server:
```bash
npm run dev
```

6. Open your browser:
   - **Website:** [http://localhost:3000](http://localhost:3000)
   - **Sanity Studio:** [http://localhost:3000/studio](http://localhost:3000/studio)

## Environment Variables

Required environment variables (see `.env.example`):

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Your Sanity project ID | Yes |
| `NEXT_PUBLIC_SANITY_DATASET` | Sanity dataset name (usually "production") | Yes |
| `SANITY_API_READ_TOKEN` | Sanity API read token | Yes |
| `NEXT_PUBLIC_SITE_URL` | Your site URL (for SEO/sitemap) | No |

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Features

- ✅ **TypeScript** - Full type safety
- ✅ **Tailwind CSS** - Utility-first styling
- ✅ **Sanity CMS** - Headless content management
- ✅ **Image Optimization** - Automatic image optimization via Next.js and Sanity
- ✅ **SEO** - Dynamic metadata, sitemap, and robots.txt
- ✅ **Accessibility** - Focus styles, semantic HTML, screen reader support
- ✅ **ISR** - Incremental Static Regeneration (60s revalidation)

## Content Types

The template includes the following Sanity document types (customize as needed):

- **Homepage** - Main landing page content
- **Post** - Blog posts or articles (with featured images, content, publish dates)
- **Page** - Static pages (About, Contact, etc.)
- **Global Settings** - Site-wide settings (title, description, OG image)
- **Image with Alt** - Reusable image object with alt text
- **Navigation** - Navigation menu structure

### Customizing Content Types

1. Edit existing schemas in `sanity/schemaTypes/`
2. Create new schemas following the same pattern
3. Add them to `sanity/sanity.config.ts`
4. Create corresponding queries in `lib/queries.ts`
5. Build pages in `app/(site)/` to display your content

## Development

### Quick Start Checklist

1. ✅ Clone or use this template
2. ✅ Install dependencies: `npm install`
3. ✅ Create a Sanity project at [sanity.io](https://sanity.io)
4. ✅ Copy `.env.example` to `.env.local` and add your Sanity credentials
5. ✅ Run `npm run dev` and visit `http://localhost:3000/studio`
6. ✅ Create a "homepage" document with slug "home" in Sanity Studio
7. ✅ Create a "globalSettings" document for site-wide settings
8. ✅ Customize schemas, components, and pages to fit your needs

### Adding New Content Types

1. Create a new schema file in `sanity/schemaTypes/` (see `post.ts` or `page.ts` as examples)
2. Import and add it to `sanity/sanity.config.ts`
3. Add TypeScript types and queries in `lib/queries.ts`
4. Create pages in `app/(site)/` to display the content

### Styling

- **Global styles:** `app/globals.css`
- **CSS variables:** `styles/variables.css`
- **Tailwind config:** `tailwind.config.ts`
- **Components:** Use the provided UI components in `components/ui/` or create your own
- **Utility classes:** Use Tailwind classes directly in components

### Reusable Components

The template includes several reusable components:

- `Button` - Button component with variants (primary, secondary, outline)
- `Card` - Card container component
- `OptimizedImage` - Next.js Image wrapper for Sanity images
- `VisuallyHidden` - Accessibility utility for screen readers

## Deployment

### Vercel

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Netlify

1. Push your code to GitHub
2. Connect repository in Netlify
3. Add environment variables in Netlify dashboard
4. Deploy!

## Customization Tips

### Renaming the Project

1. Update `package.json` name field
2. Update site title in `lib/seo.ts` (default values)
3. Update Sanity Studio title in `sanity/sanity.config.ts`

### Adding Features

- **Blog:** Use the `Post` schema and create a `/blog` route
- **Portfolio:** Create a custom schema for portfolio items
- **E-commerce:** Add product schemas and integrate with Stripe
- **Forms:** Add form handling with libraries like React Hook Form

### Performance

- Pages use ISR (Incremental Static Regeneration) with 60s revalidation
- Images are automatically optimized via Next.js Image component
- Static assets are served from CDN when deployed

## License

MIT License - feel free to use this template for any project!
