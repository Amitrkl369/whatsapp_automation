"""
WhatsApp Automation Module

This module provides functionality to automate WhatsApp messaging using pywhatkit.
"""

import pywhatkit as kit
import datetime
import time
from typing import Optional


class WhatsAppAutomation:
    """
    A class to handle WhatsApp automation tasks.
    """

    def __init__(self):
        """Initialize WhatsApp Automation."""
        self.tab_close = True
        self.wait_time = 15
        self.close_time = 3

    def send_instant_message(self, phone_number: str, message: str, 
                            wait_time: int = 15, tab_close: bool = True, 
                            close_time: int = 3) -> bool:
        """
        Send an instant WhatsApp message.

        Args:
            phone_number: Phone number with country code (e.g., '+1234567890')
            message: Message to send
            wait_time: Time to wait before sending message (seconds)
            tab_close: Whether to close the tab after sending
            close_time: Time to wait before closing tab (seconds)

        Returns:
            bool: True if message sent successfully, False otherwise
        """
        try:
            now = datetime.datetime.now()
            hour = now.hour
            minute = now.minute + 1  # Send in the next minute

            if minute >= 60:
                hour += 1
                minute = 0

            kit.sendwhatmsg(phone_number, message, hour, minute, 
                          wait_time, tab_close, close_time)
            print(f"Message sent successfully to {phone_number}")
            return True
        except Exception as e:
            print(f"Error sending message: {str(e)}")
            return False

    def send_scheduled_message(self, phone_number: str, message: str, 
                              hour: int, minute: int, wait_time: int = 15,
                              tab_close: bool = True, close_time: int = 3) -> bool:
        """
        Send a scheduled WhatsApp message.

        Args:
            phone_number: Phone number with country code (e.g., '+1234567890')
            message: Message to send
            hour: Hour to send message (24-hour format)
            minute: Minute to send message
            wait_time: Time to wait before sending message (seconds)
            tab_close: Whether to close the tab after sending
            close_time: Time to wait before closing tab (seconds)

        Returns:
            bool: True if message scheduled successfully, False otherwise
        """
        try:
            kit.sendwhatmsg(phone_number, message, hour, minute, 
                          wait_time, tab_close, close_time)
            print(f"Message scheduled successfully for {hour}:{minute:02d}")
            return True
        except Exception as e:
            print(f"Error scheduling message: {str(e)}")
            return False

    def send_bulk_messages(self, phone_numbers: list, message: str, 
                          interval: int = 60) -> dict:
        """
        Send messages to multiple contacts.

        Args:
            phone_numbers: List of phone numbers with country code
            message: Message to send
            interval: Time interval between messages in seconds

        Returns:
            dict: Dictionary with phone numbers as keys and success status as values
        """
        results = {}
        for i, phone in enumerate(phone_numbers):
            if i > 0:
                print(f"Waiting {interval} seconds before next message...")
                time.sleep(interval)
            
            result = self.send_instant_message(phone, message)
            results[phone] = result

        return results

    def send_group_message(self, group_id: str, message: str,
                          hour: int, minute: int, wait_time: int = 15,
                          tab_close: bool = True, close_time: int = 3) -> bool:
        """
        Send a message to a WhatsApp group.

        Args:
            group_id: Group ID or name
            message: Message to send
            hour: Hour to send message (24-hour format)
            minute: Minute to send message
            wait_time: Time to wait before sending message (seconds)
            tab_close: Whether to close the tab after sending
            close_time: Time to wait before closing tab (seconds)

        Returns:
            bool: True if message sent successfully, False otherwise
        """
        try:
            kit.sendwhatmsg_to_group(group_id, message, hour, minute,
                                    wait_time, tab_close, close_time)
            print(f"Message sent successfully to group {group_id}")
            return True
        except Exception as e:
            print(f"Error sending group message: {str(e)}")
            return False

    def send_image(self, phone_number: str, image_path: str, 
                   caption: Optional[str] = None) -> bool:
        """
        Send an image via WhatsApp.

        Args:
            phone_number: Phone number with country code
            image_path: Path to the image file
            caption: Optional caption for the image

        Returns:
            bool: True if image sent successfully, False otherwise
        """
        try:
            now = datetime.datetime.now()
            hour = now.hour
            minute = now.minute + 1

            if minute >= 60:
                hour += 1
                minute = 0

            if caption:
                kit.sendwhats_image(phone_number, image_path, caption, 
                                  hour, minute)
            else:
                kit.sendwhats_image(phone_number, image_path, 
                                  tab_close=True)
            
            print(f"Image sent successfully to {phone_number}")
            return True
        except Exception as e:
            print(f"Error sending image: {str(e)}")
            return False


def main():
    """
    Example usage of WhatsApp Automation.
    """
    print("WhatsApp Automation Module")
    print("-" * 50)
    print("This module provides WhatsApp automation capabilities.")
    print("\nAvailable features:")
    print("1. Send instant messages")
    print("2. Schedule messages")
    print("3. Send bulk messages")
    print("4. Send group messages")
    print("5. Send images with captions")
    print("\nImport this module to use in your scripts.")


if __name__ == "__main__":
    main()
