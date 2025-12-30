module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const uptime = process.uptime ? process.uptime() : null;
  const response = {
    status: 'OK',
    currentTime: new Date().toISOString(),
  };
  if (uptime !== null) {
    response.uptimeSeconds = uptime;
  }
  res.status(200).end(JSON.stringify(response));
};
