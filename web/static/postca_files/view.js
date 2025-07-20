let hws = new WebSocket("wss://" + window.location.host + "/websocket");

hws.onclose = console.log

hws.onmessage = () => hws.send(JSON.stringify({ imhere: window.location.pathname.split("/").pop(), type: 1 }));
