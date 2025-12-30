export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  const uptime = typeof process.uptime === 'function' ? process.uptime() : null;
  const telemetry = globalThis.telemetry || null;
  const response = {
    status: 'OK',
    timestamp: new Date().toISOString(),
  };
  if (uptime !== null) {
    response.uptime = uptime;
  }
  if (telemetry) {
    response.telemetry = telemetry;
  }
  res.status(200).json(response);
}
