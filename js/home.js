import {
    initializeStore, getBooks, getAuthors, getReadings,
    resetToSeed, getDataBackup
} from "./store.js";

const message = document.getElementById("data-message");
const resetButton = document.getElementById("reset-data-button");
const backupButton = document.getElementById("backup-data-button");

const resetModal = document.getElementById("reset-modal");
const cancelResetButton = document.getElementById("cancel-reset");
const confirmResetButton = document.getElementById("confirm-reset");



// ATUALIZA O RESUMO DOS DADOS CADASTRADOS

async function updateSummary() {
    const [books, authors, readings] = await Promise.all([
        getBooks(), getAuthors(), getReadings()
    ]);

    document.getElementById("book-count").textContent = books.length;
    document.getElementById("author-count").textContent = authors.length;
    document.getElementById("reading-count").textContent = readings.length;
}



// ABRE O MODAL DE CONFIRMAÇÃO DA RESTAURAÇÃO DOS DADOS

resetButton.addEventListener("click", () => {
    message.textContent = "";
    resetModal.classList.remove("hidden");
});



// FECHA O MODAL DE CONFIRMAÇÃO

cancelResetButton.addEventListener("click", () => {
    resetModal.classList.add("hidden");
});

resetModal.addEventListener("click", event => {
    if (event.target === resetModal) {
        resetModal.classList.add("hidden");
    }
});



// RESTAURA OS DADOS ORIGINAIS

confirmResetButton.addEventListener("click", async () => {
    resetButton.disabled = true;
    confirmResetButton.disabled = true;

    try {
        await resetToSeed();
        await updateSummary();

        message.textContent = "Official seed data restored successfully.";
        resetModal.classList.add("hidden");

    } catch (error) {
        message.textContent = error.message || "Could not restore data.";

    } finally {
        resetButton.disabled = false;
        confirmResetButton.disabled = false;
    }
});



// FAZ O DOWNLOAD DO BACKUP DOS DADOS

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



// INICIALIZA A PÁGINA

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



// CONTROLA O MENU DE NAVEGAÇÃO

document.addEventListener("click", event => {
    const menuToggle = event.target.closest("#menu-toggle");

    if (menuToggle) {
        const navbar = document.getElementById("navbar");

        if (navbar) {
            navbar.classList.toggle("active");
        }
    }
});



// INICIA A PÁGINA

start();