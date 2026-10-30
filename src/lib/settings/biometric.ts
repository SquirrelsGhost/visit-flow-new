/**
 * Kann dieses Gerät per Fingerabdruck oder Gesicht bestätigen (WebAuthn-Plattform-Authentifikator)?
 * v1 prüfte das über WebAuthnService.isSupported bzw. NativeBiometric.isAvailable.
 */
export async function platformAuthenticatorAvailable(): Promise<boolean> {
  if (typeof window === "undefined" || !window.PublicKeyCredential) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}
