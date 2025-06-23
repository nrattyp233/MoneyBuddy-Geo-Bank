const CACHE_NAME = "securebank-v1"
const urlsToCache = ["/", "/dashboard", "/savings", "/transactions", "/send", "/profile", "/ai-assistant"]

// Install service worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache)
    }),
  )
})

// Fetch event
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      return response || fetch(event.request)
    }),
  )
})

// Push event
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json()

    const options = {
      body: data.message,
      icon: "/icon-192x192.png",
      badge: "/badge-72x72.png",
      tag: data.type,
      data: data.data,
      requireInteraction: data.priority === "high" || data.priority === "urgent",
      actions: getNotificationActions(data.type),
    }

    event.waitUntil(self.registration.showNotification(data.title, options))
  }
})

// Notification click event
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  const urlToOpen = getUrlForNotificationType(event.notification.tag, event.notification.data)

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (const client of clientList) {
        if (client.url === urlToOpen && "focus" in client) {
          return client.focus()
        }
      }

      // If not, open a new window/tab
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    }),
  )
})

// Get notification actions based on type
function getNotificationActions(type) {
  switch (type) {
    case "locked_account_maturity":
      return [
        { action: "view", title: "View Account" },
        { action: "dismiss", title: "Dismiss" },
      ]
    case "fee_collected":
      return [
        { action: "view", title: "View Details" },
        { action: "dismiss", title: "Dismiss" },
      ]
    case "transaction_completed":
      return [
        { action: "view", title: "View Transaction" },
        { action: "dismiss", title: "Dismiss" },
      ]
    default:
      return [{ action: "dismiss", title: "Dismiss" }]
  }
}

// Get URL to open based on notification type
function getUrlForNotificationType(type, data) {
  const baseUrl = self.location.origin

  switch (type) {
    case "locked_account_maturity":
      return `${baseUrl}/savings`
    case "fee_collected":
      return `${baseUrl}/admin`
    case "transaction_completed":
      return `${baseUrl}/transactions`
    case "security_alert":
      return `${baseUrl}/profile`
    default:
      return `${baseUrl}/dashboard`
  }
}
