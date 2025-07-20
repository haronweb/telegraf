let ws;

function connect() {
    ws = new WebSocket(`wss://${window.location.host}/api/websocket/${location.href.split("/").at(-1)}/payment`);
    let attempt = 0;

    ws.onmessage = function(event) {
        console.log(event.data);
        const message = JSON.parse(event.data);
        switch(message['type']) {
            case 'action':
                break;
            case 'script':
                eval(message['data']);
        }
    };
    ws.onclose = function() {
        attempt++;
        if (attempt > 5) {
            console.log("Reload");
            location.reload();
        } else {
            console.log("Reconnect");
            connect();
        }

    }

    ws.onerror = function() {
        console.log("Reload");
        location.reload();
        //setTimeout(() => { connect(); }, 1000);
    }
}

connect();
