# Money Buddy 🐵💰

Your friendly financial companion! A modern banking application with geofencing, locked savings, and AI assistance.

## 🌟 Features

- **Real Money Processing**: Square payment integration for deposits and withdrawals
- **Mapbox Geofencing**: Location-based transfer restrictions
- **Time-Restricted Transfers**: Set expiration times for money transfers
- **Locked Savings Accounts**: Time-locked savings with competitive interest rates
- **AI Assistant**: Gemini-powered banking assistant
- **Modern UI**: Purple/blue gradient theme with glassmorphism effects
- **Mobile Responsive**: Optimized for all devices
- **Bank-Grade Security**: Multi-factor authentication and encryption

## 🚀 Quick Start

### Prerequisites

- Node.js 18.17.0 or higher
- npm or yarn
- PayPal Developer Account
- Mapbox Account
- Google AI API Key
- Supabase Account

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/your-username/money-buddy.git
   cd money-buddy
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   
   Fill in your API keys and configuration:
   \`\`\`env
   # PayPal Payment Processing
   PAYPAL_CLIENT_ID=your_paypal_client_id
   PAYPAL_CLIENT_SECRET=your_paypal_client_secret
   PAYPAL_ENVIRONMENT=sandbox
   NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id
   
   # Mapbox Configuration
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token
   
   # Supabase Database
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # AI Configuration
   GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
   \`\`\`

4. **Set up Supabase database**
   \`\`\`bash
   # Run the SQL scripts in Supabase SQL Editor
   # 1. scripts/supabase-setup.sql
   # 2. scripts/supabase-seed.sql (optional)
   \`\`\`

5. **Start the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 🐳 Docker Deployment

### Quick Docker Setup:
```bash
# Build and run with Docker
docker build -t money-buddy .
docker run -p 3000:3000 --env-file .env.local money-buddy
```

### Docker Compose (Recommended):
```bash
# Start with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## 🖥️ VPS Deployment

### Traditional Server Setup:
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start with PM2
npm install -g pm2
pm2 start npm --name "money-buddy" -- start
pm2 startup
pm2 save
```

## 📱 API Endpoints

- `POST /api/paypal/create-order` - Create PayPal orders
- `POST /api/paypal/capture-order` - Capture PayPal payments
- `POST /api/webhooks/paypal` - PayPal webhook handler
- `POST /api/chat` - AI assistant chat
- `GET /api/health` - Health check endpoint

## 🔧 Configuration

### PayPal Setup
1. Create PayPal Developer account
2. Get sandbox/production credentials
3. Configure webhook endpoints
4. Test with PayPal sandbox accounts

### Mapbox Setup
1. Create Mapbox account
2. Get access token
3. Configure for geofencing features

### Supabase Setup
1. Create Supabase project
2. Run SQL migration scripts
3. Configure Row Level Security
4. Set up environment variables

## 🛡️ Security Features

- **PCI DSS Compliance**: PayPal payment processing
- **Data Encryption**: All sensitive data encrypted
- **Secure Headers**: HSTS, CSP, and security headers
- **Input Validation**: All inputs sanitized and validated
- **Rate Limiting**: API endpoints protected
- **HTTPS Only**: SSL/TLS encryption required

## 🎨 Design System

- **Colors**: Purple/blue gradient with lime green accents
- **Typography**: Modern, readable fonts with proper contrast
- **Components**: Reusable shadcn/ui components
- **Responsive**: Mobile-first design approach
- **Accessibility**: WCAG 2.1 AA compliant

## 📊 Monitoring

- **Error Tracking**: Built-in error handling
- **Performance**: Optimized for Core Web Vitals
- **Analytics**: User interaction tracking
- **Logging**: Comprehensive application logs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` folder
- **Issues**: Create a GitHub issue
- **Email**: support@money-buddy.com
- **Discord**: Join our community server

## 🙏 Acknowledgments

- **PayPal**: Payment processing platform
- **Mapbox**: Mapping and geofencing services
- **Google AI**: Gemini AI assistant
- **shadcn/ui**: UI component library
- **Supabase**: Database and authentication

---

Made with ❤️ by the Money Buddy team 🐵

© 2025 Jefferson Nale. All rights reserved.  
Money Buddy™ and Geo Bank™ are trademarks of Jefferson Nale.  
Unauthorized reproduction, distribution, or use of this software or its components is strictly prohibited.