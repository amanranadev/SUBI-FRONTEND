# Subi Frontend (Web)

## Local setup

Set these variables in `web/.env.local` (or `web/.env`):

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_DEMO_DOCUMENT_PREVIEW_TOKEN=your_demo_token
NEXT_PUBLIC_CADET_EXTENSION_ID=your_unpacked_or_store_extension_id
```

`NEXT_PUBLIC_*` variables must live in the **web** app env files (`web/.env` or `web/.env.local`), not the Rails backend `.env`. Restart `npm run dev` after changing them.

Then run:

```bash
npm install
npm run dev
```

## Public document processor demo

Route: `/demo/document-processor`

This page is public (no login) and is intended for embedding and product trials:

- Runs real backend processing
- Opens real transaction review UI
- Does not save/create a transaction

## Iframe embed example

```html
<iframe
  src="https://your-web-app.com/demo/document-processor"
  title="Subi Document Processor Demo"
  width="100%"
  height="900"
  style="border:0;border-radius:16px;overflow:hidden"
  loading="lazy"
  referrerpolicy="strict-origin-when-cross-origin"
></iframe>
```
