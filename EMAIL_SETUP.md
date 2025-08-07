# 📧 Email Notifications Setup Guide

This guide will help you set up email notifications for SmartFlow AI. The system supports various types of email notifications including task assignments, deadline reminders, admin messages, and project updates.

## 🚀 Quick Setup

### 1. Install Dependencies

First, install the required email packages:

```bash
cd server
npm install nodemailer handlebars
```

### 2. Environment Variables

Create a `.env` file in the server directory with your email configuration:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@smartflowai.com
FROM_NAME=SmartFlow AI
FRONTEND_URL=http://localhost:3000

# JWT Secret (if not already set)
JWT_SECRET=your-secret-key
```

### 3. Gmail Setup (Recommended)

#### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Enable 2-Factor Authentication
3. Generate an App Password for SmartFlow AI

#### Step 2: Generate App Password
1. Go to Google Account → Security
2. Under "2-Step Verification", click "App passwords"
3. Generate a new app password for "Mail"
4. Use this password as your `SMTP_PASS`

### 4. Alternative Email Providers

#### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

#### Yahoo Mail
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

#### Custom SMTP Server
```env
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_USER=your-username
SMTP_PASS=your-password
```

## 📧 Email Notification Types

### 1. Task Assignment Emails
- **Trigger**: When a task is assigned to a user
- **Content**: Task details, project info, priority, deadline
- **Template**: Professional task assignment template

### 2. Deadline Reminder Emails
- **Trigger**: When a task deadline is approaching
- **Content**: Task details, time remaining, urgency level
- **Template**: Urgent reminder template with countdown

### 3. Admin Message Emails
- **Trigger**: When admin sends a broadcast message
- **Content**: Admin message, sender info, action buttons
- **Template**: Admin communication template

### 4. Project Update Emails
- **Trigger**: When project status or progress changes
- **Content**: Project details, progress bars, team updates
- **Template**: Project update template with progress visualization

### 5. Welcome Emails
- **Trigger**: When a new user is created
- **Content**: Welcome message, platform features, login info
- **Template**: Welcome onboarding template

## 🎨 Email Templates

The system includes beautiful, responsive HTML email templates:

### Features:
- **Responsive Design**: Works on all devices
- **Branded Templates**: SmartFlow AI branding
- **Color-coded Priority**: Visual priority indicators
- **Action Buttons**: Direct links to tasks/projects
- **Progress Bars**: Visual progress indicators
- **Professional Styling**: Modern, clean design

### Template Customization:
Edit templates in `server/services/emailService.js`:

```javascript
const emailTemplates = {
  taskAssignment: `
    <!DOCTYPE html>
    <html>
    <!-- Your custom template here -->
    </html>
  `,
  // ... other templates
};
```

## 🔧 Configuration Options

### Email Settings
Users can configure their email notification preferences:

- ✅ **Email Notifications**: Master toggle
- ✅ **Task Assignments**: New task notifications
- ✅ **Deadline Reminders**: Due date alerts
- ✅ **Admin Messages**: Broadcast notifications
- ✅ **Project Updates**: Project change notifications

### Admin Controls
Admins can:
- Send test emails
- Test email connection
- Configure system-wide settings
- Send bulk notifications

## 🧪 Testing Email Setup

### 1. Test Connection
```bash
# Test email service connection
curl -X GET http://localhost:5000/api/notifications/test-connection \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. Send Test Email
```bash
# Send test admin message
curl -X POST http://localhost:5000/api/notifications/admin-message \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Email",
    "content": "This is a test email to verify your setup.",
    "userIds": [1]
  }'
```

### 3. Frontend Testing
Use the Email Notification Settings component to:
- Test email connection
- Send test emails
- Configure notification preferences

## 🚀 Production Deployment

### 1. Vercel Environment Variables
Add these to your Vercel project:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-production-email@gmail.com
SMTP_PASS=your-production-app-password
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=SmartFlow AI
FRONTEND_URL=https://your-app.vercel.app
```

### 2. Email Service Providers
For production, consider using:
- **SendGrid**: Professional email delivery
- **Mailgun**: Reliable email service
- **Amazon SES**: Cost-effective solution
- **Postmark**: Transactional email specialist

### 3. SendGrid Setup Example
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=SmartFlow AI
```

## 🔒 Security Considerations

### 1. Email Security
- Use App Passwords instead of regular passwords
- Enable 2-Factor Authentication
- Use environment variables for sensitive data
- Regularly rotate API keys

### 2. Rate Limiting
Implement rate limiting to prevent abuse:

```javascript
// Add to server/index.js
const rateLimit = require('express-rate-limit');

const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many email requests, please try again later.'
});

app.use('/api/notifications', emailLimiter);
```

### 3. Email Validation
Always validate email addresses:

```javascript
const { body } = require('express-validator');

router.post('/send-email', [
  body('email').isEmail().withMessage('Valid email is required'),
  // ... other validations
], async (req, res) => {
  // ... handler
});
```

## 📊 Monitoring & Analytics

### 1. Email Delivery Tracking
Monitor email delivery rates:

```javascript
// Add to emailService.js
const emailStats = {
  sent: 0,
  delivered: 0,
  failed: 0,
  lastSent: null
};

// Track email statistics
async sendEmail(to, subject, templateName, data) {
  try {
    const result = await this.transporter.sendMail(mailOptions);
    emailStats.sent++;
    emailStats.lastSent = new Date();
    console.log('Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    emailStats.failed++;
    console.error('Email sending failed:', error);
    throw error;
  }
}
```

### 2. Error Logging
Implement comprehensive error logging:

```javascript
// Add to emailService.js
const logEmailError = (error, context) => {
  console.error('Email Error:', {
    timestamp: new Date().toISOString(),
    error: error.message,
    context,
    stack: error.stack
  });
};
```

## 🎯 Best Practices

### 1. Email Content
- Keep subject lines clear and concise
- Use action-oriented language
- Include relevant links and buttons
- Test emails across different clients

### 2. Timing
- Send task assignments immediately
- Send deadline reminders 1-3 days before due date
- Send project updates on significant changes
- Avoid sending emails during off-hours

### 3. Personalization
- Use recipient's name
- Include relevant project/task context
- Provide direct action links
- Show progress and status information

## 🐛 Troubleshooting

### Common Issues:

#### 1. "Authentication failed"
- Check your SMTP credentials
- Verify 2-Factor Authentication is enabled
- Generate a new App Password

#### 2. "Connection timeout"
- Check your internet connection
- Verify SMTP host and port
- Check firewall settings

#### 3. "Email not received"
- Check spam/junk folder
- Verify recipient email address
- Check email service status

#### 4. "Template rendering error"
- Check template syntax
- Verify template variables
- Test template compilation

### Debug Mode:
Enable debug logging:

```javascript
// Add to emailService.js
const transporter = nodemailer.createTransporter({
  ...emailConfig,
  debug: true, // Enable debug output
  logger: true // Log to console
});
```

## 📚 API Reference

### Email Notification Endpoints:

#### POST `/api/notifications/task-assignment`
Send task assignment email
```json
{
  "taskId": 1,
  "userId": 2
}
```

#### POST `/api/notifications/deadline-reminder`
Send deadline reminder email
```json
{
  "taskId": 1
}
```

#### POST `/api/notifications/admin-message`
Send admin broadcast message
```json
{
  "title": "Important Update",
  "content": "Please check the latest project updates.",
  "userIds": [1, 2, 3]
}
```

#### POST `/api/notifications/project-update`
Send project update notification
```json
{
  "projectId": 1
}
```

#### GET `/api/notifications/test-connection`
Test email service connection

#### GET `/api/notifications/settings`
Get user notification settings

## 🎉 Success!

Once configured, your SmartFlow AI will automatically send:
- ✅ Task assignment notifications
- ✅ Deadline reminders
- ✅ Admin broadcast messages
- ✅ Project update notifications
- ✅ Welcome emails for new users

The email system is now fully integrated and ready to enhance your team's communication! 🚀 