"""WhatsApp Business API integration utility."""
import logging
from typing import Any, Optional

import httpx

from app.core.config import get_settings
from app.core.exceptions import ExternalServiceException
from app.core.logging import get_logger

settings = get_settings()
logger = get_logger(__name__)


class WhatsAppClient:
    """
    Client for WhatsApp Business API.

    Sends templated and free-form messages to farmers.
    """

    def __init__(self):
        """Initialize WhatsApp client."""
        self.api_url = settings.WHATSAPP_API_URL
        self.access_token = settings.WHATSAPP_ACCESS_TOKEN
        self.phone_number_id = settings.WHATSAPP_PHONE_NUMBER_ID
        self.client = httpx.AsyncClient(timeout=30.0)

    async def send_message(
        self,
        phone_number: str,
        message: str,
        template_name: Optional[str] = None,
        template_params: Optional[dict[str, Any]] = None,
    ) -> dict:
        """
        Send a WhatsApp message.

        Args:
            phone_number: Recipient phone number (E.164 format)
            message: Message content
            template_name: Optional template name
            template_params: Optional template parameters

        Returns:
            API response
        """
        if not self.access_token:
            logger.warning("WhatsApp not configured, skipping message")
            return {"status": "skipped", "reason": "not_configured"}

        url = f"{self.api_url}/{self.phone_number_id}/messages"

        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json",
        }

        # Use template if provided
        if template_name:
            payload = {
                "messaging_product": "whatsapp",
                "to": phone_number,
                "type": "template",
                "template": {
                    "name": template_name,
                    "language": {"code": "pa"},  # Default to Punjabi
                    "components": [
                        {
                            "type": "body",
                            "parameters": [
                                {"type": "text", "text": str(v)}
                                for v in (template_params or {}).values()
                            ],
                        }
                    ],
                },
            }
        else:
            # Free-form message
            payload = {
                "messaging_product": "whatsapp",
                "to": phone_number,
                "type": "text",
                "text": {"body": message},
            }

        try:
            response = await self.client.post(url, headers=headers, json=payload)
            response.raise_for_status()

            result = response.json()
            logger.info(f"WhatsApp message sent to {phone_number}: {result}")
            return result

        except httpx.HTTPError as e:
            logger.error(f"WhatsApp API error: {e}")
            raise ExternalServiceException(
                service="WhatsApp",
                message=str(e),
            )

    async def send_fire_alert(
        self,
        phone_number: str,
        farmer_name: str,
        location_name: str,
        detection_time,
    ) -> dict:
        """
        Send fire alert message in Punjabi.

        Args:
            phone_number: Farmer's phone number
            farmer_name: Farmer's name
            location_name: Location name
            detection_time: Detection timestamp

        Returns:
            API response
        """
        time_str = detection_time.strftime("%I:%M %p")
        date_str = detection_time.strftime("%d %B %Y")

        # Punjabi message
        message = (
            f"🔥 ਅੱਗ ਚੇਤਾਵਨੀ - KrishiCred\n\n"
            f"ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ {farmer_name} ਜੀ,\n\n"
            f"{location_name} ਖੇਤਰ ਵਿੱਚ ਅੱਗ ਦੀ ਸੂਚਨਾ ਮਿਲੀ ਹੈ।\n"
            f"ਸਮਾਂ: {time_str}\n"
            f"ਤਾਰੀਖ: {date_str}\n\n"
            f"⚠️ ਕਿਰਪਾ ਕਰਕੇ ਫਸਲ ਬਚਾਵ ਨੂੰ ਨਾ ਸਾੜੋ।\n\n"
            f"💰 ਇਸ ਦੀ ਬਜਾਏ ਪੈਸਾ ਕਮਾਓ!\n"
            f"'ਵੇਚੋ' ਲਿਖੋ ਨੇੜਲੇ ਬਾਇਓਗੈਸ ਪਲਾਂਟਾਂ ਨਾਲ ਜੁੜਨ ਲਈ।\n\n"
            f"ਜੇ ਇਹ ਤੁਹਾਡਾ ਖੇਤਰ ਨਹੀਂ ਹੈ ਤਾਂ 'ਠੀਕ' ਲਿਖੋ।\n\n"
            f"KrishiCred - ਖੇਤ ਬਚਾਓ, ਕ੍ਰੈਡਿਟ ਕਮਾਓ।"
        )

        return await self.send_message(
            phone_number=phone_number,
            message=message,
        )

    async def send_collection_reminder(
        self,
        phone_number: str,
        farmer_name: str,
        scheduled_time,
        quantity_tons: float,
    ) -> dict:
        """Send collection reminder message."""
        time_str = scheduled_time.strftime("%I:%M %p")
        date_str = scheduled_time.strftime("%d %B %Y")

        message = (
            f"🌾 ਪਰਾਲੀ ਇਕੱਠਾ ਕਰਨ ਦੀ ਯਾਦ - KrishiCred\n\n"
            f"ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ {farmer_name} ਜੀ,\n\n"
            f"ਤੁਹਾਡੀ ਪਰਾਲੀ ਇਕੱਠਾ ਕਰਨ ਵਾਲੀ ਗੱਡੀ:\n"
            f"ਤਾਰੀਖ: {date_str}\n"
            f"ਸਮਾਂ: {time_str}\n"
            f"ਮਾਤਰਾ: {quantity_tons:.1f} ਟਨ\n\n"
            f"ਕਿਰਪਾ ਕਰਕੇ ਖੇਤਰ 'ਤੇ ਮੌਜੂਦ ਰਹੋ।\n\n"
            f"KrishiCred"
        )

        return await self.send_message(
            phone_number=phone_number,
            message=message,
        )

    async def send_route_dispatched(
        self,
        phone_number: str,
        farmer_name: str,
        scheduled_time,
        vehicle_number: str,
        driver_name: str,
        driver_phone: str,
    ) -> dict:
        """Send route dispatched notification."""
        time_str = scheduled_time.strftime("%I:%M %p")
        date_str = scheduled_time.strftime("%d %B %Y")

        message = (
            f"🚚 ਗੱਡੀ ਭੇਜੀ ਗਈ - KrishiCred\n\n"
            f"ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ {farmer_name} ਜੀ,\n\n"
            f"ਤੁਹਾਡੀ ਪਰਾਲੀ ਇਕੱਠਾ ਕਰਨ ਵਾਲੀ ਗੱਡੀ ਭੇਜੀ ਗਈ ਹੈ।\n\n"
            f"ਤਾਰੀਖ: {date_str}\n"
            f"ਸਮਾਂ: {time_str}\n"
            f"ਵਾਹਨ ਨੰਬਰ: {vehicle_number}\n"
            f"ਵਾਹਨ ਚਾਲਕ: {driver_name}\n"
            f"ਸੰਪਰਕ: {driver_phone}\n\n"
            f"KrishiCred"
        )

        return await self.send_message(
            phone_number=phone_number,
            message=message,
        )

    async def send_incoming_collection(
        self,
        phone_number: str,
        plant_name: str,
        farmer_name: str,
        quantity_tons: float,
        eta_minutes: int,
    ) -> dict:
        """Send incoming collection notification to plant."""
        message = (
            f"🚚 ਆਉਣ ਵਾਲੀ ਪਰਾਲੀ - KrishiCred\n\n"
            f"ਪਲਾਂਟ: {plant_name}\n\n"
            f"ਨਵਾਂ ਆਰਡਰ:\n"
            f"ਕਿਸਾਨ: {farmer_name}\n"
            f"ਮਾਤਰਾ: {quantity_tons:.1f} ਟਨ\n"
            f"ਅਨੁਮਾਨਿਤ ਸਮਾਂ: {eta_minutes} ਮਿੰਟ\n\n"
            f"ਤਿਆਰ ਰਹੋ।"
        )

        return await self.send_message(
            phone_number=phone_number,
            message=message,
        )

    async def send_payment_confirmation(
        self,
        phone_number: str,
        farmer_name: str,
        amount_inr: float,
        stubble_tons: float,
        transaction_code: str,
    ) -> dict:
        """Send payment confirmation message."""
        message = (
            f"💰 ਭੁਗਤਾਨ ਦੀ ਪੁਸ਼ਟੀ - KrishiCred\n\n"
            f"ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ {farmer_name} ਜੀ,\n\n"
            f"ਤੁਹਾਡਾ ਭੁਗਤਾਨ ਸਫਲ ਰਿਹਾ ਹੈ।\n\n"
            f"ਰਕਮ: ₹{amount_inr:.2f}\n"
            f"ਪਰਾਲੀ: {stubble_tons:.1f} ਟਨ\n"
            f"ਲੈਣਦੇਨ: {transaction_code}\n\n"
            f"ਧੰਨਵਾਦ!\n\n"
            f"KrishiCred"
        )

        return await self.send_message(
            phone_number=phone_number,
            message=message,
        )

    async def send_daily_summary(
        self,
        phone_number: str,
        plant_name: str,
        date,
        routes_completed: int,
        stubble_collected: float,
        fires_detected: int,
    ) -> dict:
        """Send daily summary to plant operators."""
        date_str = date.strftime("%d %B %Y")

        message = (
            f"📊 ਰੋਜ਼ਾਨਾ ਸਾਰ - KrishiCred\n\n"
            f"ਪਲਾਂਟ: {plant_name}\n"
            f"ਤਾਰੀਖ: {date_str}\n\n"
            f"ਮੁਕੰਮਲ ਰੂਟ: {routes_completed}\n"
            f"ਇਕੱਠੀ ਕੀਤੀ ਪਰਾਲੀ: {stubble_collected:.1f} ਟਨ\n"
            f"ਖੋਜੀਆਂ ਗਈਆਂ ਅੱਗਾਂ: {fires_detected}\n\n"
            f"KrishiCred"
        )

        return await self.send_message(
            phone_number=phone_number,
            message=message,
        )

    async def close(self):
        """Close the HTTP client."""
        await self.client.aclose()
