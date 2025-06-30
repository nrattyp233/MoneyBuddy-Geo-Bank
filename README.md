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
- Square Developer Account
- Mapbox Account
- Google AI API Key
- Database (PostgreSQL/Neon)

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
   # Square Payment Processing
   SQUARE_ACCESS_TOKEN=your_square_access_token
   SQUARE_APPLICATION_ID=your_square_application_id
   SQUARE_ENVIRONMENT=sandbox
   
   # Mapbox Configuration
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token
   
   # Database
   DATABASE_URL=your_database_url
   
   # AI Configuration
   GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
   \`\`\`

4. **Set up the database**
   \`\`\`bash
   # Run the SQL scripts in the scripts/ folder
   npm run db:setup
   \`\`\`

5. **Start the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 🏗️ Production Deployment

### Deploy to Vercel

1. **Install Vercel CLI**
   \`\`\`bash
   npm i -g vercel
   \`\`\`

2. **Deploy**
   \`\`\`bash
   vercel --prod
   \`\`\`

3. **Set environment variables in Vercel dashboard**
   - Go to your project settings
   - Add all production environment variables
   - Redeploy

### Environment Variables for Production

\`\`\`env
# Production Square API
SQUARE_ACCESS_TOKEN=your_production_token
SQUARE_APPLICATION_ID=your_production_app_id
SQUARE_ENVIRONMENT=production

# Production Database
DATABASE_URL=your_production_database_url

# Other production variables...
\`\`\`

## 📱 API Endpoints

- `POST /api/square/deposit` - Process deposits
- `POST /api/square/withdraw` - Process withdrawals
- `POST /api/chat` - AI assistant chat
- `GET /api/transactions` - Get transaction history
- `POST /api/transfer` - Create transfers
- `POST /api/savings/lock` - Lock savings accounts

## 🔧 Configuration

### Square Setup
1. Create Square Developer account
2. Get sandbox/production credentials
3. Configure webhook endpoints
4. Test with provided test card numbers

### Mapbox Setup
1. Create Mapbox account
2. Get access token
3. Configure for geofencing features

### Database Setup
1. Run migration scripts
2. Seed initial data
3. Configure connection pooling

## 🛡️ Security Features

- **PCI DSS Compliance**: Square payment processing
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

- **Square**: Payment processing platform
- **Mapbox**: Mapping and geofencing services
- **Google AI**: Gemini AI assistant
- **Vercel**: Hosting and deployment
- **shadcn/ui**: UI component library

---

Made with ❤️ by the Money Buddy team 🐵
