# WhatsApp Message Templates Setup Guide

## Why Templates Are Required

WhatsApp Business API **REQUIRES** pre-approved message templates for:
- First message to a new contact
- Messages outside the 24-hour customer service window
- All automated/scheduled messages

Plain text messages will show as "sent" but **won't be delivered** without templates.

---

## Step 1: Create Templates in Meta Business Manager

### Template 1: Teacher Reminder

1. Go to **Meta Business Manager** → [https://business.facebook.com](https://business.facebook.com)
2. Navigate to **WhatsApp Manager** → **Message Templates**
3. Click **Create Template**

**Template Details:**
- **Template Name:** `teacher_reminder`
- **Category:** `UTILITY`
- **Language:** `English (US)`
- **Header:** (None)
- **Body:**
  ```
  Hi {{1}}, just a quick reminder about your session today. Could you please confirm?
  ```
- **Footer:** (None)
- **Buttons:** (Optional - can add "Confirm" button)

4. Click **Submit** and wait for approval (usually takes 5-15 minutes)

---

### Template 2: Student Reminder

1. Click **Create Template** again

**Template Details:**
- **Template Name:** `student_reminder`
- **Category:** `UTILITY`
- **Language:** `English (US)`
- **Header:** (None)
- **Body:**
  ```
  Hi ma'am, Just a quick reminder about today's class at {{1}} {{2}} IST. Looking forward to seeing you in the session!
  ```
  - `{{1}}` = Date (e.g., "Jan 21, 2026")
  - `{{2}}` = Time (e.g., "3:30pm")
- **Footer:** (None)
- **Buttons:** (Optional)

2. Click **Submit** and wait for approval

---

## Step 2: Update Environment Variables

Once templates are **approved**, update your `.env` file:

```env
# Add these lines to backend/.env
WHATSAPP_TEACHER_TEMPLATE=teacher_reminder
WHATSAPP_STUDENT_TEMPLATE=student_reminder
WHATSAPP_TEMPLATE_LANGUAGE=en_US
```

---

## Step 3: Test Templates

Run the test script to verify:

```bash
cd backend
node test-template.js
```

Check your WhatsApp - you should receive the message!

---

## Current Status

✅ Code is ready to use templates  
⏳ **ACTION NEEDED:** Create & approve templates in Meta Business Manager  
⏳ **ACTION NEEDED:** Update `.env` with template names  

**For now, the app uses `hello_world` template as fallback**

---

## Important Notes

### Message Delivery Status
- ✅ **Sent** = API accepted the message
- ✅ **Delivered** = Message reached recipient's phone
- ✅ **Read** = Recipient opened the message
- ❌ **Failed** = Delivery failed (check webhooks)

### Common Issues

**1. Template Rejected:**
- Avoid promotional language
- Keep it informational/transactional
- Don't ask for sensitive info

**2. Messages Not Delivering:**
- Template not approved
- Recipient number not added to test numbers (during development)
- Rate limits exceeded

**3. Recipient Restrictions (Development Mode):**
- Add test phone numbers in **WhatsApp Manager** → **Phone Numbers** → **Recipients**
- Can add up to 5 test numbers in development mode

---

## Testing Checklist

Before sending to real users:

- [ ] Templates created and approved
- [ ] `.env` updated with template names
- [ ] Test script succeeds (`node test-template.js`)
- [ ] Messages actually deliver to WhatsApp
- [ ] Webhook configured to track delivery status
- [ ] Test numbers added as recipients

---

## Production Deployment

Before going live:

1. ✅ **Verify WhatsApp Business Account**
2. ✅ **Complete Business Verification** (if required)
3. ✅ **Increase Message Limits** (apply in Meta Business Manager)
4. ✅ **Set up webhook** for delivery status tracking
5. ✅ **Test thoroughly** with real phone numbers

---

## Need Help?

- **Meta Documentation:** [WhatsApp Business Platform Templates](https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates)
- **Template Examples:** [Message Template Examples](https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates/examples)
