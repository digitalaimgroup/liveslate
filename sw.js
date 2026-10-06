// LiveSlate service worker: shows alerts (from the app or the LiveSlate alert server)
// and reopens the right game when one is tapped.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));

self.addEventListener("push", e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = {title: "LiveSlate", body: e.data ? e.data.text() : ""}; }
  e.waitUntil(self.registration.showNotification(d.title || "LiveSlate", {
    body: d.body || "",
    tag: d.tag || undefined,
    renotify: !!d.tag,
    icon: "icon-192.png",
    badge: "icon-192.png",
    data: {gameId: d.gameId || null},
  }));
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  const id = e.notification.data && e.notification.data.gameId;
  const url = new URL("./" + (id ? "#g" + id : ""), self.registration.scope).href;
  e.waitUntil((async () => {
    const wins = await self.clients.matchAll({type: "window", includeUncontrolled: true});
    for (const w of wins) {
      if ("focus" in w) { w.postMessage({type: "open", gameId: id}); return w.focus(); }
    }
    return self.clients.openWindow(url);
  })());
});
