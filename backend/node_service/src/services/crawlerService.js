import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import pLimit from 'p-limit';
import { ContactEmail } from '../models/index.js';
import { URL } from 'url';

puppeteer.use(StealthPlugin());

let browserInstance = null;
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

/**
 * Ensures a singleton browser instance for efficiency
 */
const getBrowser = async () => {
    if (browserInstance && browserInstance.process() && !browserInstance.process().killed) {
        return browserInstance;
    }
    browserInstance = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    return browserInstance;
};

const CONTACT_PATHS = [
    '/contact', '/contact-us', '/support', '/about-us', '/privacy-policy', '/legal', '/help'
];

const limit = pLimit(10); // Limit to 10 concurrent crawls

/**
 * Normalizes email address
 */
const normalizeEmail = (email) => {
    return email.toLowerCase().trim();
};

/**
 * Extracts emails from text string using regex
 */
const extractEmails = (text) => {
    if (!text) return [];
    const matches = text.match(EMAIL_REGEX);
    if (!matches) return [];
    
    // Filter out common false positives and duplicates
    const ignorePatterns = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.css', '.js', 'example.com'];
    return [...new Set(matches)]
        .map(normalizeEmail)
        .filter(email => !ignorePatterns.some(p => email.endsWith(p)));
};

/**
 * Crawl using Axios + Cheerio (Static)
 */
const crawlStatic = async (url) => {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 10000
        });
        return response.data;
    } catch (error) {
        console.error(`[Crawler] Static crawl failed for ${url}: ${error.message}`);
        return null;
    }
};

/**
 * Crawl using Puppeteer (Dynamic)
 */
const crawlDynamic = async (url) => {
    let page;
    try {
        const browser = await getBrowser();
        page = await browser.newPage();
        
        // Block images and CSS to speed up rendering
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
        const content = await page.content();
        return content;
    } catch (error) {
        console.error(`[Crawler] Dynamic crawl failed for ${url}: ${error.message}`);
        return null;
    } finally {
        if (page) await page.close();
    }
};

/**
 * Crawls a specific domain and its contact pages to find emails
 */
export const crawlWebsiteForEmails = async (domainUrl) => {
    const domain = new URL(domainUrl).hostname.replace('www.', '');
    const baseUrl = new URL(domainUrl).origin;
    const foundEmails = new Map(); // Use map to keep track of email -> source_page

    const processPage = async (pageUrl, usePuppeteer = false) => {
        // FAST MODE: Default to Static crawl only for discovery phase
        let html = usePuppeteer ? await crawlDynamic(pageUrl) : await crawlStatic(pageUrl);
        
        if (!html) return null;

        const emails = extractEmails(html);
        emails.forEach(email => {
            if (!foundEmails.has(email)) {
                foundEmails.set(email, pageUrl.replace(baseUrl, ''));
            }
        });
        
        return html;
    };

    try {
        // 1. Crawl Homepage first
        const homepageHtml = await processPage(baseUrl);

        // 2. SMART DISCOVERY: Only crawl contact pages if no emails found OR if we find likely links
        if (foundEmails.size < 2 && homepageHtml) {
            const $ = cheerio.load(homepageHtml);
            const discoveredPaths = new Set();
            
            // Look for links that match our contact keywords
            $('a[href]').each((_, el) => {
                const href = $(el).attr('href');
                if (!href) return;
                
                const lowerHref = href.toLowerCase();
                if (CONTACT_PATHS.some(p => lowerHref.includes(p))) {
                    try {
                        const fullUrl = new URL(href, baseUrl).href;
                        if (fullUrl.startsWith(baseUrl)) {
                            discoveredPaths.add(fullUrl);
                        }
                    } catch (e) {}
                }
            });

            // Always add a few top fallbacks if discovery found nothing
            if (discoveredPaths.size === 0) {
                CONTACT_PATHS.slice(0, 3).forEach(p => discoveredPaths.add(new URL(p, baseUrl).href));
            }

            // Crawl discovered pages (limited to top 5 for speed)
            const pagesToCrawl = Array.from(discoveredPaths).slice(0, 5);
            await Promise.all(pagesToCrawl.map(p => limit(() => processPage(p))));
        }

        // 3. Save to Database
        const results = [];
        for (const [email, source] of foundEmails.entries()) {
            try {
                await ContactEmail.create({
                    domain: domain,
                    email: email,
                    sourcePage: source || '/'
                });
                results.push({
                    domain: domain,
                    email: email,
                    source: source || '/'
                });
            } catch (dbErr) {}
        }

        return results;
    } catch (error) {
        console.error(`[Crawler] Error crawling ${domainUrl}:`, error.message);
        return [];
    }
};

/**
 * Batch crawl multiple websites
 */
export const batchCrawlWebsites = async (urls) => {
    const results = await Promise.all(urls.map(url => limit(() => crawlWebsiteForEmails(url))));
    return results.flat();
};
