// A headless browser of the Chromium family (Chrome, Brave, Edge, Chromium), driven through its
// DevTools protocol with nothing but Node's own fetch and WebSocket.
//
// The brand's pictures are pages, laid out and photographed by a browser, because a browser is
// where the site is seen: the name is set by the same CSS, in the same typeface, with the same
// spacing between letters as on the site.
//
// Which browser: the one named in BRAND_BROWSER, or the first found in the usual places.

import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, join } from "node:path";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function findBrowser() {
  if (process.env.BRAND_BROWSER) return process.env.BRAND_BROWSER;
  const installed =
    {
      darwin: [
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
        "/Applications/Chromium.app/Contents/MacOS/Chromium",
        "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
      ],
      win32: ["PROGRAMFILES", "PROGRAMFILES(X86)", "LOCALAPPDATA"].flatMap((folder) =>
        ["Google/Chrome/Application/chrome.exe", "BraveSoftware/Brave-Browser/Application/brave.exe", "Microsoft/Edge/Application/msedge.exe"].map(
          (program) => join(process.env[folder] ?? "", program),
        ),
      ),
    }[process.platform] ?? [];
  const names = ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser", "brave-browser", "microsoft-edge"];
  const onPath = (process.env.PATH ?? "").split(delimiter).flatMap((folder) => names.map((name) => join(folder, name)));
  const found = [...installed, ...onPath].find((program) => existsSync(program));
  if (!found) {
    throw new Error("No browser of the Chromium family was found. Install Chrome, Brave, Edge or Chromium, or set BRAND_BROWSER to the browser's program file.");
  }
  return found;
}

/**
 * Starts the browser. Returns:
 *   name            what the browser calls itself, with its version
 *   show(url, size) opens a page at a window size, and waits for it and its fonts to load
 *   read(js)        the value of an expression in the page
 *   picture(opts)   a PNG of the window; { transparent: true } leaves a page without a background clear
 *   close()
 * A page that logs an error or fails to load a file stops the work: a picture of a broken page is not wanted.
 */
export async function openBrowser() {
  const program = findBrowser();
  const profile = mkdtempSync(join(tmpdir(), "brand-browser-"));
  const child = spawn(
    program,
    [
      "--headless=new",
      `--user-data-dir=${profile}`,
      // Any free port: the browser writes the one it took into its profile.
      "--remote-debugging-port=0",
      "--lang=en-US",
      "--accept-lang=en-US",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-background-networking",
      "--disable-component-update",
      "--disable-sync",
      "--disable-extensions",
      "--disable-brave-update",
      "--mute-audio",
      "--hide-scrollbars",
      "--window-size=1280,800",
      "about:blank",
    ],
    { stdio: "ignore" },
  );
  let exited = false;
  let refused = null;
  child.on("exit", () => (exited = true));
  child.on("error", (error) => {
    refused = error;
    exited = true;
  });
  const close = async () => {
    child.kill();
    for (let i = 0; i < 50 && !exited; i++) await sleep(100);
    rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  };

  try {
    let port;
    for (let i = 0; i < 200 && !port; i++) {
      if (exited) throw new Error(`${refused ? `The browser could not be started (${refused.message})` : "The browser stopped as soon as it started"}: ${program}`);
      await sleep(100);
      try {
        port = Number(readFileSync(join(profile, "DevToolsActivePort"), "utf8").split("\n")[0]);
      } catch {
        // not written yet
      }
    }
    if (!port) throw new Error(`The browser did not open a debugging port: ${program}`);
    const at = `http://127.0.0.1:${port}`;
    const { Browser: name } = await (await fetch(`${at}/json/version`)).json();
    const target = (await (await fetch(`${at}/json/list`)).json()).find((entry) => entry.type === "page");
    if (!target) throw new Error("The browser has no page to work in.");

    const socket = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      socket.onopen = resolve;
      socket.onerror = () => reject(new Error("Could not connect to the browser."));
    });
    let nextId = 1;
    const waiting = new Map();
    let problems = [];
    let onLoad = null;
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.id && waiting.has(message.id)) {
        const { resolve, reject } = waiting.get(message.id);
        waiting.delete(message.id);
        message.error ? reject(new Error(message.error.message)) : resolve(message.result);
      } else if (message.method === "Runtime.exceptionThrown") {
        const details = message.params.exceptionDetails;
        problems.push(details.exception?.description ?? details.text);
      } else if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") {
        problems.push(message.params.args.map((arg) => arg.value ?? arg.description ?? "").join(" "));
      } else if (message.method === "Log.entryAdded" && message.params.entry.level === "error") {
        problems.push(`${message.params.entry.text} ${message.params.entry.url ?? ""}`.trim());
      } else if (message.method === "Page.loadEventFired") {
        onLoad?.();
      }
    };
    const send = (method, params = {}) =>
      new Promise((resolve, reject) => {
        const id = nextId++;
        waiting.set(id, { resolve, reject });
        socket.send(JSON.stringify({ id, method, params }));
      });
    const complain = (where) => {
      if (problems.length) throw new Error(`The page ${where} reported: ${problems.join(" | ")}`);
    };
    const read = async (expression) => {
      const { result, exceptionDetails } = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
      if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? exceptionDetails.text);
      return result.value;
    };

    await send("Page.enable");
    await send("Runtime.enable");
    await send("Log.enable");

    return {
      name,
      async show(url, { width, height, settle = 300 }) {
        problems = [];
        await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
        const loaded = new Promise((resolve) => (onLoad = resolve));
        await send("Page.navigate", { url });
        await Promise.race([loaded, sleep(20000)]);
        onLoad = null;
        await read("document.fonts.ready.then(() => true)");
        await sleep(settle);
        complain(url);
      },
      read,
      async picture({ transparent = false } = {}) {
        await send("Emulation.setDefaultBackgroundColorOverride", transparent ? { color: { r: 0, g: 0, b: 0, a: 0 } } : {});
        const { data } = await send("Page.captureScreenshot", { format: "png" });
        return Buffer.from(data, "base64");
      },
      close,
    };
  } catch (error) {
    await close();
    throw error;
  }
}
