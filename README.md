# URL Shortener

Simple URL shortener banaya hai jo localhost pe chal sakta hai aur vercel pe bhi deploy ho sakta hai.

## Features

- Long URLs ko short codes mein convert karta hai
- Custom short codes bhi laga sakte ho (optional)
- Click tracking - kitni baar link open hua wo count karta hai
- Search functionality - apne links dhundh sakte ho
- Links delete bhi kar sakte ho

## Setup

```bash
npm install
npm run dev
```

Browser mein `http://localhost:3000` kholo.

## Files

- `api/links.js` - links create aur fetch karne ke liye
- `api/[code].js` - short code se redirect karne ke liye
- `public/index.html` - frontend UI
- `public/app.js` - API calls aur interactions

## Local Development

Local pe file-based storage use ho raha hai. Links `links-data.json` file mein save hote hain.

## Deploy to Vercel

```bash
npx vercel
```

Production ke liye Vercel KV database setup karna padega for proper storage.

## Tech Stack

- Vanilla JS for frontend
- Vercel Serverless Functions for backend
- File storage for local dev

---

Made this for learning purpose. Feel free to use or modify.
