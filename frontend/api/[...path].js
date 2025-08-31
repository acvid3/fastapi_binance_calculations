export default async function handler(req, res) {
  const seg = req.query.path;
  const tail = Array.isArray(seg) ? seg.join('/') : (seg || '');
  const url = `http://13.50.4.32:8000/${tail}`;

  const method = (req.method || 'GET').toUpperCase();

  // Parse request body for POST/PUT requests
  let body;
  if (method !== 'GET' && method !== 'HEAD') {
    try {
      // Vercel serverless functions need explicit body parsing
      if (req.body) {
        if (typeof req.body === 'string') {
          body = req.body;
        } else if (Buffer.isBuffer(req.body)) {
          body = req.body;
        } else {
          body = JSON.stringify(req.body);
        }
      }
    } catch (error) {
      console.error('Body parsing error:', error);
    }
  }

  // Prepare headers
  const headers = {};
  for (const [k, v] of Object.entries(req.headers || {})) {
    if (typeof v === 'string') headers[k] = v;
  }
  
  // Remove problematic headers
  delete headers.host;
  delete headers['content-length'];
  delete headers['transfer-encoding'];
  
  // Set content-type for POST requests with body
  if (body && method !== 'GET' && method !== 'HEAD') {
    if (!headers['content-type']) {
      headers['content-type'] = 'application/json';
    }
  }

  try {
    console.log(`[${new Date().toISOString()}] Proxying ${method} request to: ${url}`);
    console.log('Request headers:', JSON.stringify(headers, null, 2));
    if (body) console.log('Request body:', body);

    const upstream = await fetch(url, { 
      method, 
      headers, 
      body: body || undefined 
    });
    
    console.log(`[${new Date().toISOString()}] Upstream response status: ${upstream.status}`);
    
    // Set response status
    res.status(upstream.status);
    
    // Copy headers from upstream response
    upstream.headers.forEach((v, k) => {
      if (k.toLowerCase() !== 'content-encoding') { // Avoid compression issues
        res.setHeader(k, v);
      }
    });
    
    // Handle response body
    if (method !== 'HEAD') {
      const responseText = await upstream.text();
      console.log(`[${new Date().toISOString()}] Response body length: ${responseText.length}`);
      res.send(responseText);
    } else {
      res.end();
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Proxy error:`, error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      url: url,
      method: method,
      body: body
    });
    
    res.status(500).json({ 
      error: 'Proxy error', 
      message: error.message,
      url: url,
      method: method,
      body: body,
      timestamp: new Date().toISOString()
    });
  }
}
