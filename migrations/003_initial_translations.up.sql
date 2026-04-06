-- ============================================================================
-- KrishiCred - Initial Translations (Punjabi & English)
-- ============================================================================

-- English translations (default)
INSERT INTO translations (locale, key, value, context) VALUES
('en', 'app.name', 'KrishiCred', 'Application name'),
('en', 'app.tagline', 'Sustainable Farming, Carbon Credits', 'Application tagline'),
('en', 'nav.dashboard', 'Dashboard', 'Navigation'),
('en', 'nav.farmers', 'Farmers', 'Navigation'),
('en', 'nav.farms', 'Farms', 'Navigation'),
('en', 'nav.plants', 'Biogas Plants', 'Navigation'),
('en', 'nav.fire_events', 'Fire Events', 'Navigation'),
('en', 'nav.carbon_credits', 'Carbon Credits', 'Navigation'),
('en', 'nav.transactions', 'Transactions', 'Navigation'),
('en', 'nav.reports', 'Reports', 'Navigation'),
('en', 'nav.settings', 'Settings', 'Navigation'),
('en', 'login.title', 'Login to KrishiCred', 'Authentication'),
('en', 'login.username', 'Username', 'Authentication'),
('en', 'login.password', 'Password', 'Authentication'),
('en', 'login.remember_me', 'Remember Me', 'Authentication'),
('en', 'login.forgot_password', 'Forgot Password?', 'Authentication'),
('en', 'login.submit', 'Login', 'Authentication'),
('en', 'farmer.list_title', 'Farmers', 'Farmers'),
('en', 'farmer.add', 'Add Farmer', 'Farmers'),
('en', 'farmer.edit', 'Edit Farmer', 'Farmers'),
('en', 'farmer.details', 'Farmer Details', 'Farmers'),
('en', 'farmer.name', 'Name', 'Farmers'),
('en', 'farmer.father_name', 'Father''s Name', 'Farmers'),
('en', 'farmer.phone', 'Phone Number', 'Farmers'),
('en', 'farmer.village', 'Village', 'Farmers'),
('en', 'farmer.land_area', 'Land Area (Hectares)', 'Farmers'),
('en', 'farmer.verification_status', 'Verification Status', 'Farmers'),
('en', 'farmer.status.pending', 'Pending', 'Farmers'),
('en', 'farmer.status.verified', 'Verified', 'Farmers'),
('en', 'farmer.status.rejected', 'Rejected', 'Farmers'),
('en', 'farm.list_title', 'Farms', 'Farms'),
('en', 'farm.add', 'Add Farm', 'Farms'),
('en', 'farm.edit', 'Edit Farm', 'Farms'),
('en', 'farm.khasra_number', 'Khasra Number', 'Farms'),
('en', 'farm.area', 'Area (Hectares)', 'Farms'),
('en', 'farm.location', 'Location', 'Farms'),
('en', 'farm.crop_type', 'Crop Type', 'Farms'),
('en', 'farm.season', 'Season', 'Farms'),
('en', 'farm.season.kharif', 'Kharif', 'Farms'),
('en', 'farm.season.rabi', 'Rabi', 'Farms'),
('en', 'farm.season.zaid', 'Zaid', 'Farms'),
('en', 'farm.crop.wheat', 'Wheat', 'Farms'),
('en', 'farm.crop.rice', 'Rice', 'Farms'),
('en', 'farm.crop.cotton', 'Cotton', 'Farms'),
('en', 'farm.crop.maize', 'Maize', 'Farms'),
('en', 'fire.list_title', 'Fire Detections', 'Fire Events'),
('en', 'fire.nearby_farms', 'Nearby Farms', 'Fire Events'),
('en', 'fire.alert_title', 'Fire Alert', 'Fire Events'),
('en', 'fire.alert_message', 'Fire detected near your farm. Please avoid burning stubble.', 'Fire Events'),
('en', 'fire.confidence.high', 'High', 'Fire Events'),
('en', 'fire.confidence.nominal', 'Nominal', 'Fire Events'),
('en', 'fire.confidence.low', 'Low', 'Fire Events'),
('en', 'carbon.list_title', 'Carbon Credits', 'Carbon Credits'),
('en', 'carbon.total_earned', 'Total Credits Earned', 'Carbon Credits'),
('en', 'carbon.available', 'Available Credits', 'Carbon Credits'),
('en', 'carbon.pending', 'Pending Verification', 'Carbon Credits'),
('en', 'carbon.retired', 'Retired Credits', 'Carbon Credits'),
('en', 'carbon.co2_prevented', 'CO₂ Prevented (Tonnes)', 'Carbon Credits'),
('en', 'carbon.stubble_collected', 'Stubble Collected (Tonnes)', 'Carbon Credits'),
('en', 'transaction.list_title', 'Transactions', 'Transactions'),
('en', 'transaction.type.sale', 'Stubble Sale', 'Transactions'),
('en', 'transaction.type.issuance', 'Credit Issuance', 'Transactions'),
('en', 'transaction.type.transfer', 'Credit Transfer', 'Transactions'),
('en', 'transaction.type.retirement', 'Credit Retirement', 'Transactions'),
('en', 'transaction.type.payment', 'Payment', 'Transactions'),
('en', 'transaction.amount', 'Amount', 'Transactions'),
('en', 'transaction.status', 'Status', 'Transactions'),
('en', 'transaction.date', 'Date', 'Transactions'),
('en', 'plant.list_title', 'Biogas Plants', 'Plants'),
('en', 'plant.capacity', 'Capacity (Tonnes/Day)', 'Plants'),
('en', 'plant.current_storage', 'Current Storage', 'Plants'),
('en', 'plant.status', 'Status', 'Plants'),
('en', 'plant.status.operational', 'Operational', 'Plants'),
('en', 'plant.status.maintenance', 'Under Maintenance', 'Plants'),
('en', 'baler.list_title', 'Balers', 'Balers'),
('en', 'baler.status.available', 'Available', 'Balers'),
('en', 'baler.status.in_use', 'In Use', 'Balers'),
('en', 'baler.status.maintenance', 'Maintenance', 'Balers'),
('en', 'notification.mark_read', 'Mark as Read', 'Notifications'),
('en', 'notification.mark_all_read', 'Mark All as Read', 'Notifications'),
('en', 'common.save', 'Save', 'Common'),
('en', 'common.cancel', 'Cancel', 'Common'),
('en', 'common.delete', 'Delete', 'Common'),
('en', 'common.edit', 'Edit', 'Common'),
('en', 'common.add', 'Add', 'Common'),
('en', 'common.search', 'Search', 'Common'),
('en', 'common.filter', 'Filter', 'Common'),
('en', 'common.export', 'Export', 'Common'),
('en', 'common.print', 'Print', 'Common'),
('en', 'common.confirm', 'Confirm', 'Common'),
('en', 'common.yes', 'Yes', 'Common'),
('en', 'common.no', 'No', 'Common'),
('en', 'common.loading', 'Loading...', 'Common'),
('en', 'common.no_data', 'No Data Available', 'Common'),
('en', 'common.total', 'Total', 'Common'),
('en', 'common.from', 'From', 'Common'),
('en', 'common.to', 'To', 'Common'),
('en', 'error.required_field', 'This field is required', 'Errors'),
('en', 'error.invalid_phone', 'Invalid phone number', 'Errors'),
('en', 'error.invalid_email', 'Invalid email address', 'Errors'),
('en', 'error.network', 'Network error. Please try again.', 'Errors'),
('en', 'error.unauthorized', 'Unauthorized access', 'Errors'),
('en', 'success.save', 'Saved successfully', 'Success'),
('en', 'success.delete', 'Deleted successfully', 'Success'),
('en', 'success.verify', 'Verified successfully', 'Success'),
('en', 'date.today', 'Today', 'Date'),
('en', 'date.yesterday', 'Yesterday', 'Date'),
('en', 'date.this_week', 'This Week', 'Date'),
('en', 'date.this_month', 'This Month', 'Date'),
('en', 'date.this_year', 'This Year', 'Date'),
('en', 'unit.hectare', 'Hectare', 'Units'),
('en', 'unit.tonne', 'Tonne', 'Units'),
('en', 'unit.kg', 'Kilogram', 'Units'),
('en', 'unit.km', 'Kilometer', 'Units'),
('en', 'unit.credit', 'Credit', 'Units'),
('en', 'unit.inr', '₹', 'Currency'),
('en', 'report.farm_summary', 'Farm Summary', 'Reports'),
('en', 'report.fire_statistics', 'Fire Statistics', 'Reports'),
('en', 'report.carbon_summary', 'Carbon Credit Summary', 'Reports'),
('en', 'report.stubble_collection', 'Stubble Collection Report', 'Reports')
ON CONFLICT (locale, key) DO NOTHING;

-- Punjabi translations
INSERT INTO translations (locale, key, value, context) VALUES
('pa', 'app.name', 'ਕ੍ਰਿਸ਼ੀ ਕ੍ਰੈਡਿਟ', 'Application name'),
('pa', 'app.tagline', 'ਟਿਕਾਊ ਖੇਤੀ, ਕਾਰਬਨ ਕ੍ਰੈਡਿਟ', 'Application tagline'),
('pa', 'nav.dashboard', 'ਡੈਸ਼ਬੋਰਡ', 'Navigation'),
('pa', 'nav.farmers', 'ਕਿਸਾਨ', 'Navigation'),
('pa', 'nav.farms', 'ਖੇਤ', 'Navigation'),
('pa', 'nav.plants', 'ਬਾਇਓਗੈਸ ਪਲਾਂਟ', 'Navigation'),
('pa', 'nav.fire_events', 'ਅੱਗ ਦੀਆਂ ਘਟਨਾਵਾਂ', 'Navigation'),
('pa', 'nav.carbon_credits', 'ਕਾਰਬਨ ਕ੍ਰੈਡਿਟ', 'Navigation'),
('pa', 'nav.transactions', 'ਲੈਣ-ਦੇਣ', 'Navigation'),
('pa', 'nav.reports', 'ਰਿਪੋਰਟਾਂ', 'Navigation'),
('pa', 'nav.settings', 'ਸੈਟਿੰਗਾਂ', 'Navigation'),
('pa', 'login.title', 'ਕ੍ਰਿਸ਼ੀ ਕ੍ਰੈਡਿਟ ਵਿੱਚ ਲੌਗਇਨ ਕਰੋ', 'Authentication'),
('pa', 'login.username', 'ਵਰਤੋਂਕਾਰ ਨਾਂ', 'Authentication'),
('pa', 'login.password', 'ਪਾਸਵਰਡ', 'Authentication'),
('pa', 'login.remember_me', 'ਯਾਦ ਰੱਖੋ', 'Authentication'),
('pa', 'login.forgot_password', 'ਪਾਸਵਰਡ ਭੁੱਲ ਗਏ?', 'Authentication'),
('pa', 'login.submit', 'ਲੌਗਇਨ', 'Authentication'),
('pa', 'farmer.list_title', 'ਕਿਸਾਨ', 'Farmers'),
('pa', 'farmer.add', 'ਕਿਸਾਨ ਜੋੜੋ', 'Farmers'),
('pa', 'farmer.edit', 'ਕਿਸਾਨ ਸੋਧੋ', 'Farmers'),
('pa', 'farmer.details', 'ਕਿਸਾਨ ਦੀਆਂ ਵੇਰਵਾ', 'Farmers'),
('pa', 'farmer.name', 'ਨਾਂ', 'Farmers'),
('pa', 'farmer.father_name', 'ਪਿਤਾ ਦਾ ਨਾਂ', 'Farmers'),
('pa', 'farmer.phone', 'ਫੋਨ ਨੰਬਰ', 'Farmers'),
('pa', 'farmer.village', 'ਪਿੰਡ', 'Farmers'),
('pa', 'farmer.land_area', 'ਜ਼ਮੀਨੀ ਖੇਤਰ (ਹੈਕਟੇਅਰ)', 'Farmers'),
('pa', 'farmer.verification_status', 'ਪੁਸ਼ਟੀ ਦੀ ਸਥਿਤੀ', 'Farmers'),
('pa', 'farmer.status.pending', 'ਬਾਕੀ', 'Farmers'),
('pa', 'farmer.status.verified', 'ਪੁਸ਼ਟੀ ਕੀਤੀ', 'Farmers'),
('pa', 'farmer.status.rejected', 'ਰੱਦ ਕੀਤੀ', 'Farmers'),
('pa', 'farm.list_title', 'ਖੇਤ', 'Farms'),
('pa', 'farm.add', 'ਖੇਤ ਜੋੜੋ', 'Farms'),
('pa', 'farm.edit', 'ਖੇਤ ਸੋਧੋ', 'Farms'),
('pa', 'farm.khasra_number', 'ਖਸਰਾ ਨੰਬਰ', 'Farms'),
('pa', 'farm.area', 'ਖੇਤਰ (ਹੈਕਟੇਅਰ)', 'Farms'),
('pa', 'farm.location', 'ਟਿਕਾਣਾ', 'Farms'),
('pa', 'farm.crop_type', 'ਫ਼ਸਲ ਦੀ ਕਿਸਮ', 'Farms'),
('pa', 'farm.season', 'ਮੌਸਮ', 'Farms'),
('pa', 'farm.season.kharif', 'ਖਰੀਫ', 'Farms'),
('pa', 'farm.season.rabi', 'ਰਬੀ', 'Farms'),
('pa', 'farm.season.zaid', 'ਜ਼ੈਦ', 'Farms'),
('pa', 'farm.crop.wheat', 'ਕਣਕ', 'Farms'),
('pa', 'farm.crop.rice', 'ਝੋਨਾ', 'Farms'),
('pa', 'farm.crop.cotton', 'ਕਪਾਹ', 'Farms'),
('pa', 'farm.crop.maize', 'ਮੱਕੀ', 'Farms'),
('pa', 'fire.list_title', 'ਅੱਗ ਦੀਆਂ ਘਟਨਾਵਾਂ', 'Fire Events'),
('pa', 'fire.nearby_farms', 'ਨੇੜਲੇ ਖੇਤ', 'Fire Events'),
('pa', 'fire.alert_title', 'ਅੱਗ ਚੇਤਾਵਨੀ', 'Fire Events'),
('pa', 'fire.alert_message', 'ਤੁਹਾਡੇ ਖੇਤ ਦੇ ਨੇੜੇ ਅੱਗ ਦਾ ਪਤਾ ਲੱਗਾ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਪਰਾਲੀ ਤੋਂ ਬਚੋ।', 'Fire Events'),
('pa', 'fire.confidence.high', 'ਉੱਚ', 'Fire Events'),
('pa', 'fire.confidence.nominal', 'ਸਧਾਰਨ', 'Fire Events'),
('pa', 'fire.confidence.low', 'ਘੱਟ', 'Fire Events'),
('pa', 'carbon.list_title', 'ਕਾਰਬਨ ਕ੍ਰੈਡਿਟ', 'Carbon Credits'),
('pa', 'carbon.total_earned', 'ਕੁੱਲ ਕ੍ਰੈਡਿਟ ਪ੍ਰਾਪਤ', 'Carbon Credits'),
('pa', 'carbon.available', 'ਉਪਲਬਧ ਕ੍ਰੈਡਿਟ', 'Carbon Credits'),
('pa', 'carbon.pending', 'ਪੁਸ਼ਟੀ ਬਾਕੀ', 'Carbon Credits'),
('pa', 'carbon.retired', 'ਰਿਟਾਇਰ ਕੀਤੇ ਕ੍ਰੈਡਿਟ', 'Carbon Credits'),
('pa', 'carbon.co2_prevented', 'ਰੋਕਿਆ CO₂ (ਟਨ)', 'Carbon Credits'),
('pa', 'carbon.stubble_collected', 'ਇਕੱਠਾ ਕੀਤਾ ਪਰਾਲੀ (ਟਨ)', 'Carbon Credits'),
('pa', 'transaction.list_title', 'ਲੈਣ-ਦੇਣ', 'Transactions'),
('pa', 'transaction.type.sale', 'ਪਰਾਲੀ ਵਿਕਰੀ', 'Transactions'),
('pa', 'transaction.type.issuance', 'ਕ੍ਰੈਡਿਟ ਜਾਰੀ', 'Transactions'),
('pa', 'transaction.type.transfer', 'ਕ੍ਰੈਡਿਟ ਟ੍ਰਾਂਸਫਰ', 'Transactions'),
('pa', 'transaction.type.retirement', 'ਕ੍ਰੈਡਿਟ ਰਿਟਾਇਰਮੈਂਟ', 'Transactions'),
('pa', 'transaction.type.payment', 'ਭੁਗਤਾਨ', 'Transactions'),
('pa', 'transaction.amount', 'ਰਕਮ', 'Transactions'),
('pa', 'transaction.status', 'ਸਥਿਤੀ', 'Transactions'),
('pa', 'transaction.date', 'ਮਿਤੀ', 'Transactions'),
('pa', 'plant.list_title', 'ਬਾਇਓਗੈਸ ਪਲਾਂਟ', 'Plants'),
('pa', 'plant.capacity', 'ਸਮਰੱਥਾ (ਟਨ/ਦਿਨ)', 'Plants'),
('pa', 'plant.current_storage', 'ਮੌਜੂਦਾ ਸਟੋਰੇਜ', 'Plants'),
('pa', 'plant.status', 'ਸਥਿਤੀ', 'Plants'),
('pa', 'plant.status.operational', 'ਕਾਰਜਸ਼ੀਲ', 'Plants'),
('pa', 'plant.status.maintenance', 'ਮੁਰੰਮਤ ਅਧੀਨ', 'Plants'),
('pa', 'baler.list_title', 'ਬੇਲਰ', 'Balers'),
('pa', 'baler.status.available', 'ਉਪਲਬਧ', 'Balers'),
('pa', 'baler.status.in_use', 'ਵਰਤੋਂ ਵਿੱਚ', 'Balers'),
('pa', 'baler.status.maintenance', 'ਮੁਰੰਮਤ', 'Balers'),
('pa', 'notification.mark_read', 'ਪੜ੍ਹਿਆ ਵਜੋਂ ਚਿੰਨ੍ਹਿਤ', 'Notifications'),
('pa', 'notification.mark_all_read', 'ਸਭ ਨੂੰ ਪੜ੍ਹਿਆ ਵਜੋਂ ਚਿੰਨ੍ਹਿਤ', 'Notifications'),
('pa', 'common.save', 'ਸੇਵ ਕਰੋ', 'Common'),
('pa', 'common.cancel', 'ਰੱਦ ਕਰੋ', 'Common'),
('pa', 'common.delete', 'ਹਟਾਓ', 'Common'),
('pa', 'common.edit', 'ਸੋਧੋ', 'Common'),
('pa', 'common.add', 'ਜੋੜੋ', 'Common'),
('pa', 'common.search', 'ਖੋਜੋ', 'Common'),
('pa', 'common.filter', 'ਫਿਲਟਰ', 'Common'),
('pa', 'common.export', 'ਐਕਸਪੋਰਟ', 'Common'),
('pa', 'common.print', 'ਪਰਿੰਟ', 'Common'),
('pa', 'common.confirm', 'ਪੁਸ਼ਟੀ', 'Common'),
('pa', 'common.yes', 'ਹਾਂ', 'Common'),
('pa', 'common.no', 'ਨਹੀਂ', 'Common'),
('pa', 'common.loading', 'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...', 'Common'),
('pa', 'common.no_data', 'ਕੋਈ ਡੇਟਾ ਉਪਲਬਧ ਨਹੀਂ', 'Common'),
('pa', 'common.total', 'ਕੁੱਲ', 'Common'),
('pa', 'common.from', 'ਤੋਂ', 'Common'),
('pa', 'common.to', 'ਤੱਕ', 'Common'),
('pa', 'error.required_field', 'ਇਹ ਖੇਤਰ ਲੋੜੀਂਦਾ ਹੈ', 'Errors'),
('pa', 'error.invalid_phone', 'ਗਲਤ ਫੋਨ ਨੰਬਰ', 'Errors'),
('pa', 'error.invalid_email', 'ਗਲਤ ਈਮੇਲ ਪਤਾ', 'Errors'),
('pa', 'error.network', 'ਨੈੱਟਵਰਕ ਗਲਤੀ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।', 'Errors'),
('pa', 'error.unauthorized', 'ਅਣਅਧਿਕਾਰਤ ਪਹੁੰਚ', 'Errors'),
('pa', 'success.save', 'ਸਫਲਤਾਪੂਰਵਕ ਸੇਵ ਕੀਤਾ ਗਿਆ', 'Success'),
('pa', 'success.delete', 'ਸਫਲਤਾਪੂਰਵਕ ਹਟਾਇਆ ਗਿਆ', 'Success'),
('pa', 'success.verify', 'ਸਫਲਤਾਪੂਰਵਕ ਪੁਸ਼ਟੀ ਕੀਤੀ ਗਈ', 'Success'),
('pa', 'date.today', 'ਅੱਜ', 'Date'),
('pa', 'date.yesterday', 'ਕੱਲ੍ਹ', 'Date'),
('pa', 'date.this_week', 'ਇਹ ਹਫ਼ਤਾ', 'Date'),
('pa', 'date.this_month', 'ਇਹ ਮਹੀਨਾ', 'Date'),
('pa', 'date.this_year', 'ਇਹ ਸਾਲ', 'Date'),
('pa', 'unit.hectare', 'ਹੈਕਟੇਅਰ', 'Units'),
('pa', 'unit.tonne', 'ਟਨ', 'Units'),
('pa', 'unit.kg', 'ਕਿਲੋਗ੍ਰਾਮ', 'Units'),
('pa', 'unit.km', 'ਕਿਲੋਮੀਟਰ', 'Units'),
('pa', 'unit.credit', 'ਕ੍ਰੈਡਿਟ', 'Units'),
('pa', 'unit.inr', '₹', 'Currency'),
('pa', 'report.farm_summary', 'ਖੇਤ ਸਾਰਾਂਸ਼', 'Reports'),
('pa', 'report.fire_statistics', 'ਅੱਗ ਅੰਕੜੇ', 'Reports'),
('pa', 'report.carbon_summary', 'ਕਾਰਬਨ ਕ੍ਰੈਡਿਟ ਸਾਰਾਂਸ਼', 'Reports'),
('pa', 'report.stubble_collection', 'ਪਰਾਲੀ ਇਕੱਠਾ ਕਰਨ ਦੀ ਰਿਪੋਰਟ', 'Reports')
ON CONFLICT (locale, key) DO NOTHING;

-- Hindi translations (optional, for broader accessibility)
INSERT INTO translations (locale, key, value, context) VALUES
('hi', 'app.name', 'कृषि क्रेडिट', 'Application name'),
('hi', 'app.tagline', 'टिकाऊ खेती, कार्बन क्रेडिट', 'Application tagline'),
('hi', 'nav.dashboard', 'डैशबोर्ड', 'Navigation'),
('hi', 'nav.farmers', 'किसान', 'Navigation'),
('hi', 'nav.farms', 'खेत', 'Navigation'),
('hi', 'nav.plants', 'बायोगैस प्लांट', 'Navigation'),
('hi', 'nav.fire_events', 'आग की घटनाएं', 'Navigation'),
('hi', 'nav.carbon_credits', 'कार्बन क्रेडिट', 'Navigation'),
('hi', 'nav.transactions', 'लेनदेन', 'Navigation'),
('hi', 'nav.reports', 'रिपोर्ट', 'Navigation'),
('hi', 'nav.settings', 'सेटिंग्स', 'Navigation'),
('hi', 'farmer.name', 'नाम', 'Farmers'),
('hi', 'farmer.village', 'गांव', 'Farmers'),
('hi', 'farmer.land_area', 'भूमि क्षेत्र (हेक्टेयर)', 'Farmers'),
('hi', 'fire.alert_title', 'आग की चेतावनी', 'Fire Events'),
('hi', 'fire.alert_message', 'आपके खेत के पास आग का पता चला है। कृपया पराली जलाने से बचें।', 'Fire Events'),
('hi', 'carbon.total_earned', 'कुल क्रेडिट अर्जित', 'Carbon Credits'),
('hi', 'carbon.stubble_collected', 'एकत्रित पराली (टन)', 'Carbon Credits'),
('hi', 'common.save', 'सहेजें', 'Common'),
('hi', 'common.cancel', 'रद्द करें', 'Common'),
('hi', 'common.search', 'खोजें', 'Common'),
('hi', 'error.required_field', 'यह फ़ील्ड आवश्यक है', 'Errors'),
('hi', 'success.save', 'सफलतापूर्वक सहेजा गया', 'Success')
ON CONFLICT (locale, key) DO NOTHING;

-- Create index for faster translation lookups
CREATE INDEX IF NOT EXISTS idx_translations_locale_key ON translations(locale, key);
CREATE INDEX IF NOT EXISTS idx_translations_locale ON translations(locale);
CREATE INDEX IF NOT EXISTS idx_translations_key ON translations(key);

-- ============================================================================
-- TRANSLATION HELPER FUNCTIONS
-- ============================================================================

-- Function to get translation for a key in a specific locale
CREATE OR REPLACE FUNCTION get_translation(
    p_key TEXT,
    p_locale TEXT DEFAULT 'en'
)
RETURNS TEXT AS $$
DECLARE
    result TEXT;
BEGIN
    SELECT value INTO result
    FROM translations
    WHERE key = p_key AND locale = p_locale
    LIMIT 1;

    IF result IS NULL THEN
        -- Fallback to English if translation not found
        SELECT value INTO result
        FROM translations
        WHERE key = p_key AND locale = 'en'
        LIMIT 1;
    END IF;

    RETURN COALESCE(result, p_key);
END;
$$ LANGUAGE plpgsql;

-- Function to get multiple translations at once
CREATE OR REPLACE FUNCTION get_translations(
    p_keys TEXT[],
    p_locale TEXT DEFAULT 'en'
)
RETURNS TABLE(key TEXT, value TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT
        t.key,
        COALESCE(t.value, f.value, t.key) AS value
    FROM unnest(p_keys) AS k(key)
    LEFT JOIN translations t ON t.key = k.key AND t.locale = p_locale
    LEFT JOIN translations f ON f.key = k.key AND f.locale = 'en';
END;
$$ LANGUAGE plpgsql;

-- Function to add or update translation
CREATE OR REPLACE FUNCTION upsert_translation(
    p_locale TEXT,
    p_key TEXT,
    p_value TEXT,
    p_context TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    result UUID;
BEGIN
    INSERT INTO translations (locale, key, value, context)
    VALUES (p_locale, p_key, p_value, p_context)
    ON CONFLICT (locale, key)
    DO UPDATE SET
        value = EXCLUDED.value,
        context = COALESCE(EXCLUDED.context, translations.context),
        updated_at = NOW()
    RETURNING id INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_translation(TEXT, TEXT) IS 'Get a translation for a key in the specified locale with English fallback';
COMMENT ON FUNCTION get_translations(TEXT[], TEXT) IS 'Get multiple translations in a single query';
COMMENT ON FUNCTION upsert_translation(TEXT, TEXT, TEXT, TEXT) IS 'Insert or update a translation';
