import {
  Application,
  Router
} from "./deps.ts";
import { middleware } from "./middleware.ts";
import { handleSocket } from "./handleSocket.ts";

const app = new Application();
const router = new Router();
app.use(router.routes());
app.use(router.allowedMethods());
app.use(middleware);
router.get("/", async (context) => {
  const decoder = new TextDecoder("utf-8");
  const bytes = Deno.readFileSync("index.html");
  const text = decoder.decode(bytes);  
  context.response.body = text;
});
router
  .get("/ws", handleSocket);
console.log("Server running on localhost:3000");
await app.listen({ port: 3000 });
