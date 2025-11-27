import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  const { code } = req.query;

  if (req.method === 'DELETE') {
    try {
      await kv.del(`link:${code}`);
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting link:', error);
      return res.status(500).json({ error: 'Failed to delete link' });
    }
  }

  if (req.method === 'GET') {
    try {
      const link = await kv.get(`link:${code}`);

      if (!link) {
        return res.status(404).send(`
          <!DOCTYPE html>
          <html>
          <head><title>404 - Not Found</title></head>
          <body style="font-family: system-ui; text-align: center; padding: 50px;">
            <h1>🔍 Link Not Found</h1>
            <p>This short link doesn't exist or has been deleted.</p>
            <a href="/" style="color: #667eea; text-decoration: none; font-weight: bold;">← Go to Homepage</a>
          </body>
          </html>
        `);
      }

      link.click_count += 1;
      link.last_clicked = new Date().toISOString();
      await kv.set(`link:${code}`, link);

      return res.redirect(301, link.original_url);
    } catch (error) {
      console.error('Error redirecting:', error);
      return res.status(500).send('Server error');
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}