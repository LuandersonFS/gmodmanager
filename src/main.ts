import * as http from "node:http";
import * as https from "node:https";
import { createWriteStream, writeFileSync } from "node:fs";

const logLevel: { 0: "LOG"; 1: "WARN"; 2: "ERROR"; LOG: 0; WARN: 1; ERROR: 2 } =
  {
    0: "LOG",
    1: "WARN",
    2: "ERROR",
    LOG: 0,
    WARN: 1,
    ERROR: 2,
  };

const protocol = { "http:": http, "https:": https };
const linkQueue: string[] = [];
const fetchOptions = {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:130.0) Gecko/20100101 Firefox/130.0",
  },
};

const input = [
  "https://steamcommunity.com/sharedfiles/filedetails/?id=3329291214",
  "wss://steamcommunity.com/sharedfiles/filedetails/?id=3329291214",
];

log("Queuing " + input, 0);
linkQueue.push(...input);

for (let n = 0; !!linkQueue[n]; n++) {
  const link = new URL(linkQueue[n]);

  if (!(link.protocol in protocol)) {
    log(
      `"${link.protocol.slice(0, -1)}" protocol in ${
        link.href
      } is not supported.`,
      1
    );
    continue;
  }

  const filePath = `./examples/${link.searchParams.get("id")}.html`;
  const request = protocol[link.protocol as "http:" | "https:"].get(
    link.href,
    fetchOptions
  );

  request.on("response", (res) => {
    log("Response received from " + link.href, 0);
    log("Writing response headers", 0);
    writeFileSync(
      "./examples/responseHeaders.json",
      JSON.stringify({ rawHeaders: res.rawHeaders, headers: res.headers })
    );
    log("headers writed", 0);
    const ws = createWriteStream(filePath);
    log("Writing response to " + filePath, 0);

    res
      .on("data", () => {
        log("Received chunk from " + link.href, 0);
      })
      .on("end", () => {
        log(filePath + " writed", 0);
      })
      .on("error", (err) => {
        log("Error while fetching: " + err, 2);
      })
      .pipe(ws);
  });
}
function log(msg: string, type: 0 | 1 | 2) {
  console[logLevel[type].toLowerCase() as "log" | "warn" | "error"](
    `[${new Date().toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      //@ts-ignore
      fractionalSecondDigits: 3,
    })}]\t${logLevel[type]}: ${msg}`
  );
}
