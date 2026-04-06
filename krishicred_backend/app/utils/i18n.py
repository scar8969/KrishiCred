"""Internationalization and translation utility."""
from typing import Any


class Translator:
    """
    Translation utility for multi-language support.

    Primarily for Punjabi and Hindi messages for farmers.
    """

    # Translation dictionaries
    TRANSLATIONS = {
        "fire_alert_punjabi": {
            "template": (
                "🔥 ਅੱਗ ਚੇਤਾਵਨੀ - KrishiCred\n\n"
                "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ {farmer_name} ਜੀ,\n\n"
                "{location} ਖੇਤਰ ਵਿੱਚ ਅੱਗ ਦੀ ਸੂਚਨਾ ਮਿਲੀ ਹੈ।\n"
                "ਸਮਾਂ: {time}\n"
                "ਤਾਰੀਖ: {date}\n\n"
                "⚠️ ਕਿਰਪਾ ਕਰਕੇ ਫਸਲ ਬਚਾਵ ਨੂੰ ਨਾ ਸਾੜੋ।\n\n"
                "💰 ਇਸ ਦੀ ਬਜਾਏ ਪੈਸਾ ਕਮਾਓ!\n"
                "'ਵੇਚੋ' ਲਿਖੋ ਨੇੜਲੇ ਬਾਇਓਗੈਸ ਪਲਾਂਟਾਂ ਨਾਲ ਜੁੜਨ ਲਈ।\n\n"
                "ਜੇ ਇਹ ਤੁਹਾਡਾ ਖੇਤਰ ਨਹੀਂ ਹੈ ਤਾਂ 'ਠੀਕ' ਲਿਖੋ।\n\n"
                "KrishiCred - ਖੇਤ ਬਚਾਓ, ਕ੍ਰੈਡਿਟ ਕਮਾਓ।"
            ),
        },
        "fire_alert_hindi": {
            "template": (
                "🔥 आग चेतावनी - KrishiCred\n\n"
                "नमस्ते {farmer_name} जी,\n\n"
                "{location} क्षेत्र में आग की सूचना मिली है।\n"
                "समय: {time}\n"
                "तारीख: {date}\n\n"
                "⚠️ कृपया फसल अवशेष न जलाएं।\n\n"
                "💰 इसके बजाय पैसे कमाएं!\n"
                "'बेचना' लिखें नजदीकी बायोगैस संयंत्रों से जुड़ने के लिए।\n\n"
                "यदि यह आपका खेत नहीं है तो 'ठीक' लिखें।\n\n"
                "KrishiCred - खेत बचाएं, क्रेडिट कमाएं।"
            ),
        },
        "fire_alert_english": {
            "template": (
                "🔥 FIRE ALERT - KrishiCred\n\n"
                "Dear {farmer_name},\n\n"
                "A fire has been detected near {location} "
                "at {time} on {date}.\n\n"
                "⚠️ Please DO NOT burn crop residue.\n\n"
                "💰 Instead, sell your stubble to earn money!\n"
                "Reply 'SELL' to connect with nearby biogas plants.\n\n"
                "Reply 'SAFE' if this is not your farm.\n\n"
                "KrishiCred - Saving farms, earning credits."
            ),
        },
        "no_plants_nearby_punjabi": {
            "template": (
                "ਅਫਸੋਸ {farmer_name} ਜੀ,\n\n"
                "ਆਪਣੇ ਖੇਤਰ ਵਿੱਚ ਕੋਈ ਬਾਇਓਗੈਸ ਪਲਾਂਟ ਉਪਲੱਬਧ ਨਹੀਂ ਹੈ।\n\n"
                "ਕਿਰਪਾ ਕਰਕੇ ਬਾਅਦ ਵਿੱਚ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।\n\n"
                "KrishiCred"
            ),
        },
        "no_plants_nearby_hindi": {
            "template": (
                "क्षमा करें {farmer_name} जी,\n\n"
                "आपके क्षेत्र में कोई बायोगैस संयंत्र उपलब्ध नहीं है।\n\n"
                "कृपया बाद में पुनः प्रयास करें।\n\n"
                "KrishiCred"
            ),
        },
        "collection_reminder_punjabi": {
            "template": (
                "🌾 ਪਰਾਲੀ ਇਕੱਠਾ ਕਰਨ ਦੀ ਯਾਦ - KrishiCred\n\n"
                "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ {farmer_name} ਜੀ,\n\n"
                "ਤੁਹਾਡੀ ਪਰਾਲੀ ਇਕੱਠਾ ਕਰਨ ਵਾਲੀ ਗੱਡੀ:\n"
                "ਤਾਰੀਖ: {date}\n"
                "ਸਮਾਂ: {time}\n"
                "ਮਾਤਰਾ: {quantity} ਟਨ\n\n"
                "ਕਿਰਪਾ ਕਰਕੇ ਖੇਤਰ 'ਤੇ ਮੌਜੂਦ ਰਹੋ।\n\n"
                "KrishiCred"
            ),
        },
        "payment_confirmation_punjabi": {
            "template": (
                "💰 ਭੁਗਤਾਨ ਦੀ ਪੁਸ਼ਟੀ - KrishiCred\n\n"
                "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ {farmer_name} ਜੀ,\n\n"
                "ਤੁਹਾਡਾ ਭੁਗਤਾਨ ਸਫਲ ਰਿਹਾ ਹੈ।\n\n"
                "ਰਕਮ: ₹{amount}\n"
                "ਪਰਾਲੀ: {stubble} ਟਨ\n"
                "ਲੈਣਦੇਨ: {transaction}\n\n"
                "ਧੰਨਵਾਦ!\n\n"
                "KrishiCred"
            ),
        },
    }

    def translate(
        self,
        key: str,
        params: dict[str, Any],
        language: str = "en",
    ) -> str:
        """
        Translate a message template.

        Args:
            key: Translation key
            params: Parameters to substitute
            language: Target language (pa, hi, en)

        Returns:
            Translated message
        """
        # Get translation key with language suffix
        lookup_key = f"{key}_{language}" if language != "en" else f"{key}_english"

        if lookup_key not in self.TRANSLATIONS:
            # Fallback to English
            lookup_key = f"{key}_english"

        template = self.TRANSLATIONS.get(lookup_key, {}).get("template", key)

        # Substitute parameters
        try:
            return template.format(**params)
        except KeyError as e:
            return template  # Return template if params missing

    def get_language_name(self, code: str) -> str:
        """Get full language name from code."""
        names = {
            "pa": "Punjabi",
            "hi": "Hindi",
            "en": "English",
        }
        return names.get(code, "Unknown")


# Convenience function for quick translations
def translate(
    key: str,
    params: dict[str, Any],
    language: str = "en",
) -> str:
    """Quick translation function."""
    translator = Translator()
    return translator.translate(key, params, language)
