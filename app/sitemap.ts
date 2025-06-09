import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://veilvid.vercel.app'
  
  // Define the languages
  const languages = ['en', 'pt-BR']
  
  // Define the main routes (only static routes, no dynamic content)
  const routes = [
    '',  // home page
  ]

  // Popular TikTok users to include in sitemap
  const popularUsers = [
    'ishowspeed',
    'charlidamelio',
    'khaby.lame',
    'addisonre',
    'bellapoarch',
    'zachking',
    'mrbeast',
    'gordonramsayofficial',
    'cristiano',
    'selenagomez',
    'captainbr',
    'therock',
    'neymarjr',
    'leomessi',
    'kimkardashian',
    'elonmusk'
  ]

  // Generate sitemap entries for each route and language
  const sitemapEntries = routes.flatMap(route => 
    languages.map(lang => ({
      url: `${baseUrl}/${lang}${route}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: route === '' ? 1 : 0.8,
    }))
  )

  // Add the default language version (English) without the language prefix
  const defaultEntries = routes.map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // Add entries for popular users
  const userEntries = popularUsers.map(username => ({
    url: `${baseUrl}/?q=${username}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  }))

  return [...sitemapEntries, ...defaultEntries, ...userEntries]
} 