import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { BLOG_POSTS } from '../src/data/blogPosts.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DOMAIN = 'https://revivaabyzaish.com'

const STATIC_PAGES = [
  { url: '/', priority: '1.0', changefreq: 'daily', image: `${DOMAIN}/images/hero-product.png` },
  { url: '/shop', priority: '0.9', changefreq: 'daily' },
  { url: '/product/revivaa-oil-150', priority: '0.95', changefreq: 'daily', image: `${DOMAIN}/images/hero-product.png` },
  { url: '/how-it-works', priority: '0.85', changefreq: 'weekly' },
  { url: '/ingredients', priority: '0.85', changefreq: 'weekly' },
  { url: '/about', priority: '0.8', changefreq: 'monthly' },
  { url: '/reviews', priority: '0.8', changefreq: 'weekly' },
  { url: '/faq', priority: '0.8', changefreq: 'weekly' },
  { url: '/contact', priority: '0.75', changefreq: 'monthly' },
  { url: '/track', priority: '0.7', changefreq: 'monthly' },
  { url: '/blog', priority: '0.85', changefreq: 'weekly' },
]

function generateSitemap() {
  const today = new Date().toISOString().split('T')[0]

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n'
  xml += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n'

  STATIC_PAGES.forEach((page) => {
    xml += '  <url>\n'
    xml += `    <loc>${DOMAIN}${page.url}</loc>\n`
    xml += `    <lastmod>${today}</lastmod>\n`
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`
    xml += `    <priority>${page.priority}</priority>\n`
    if (page.image) {
      xml += '    <image:image>\n'
      xml += `      <image:loc>${page.image}</image:loc>\n`
      xml += '      <image:title>Revivaa Botanical Hair Oil 150ml</image:title>\n'
      xml += '    </image:image>\n'
    }
    xml += '  </url>\n'
  })

  BLOG_POSTS.forEach((post) => {
    const postDate = post.updatedAt ? post.updatedAt.split('T')[0] : post.publishedAt.split('T')[0]
    xml += '  <url>\n'
    xml += `    <loc>${DOMAIN}/blog/${post.slug}</loc>\n`
    xml += `    <lastmod>${postDate}</lastmod>\n`
    xml += '    <changefreq>monthly</changefreq>\n'
    xml += '    <priority>0.8</priority>\n'
    if (post.coverImage) {
      xml += '    <image:image>\n'
      xml += `      <image:loc>${post.coverImage}</image:loc>\n`
      xml += `      <image:title>${post.title.replace(/&/g, '&amp;')}</image:title>\n`
      xml += '    </image:image>\n'
    }
    xml += '  </url>\n'
  })

  xml += '</urlset>\n'

  const targetPath = path.resolve(__dirname, '../public/sitemap.xml')
  fs.writeFileSync(targetPath, xml, 'utf8')
  console.log(`Successfully generated sitemap.xml at ${targetPath}`)
}

generateSitemap()
