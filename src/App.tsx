import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import TransferPage from './pages/TransferPage'
import GeofenceTransferPage from './pages/GeofenceTransferPage'
import DepositPage from './pages/DepositPage'
import WithdrawPage from './pages/WithdrawPage'
import SavingsPage from './pages/SavingsPage'
import LockSavingsPage from './pages/LockSavingsPage'
import ChatPage from './pages/ChatPage'
import TransactionsPage from './pages/TransactionsPage'
import ProfilePage from './pages/ProfilePage'
import AdminPage from './pages/AdminPage'
import DemoPage from './pages/DemoPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/demo" element={<DemoPage />} />
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/transfer" element={<TransferPage />} />
      <Route path="/transfer/geofence" element={<GeofenceTransferPage />} />
      <Route path="/deposit" element={<DepositPage />} />
      <Route path="/withdraw" element={<WithdrawPage />} />
      <Route path="/savings" element={<SavingsPage />} />
      <Route path="/savings/lock" element={<LockSavingsPage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/transactions" element={<TransactionsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App