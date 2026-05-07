// ==UserScript==
// @name         Travian Universal Ad & Reward Skipper 2026
// @namespace    https://github.com/bourama1/Travian-scripts
// @version      3.0
// @description  Skips video ads and reward dialogs in Travian Legends
// @author       bourama1
// @match        *://*.travian*.*/*
// @match        *://media.oadts.com/*
// @grant        none
// @run-at       document-start
// @all-frames   true
// ==/UserScript==

(function () {
    "use strict";

    // ─── CONFIG ──────────────────────────────────────────────────────────────
    const MIN_PLAYTIME = 0.4; // seconds before we're allowed to skip
    const VIDEO_LOOKUP_POLL = 50; // ms — poll rate waiting for <video> to appear
    const VIDEO_SKIP_POLL = 300; // ms — poll rate for advancing currentTime
    const DEBUG = false; // set true to see console logs
    // ─────────────────────────────────────────────────────────────────────────

    const log = (...a) => DEBUG && console.log("%c[TravianSkip]", "color:#00c896", ...a);
    const url = window.location.href;
    const isInIframe = window.top !== window.self;

    // ═══════════════════════════════════════════════════════════════════════════
    // PART 1 — Video ad skipper (runs inside the ad iframe on media.oadts.com)
    // ═══════════════════════════════════════════════════════════════════════════
    const AD_KEYWORDS = ["media.oadts.com", "delivery", "afv.php"];
    const isAdFrame = isInIframe && AD_KEYWORDS.every((k) => url.includes(k));

    if (isAdFrame) {
        log("Ad iframe detected:", url);

        // Wait for any CSS selector to appear in the DOM
        function waitFor(selector, poll = 50) {
            return new Promise((resolve) => {
                (function check() {
                    if (document.querySelector(selector)) return resolve();
                    setTimeout(check, poll);
                })();
            });
        }

        // Click the play button so the video actually starts, then skip it
        waitFor(".atg-gima-big-play-button-outer").then(() => {
            log("Play button found, clicking...");
            const btn = document.querySelector(".atg-gima-big-play-button-outer");
            if (btn) btn.click();

            // Now wait for the <video> element to exist
            waitFor("video", VIDEO_LOOKUP_POLL).then(() => {
                log("Video element found, starting skip loop");

                setInterval(() => {
                    document.querySelectorAll("video").forEach((video) => {
                        if (!video || video.src.includes("blank.mp4")) return;
                        const { currentTime, duration } = video;
                        if (!isFinite(duration) || !isFinite(currentTime)) return;

                        if (currentTime < duration) {
                            if (currentTime > MIN_PLAYTIME) {
                                log(`Skipping video at ${currentTime.toFixed(2)}s / ${duration.toFixed(2)}s`);
                                video.currentTime = duration + 1;
                            } else {
                                log(`Waiting for min playtime (${currentTime.toFixed(2)}s)`);
                            }
                        }
                    });
                }, VIDEO_SKIP_POLL);
            });
        });

        return; // Nothing else to do inside the ad iframe
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PART 2 — Reward / bonus dialog auto-closer (runs on the main Travian page)
    // Only clicks buttons that are clearly inside a bonus/reward overlay.
    // ═══════════════════════════════════════════════════════════════════════════
    if (isInIframe) return; // Don't run Part 2 in any other iframe

    // Selectors for the reward overlay containers Travian uses
    const OVERLAY_SELECTORS = [
        ".rewardOverlay",
        ".productionBoostOverlay",
        ".bonusOverlay",
        '[class*="rewardDialog"]',
        '[class*="bonusDialog"]',
        '[class*="adDialog"]',
        ".dialogContent",
        // generic Travian modal
    ].join(", ");

    // Text patterns that mean "dismiss this dialog"
    const DISMISS_RE =
        /^(skip|claim|reward|close|schließen|fertig|weiter|ok|done|accept|continue|get\s*bonus|production\s*boost)$/i;

    function tryDismissOverlays() {
        const overlays = document.querySelectorAll(OVERLAY_SELECTORS);
        overlays.forEach((overlay) => {
            // Only click buttons that live INSIDE a known overlay — not page-wide
            overlay.querySelectorAll('button, a.button, div[role="button"]').forEach((btn) => {
                const text = (btn.textContent || "").trim();
                if (DISMISS_RE.test(text) && btn.offsetParent !== null) {
                    log(`Clicking dismiss button: "${text}"`);
                    btn.click();
                }
            });
        });
    }

    // Watch for overlays being injected into the DOM
    const observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
            if (m.addedNodes.length) {
                tryDismissOverlays();
                break; // one check per batch is enough
            }
        }
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        // No attribute watching — saves a lot of CPU
    });

    log("Main page hook active");
})();
