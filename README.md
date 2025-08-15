# MoneyBuddy Geo-Bank

**MoneyBuddy Geo-Bank** is an innovative **conditional transfer and savings platform** that combines location-based payment constraints with time-locked savings accounts. Built with Next.js and powered by Stripe, it offers a unique twist on peer-to-peer payments and savings management.

## 🎯 Core Features

### 🌍 Conditional Geo-Time Transfers
- **Location-based fund release**: Recipients must be within a geofence to claim funds
- **Time windows**: Transfers expire if conditions aren't met within specified time
- **Automatic refunds**: Failed conditions return money to sender
- **Real-time GPS tracking**: Precise location verification with user consent

### 🔒 Time-Locked Savings Accounts  
- **Fixed-term deposits**: 3, 6, 9, 12-month lock periods
- **Progressive interest rates**: Higher rates for longer commitments (2.5% - 4.0% APY)
- **Early withdrawal penalties**: Discourage breaking savings commitments
- **Compound interest**: Earn on locked principal over time

### 🗺️ Interactive Mapping
- **Geofence drawing**: Create circular boundaries on interactive maps
- **Address search**: Find locations by name or address
- **Radius control**: Adjustable geofence size (50m - 1km)
- **Real-time location**: GPS-based position tracking

## 🏗️ Architecture

### Frontend (Next.js 14)
- **React components** with TypeScript
- **Tailwind CSS** for styling
- **Shadcn/ui** component library
- **Leaflet/Mapbox** for interactive maps

### Backend (API Routes)
- **Stripe integration** for payment processing
- **Supabase** for database and authentication
- **Geolocation APIs** for location services
- **Real-time webhooks** for status updates

### Database (PostgreSQL)
- **User management** and authentication
- **Transfer tracking** with geofence data
- **Savings accounts** with lock periods
- **Location logs** for compliance

## � Business Model

### Legal Framework
- **Payment facilitator**: Not a bank, just processing conditional transfers
- **Personal Stripe account**: Avoiding banking license requirements
- **Clear disclaimers**: Users understand fund custody arrangements
- **Location consent**: Explicit permission for GPS tracking

### Revenue Streams
- **Transfer fees**: 2.9% + $0.30 per conditional transfer
- **Processing fees**: $1 for failed/expired transfers
- **Savings management**: 0.5% annual fee on locked accounts
- **Early withdrawal penalties**: 1-2.5% of withdrawn amount

## 🛡️ Compliance & Privacy

- **Not FDIC insured**: Funds held in service provider's Stripe account
- **Location privacy**: GPS data used only for transfer verification
- **Terms of service**: Clear liability limitations
- **State compliance**: Adheres to money transmitter regulations

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and pnpm
- Stripe account for payments
- Supabase project for database
- Mapbox account for maps

### Installation
```bash
git clone https://github.com/nrattyp233/MoneyBuddy-Geo-Bank
cd MoneyBuddy-Geo-Bank
pnpm install
```

### Environment Setup
```bash
cp .env.example .env.local
# Add your API keys for Stripe, Supabase, and Mapbox
```

### Run Development
```bash
pnpm dev
```

## � Key User Flows

### Conditional Transfer
1. **Set conditions**: Choose location and time window
2. **Add recipient**: Enter email and amount
3. **Draw geofence**: Select area on map with radius
4. **Funds held**: Payment authorized but not captured
5. **Location check**: Recipient visits location within time limit
6. **Auto release**: Funds transferred when conditions met
7. **Auto refund**: Money returned if conditions fail

### Locked Savings
1. **Choose amount**: Minimum $100 deposit
2. **Select duration**: 3-12 month lock periods
3. **View projections**: Calculate interest earnings
4. **Lock funds**: Money held until unlock date
5. **Earn interest**: Progressive rates for longer locks
6. **Early withdrawal**: Available with penalty fees

## 🎨 Design Philosophy

MoneyBuddy reimagines money transfers by adding **context and intention**. Instead of instant, anonymous payments, it creates **meaningful financial interactions** tied to real-world locations and time commitments.

The platform encourages **mindful spending** through location requirements and **disciplined saving** through time locks, making money management more engaging and purposeful.

## 💡 Innovation

- **First conditional P2P platform**: Payments that require location + time
- **Gamified savings**: Interest rates that reward commitment
- **Privacy-first location**: GPS used only for verification, not tracking
- **Non-banking approach**: Innovative financial services without bank licensing

---

## 📜 License
This project is currently unlicensed. All rights reserved by the creator.

---

*Created by J. Lucas Nale — pushing the boundaries of location-based fintech and conditional payment systems.*

© 2025 J. Lucas Nale. All rights reserved
