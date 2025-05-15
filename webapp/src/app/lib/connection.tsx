export function Code(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
const backendURL = 'http://192.168.1.26:4000';
export async function setupconnection(){
        if ('serviceWorker' in navigator && 'PushManager' in window) {
          try {
            // this is me asking permission to marry you , chwaya wa9t ou tw narja3lk
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
              console.log('Push permission denied'); // this is you saying no to me
              return;
            }
  
            const registration = await navigator.serviceWorker.register('/Notifications.js');
            const subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: Code('BME6S9g2Uqstk9_Y15xclo7mFV92_MH8oe2k2Z0IJGyP3yUSwYjz1rJveTEQVWrOPLC44R1RQooKchJNpYf3330'),
            });
            await fetch(`${backendURL}/subscribe`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(subscription),
            });
            console.log('Push subscribed!');
          } catch (err) {
            console.error('Push setup failed:', err);
          }
        }
}