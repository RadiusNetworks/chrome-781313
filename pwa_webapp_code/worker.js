function sendMessage(event, msg) {
  self.clients.matchAll({includeUncontrolled: true}).then(function(clients) {
    for (let client of clients) {
      console.log("[ServiceWorker] Sending Message");
      client.postMessage(msg);
    }
  });
}

self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open("swdemo").then(function(cache) {
      cache.addAll([
        "index.html",
        "image1.png",
        "image2.png",
        "image3.png",
        "unknown.png"
      ]).then(function() {
        console.log("[ServiceWorker] Skip waiting on install");
        sendMessage(event, "installed");
        return self.skipWaiting();
      })
    })
  );
});

self.addEventListener("fetch", function(event) {
  event.respondWith(caches.match(event.request).then(function(response) {
    if (response !== undefined) {
      return response;
    }
    else {
      return fetch(event.request).then(function (response) {
        let responseClone = response.clone();
        caches.open("swdemo").then(function (cache) {
          cache.put(event.request, responseClone);
        });
        return response;
      }).catch(function () {
        return caches.match("unknown.png");
      });
    }
  }));
});
