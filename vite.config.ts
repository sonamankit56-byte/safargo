import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const resendApiPlugin = (): Plugin => ({
  name: 'resend-api-middleware',
  configureServer(server) {
    server.middlewares.use('/api/send-email', (req, res) => {
      if (req.method !== 'POST') {
        res.statusCode = 405;
        res.end('Method Not Allowed');
        return;
      }
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const payload = JSON.parse(body);
          const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.VITE_RESEND_API_KEY || ''}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: payload.from || 'SafarGo <noreply@safargo.in>',
              to: Array.isArray(payload.to) ? payload.to : [payload.to],
              subject: payload.subject,
              html: payload.html,
              text: payload.text
            })
          });
          const data = await response.json();
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = response.status;
          res.end(JSON.stringify(data));
        } catch (err: any) {
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err?.message || 'Failed to dispatch email' }));
        }
      });
    });
  }
});

const paybeezApiPlugin = (): Plugin => ({
  name: 'paybeez-api-middleware',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (!req.url?.startsWith('/api/recharge/')) {
        return next();
      }

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      if (req.method === 'OPTIONS') {
        res.statusCode = 200;
        res.end();
        return;
      }

      if (req.method === 'GET') {
        let getTargetUrl = '';
        if (req.url?.startsWith('/api/recharge/orders/')) {
          const orderId = req.url.replace('/api/recharge/orders/', '').split('?')[0];
          getTargetUrl = `https://api.paybeez.in/v1/public/recharge/orders/${encodeURIComponent(orderId)}`;
        } else if (req.url === '/api/recharge/operators') {
          getTargetUrl = 'https://api.paybeez.in/v1/recharge/prepaid/operators';
        } else if (req.url === '/api/recharge/circles') {
          getTargetUrl = 'https://api.paybeez.in/v1/recharge/prepaid/circles';
        } else if (req.url?.startsWith('/api/recharge/plans?')) {
          const query = req.url.split('?')[1] || '';
          getTargetUrl = `https://api.paybeez.in/v1/recharge/prepaid/plans?${query}`;
        }

        if (getTargetUrl) {
          try {
            const response = await fetch(getTargetUrl, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SafarGo/1.0'
              }
            });
            const data = await response.json();
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = response.status;
            res.end(JSON.stringify(data));
          } catch (err: any) {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 500;
            res.end(JSON.stringify({ success: false, error: err?.message || 'Failed to fetch data' }));
          }
          return;
        }
      }

      if (req.method !== 'POST') {
        res.statusCode = 405;
        res.end('Method Not Allowed');
        return;
      }

      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          const payload = body ? JSON.parse(body) : {};
          let targetUrl = '';

          if (req.url === '/api/recharge/plans-auto') {
            targetUrl = 'https://api.paybeez.in/v1/recharge/prepaid/plans-auto';
          } else if (req.url === '/api/recharge/quote') {
            targetUrl = 'https://api.paybeez.in/v1/payments/quote';
          } else if (req.url === '/api/recharge/checkout') {
            targetUrl = 'https://api.paybeez.in/v1/public/recharge/checkout';
          } else {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'Endpoint not found' }));
            return;
          }

          const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SafarGo/1.0'
            },
            body: JSON.stringify(payload)
          });

          const data = await response.json();
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = response.status;
          res.end(JSON.stringify(data));
        } catch (err: any) {
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 500;
          res.end(JSON.stringify({ success: false, error: err?.message || 'Server error' }));
        }
      });
    });
  }
});

import fs from 'fs';
import path from 'path';

const fast2smsApiPlugin = (): Plugin => ({
  name: 'fast2sms-api-middleware',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (!req.url?.startsWith('/api/sms/')) {
        return next();
      }

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      if (req.method === 'OPTIONS') {
        res.statusCode = 200;
        res.end();
        return;
      }

      if (req.url === '/api/sms/send-otp' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
          try {
            const payload = body ? JSON.parse(body) : {};
            const { mobile, otp, route = 'otp' } = payload;
            const cleanMobile = String(mobile || '').replace(/\D/g, '').slice(-10);

            // Read API key from request payload, env var, or .env file
            let apiKey = (payload.apiKey || process.env.VITE_FAST2SMS_API_KEY || '').trim();
            if (!apiKey) {
              try {
                const envContent = fs.readFileSync(path.resolve(process.cwd(), '.env'), 'utf-8');
                const match = envContent.match(/VITE_FAST2SMS_API_KEY\s*=\s*(.*)/);
                if (match && match[1]) {
                  apiKey = match[1].trim();
                }
              } catch {}
            }

            if (!apiKey) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 400;
              res.end(JSON.stringify({
                return: false,
                status_code: 400,
                message: 'Fast2SMS API key not configured. Please add VITE_FAST2SMS_API_KEY in .env or settings.'
              }));
              return;
            }

            if (!cleanMobile || cleanMobile.length !== 10) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 400;
              res.end(JSON.stringify({
                return: false,
                status_code: 400,
                message: 'Invalid 10-digit Indian mobile number'
              }));
              return;
            }

            let fast2smsPayload: any = {
              route: route === 'q' ? 'q' : 'otp',
              numbers: cleanMobile
            };

            if (route === 'q') {
              fast2smsPayload.message = payload.message || `SafarGo OTP: ${otp} is your secret login verification code. Valid for 10 minutes.`;
              fast2smsPayload.language = 'english';
              fast2smsPayload.flash = 0;
            } else {
              fast2smsPayload.variables_values = String(otp);
            }

            const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
              method: 'POST',
              headers: {
                'authorization': apiKey,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(fast2smsPayload)
            });

            const data = await response.json().catch(() => ({}));
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = response.status;
            res.end(JSON.stringify(data));
          } catch (err: any) {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 500;
            res.end(JSON.stringify({
              return: false,
              status_code: 500,
              message: err?.message || 'Server failed to dispatch SMS'
            }));
          }
        });
        return;
      }

      next();
    });
  }
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), resendApiPlugin(), paybeezApiPlugin(), fast2smsApiPlugin()],
  server: {
    port: 5174,
    host: true,
    allowedHosts: true,
  },
});

