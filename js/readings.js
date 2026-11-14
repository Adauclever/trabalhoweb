import { MESSAGES } from "./messages.js";
import {
    initializeStore,
    getBooks,
    getAuthors,
    getReadings,
    saveReading,
    deleteReading
} from "./store.js";

import { validateReading } from "./validation.js";

const form = document.getElementById("reading-form");
const idInput = document.getElementById("reading-id");
const bookSelect = document.getElementById("reading-book");
const statusSelect = document.getElementById("reading-status");
const yearInput = document.getElementById("reading-year");
const gradeInput = document.getElementById("reading-grade");
const prioritySelect = document.getElementById("reading-priority");
const recommendedInput = document.getElementById("reading-recommended");
const notesInput = document.getElementById("reading-notes");
const list = document.getElementById("readings-list");
const cancelButton = document.getElementById("cancel-reading-edit");
const formHeading = document.getElementById("reading-form-heading");
const readingSearch = document.getElementById("reading-search");

const successModal = document.getElementById("success-modal");
const successMessage = document.getElementById("success-message");
const successButton = document.getElementById("success-button");

// Modal de exclusão
const deleteModal = document.getElementById("delete-modal");
const deleteMessage = document.getElementById("delete-message");
const cancelDeleteButton = document.getElementById("cancel-delete");
const confirmDeleteButton = document.getElementById("confirm-delete");

let books = [];
let authors = [];
let readings = [];

let sortField = "yearRead";
let sortAscending = false;
let previousStatus = "Want to read";

let readingToDelete = null;


// ========================================
// MENSAGENS DE ERRO
// ========================================

const errorIds = {
    bookId: "book-error",
    status: "status-error",
    yearRead: "year-error",
    grade: "grade-error",
    priority: "priority-error",
    recommendedBy: "recommended-error",
    notes: "notes-error"
};

function clearErrors() {
    Object.values(errorIds).forEach(id => {
        const element = document.getElementById(id);

        if (element) {
            element.textContent = "";
        }
    });
}

function showErrors(errors) {
    clearErrors();

    errors.forEach(error => {
        const elementId = errorIds[error.field];

        const element = elementId
            ? document.getElementById(elementId)
            : null;

        if (element) {
            element.textContent = error.message;
        } else {
            alert(error.message);
        }
    });
}


// ========================================
// MODAL DE CONFIRMAÇÃO DE EXCLUSÃO
// ========================================

function showDeleteConfirmation(reading, book) {
    readingToDelete = reading;

    deleteMessage.textContent =
        MESSAGES.ui.confirmDeleteReading(book?.title ?? "this book");

    deleteModal.classList.add("active");
}

function closeDeleteConfirmation() {
    readingToDelete = null;
    deleteModal.classList.remove("active");
}

cancelDeleteButton.addEventListener("click", () => {
    closeDeleteConfirmation();
});

deleteModal.addEventListener("click", event => {
    if (event.target === deleteModal) {
        closeDeleteConfirmation();
    }
});

confirmDeleteButton.addEventListener("click", async () => {
    if (!readingToDelete) {
        return;
    }

    const reading = readingToDelete;

    confirmDeleteButton.disabled = true;

    try {
        await deleteReading(Number(reading.id));

        readings = await getReadings();

        if (Number(idInput.value) === Number(reading.id)) {
            resetForm();
        }

        closeDeleteConfirmation();

        renderReadings();

        showSuccess(MESSAGES.ui.readingDeleted);

    } catch (error) {
        console.error("Error deleting reading:", error);

        closeDeleteConfirmation();

        alert(
            error.message ||
            MESSAGES.ui.readingDeleteFailed
        );

    } finally {
        confirmDeleteButton.disabled = false;
    }
});


// ========================================
// MENSAGEM DE SUCESSO
// ========================================

function showSuccess(message) {
    successMessage.textContent = message;
    successModal.classList.add("active");
}

successButton.addEventListener("click", () => {
    successModal.classList.remove("active");
});


// ========================================
// CONTROLAR CAMPOS POR STATUS
// ========================================

function updateFields() {
    const status = statusSelect.value;

    const completedOrAbandoned =
        status === "Read" ||
        status === "Abandoned";

    yearInput.disabled = !completedOrAbandoned;
    gradeInput.disabled = !completedOrAbandoned;

    // O ano é obrigatório somente quando o status é Read.
    yearInput.required = status === "Read";

    prioritySelect.disabled =
        status !== "Want to read";
}

function handleStatusChange() {
    const newStatus = statusSelect.value;

    const completedOrAbandoned =
        newStatus === "Read" ||
        newStatus === "Abandoned";

    const willLoseYear =
        !completedOrAbandoned &&
        yearInput.value !== "";

    const willLoseGrade =
        !completedOrAbandoned &&
        gradeInput.value !== "";

    const willLosePriority =
        newStatus !== "Want to read" &&
        prioritySelect.value !== "";

    if (willLoseYear || willLoseGrade || willLosePriority) {
        const confirmed = window.confirm(
            MESSAGES.ui.statusClearsFields
        );

        if (!confirmed) {
            statusSelect.value = previousStatus;
            updateFields();
            return;
        }
    }

    if (!completedOrAbandoned) {
        yearInput.value = "";
        gradeInput.value = "";
    }

    if (newStatus !== "Want to read") {
        prioritySelect.value = "";
    }

    previousStatus = newStatus;

    updateFields();
    clearErrors();
}

statusSelect.addEventListener("change", handleStatusChange);


// ========================================
// CARREGAR DADOS
// ========================================

async function loadData() {
    books = await getBooks();
    authors = await getAuthors();
    readings = await getReadings();

    // Ordena os livros alfabeticamente pelo título.
    const sortedBooks = [...books].sort((a, b) =>
        a.title.localeCompare(b.title, "en", {
            sensitivity: "base"
        })
    );

    bookSelect.replaceChildren(
        new Option(MESSAGES.ui.selectBookOption, "")
    );

    sortedBooks.forEach(book => {
        bookSelect.add(
            new Option(book.title, String(book.id))
        );
    });
}

function getAuthorNames(book) {
    const names = (book?.authorIds ?? [])
        .map(id => {
            return authors.find(
                author => Number(author.id) === Number(id)
            )?.name;
        })
        .filter(Boolean);

    return names.join(", ");
}


// ========================================
// LIMPAR FORMULÁRIO
// ========================================

function resetForm() {
    form.reset();

    idInput.value = "";
    formHeading.textContent = "Add New Reading";

    cancelButton.hidden = true;

    previousStatus = statusSelect.value;

    updateFields();
    clearErrors();
}


// ========================================
// EDITAR LEITURA
// ========================================

function editReading(reading) {
    idInput.value = reading.id;

    bookSelect.value = String(reading.bookId);
    statusSelect.value = reading.status;

    previousStatus = reading.status;

    yearInput.value = reading.yearRead ?? "";
    gradeInput.value = reading.grade ?? "";

    recommendedInput.value = reading.recommendedBy ?? "";
    prioritySelect.value = reading.priority ?? "";
    notesInput.value = reading.notes ?? "";

    updateFields();
    clearErrors();

    formHeading.textContent = "Edit Reading";
    cancelButton.hidden = false;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ========================================
// ORDENAÇÃO
// ========================================

function compareValues(a, b) {
    const missingA =
        a === null || a === undefined || a === "";

    const missingB =
        b === null || b === undefined || b === "";

    if (missingA && missingB) return 0;
    if (missingA) return 1;
    if (missingB) return -1;

    if (typeof a === "number" && typeof b === "number") {
        return sortAscending ? a - b : b - a;
    }

    const result = String(a).localeCompare(
        String(b),
        "en",
        { sensitivity: "base" }
    );

    return sortAscending ? result : -result;
}

function getSortValue(reading, book) {
    if (sortField === "title") {
        return book?.title ?? null;
    }

    if (sortField === "authors") {
        return getAuthorNames(book) || null;
    }

    return reading[sortField];
}


// ========================================
// EXIBIR LEITURAS E PESQUISAR
// ========================================

function renderReadings() {
    list.replaceChildren();

    const search = readingSearch.value.trim().toLowerCase();

    const sorted = [...readings].sort((a, b) => {
        const bookA = books.find(
            book => Number(book.id) === Number(a.bookId)
        );

        const bookB = books.find(
            book => Number(book.id) === Number(b.bookId)
        );

        const result = compareValues(
            getSortValue(a, bookA),
            getSortValue(b, bookB)
        );

        return result || Number(a.id) - Number(b.id);
    });

    const filteredReadings = sorted.filter(reading => {
        const book = books.find(
            item => Number(item.id) === Number(reading.bookId)
        );

        const title = (book?.title ?? "").toLowerCase();
        const authorNames = getAuthorNames(book).toLowerCase();

        return (
            title.includes(search) ||
            authorNames.includes(search)
        );
    });

    if (filteredReadings.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 6;

        cell.textContent = search
            ? MESSAGES.ui.readingsNotFound
            : MESSAGES.ui.readingsEmpty;

        row.appendChild(cell);
        list.appendChild(row);

        return;
    }

    filteredReadings.forEach(reading => {
        const book = books.find(
            item => Number(item.id) === Number(reading.bookId)
        );

        const row = document.createElement("tr");

        const values = [
            book?.title ?? "-",
            getAuthorNames(book) || "-",
            reading.status,
            reading.yearRead ?? "-",
            reading.grade ?? "-"
        ];

        values.forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = String(value);
            row.appendChild(cell);
        });

        const actionsCell = document.createElement("td");
        actionsCell.classList.add("reading-actions");

        // BOTÃO EDIT
        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.classList.add("edit-button");
        editButton.innerHTML =
            '<i class="fa-solid fa-pen"></i> Edit';

        editButton.addEventListener("click", () => {
            editReading(reading);
        });

        // BOTÃO DELETE COM MODAL PERSONALIZADO
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.classList.add("delete-button");
        deleteButton.innerHTML =
            '<i class="fa-solid fa-trash"></i> Delete';

        deleteButton.addEventListener("click", () => {
            showDeleteConfirmation(reading, book);
        });

        actionsCell.appendChild(editButton);
        actionsCell.appendChild(deleteButton);

        row.appendChild(actionsCell);
        list.appendChild(row);
    });
}

readingSearch.addEventListener("input", renderReadings);


// ========================================
// BOTÕES DE ORDENAÇÃO
// ========================================

document.querySelectorAll("[data-sort]").forEach(button => {
    button.addEventListener("click", () => {
        const field = button.dataset.sort;

        if (sortField === field) {
            sortAscending = !sortAscending;
        } else {
            sortField = field;
            sortAscending = field !== "yearRead";
        }

        renderReadings();
    });
});


// ========================================
// SALVAR LEITURA
// ========================================

form.addEventListener("submit", async event => {
    event.preventDefault();
    clearErrors();

    const idValue = idInput.value;
    const isEditing = idValue !== "";

    const bookId = Number(bookSelect.value);

    const book = books.find(
        item => Number(item.id) === bookId
    );

    const reading = {
        id: isEditing ? Number(idValue) : null,
        bookId,
        status: statusSelect.value,

        yearRead:
            yearInput.value === ""
                ? null
                : Number(yearInput.value),

        grade:
            gradeInput.value === ""
                ? null
                : Number(gradeInput.value),

        recommendedBy:
            recommendedInput.value.trim() || null,

        priority:
            prioritySelect.value || null,

        notes:
            notesInput.value.trim() || null
    };

    const errors = validateReading(reading, book);

    if (errors.length > 0) {
        showErrors(errors);
        return;
    }

    try {
        await saveReading(reading);

        readings = await getReadings();

        resetForm();
        renderReadings();

        if (isEditing) {
            showSuccess(MESSAGES.ui.readingUpdated);
        } else {
            showSuccess(MESSAGES.ui.readingSaved);
        }

    } catch (error) {
        if (error.errors?.length) {
            showErrors(error.errors);
        } else {
            console.error("Error saving reading:", error);

            alert(
                error.message ||
                MESSAGES.ui.readingSaveFailed
            );
        }
    }
});


// ========================================
// CANCELAR EDIÇÃO
// ========================================

cancelButton.addEventListener("click", resetForm);


// ========================================
// INICIAR PÁGINA
// ========================================

async function start() {
    try {
        await initializeStore();

        await loadData();

        previousStatus = statusSelect.value;

        updateFields();
        renderReadings();

    } catch (error) {
        console.error("Could not initialize Reading Log:", error);

        alert(MESSAGES.ui.readingsLoadFailed);
    }
}

start();