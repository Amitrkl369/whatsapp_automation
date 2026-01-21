import express from 'express';
import whatsappService from '../services/whatsappService.js';
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
    try {
        console.log('Received webhook event:', JSON.stringify(req.body, null, 2));
        
        // Process WhatsApp status updates
        const entry = req.body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;
        
        if (value?.statuses) {
            // Handle message status updates (sent, delivered, read, failed)
            value.statuses.forEach(status => {
                const messageId = status.id;
                const statusType = status.status; // sent, delivered, read, failed
                
                console.log(`📱 Status update - Message: ${messageId}, Status: ${statusType}`);
                whatsappService.updateMessageStatus(messageId, statusType);
            });
        }
        
        if (value?.messages) {
            // Handle incoming messages (if needed)
            console.log('📨 Received incoming message');
        }
        
        res.sendStatus(200);
    } catch (error) {
        console.error('Webhook error:', error);
        res.sendStatus(500);
    }
});

export default router;
