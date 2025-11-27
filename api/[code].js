import fs from 'fs';
import path from 'path';

// File-based storage (same as links.js)
const DATA_FILE = path.join(process.cwd(), 'links-data.json');

const getLinksStore = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading data file:', err);
  }
  return {};
};

const saveLinksStore = (data) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving data file:', err);
  }
};

export default async function handler(req, res) {
  const { code } = req.query;
  const linksStore = getLinksStore();

  // DELETE - Remove link
  if (req.method === 'DELETE') {
    try {
      delete linksStore[code];
      saveLinksStore(linksStore);
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting link:', error);
      return res.status(500).json({ error: 'Failed to delete link' });
    }
  }

  // GET - Redirect to original URL
  if (req.method === 'GET') {
    try {
      const link = linksStore[code];

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

      // Update click count
      link.click_count += 1;
      link.last_clicked = new Date().toISOString();
      linksStore[code] = link;
      saveLinksStore(linksStore);

      // Redirect to original URL
      return res.redirect(301, link.original_url);
    } catch (error) {
      console.error('Error redirecting:', error);
      return res.status(500).send(`
        <!DOCTYPE html>
        <html>
        <head><title>500 - Server Error</title></head>
        <body style="font-family: system-ui; text-align: center; padding: 50px;">
          <h1>⚠️ Server Error</h1>
          <p>Something went wrong. Please try again.</p>
          <a href="/" style="color: #667eea; text-decoration: none; font-weight: bold;">← Go to Homepage</a>
        </body>
        </html>
      `);
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}