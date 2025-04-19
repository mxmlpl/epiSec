console.log("⚡ Epilepsy Video Guard aktiviert!");

// Funktion, um das Video-Element zu finden
function startMonitoring() {
    let video = document.querySelector("video");

    if (!video) {
        console.log("❌ Kein Video gefunden.");
        return;
    }

    console.log("🎥 Video erkannt! Flacker-Überwachung gestartet.");

    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d");

    let lastBrightness = 0;
    let flashCount = 0;
    let lastFlashTime = Date.now();

    // Warte, bis das Video genug Daten hat
    video.addEventListener("play", () => {
        setInterval(() => {
            detectFlashing(video, ctx, canvas, lastBrightness, flashCount, lastFlashTime);
        }, 100);
    });
}

// Beobachte DOM-Änderungen, falls ein Video dynamisch nachgeladen wird
let observer = new MutationObserver((mutations) => {
    for (let mutation of mutations) {
        if (mutation.addedNodes.length) {
            startMonitoring();
        }
    }
});

observer.observe(document.body, { childList: true, subtree: true });

// Starte die Überwachung beim ersten Laden
startMonitoring();

// Funktion zur verbesserten Flackererkennung
function detectFlashing(video, ctx, canvas, lastBrightness, flashCount, lastFlashTime) {
    if (video.readyState < 2) return; // Prüft, ob genug Frames geladen sind

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    try {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    } catch (e) {
        console.error("⚠ Fehler bei drawImage:", e);
        return;
    }

    let frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let pixels = frame.data;
    let brightnessSum = 0;

    for (let i = 0; i < pixels.length; i += 4) {
        let r = pixels[i];
        let g = pixels[i + 1];
        let b = pixels[i + 2];
        let brightness = (r + g + b) / 3;
        brightnessSum += brightness;
    }

    let avgBrightness = brightnessSum / (pixels.length / 4);
    let brightnessDiff = Math.abs(avgBrightness - lastBrightness);

    let now = Date.now();

    if (brightnessDiff > 100) {
        flashCount++;
        console.log(`⚠ Starker Helligkeitswechsel! (${flashCount} in kurzer Zeit)`);

        if (flashCount >= 3 && now - lastFlashTime < 3000) {
            showWarning();
            flashCount = 0;
            lastFlashTime = now;
        }
    } else {
        if (now - lastFlashTime > 3000) {
            flashCount = 0;
        }
    }

    lastBrightness = avgBrightness;
}

function showWarning() {
    console.log("⚠️ WARNUNG AUSGELÖST!");

    let existingWarning = document.getElementById("epilepsy-warning");
    if (!existingWarning) {
        let warning = document.createElement("div");
        warning.id = "epilepsy-warning";
        warning.innerText = "⚠ Achtung: Starke Lichtblitze erkannt!";
        warning.classList.add("epilepsy-alert");

        // Style direkt im JS setzen, falls CSS nicht geladen wird
        warning.style.position = "fixed";
        warning.style.top = "20px";
        warning.style.left = "50%";
        warning.style.transform = "translateX(-50%)";
        warning.style.padding = "15px";
        warning.style.backgroundColor = "red";
        warning.style.color = "white";
        warning.style.fontSize = "20px";
        warning.style.fontWeight = "bold";
        warning.style.borderRadius = "5px";
        warning.style.zIndex = "9999";
        warning.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)";

        document.body.appendChild(warning);

        // Bildschirm abdunkeln
        document.body.style.filter = "brightness(50%)";

        // Entferne das Popup nach 5 Sekunden
        setTimeout(() => {
            document.body.style.filter = "brightness(100%)";
            warning.remove();
        }, 5000);
    } else {
        console.log("⚠️ WARNUNG bereits vorhanden!");
    }
}



   

