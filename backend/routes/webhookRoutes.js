import express from 'express';
const router = express.Router();

// Webhook verification endpoint
router.get('/webhook', (req, res) => {
    const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'your_verify_token';
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    } else {
        res.sendStatus(400);
    }
});

// Webhook event receiver
router.post('/webhook', (req, res) => {
    // Handle incoming webhook events here
    console.log('Received webhook event:', JSON.stringify(req.body, null, 2));
    res.sendStatus(200);
});

export default router;
