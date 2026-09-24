// Service worker minimal : reçoit les notifications push et les affiche,
// et ramène au site si on clique dessus. Pas de mise en cache/mode
// hors-ligne ici (voir CLAUDE.md pour pourquoi).

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : "" };
  }

  const title = data.title || "Habit Tracker";
  const options = {
    body: data.body || "N'oublie pas tes habitudes du jour !",
    icon: "/icon.png",
    badge: "/icon.png",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow("/");
    })
  );
});
