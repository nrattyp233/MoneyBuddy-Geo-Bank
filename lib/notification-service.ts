export interface NotificationData {
  type: "locked_account_maturity" | "fee_collected" | "transaction_completed" | "security_alert" | "general"
  title: string
  message: string
  data?: Record<string, any>
  priority?: "low" | "normal" | "high" | "urgent"
  userId: string
}

export interface PushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

class NotificationService {
  private static instance: NotificationService
  private vapidPublicKey = "BEl62iUYgUivxIkv69yViEuiBIa40HI80NM9f8HtLlVLOPOHNcmMrXPKNSRRjtnfG3JOYkSjyQhyPpQPiNXHQkU" // Demo key

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  // Request permission for push notifications
  async requestPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      console.warn("This browser does not support notifications")
      return false
    }

    if (Notification.permission === "granted") {
      return true
    }

    if (Notification.permission === "denied") {
      return false
    }

    const permission = await Notification.requestPermission()
    return permission === "granted"
  }

  // Subscribe to push notifications
  async subscribeToPush(userId: string): Promise<PushSubscription | null> {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.warn("Push messaging is not supported")
      return null
    }

    try {
      const registration = await navigator.serviceWorker.register("/sw.js")
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey),
      })

      const pushSubscription: PushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey("p256dh")!))),
          auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey("auth")!))),
        },
      }

      // Save subscription to backend
      await this.savePushSubscription(userId, pushSubscription)

      return pushSubscription
    } catch (error) {
      console.error("Failed to subscribe to push notifications:", error)
      return null
    }
  }

  // Save push subscription to backend
  private async savePushSubscription(userId: string, subscription: PushSubscription): Promise<void> {
    try {
      // In a real app, this would be an API call
      const subscriptionData = {
        userId,
        endpoint: subscription.endpoint,
        p256dhKey: subscription.keys.p256dh,
        authKey: subscription.keys.auth,
        userAgent: navigator.userAgent,
      }

      // Store in localStorage for demo purposes
      const existingSubscriptions = JSON.parse(localStorage.getItem("pushSubscriptions") || "[]")
      const updatedSubscriptions = existingSubscriptions.filter((sub: any) => sub.userId !== userId)
      updatedSubscriptions.push(subscriptionData)
      localStorage.setItem("pushSubscriptions", JSON.stringify(updatedSubscriptions))

      console.log("Push subscription saved:", subscriptionData)
    } catch (error) {
      console.error("Failed to save push subscription:", error)
    }
  }

  // Send push notification
  async sendPushNotification(notificationData: NotificationData): Promise<void> {
    try {
      // In a real app, this would be sent to your backend
      // For demo purposes, we'll show a browser notification
      if (Notification.permission === "granted") {
        const notification = new Notification(notificationData.title, {
          body: notificationData.message,
          icon: "/icon-192x192.png",
          badge: "/badge-72x72.png",
          tag: notificationData.type,
          data: notificationData.data,
          requireInteraction: notificationData.priority === "high" || notificationData.priority === "urgent",
        })

        notification.onclick = () => {
          window.focus()
          notification.close()

          // Handle notification click based on type
          this.handleNotificationClick(notificationData)
        }

        // Auto-close after 5 seconds for normal priority
        if (notificationData.priority === "normal" || notificationData.priority === "low") {
          setTimeout(() => notification.close(), 5000)
        }
      }

      // Save notification to in-app notifications
      await this.saveInAppNotification(notificationData)
    } catch (error) {
      console.error("Failed to send push notification:", error)
    }
  }

  // Save in-app notification
  private async saveInAppNotification(notificationData: NotificationData): Promise<void> {
    try {
      const notification = {
        id: Date.now().toString(),
        ...notificationData,
        isRead: false,
        createdAt: new Date().toISOString(),
      }

      const existingNotifications = JSON.parse(localStorage.getItem("inAppNotifications") || "[]")
      existingNotifications.unshift(notification)

      // Keep only last 50 notifications
      const trimmedNotifications = existingNotifications.slice(0, 50)
      localStorage.setItem("inAppNotifications", JSON.stringify(trimmedNotifications))
    } catch (error) {
      console.error("Failed to save in-app notification:", error)
    }
  }

  // Handle notification click
  private handleNotificationClick(notificationData: NotificationData): void {
    switch (notificationData.type) {
      case "locked_account_maturity":
        window.location.href = "/savings"
        break
      case "fee_collected":
        window.location.href = "/admin"
        break
      case "transaction_completed":
        window.location.href = "/transactions"
        break
      case "security_alert":
        window.location.href = "/profile"
        break
      default:
        window.location.href = "/dashboard"
    }
  }

  // Get in-app notifications
  getInAppNotifications(userId: string): any[] {
    try {
      const notifications = JSON.parse(localStorage.getItem("inAppNotifications") || "[]")
      return notifications.filter((notification: any) => notification.userId === userId)
    } catch (error) {
      console.error("Failed to get in-app notifications:", error)
      return []
    }
  }

  // Mark notification as read
  markAsRead(notificationId: string): void {
    try {
      const notifications = JSON.parse(localStorage.getItem("inAppNotifications") || "[]")
      const updatedNotifications = notifications.map((notification: any) =>
        notification.id === notificationId
          ? { ...notification, isRead: true, readAt: new Date().toISOString() }
          : notification,
      )
      localStorage.setItem("inAppNotifications", JSON.stringify(updatedNotifications))
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  // Clear all notifications
  clearAllNotifications(userId: string): void {
    try {
      const notifications = JSON.parse(localStorage.getItem("inAppNotifications") || "[]")
      const filteredNotifications = notifications.filter((notification: any) => notification.userId !== userId)
      localStorage.setItem("inAppNotifications", JSON.stringify(filteredNotifications))
    } catch (error) {
      console.error("Failed to clear notifications:", error)
    }
  }

  // Utility function to convert VAPID key
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  // Check for locked account maturity
  checkLockedAccountMaturity(lockedAccounts: any[], userId: string): void {
    const now = new Date()

    lockedAccounts.forEach((account) => {
      if (account.status === "active") {
        const unlockDate = new Date(account.unlockDate)
        const daysUntilMaturity = Math.ceil((unlockDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        // Notify 7 days before maturity
        if (daysUntilMaturity === 7) {
          this.sendPushNotification({
            type: "locked_account_maturity",
            title: "Locked Account Maturing Soon",
            message: `Your "${account.accountName}" will mature in 7 days. You'll earn $${account.projectedEarnings.toFixed(2)} in interest!`,
            data: { accountId: account.id, daysRemaining: 7 },
            priority: "normal",
            userId,
          })
        }

        // Notify 1 day before maturity
        if (daysUntilMaturity === 1) {
          this.sendPushNotification({
            type: "locked_account_maturity",
            title: "Locked Account Maturing Tomorrow",
            message: `Your "${account.accountName}" matures tomorrow! Ready to withdraw $${account.currentValue.toFixed(2)}.`,
            data: { accountId: account.id, daysRemaining: 1 },
            priority: "high",
            userId,
          })
        }

        // Notify on maturity day
        if (daysUntilMaturity === 0) {
          this.sendPushNotification({
            type: "locked_account_maturity",
            title: "Locked Account Matured!",
            message: `Your "${account.accountName}" has matured! You can now withdraw $${account.currentValue.toFixed(2)} including $${account.projectedEarnings.toFixed(2)} in earnings.`,
            data: { accountId: account.id, matured: true },
            priority: "high",
            userId,
          })
        }
      }
    })
  }

  // Notify about fee collection
  notifyFeeCollection(
    feeType: "transaction" | "early_withdrawal",
    amount: number,
    originalAmount: number,
    userId: string,
  ): void {
    const feePercentage = feeType === "transaction" ? "2%" : "5%"
    const title = feeType === "transaction" ? "Transaction Fee Collected" : "Early Withdrawal Fee Collected"
    const message = `${feePercentage} fee of $${amount.toFixed(2)} collected from $${originalAmount.toFixed(2)} ${feeType === "transaction" ? "transaction" : "early withdrawal"}.`

    this.sendPushNotification({
      type: "fee_collected",
      title,
      message,
      data: { feeType, amount, originalAmount },
      priority: "low",
      userId,
    })
  }
}

export default NotificationService.getInstance()
