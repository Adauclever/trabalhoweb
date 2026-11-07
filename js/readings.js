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

const errorIds = {
    bookId: "book-error",
    status: "status-error",
    yearRead: "year-error",
    grade: "grade-error",
    priority: "priority-error",
    recommendedBy: "recommended-error",
    notes: "notes-error"
};



// MOSTRA AS MENSAGENS DE ERRO

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



// CONFIRMA SE QUER EXCLUIR A LEITURA

function showDeleteConfirmation(reading, book) {
    readingToDelete = reading;

    deleteMessage.textContent =
        `Are you sure you want to delete the reading of "${book?.title ?? "this book"}"? ` +
        "This action cannot be undone.";

    deleteModal.classList.add("active");
}



// FECHA O MODAL DE EXCLUSÃO

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



// CONFIRMA A EXCLUSÃO DA LEITURA

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

        showSuccess("Reading deleted successfully!");

    } catch (error) {
        console.error("Error deleting reading:", error);

        closeDeleteConfirmation();

        alert(
            error.message ||
            "Could not delete reading."
        );

    } finally {
        confirmDeleteButton.disabled = false;
    }
});



// EXIBE UMA MENSAGEM DE SUCESSO

function showSuccess(message) {
    successMessage.textContent = message;
    successModal.classList.add("active");
}

successButton.addEventListener("click", () => {
    successModal.classList.remove("active");
});



// ATUALIZA OS CAMPOS DE ACORDO COM O STATUS DA LEITURA

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



// CONFIRMA A MUDANÇA DE STATUS DA LEITURA

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
            "Changing the status will clear some fields. " +
            "Do you want to continue?"
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



// CARREGA OS DADOS DOS LIVROS, AUTORES E LEITURAS

async function loadData() {
    books = await getBooks();
    authors = await getAuthors();
    readings = await getReadings();

    const sortedBooks = [...books].sort((a, b) =>
        a.title.localeCompare(b.title, "en", {
            sensitivity: "base"
        })
    );

    bookSelect.replaceChildren(
        new Option("Select a book", "")
    );

    sortedBooks.forEach(book => {
        bookSelect.add(
            new Option(book.title, String(book.id))
        );
    });
}



// BUSCA OS NOMES DOS AUTORES DE UM LIVRO

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



// LIMPA OS DADOS DO FORMULÁRIO

function resetForm() {
    form.reset();

    idInput.value = "";
    formHeading.textContent = "Add New Reading";

    cancelButton.hidden = true;

    previousStatus = statusSelect.value;

    updateFields();
    clearErrors();
}



// PREENCHE O FORMULÁRIO PARA EDITAR UMA LEITURA

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



// COMPARA OS VALORES PARA ORGANIZAR A LISTA

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



// DEFINE O VALOR UTILIZADO NA ORDENAÇÃO

function getSortValue(reading, book) {
    if (sortField === "title") {
        return book?.title ?? null;
    }

    if (sortField === "authors") {
        return getAuthorNames(book) || null;
    }

    return reading[sortField];
}



// EXIBE A LISTA DE LEITURAS CADASTRADAS

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
            ? "No readings found."
            : "No readings registered yet.";

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

        // Botão "Edit"
        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.classList.add("edit-button");
        editButton.innerHTML =
            '<i class="fa-solid fa-pen"></i> Edit';

        editButton.addEventListener("click", () => {
            editReading(reading);
        });

        // Botão "Delete"
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



// PESQUISA AS LEITURAS

readingSearch.addEventListener("input", renderReadings);



// CONTROLA A ORDENAÇÃO DAS LEITURAS

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



// SALVA OU ATUALIZA A LEITURA

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
            showSuccess("Reading updated successfully!");
        } else {
            showSuccess("Reading registered successfully!");
        }

    } catch (error) {
        if (error.errors?.length) {
            showErrors(error.errors);
        } else {
            console.error("Error saving reading:", error);

            alert(
                error.message ||
                "Could not save reading."
            );
        }
    }
});



// CANCELAR A EDIÇÃO

cancelButton.addEventListener("click", resetForm);



// INICIA A PÁGINA

async function start() {
    try {
        await initializeStore();

        await loadData();

        previousStatus = statusSelect.value;

        updateFields();
        renderReadings();

    } catch (error) {
        console.error("Could not initialize Reading Log:", error);

        alert("Could not load reading data.");
    }
}

start();