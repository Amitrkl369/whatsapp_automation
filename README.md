# WhatsApp Automation

A Python-based WhatsApp automation tool that allows you to send messages, schedule messages, and automate various WhatsApp tasks using WhatsApp Web.

## Features

- ✅ Send instant WhatsApp messages
- ✅ Schedule messages for specific times
- ✅ Send bulk messages to multiple contacts
- ✅ Send messages to WhatsApp groups
- ✅ Send images with captions
- ✅ Easy-to-use Python API
- ✅ Customizable wait times and settings

## Prerequisites

- Python 3.7 or higher
- Google Chrome or Firefox browser
- WhatsApp account (must be logged into WhatsApp Web)

## Installation

1. Clone this repository:
```bash
git clone https://github.com/Amitrkl369/whatsapp_automation.git
cd whatsapp_automation
```

2. Install required dependencies:
```bash
pip install -r requirements.txt
```

## Quick Start

### Basic Usage

```python
from whatsapp_automation import WhatsAppAutomation

# Initialize the automation
wa = WhatsAppAutomation()

# Send an instant message
phone_number = "+1234567890"  # Include country code with +
message = "Hello from WhatsApp Automation!"
wa.send_instant_message(phone_number, message)
```

### Schedule a Message

```python
from whatsapp_automation import WhatsAppAutomation

wa = WhatsAppAutomation()

# Schedule message for 14:30 (2:30 PM)
phone_number = "+1234567890"
message = "This is a scheduled message"
wa.send_scheduled_message(phone_number, message, hour=14, minute=30)
```

### Send Bulk Messages

```python
from whatsapp_automation import WhatsAppAutomation

wa = WhatsAppAutomation()

phone_numbers = ["+1234567890", "+0987654321"]
message = "Hello everyone!"

# Send with 60 second interval between messages
results = wa.send_bulk_messages(phone_numbers, message, interval=60)
```

### Send to a Group

```python
from whatsapp_automation import WhatsAppAutomation

wa = WhatsAppAutomation()

group_id = "YourGroupID"  # Get from WhatsApp Web URL
message = "Hello group!"
wa.send_group_message(group_id, message, hour=15, minute=0)
```

### Send Image with Caption

```python
from whatsapp_automation import WhatsAppAutomation

wa = WhatsAppAutomation()

phone_number = "+1234567890"
image_path = "/path/to/image.jpg"
caption = "Check this out!"
wa.send_image(phone_number, image_path, caption)
```

## Usage Examples

Check out the `examples.py` file for more detailed examples:

```bash
python examples.py
```

## Important Notes

### Phone Number Format
- Always include the country code with a `+` sign
- Example: `+1234567890` (for US/Canada: +1, India: +91, UK: +44, etc.)
- Do not include any spaces, dashes, or parentheses

### WhatsApp Web
- You must be logged into WhatsApp Web in your default browser
- The automation will open WhatsApp Web automatically
- Make sure you don't close the browser window until the message is sent

### Timing
- Scheduled messages must be set for a future time
- The script will wait until the scheduled time before sending
- For instant messages, a small delay (1 minute) is used to open and load WhatsApp Web

### Rate Limiting
- When sending bulk messages, use appropriate intervals (recommended: 60+ seconds)
- Sending too many messages too quickly may trigger WhatsApp's spam detection

## API Reference

### WhatsAppAutomation Class

#### `send_instant_message(phone_number, message, wait_time=15, tab_close=True, close_time=3)`
Send a message immediately (within 1 minute).

**Parameters:**
- `phone_number` (str): Phone number with country code
- `message` (str): Message to send
- `wait_time` (int): Time to wait before sending (default: 15 seconds)
- `tab_close` (bool): Close tab after sending (default: True)
- `close_time` (int): Time before closing tab (default: 3 seconds)

**Returns:** `bool` - True if successful

#### `send_scheduled_message(phone_number, message, hour, minute, wait_time=15, tab_close=True, close_time=3)`
Schedule a message for a specific time.

**Parameters:**
- `phone_number` (str): Phone number with country code
- `message` (str): Message to send
- `hour` (int): Hour in 24-hour format (0-23)
- `minute` (int): Minute (0-59)
- `wait_time` (int): Time to wait before sending (default: 15 seconds)
- `tab_close` (bool): Close tab after sending (default: True)
- `close_time` (int): Time before closing tab (default: 3 seconds)

**Returns:** `bool` - True if successful

#### `send_bulk_messages(phone_numbers, message, interval=60)`
Send messages to multiple contacts.

**Parameters:**
- `phone_numbers` (list): List of phone numbers with country codes
- `message` (str): Message to send
- `interval` (int): Seconds between messages (default: 60)

**Returns:** `dict` - Dictionary with results for each number

#### `send_group_message(group_id, message, hour, minute, wait_time=15, tab_close=True, close_time=3)`
Send a message to a WhatsApp group.

**Parameters:**
- `group_id` (str): Group ID from WhatsApp Web URL
- `message` (str): Message to send
- `hour` (int): Hour in 24-hour format
- `minute` (int): Minute
- `wait_time` (int): Time to wait before sending (default: 15 seconds)
- `tab_close` (bool): Close tab after sending (default: True)
- `close_time` (int): Time before closing tab (default: 3 seconds)

**Returns:** `bool` - True if successful

#### `send_image(phone_number, image_path, caption=None)`
Send an image with optional caption.

**Parameters:**
- `phone_number` (str): Phone number with country code
- `image_path` (str): Path to the image file
- `caption` (str, optional): Image caption

**Returns:** `bool` - True if successful

## Troubleshooting

### Browser doesn't open
- Make sure Chrome or Firefox is installed
- Check that WhatsApp Web works in your browser manually
- Try logging into WhatsApp Web manually first

### Messages not sending
- Verify phone number format (include + and country code)
- Check internet connection
- Ensure WhatsApp Web is logged in
- Check if the recipient has blocked you

### Image not sending
- Verify the image path is correct
- Ensure the image format is supported (JPG, PNG)
- Check file permissions

## Limitations

- Requires WhatsApp Web to be logged in
- Requires internet connection
- Subject to WhatsApp's terms of service
- May be detected as automation by WhatsApp if overused

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Disclaimer

This tool is for educational purposes only. Use it responsibly and in accordance with WhatsApp's Terms of Service. The authors are not responsible for any misuse of this tool.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.
