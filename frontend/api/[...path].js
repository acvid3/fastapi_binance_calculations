export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.status(200).end();
        return;
    }

    const { path } = req.query;
    const backendUrl = 'http://13.50.4.32:8000';
    
    try {
        const url = `${backendUrl}/${path.join('/')}`;
        console.log(`Proxying request to: ${url}`);
        
        const fetchOptions = {
            method: req.method,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Vercel-Proxy'
            }
        };
        
        if (req.method !== 'GET' && req.body) {
            fetchOptions.body = JSON.stringify(req.body);
        }
        
        const response = await fetch(url, fetchOptions);
        
        if (!response.ok) {
            console.error(`Backend responded with status: ${response.status}`);
            return res.status(response.status).json({ 
                error: `Backend error: ${response.status}` 
            });
        }
        
        const data = await response.json();
        
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).json(data);
        
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ 
            error: 'Internal Server Error',
            details: error.message 
        });
    }
}
