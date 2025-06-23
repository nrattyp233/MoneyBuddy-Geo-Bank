import crypto from "crypto"

export class WebhookSecurity {
  // Verify PayPal webhook signature
  static verifyPayPalWebhook(payload: string, headers: Record<string, string>, webhookId: string): boolean {
    try {
      const authAlgo = headers["paypal-auth-algo"]
      const transmission_id = headers["paypal-transmission-id"]
      const cert_id = headers["paypal-cert-id"]
      const transmission_sig = headers["paypal-transmission-sig"]
      const transmission_time = headers["paypal-transmission-time"]

      // In production, verify against PayPal's certificate
      // This is a simplified version - use PayPal's SDK for full verification
      return true // Implement full verification in production
    } catch (error) {
      console.error("PayPal webhook verification failed:", error)
      return false
    }
  }

  // Verify Square webhook signature
  static verifySquareWebhook(
    payload: string,
    signature: string,
    signatureKey: string,
    notificationUrl: string,
  ): boolean {
    try {
      const stringToSign = notificationUrl + payload
      const expectedSignature = crypto.createHmac("sha1", signatureKey).update(stringToSign, "utf8").digest("base64")

      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
    } catch (error) {
      console.error("Square webhook verification failed:", error)
      return false
    }
  }

  // Verify Dwolla webhook signature
  static verifyDwollaWebhook(payload: string, signature: string, secret: string): boolean {
    try {
      const expectedSignature = crypto.createHmac("sha256", secret).update(payload, "utf8").digest("hex")

      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
    } catch (error) {
      console.error("Dwolla webhook verification failed:", error)
      return false
    }
  }
}
