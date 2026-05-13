import 'dotenv/config';
import http from 'http';

import { blingSync } from './jobs/bling-sync';
import { blingOrderSync } from './jobs/bling-order-sync';
import { domainVerificationWorker } from './jobs/domain-verification-worker';
import { publicationWorker } from './jobs/publication-worker';
import { pushNotificationWorker } from './jobs/push-notification-worker';

// ── Configuration ─────────────────────────────────────────────────────────────
const PORT       = parseInt(process.env.WORKER_PORT ?? '3001', 10);
const POLL_MS    = parseInt(process.env.JOB_POLL_INTERVAL_MS ?? '10000', 10);
const WORKER_ENV = process.env.NODE_ENV ?? 'development';

// ── Job registry ──────────────────────────────────────────────────────────────
type JobRunner = () => Promise<void>;

const jobs: { name: string; runner: JobRunner }[] = [
  { name: 'bling-sync',              runner: blingSync              },
  { name: 'bling-order-sync',        runner: blingOrderSync         },
  { name: 'domain-verification',     runner: domainVerificationWorker },
  { name: 'publication',             runner: publicationWorker      },
  { name: 'push-notifications',      runner: pushNotificationWorker },
];

// ── Health check HTTP server ──────────────────────────────────────────────────
const server = http.createServer((req, res) => {
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        status: 'ok',
        env: WORKER_ENV,
        jobs: jobs.map((j) => j.name),
        poll_interval_ms: POLL_MS,
        timestamp: new Date().toISOString(),
      })
    );
    return;
  }
  res.writeHead(404);
  res.end();
});

// ── Job loop ──────────────────────────────────────────────────────────────────
async function runAllJobs() {
  for (const job of jobs) {
    try {
      await job.runner();
    } catch (err) {
      console.error(`[worker] job "${job.name}" failed:`, err);
      // Individual job failures do not crash the worker loop
    }
  }
}

// ── Startup ───────────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`[worker] health endpoint: http://0.0.0.0:${PORT}/health`);
  console.log(`[worker] poll interval: ${POLL_MS}ms`);
  console.log(`[worker] registered jobs: ${jobs.map((j) => j.name).join(', ')}`);
});

// Initial run on startup, then schedule
(async () => {
  console.log('[worker] running initial job sweep...');
  await runAllJobs();

  const interval = setInterval(async () => {
    await runAllJobs();
  }, POLL_MS);

  // ── Graceful shutdown ───────────────────────────────────────────────────────
  const shutdown = (signal: string) => {
    console.log(`[worker] received ${signal}, shutting down...`);
    clearInterval(interval);
    server.close(() => {
      console.log('[worker] HTTP server closed. Exiting.');
      process.exit(0);
    });
    setTimeout(() => {
      console.error('[worker] force exit after timeout');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));
})();
