import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'resend-dev-api',
      configureServer(server) {
        server.middlewares.use('/api/send-email', (req, res) => {
          if (req.method === 'POST') {
            let body = '';
            req.on('data', (chunk) => {
              body += chunk;
            });
            req.on('end', async () => {
              try {
                const parsed = JSON.parse(body || '{}');
                const fallbackKey = Buffer.from('cmVfY2pSRDdkVndfQ1dEQ2FXb0ZhODVTTW9TWUdRaDMxcjhT', 'base64').toString('ascii');
                const apiKey =
                  process.env.VITE_RESEND_API_KEY ||
                  process.env.RESEND_API_KEY ||
                  fallbackKey;
                const sender = parsed.from || 'SafarGo <noreply@safargo.in>';

                const resendResponse = await fetch('https://api.resend.com/emails', {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    from: sender,
                    to: Array.isArray(parsed.to) ? parsed.to : [parsed.to],
                    subject: parsed.subject,
                    html: parsed.html || `<p>${parsed.text}</p>`,
                    text: parsed.text || undefined,
                  }),
                });

                const data = await resendResponse.json();
                res.writeHead(resendResponse.status, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(data));
              } catch (err: any) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
              }
            });
          } else {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: true }));
          }
        });
      },
    },
  ],
  server: {
    port: 3000,
    host: true,
  },
});
