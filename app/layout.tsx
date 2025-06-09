import type { Metadata } from 'next'
import './globals.css'
import { DonationAlert } from '@/components/DonationAlert'
import { Toaster } from "sonner"
import { Analytics } from "@vercel/analytics/react"

// Define metadata for different languages
const metadataByLang = {
  'en': {
    title: 'VeilVid - Anonymous TikTok Video Viewer & Downloader',
    description: 'VeilVid: The best anonymous TikTok video viewer. Watch and download TikTok videos without an account. Search any username to view their videos privately. No login required.',
    keywords: [
      'VeilVid',
      'anonymous TikTok viewer',
      'TikTok video downloader',
      'watch TikTok without account',
      'private TikTok browsing',
      'TikTok video search',
      'TikTok anonymous viewer',
      'download TikTok videos',
      'TikTok video player',
      'TikTok profile viewer'
    ],
  },
  'pt-BR': {
    title: 'VeilVid - Visualizador e Baixador Anônimo de Vídeos do TikTok',
    description: 'VeilVid: O melhor visualizador anônimo de vídeos do TikTok. Assista e baixe vídeos do TikTok sem conta. Pesquise qualquer nome de usuário para ver seus vídeos em privado. Sem necessidade de login.',
    keywords: [
      'VeilVid',
      'visualizador anônimo TikTok',
      'baixador de vídeos TikTok',
      'assistir TikTok sem conta',
      'navegação privada TikTok',
      'pesquisa de vídeos TikTok',
      'visualizador anônimo TikTok',
      'baixar vídeos TikTok',
      'player de vídeos TikTok',
      'visualizador de perfil TikTok'
    ],
  }
}

export async function generateMetadata({ searchParams }: { searchParams?: { q?: string } }): Promise<Metadata> {
  const username = searchParams?.q || ""
  
  if (!username) {
    return {
      ...metadataByLang['en'], // Default to English
      viewport: 'width=device-width, initial-scale=1.0, viewport-fit=cover',
      robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
      icons: {
        icon: '/favicon.ico',
        apple: '/apple-touch-icon.png',
      },
      alternates: {
        canonical: 'https://veilvid.vercel.app/',
        languages: {
          'en': 'https://veilvid.vercel.app/en',
          'pt-BR': 'https://veilvid.vercel.app/pt-BR',
        },
      },
      twitter: {
        card: 'summary_large_image',
        title: 'VeilVid - Anonymous TikTok Video Viewer & Downloader',
        description: 'Watch and download TikTok videos anonymously. Search any username to view their videos privately. No account needed.',
        images: 'https://veilvid.vercel.app/og-image.png',
        site: 'https://veilvid.vercel.app/'
      },
      openGraph: {
        title: 'VeilVid - Anonymous TikTok Video Viewer & Downloader',
        description: 'Watch and download TikTok videos anonymously. Search any username to view their videos privately. No account needed.',
        url: 'https://veilvid.vercel.app/',
        siteName: 'VeilVid',
        images: [
          {
            url: 'https://veilvid.vercel.app/og-image.png',
            width: 1200,
            height: 630,
            alt: 'VeilVid - Anonymous TikTok Video Viewer',
          },
        ],
        locale: 'en_US',
        type: 'website',
        alternateLocale: 'pt_BR',
      },
    }
  }

  // Format username (remove @ if present)
  const formattedUsername = username.startsWith("@") ? username : `@${username}`

  return {
    title: `Watch ${formattedUsername} TikTok Videos Anonymously - VeilVid`,
    description: `Watch ${formattedUsername}'s TikTok videos anonymously on VeilVid. Download and view their latest reels, trending content, and popular videos without an account. No login required.`,
    keywords: [
      `${formattedUsername} TikTok videos`,
      `${formattedUsername} reels`,
      `watch ${formattedUsername} TikTok`,
      `${formattedUsername} TikTok download`,
      `anonymous ${formattedUsername} videos`,
      'TikTok video viewer',
      'TikTok video downloader',
      'anonymous TikTok viewer'
    ],
    openGraph: {
      title: `Watch ${formattedUsername} TikTok Videos Anonymously - VeilVid`,
      description: `Watch ${formattedUsername}'s TikTok videos anonymously on VeilVid. Download and view their latest reels, trending content, and popular videos without an account. No login required.`,
      url: `https://veilvid.vercel.app/?q=${formattedUsername}`,
      type: 'video.other',
      videos: [
        {
          url: `https://veilvid.vercel.app/?q=${formattedUsername}`,
          type: 'text/html',
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: `Watch ${formattedUsername} TikTok Videos Anonymously - VeilVid`,
      description: `Watch ${formattedUsername}'s TikTok videos anonymously on VeilVid. Download and view their latest reels, trending content, and popular videos without an account. No login required.`,
    },
    alternates: {
      canonical: `https://veilvid.vercel.app/?q=${formattedUsername}`,
    }
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        {/* Structured Data (JSON-LD) for WebSite Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'VeilVid',
              url: 'https://veilvid.vercel.app/',
              description: 'VeilVid allows users to search and watch TikTok videos anonymously by entering a username to view profiles and reels privately without an account.',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://veilvid.vercel.app/?q={search_term_string}',
                'query-input': 'required name=search_term_string'
              },
              inLanguage: ['en-US', 'pt-BR'],
              alternateName: ['VeilVid - Pesquisar Vídeos do TikTok Anonimamente'],
            }),
          }}
        />
      </head>
      <body>
        {children}
        <DonationAlert />
        <Toaster position="top-center" />
        <Analytics />
      </body>
    </html>
  )
}