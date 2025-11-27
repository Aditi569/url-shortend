import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET - Fetch all links
  if (req.method === 'GET') {
    try {
      const keys = await kv.keys('link:*');
      const links = [];

      for (const key of keys) {
        const link = await kv.get(key);
        if (link) links.push(link);
      }

      links.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return res.status(200).json(links);
    } catch (error) {
      console.error('Error fetching links:', error);
      return res.status(500).json({ error: 'Failed to fetch links' });
    }
  }

  // POST - Create new link
  if (req.method === 'POST') {
    try {
      const { originalUrl, customCode } = req.body;

      if (!originalUrl) {
        return res.status(400).json({ error: 'Original URL is required' });
      }

      try {
        new URL(originalUrl);
      } catch {
        return res.status(400).json({ error: 'Invalid URL format' });
      }

      const code = customCode || generateCode();

      const existing = await kv.get(`link:${code}`);
      if (existing) {
        return res.status(409).json({ error: 'Custom code already exists' });
      }

      const linkData = {
        short_code: code,
        original_url: originalUrl,
        click_count: 0,
        created_at: new Date().toISOString(),
        last_clicked: null
      };

      await kv.set(`link:${code}`, linkData);

      const protocol = req.headers['x-forwarded-proto'] || 'http';
      const host = req.headers.host;

      return res.status(201).json({
        shortUrl: `${protocol}://${host}/${code}`,
        ...linkData
      });
    } catch (error) {
      console.error('Error creating link:', error);
      return res.status(500).json({ error: 'Failed to create link' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

function generateCode() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}