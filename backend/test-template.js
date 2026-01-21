import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const token = process.env.WHATSAPP_API_TOKEN;
const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
const testPhone = '919199146909'; // Replace with your test number

console.log('Testing WhatsApp Template Message...');
console.log('Phone Number ID:', phoneId);
console.log('Token (first 20 chars):', token?.substring(0, 20) + '...');

// Send the hello_world template (every WhatsApp Business account has this by default)
axios.post(
  `https://graph.facebook.com/v18.0/${phoneId}/messages`,
  {
    messaging_product: 'whatsapp',
    to: testPhone,
    type: 'template',
    template: {
      name: 'hello_world',
      language: {
        code: 'en_US'
      }
    }
  },
  {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }
)
.then(r => {
  console.log('✅ SUCCESS! Template message sent:', JSON.stringify(r.data, null, 2));
  console.log('\n📱 Check your WhatsApp now - you should receive the "Hello World" message!');
})
.catch(e => {
  console.log('❌ ERROR:', JSON.stringify(e.response?.data || e.message, null, 2));
  
  if (e.response?.data?.error) {
    const errorCode = e.response.data.error.code;
    const errorMsg = e.response.data.error.message;
    
    console.log('\n📋 Error Details:');
    console.log('Code:', errorCode);
    console.log('Message:', errorMsg);
    
    if (errorCode === 131047) {
      console.log('\n💡 Solution: The recipient needs to be added to your phone number recipients list.');
      console.log('Go to: WhatsApp Manager > Phone Numbers > Recipients and add the number.');
    }
  }
});
