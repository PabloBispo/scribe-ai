# 🤖 Scribe AI - Next.js Component

This is the Next.js-compatible version of the Scribe AI widget that avoids synchronous script issues.

## 🚀 Quick Start

### 1. Import the Component

```jsx
import ScribeAIWidget from '../components/ScribeAIWidget';
```

### 2. Use in Your Page/Component

```jsx
export default function MyPage() {
  return (
    <div>
      <form id="contactForm">
        <input type="text" id="name" name="name" />
        <input type="email" id="email" name="email" />
        <button type="submit">Send</button>
      </form>
      
      <ScribeAIWidget formId="contactForm" />
    </div>
  );
}
```

## ⚙️ Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `formId` | string | - | **Required** - ID of the form to fill |
| `apiUrl` | string | `/api/chat` | URL of the Scribe AI API endpoint |
| `theme` | string | `default` | Theme for the widget (future use) |

## 📋 Complete Example

```jsx
"use client";

import ScribeAIWidget from '../components/ScribeAIWidget';

export default function ContactPage() {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted!');
  };

  return (
    <div className="container">
      <h1>Contact Us</h1>
      
      <form id="contactForm" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Name:</label>
          <input type="text" id="name" name="name" required />
        </div>
        
        <div>
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" name="email" required />
        </div>
        
        <div>
          <label htmlFor="message">Message:</label>
          <textarea id="message" name="message" required></textarea>
        </div>
        
        <button type="submit">Send Message</button>
      </form>
      
      {/* Scribe AI Widget */}
      <ScribeAIWidget 
        formId="contactForm"
        apiUrl="/api/chat"
      />
    </div>
  );
}
```

## 🎯 Features

- ✅ **Next.js Compatible**: Uses "use client" directive
- ✅ **No Synchronous Scripts**: Avoids ESLint warnings
- ✅ **Auto-initialization**: Automatically detects form fields
- ✅ **Progress Tracking**: Shows "X of Y" progress
- ✅ **Form Filling**: Automatically fills form fields
- ✅ **Submit Integration**: Handles form submission
- ✅ **Responsive Design**: Works on all devices
- ✅ **Inline Styles**: No external CSS dependencies

## 🔧 How It Works

1. **Initialization**: Component finds the form by ID and detects fillable fields
2. **Conversation Start**: Automatically starts the conversation with the first field
3. **User Interaction**: Users can chat with the AI assistant
4. **Form Filling**: Responses are automatically filled into form fields
5. **Progress Tracking**: Shows current field and total progress
6. **Completion**: When all fields are filled, shows submit button

## 🎨 Styling

The component uses inline styles to avoid CSS conflicts. To customize:

```jsx
// You can override styles by targeting the classes
<style jsx>{`
  .scribe-ai-widget {
    /* Your custom styles */
  }
  
  .scribe-ai-toggle {
    /* Custom toggle button styles */
  }
`}</style>
```

## 🐛 Troubleshooting

### Widget doesn't appear
- Check if `formId` matches your form's ID
- Ensure form has fields with valid `id` attributes
- Check browser console for errors

### API errors
- Verify `apiUrl` is correct
- Ensure API endpoint is working
- Check network tab for failed requests

### Fields not being filled
- Make sure fields have unique `id` attributes
- Check that fields aren't disabled or readonly
- Verify field types are supported

## 🔄 Migration from Script Version

If you were using the script version:

**Before:**
```html
<script src="scribe-ai.js" data-form-id="myForm"></script>
```

**After:**
```jsx
import ScribeAIWidget from '../components/ScribeAIWidget';

<ScribeAIWidget formId="myForm" />
```

## 📱 Browser Support

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Mobile browsers

## 🤝 Contributing

Feel free to contribute by:
1. Forking the repository
2. Creating a feature branch
3. Making your changes
4. Submitting a pull request

---

**Scribe AI** - Making forms conversational! 🤖✨ 