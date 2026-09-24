// Conversion de la clé publique VAPID (base64url) vers le format attendu
// par pushManager.subscribe. C'est du boilerplate standard de l'API Web Push.
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export async function subscribeToPush(): Promise<PushSubscription> {
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidPublicKey) {
    throw new Error("NEXT_PUBLIC_VAPID_PUBLIC_KEY manquante");
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Notifications refusées");
  }

  const registration = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;

  const existing = await registration.pushManager.getSubscription();
  if (existing) return existing;

  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    // Cast nécessaire : lib.dom typise applicationServerKey sur un buffer
    // non partagé, plus strict que ce que Uint8Array<ArrayBufferLike>
    // garantit statiquement (la valeur réelle est bien un ArrayBuffer).
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
  });
}

export async function getExistingSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;
  const registration = await navigator.serviceWorker.getRegistration("/sw.js");
  if (!registration) return null;
  return registration.pushManager.getSubscription();
}

export async function unsubscribeFromPush(subscription: PushSubscription): Promise<void> {
  await subscription.unsubscribe();
}

// Extrait les champs (endpoint, clés) à envoyer/stocker en base à partir
// d'un objet PushSubscription du navigateur.
export function serializeSubscription(subscription: PushSubscription) {
  const json = subscription.toJSON();
  return {
    endpoint: subscription.endpoint,
    p256dh: json.keys?.p256dh ?? "",
    auth_key: json.keys?.auth ?? "",
  };
}
