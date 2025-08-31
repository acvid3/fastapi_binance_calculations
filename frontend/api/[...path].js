export default async function handler(req, res) {
  const seg = req.query.path;
  const tail = Array.isArray(seg) ? seg.join('/') : (seg || '');
  const url = `http://13.50.4.32:8000/${tail}`;

  const method = (req.method || 'GET').toUpperCase();

  const headers = {};
  for (const [k, v] of Object.entries(req.headers || {})) {
    if (typeof v === 'string') headers[k] = v;
  }
  delete headers.host;
  delete headers['content-length'];

  let body;
  if (method !== 'GET' && method !== 'HEAD') {
    if (typeof req.body === 'string' || Buffer.isBuffer(req.body)) {
      body = req.body;
    } else if (req.body != null) {
      body = JSON.stringify(req.body);
      if (!headers['content-type']) headers['content-type'] = 'application/json';
    }
  }

  try {
    const upstream = await fetch(url, { method, headers, body });
    res.status(upstream.status);
    
    // Copy headers from upstream response
    upstream.headers.forEach((v, k) => res.setHeader(k, v));
    
    // Handle response body
    if (method !== 'HEAD') {
      const buf = Buffer.from(await upstream.arrayBuffer());
      res.send(buf);
    } else {
      res.end();
    }
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Proxy error', 
      message: error.message,
      url: url 
    });
  }
}
