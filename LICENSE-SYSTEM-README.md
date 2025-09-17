# 🔐 Theme License Protection System

A complete license protection solution for Shopify themes that prevents unauthorized usage and reselling.

## 🚀 Features

- **Domain Locking**: Each license works on only one .myshopify.com domain
- **Secure Activation**: License activation through Shopify App Bridge
- **Metafield Storage**: Activation status stored in Shopify metafields
- **Real-time Validation**: Theme checks license status dynamically
- **Admin Dashboard**: Complete license management interface
- **Anti-tampering**: Multiple layers of protection against bypassing

## 📋 System Components

### 1. Shopify App (License Management)
- License generation and management
- Domain-based activation system
- Real-time validation API
- Admin dashboard for tracking

### 2. Theme Protection (Client-side)
- License status checking
- Full-screen activation notice
- Periodic license validation
- Developer tools protection

### 3. Database Schema
- `License`: Master license records
- `LicenseActivation`: Domain-specific activations

## 🛠️ Setup Instructions

### Step 1: App Installation & Configuration

1. **Update App Scopes** (Already done ✅)
   ```toml
   scopes = "write_products,read_themes,write_themes"
   ```

2. **Run Database Migration**
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

3. **Deploy Your App**
   ```bash
   npm run deploy
   ```

### Step 2: Theme Integration

1. **Add License Check to Theme**
   - Copy content from `theme-license-check.liquid`
   - Paste into your theme's `layout/theme.liquid` after `<body>` tag
   - Or create a snippet and include it

2. **Follow Integration Guide**
   - See `theme-integration-guide.md` for detailed instructions
   - Test activation flow thoroughly

### Step 3: License Generation & Distribution

1. **Generate Licenses**
   - Use the "License Management" section in your Shopify app
   - Generate licenses in batches
   - Export license keys for distribution

2. **Customer Workflow**
   - Customer receives: Theme ZIP + License Key + PDF Guide
   - Customer uploads theme → sees activation notice
   - Customer installs your Shopify app
   - Customer enters license key + domain in app
   - Theme unlocks automatically

## 🔧 API Endpoints

### License Validation
```
GET /api/license/validate?license=KEY&domain=DOMAIN
```
Response:
```json
{
  "success": true,
  "activated": true,
  "domain": "shop.myshopify.com",
  "activatedAt": "2025-09-17T15:00:00Z"
}
```

### License Activation
```
POST /api/license/activate
FormData: licenseKey, domain, themeId (optional)
```
Response:
```json
{
  "success": true,
  "message": "License activated successfully",
  "activation": {
    "licenseKey": "TL-ABC123-XYZ789",
    "domain": "shop.myshopify.com",
    "activatedAt": "2025-09-17T15:00:00Z"
  }
}
```

### License Creation
```
POST /api/license/create
FormData: count (number of licenses to generate)
```

## 🎯 Usage Workflow

### For Theme Sellers:
1. Generate license keys in batches
2. Package theme with license key and instructions
3. Customer activates through your app
4. Monitor activations in dashboard

### For Theme Buyers:
1. Upload theme → sees activation notice
2. Install license management app
3. Enter license key + shop domain
4. Theme unlocks immediately

## 🛡️ Security Features

### Theme-Side Protection:
- Full-screen overlay when not activated
- Right-click and dev tools disabled
- Periodic license status checks
- Fallback protection for no-JS scenarios

### Server-Side Security:
- Domain validation and locking
- Secure license key generation
- Database-backed validation
- Metafield-based status storage

## 📊 Admin Dashboard Features

- **License Generation**: Create licenses in batches
- **Activation Management**: View all active licenses
- **Domain Tracking**: See which domains use which licenses
- **Real-time Status**: Monitor activation status
- **Search & Filter**: Find specific licenses or domains

## 🔍 Testing Checklist

- [ ] Generate test license keys
- [ ] Upload theme without activation
- [ ] Verify activation notice appears
- [ ] Test license activation flow
- [ ] Confirm theme unlocks after activation
- [ ] Test on different browsers/devices
- [ ] Verify domain locking works
- [ ] Test license validation API

## 🚨 Troubleshooting

### Common Issues:

**License notice won't disappear:**
- Check metafields are properly set
- Verify exact domain match
- Clear browser cache

**Activation fails:**
- Verify license key format
- Check domain format (.myshopify.com)
- Ensure app has proper scopes

**Theme not loading:**
- Check Liquid syntax errors
- Verify integration code placement
- Test theme preview URL

## 📈 Customization Options

### Styling:
- Modify inline CSS in license notice
- Customize colors, fonts, layout
- Add your branding

### Messages:
- Update activation instructions
- Change support contact info
- Customize error messages

### Behavior:
- Adjust check frequency (default: 30s)
- Modify protection level
- Add custom validation logic

## 🔒 License Key Format

```
TL-[8 HEX CHARS]-[TIMESTAMP BASE36]
Example: TL-A1B2C3D4-1K2L3M4N
```

## 📞 Support

For technical support:
1. Check this documentation first
2. Review theme integration guide
3. Test API endpoints manually
4. Contact with: shop domain, license key, error details

---

## 🎉 System Status: ✅ READY TO USE

Your license protection system is now fully implemented and ready for production use!

### Next Steps:
1. Deploy your Shopify app
2. Test the complete activation flow
3. Integrate protection code into your themes
4. Start generating and distributing licenses

**Happy selling! 🚀**
