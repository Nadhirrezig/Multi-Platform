self.addEventListener('push', (event) => {
    const data = event.data.json();
    const { title, body } = data;
  
    event.waitUntil(
      self.registration.showNotification(title, {
        body,
        icon: './vercel.svg',
      })
    );
  });
  
  self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(clients.openwindow('http://localhost:3000'));
  });