# Theme License Protection - Integration Guide

## Quick Setup Instructions

### 1. Add License Check to Your Theme

**Step 1:** Open your theme's `layout/theme.liquid` file

**Step 2:** Add this code right after the opening `<body>` tag:

```liquid
{% comment %} Theme License Protection {% endcomment %}
{% include 'license-check' %}
```

**Step 3:** Create a new snippet file `snippets/license-check.liquid` and copy the content from `theme-license-check.liquid`

### 2. Alternative Integration (Direct Method)

If you prefer not to use a snippet, you can directly paste the entire content of `theme-license-check.liquid` into your `layout/theme.liquid` file right after the `<body>` tag.

### 3. CSS Enhancement (Optional but Recommended)

Add this CSS to your theme's main stylesheet to ensure content is hidden when JavaScript is disabled:

```css
/* License protection fallback */
.no-js #theme-license-notice ~ * {
  display: none !important;
}

html.no-js body {
  overflow: hidden;
}
```

And add this to the `<html>` tag in your theme.liquid:
```liquid
<html class="no-js" lang="{{ request.locale.iso_code }}">
```

Then add this script in the `<head>` section:
```liquid
<script>document.documentElement.className = document.documentElement.className.replace('no-js', 'js');</script>
```

## How It Works

1. **Theme Upload**: Customer uploads theme → Shows license activation notice
2. **License Check**: Theme checks for activation status in Shopify metafields
3. **Activation Required**: If not activated, displays full-screen overlay with instructions
4. **License Activation**: Customer uses your Shopify app to activate license
5. **Theme Unlocked**: After activation, theme works normally

## Security Features

- **Domain Locking**: Each license can only be activated on one domain
- **Metafield Storage**: Activation status stored securely in Shopify metafields
- **Periodic Checks**: Theme checks license status every 30 seconds
- **Right-click Protection**: Disables right-click and common developer shortcuts
- **Fallback Protection**: Works even when JavaScript is disabled

## Customization

### Change Support Email
Edit line 95 in the license check code:
```liquid
<a href="mailto:YOUR-EMAIL@domain.com" ...>
```

### Modify Styling
The license notice uses inline styles for maximum compatibility. You can customize:
- Colors and fonts
- Layout and positioning
- Button styles
- Background overlay

### Custom Messages
Edit the text content in the license notice section to match your brand voice.

## Testing

1. Upload theme without activation
2. Verify license notice appears
3. Activate license through your app
4. Confirm notice disappears and theme works
5. Test on different devices and browsers

## Troubleshooting

**License notice won't disappear after activation:**
- Check if metafields are properly set
- Verify domain matches exactly (including .myshopify.com)
- Clear browser cache and refresh

**Theme not loading at all:**
- Check for Liquid syntax errors
- Verify the license check code is properly integrated
- Test with theme preview URL

**Styling issues:**
- Ensure no CSS conflicts with existing theme styles
- Test on different screen sizes
- Check browser compatibility

## Support

For technical support with the license system integration, contact your theme provider with:
- Shop domain
- License key
- Screenshot of any errors
- Browser and device information
