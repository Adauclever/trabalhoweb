import {
    initializeStore, getBooks, getAuthors, getReadings,
    resetToSeed, getDataBackup
} from "./store.js";

const message = document.getElementById("data-message");
const resetButton = document.getElementById("reset-data-button");
const backupButton = document.getElementById("backup-data-button");

async function updateSummary() {
    const [books, authors, readings] = await Promise.all([
        getBooks(), getAuthors(), getReadings()
    ]);
    document.getElementById("book-count").textContent = books.length;
    document.getElementById("author-count").textContent = authors.length;
    document.getElementById("reading-count").textContent = readings.length;
}

resetButton.addEventListener("click", async () => {
    message.textContent = "";
    if (!confirm(
        "Reset all data to the official seed?\n\n" +
        "All books, authors, themes and readings currently saved " +
        "in this browser will be replaced. This cannot be undone."
    )) return;

    resetButton.disabled = true;
    try {
        await resetToSeed();
        await updateSummary();
        message.textContent = "Official seed data restored successfully.";
    } catch (error) {
        message.textContent = error.message || "Could not restore data.";
    } finally {
        resetButton.disabled = false;
    }
});

backupButton.addEventListener("click", async () => {
    try {
        const json = await getDataBackup();
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "reading-tracker-backup.json";
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        message.textContent = "Backup downloaded.";
    } catch (error) {
        message.textContent = error.message || "Could not export backup.";
    }
});

async function start() {
    resetButton.disabled = true;
    backupButton.disabled = true;
    try {
        const result = await initializeStore();
        await updateSummary();
        if (result.loadedFromSeed) {
            message.textContent = "Official seed data loaded on first use.";
        }
        resetButton.disabled = false;
        backupButton.disabled = false;
    } catch (error) {
        message.textContent = error.message || "Could not initialize the app.";
        console.error(error);
    }
}

const menuToggle = document.getElementById("menu-toggle");
const navbar = document.getElementById("navbar");

menuToggle.addEventListener("click", () => {
    navbar.classList.toggle("active");
});

start();
