export default function handler(req, res) {
  const timestamp = new Date().toISOString();
  
  // Log request details
  console.log(`[${timestamp}] Debug endpoint called`);
  console.log('Method:', req.method);
  console.log('Headers:', req.headers);
  console.log('Query:', req.query);
  console.log('Body:', req.body);
  
  // Return debug information
  res.status(200).json({
    message: 'Debug endpoint working',
    timestamp: timestamp,
    method: req.method,
    headers: req.headers,
    query: req.query,
    body: req.body,
    environment: process.env.NODE_ENV || 'development',
    vercel: {
      region: process.env.VERCEL_REGION || 'unknown',
      url: process.env.VERCEL_URL || 'unknown'
    }
  });
}
