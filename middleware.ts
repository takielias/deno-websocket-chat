import {
  acceptWebSocket,
  isWebSocketCloseEvent,
  isWebSocketPingEvent,
} from "./deps.ts";

export const middleware = async function (ctx: any, next: any) {
  if (ctx.request.url.pathname !== "/") {
    return await next();
  }

  if (ctx.request.url.pathname !== "/ws") {
    return await next();
  }

  if (ctx.request.headers.get("upgrade") !== "websocket") {
    ctx.response.status = 200;
    return;
  }

  const { conn, r: bufReader, w: bufWriter, headers } =
    ctx.request.serverRequest;

  try {
    const sock = await acceptWebSocket({
      conn,
      bufReader,
      bufWriter,
      headers,
    });
    try {
      for await (const ev of sock) {
        if (typeof ev === "string") {
          // text message
          console.log("ws:Text", ev);

          // await sock.send(ev);

          sock.send(ev);
        } else if (ev instanceof Uint8Array) {
          // binary message
          console.log("ws:Binary", ev);
        } else if (isWebSocketPingEvent(ev)) {
          const [, body] = ev;
          // ping
          console.log("ws:Ping", body);
        } else if (isWebSocketCloseEvent(ev)) {
          // close
          const { code, reason } = ev;
          console.log("ws:Close", code, reason);
        }
      }
    } catch (err) {
      console.error(`Dev Server failed to receive frame: ${err}`);

      if (!sock.isClosed) {
        await sock.close(1000).catch(console.error);
      }
    }
  } catch (err) {
    console.error(`Dev Server failed to accept websocket: ${err}`);
    ctx.response.status = 400;
  }
};
