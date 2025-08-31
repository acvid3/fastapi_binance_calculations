module.exports = (req, res) => {
    res.status(200).json({ 
        message: 'Vercel Function is working!',
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url
    });
};
