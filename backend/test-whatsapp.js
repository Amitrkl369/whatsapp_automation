import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const token = process.env.WHATSAPP_API_TOKEN;
const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
const testPhone = '919199146909';

console.log('Testing WhatsApp API with new token...');
console.log('Phone Number ID:', phoneId);
console.log('Token (first 20 chars):', token?.substring(0, 20) + '...');

axios.post(
  `https://graph.facebook.com/v18.0/${phoneId}/messages`,
  {
    messaging_product: 'whatsapp',
    to: testPhone,
    type: 'text',
    text: { body: 'Test message - token updated!' }
  },
  {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }
)
.then(r => {
  console.log('✅ SUCCESS:', JSON.stringify(r.data, null, 2));
})
.catch(e => {
  console.log('❌ ERROR:', JSON.stringify(e.response?.data || e.message, null, 2));
});
