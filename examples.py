"""
Example usage of WhatsApp Automation

This script demonstrates how to use the WhatsApp automation module.

IMPORTANT: Before running this script:
1. Install required packages: pip install -r requirements.txt
2. Make sure WhatsApp Web is logged in on your default browser
3. Update the phone numbers and messages below with your own data
4. Phone numbers must include country code (e.g., '+1234567890')
"""

from whatsapp_automation import WhatsAppAutomation
import datetime


def example_instant_message():
    """Example: Send an instant message."""
    print("\n--- Example: Send Instant Message ---")
    
    wa = WhatsAppAutomation()
    
    # Replace with actual phone number (include country code with +)
    phone_number = "+1234567890"
    message = "Hello! This is an automated message from WhatsApp Automation."
    
    # Send instant message
    wa.send_instant_message(phone_number, message)
    print("Check WhatsApp Web - message should be sent within 1 minute")


def example_scheduled_message():
    """Example: Schedule a message for a specific time."""
    print("\n--- Example: Schedule Message ---")
    
    wa = WhatsAppAutomation()
    
    # Replace with actual phone number
    phone_number = "+1234567890"
    message = "This is a scheduled message!"
    
    # Get current time and schedule for 2 minutes from now
    now = datetime.datetime.now()
    schedule_time = now + datetime.timedelta(minutes=2)
    
    hour = schedule_time.hour
    minute = schedule_time.minute
    
    print(f"Scheduling message for {hour}:{minute:02d}")
    wa.send_scheduled_message(phone_number, message, hour, minute)


def example_bulk_messages():
    """Example: Send messages to multiple contacts."""
    print("\n--- Example: Send Bulk Messages ---")
    
    wa = WhatsAppAutomation()
    
    # Replace with actual phone numbers
    phone_numbers = [
        "+1234567890",
        "+0987654321",
    ]
    
    message = "Hello! This is a bulk message test."
    
    # Send to all contacts with 60 second interval
    results = wa.send_bulk_messages(phone_numbers, message, interval=60)
    
    print("\nResults:")
    for phone, success in results.items():
        status = "Success" if success else "Failed"
        print(f"{phone}: {status}")


def example_group_message():
    """Example: Send message to a WhatsApp group."""
    print("\n--- Example: Send Group Message ---")
    
    wa = WhatsAppAutomation()
    
    # Replace with actual group ID (you can find this in WhatsApp Web URL)
    group_id = "YourGroupID"
    message = "Hello group! This is an automated message."
    
    # Schedule for 2 minutes from now
    now = datetime.datetime.now()
    schedule_time = now + datetime.timedelta(minutes=2)
    
    wa.send_group_message(group_id, message, 
                         schedule_time.hour, schedule_time.minute)


def example_send_image():
    """Example: Send an image with caption."""
    print("\n--- Example: Send Image ---")
    
    wa = WhatsAppAutomation()
    
    # Replace with actual phone number and image path
    phone_number = "+1234567890"
    image_path = "/path/to/your/image.jpg"
    caption = "Check out this image!"
    
    wa.send_image(phone_number, image_path, caption)


def main():
    """
    Main function to run examples.
    
    Uncomment the example you want to run.
    """
    print("WhatsApp Automation - Example Usage")
    print("=" * 50)
    print("\nWARNING: Before running these examples:")
    print("1. Make sure WhatsApp Web is logged in")
    print("2. Update phone numbers with real numbers (include country code)")
    print("3. Be aware that messages will actually be sent!")
    print("\nUncomment the example you want to run in the code.")
    
    # Uncomment ONE example at a time to test:
    
    # example_instant_message()
    # example_scheduled_message()
    # example_bulk_messages()
    # example_group_message()
    # example_send_image()


if __name__ == "__main__":
    main()
