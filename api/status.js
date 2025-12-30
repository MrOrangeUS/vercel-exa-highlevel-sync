export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  const uptime = typeof process.uptime === 'function' ? process.uptime() : null;
  const response = {
    status: 'OK',
    timestamp: new Date().toISOString(),
  };
  if (uptime !== null) {
    response.uptime = uptime;
  }
  res.status(200).json(response);
}
