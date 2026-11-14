import { MESSAGES } from "./messages.js";
import {
    initializeStore,
    getBooks,
    getAuthors,
    getReadings,
    getThemes,
    updateBook,
    deleteBook,
    saveTheme,
    createBookWithReading
} from "./store.js";

import { validateBook } from "./validation.js";

// ========================================
// ELEMENTOS DO FORMULÁRIO
// ========================================

const form = document.getElementById("book-form");
const booksList = document.getElementById("books-list");

const idInput = document.getElementById("book-id");
const titleInput = document.getElementById("title");
const yearInput = document.getElementById("publicationYear");

const authorsSelect = document.getElementById("authors");
const authorSearch = document.getElementById("author-search");
const bookSearch = document.getElementById("book-search");
const themesSelect = document.getElementById("themes");

const formSelect = document.getElementById("form");
const modeSelect = document.getElementById("mode");
const contentSelect = document.getElementById("content");

const cancelButton =
    document.getElementById("cancel-book-edit");

const formHeading =
    document.getElementById("book-form-heading");

// ========================================
// NOTIFICAÇÃO DE SUCESSO
// ========================================

const successModal =
    document.getElementById("success-modal");

const successMessage =
    document.getElementById("success-message");

const successButton =
    document.getElementById("success-button");

function showSuccess(message) {
    successMessage.textContent = message;

    successModal.classList.add("active");
}

successButton.addEventListener("click", () => {
    successModal.classList.remove("active");
});

// ========================================
// ELEMENTOS DO MODAL DE EXCLUSÃO
// ========================================

const deleteModal =
    document.getElementById("delete-modal");

const deleteMessage =
    document.getElementById("delete-message");

const cancelDeleteButton =
    document.getElementById("cancel-delete");

const confirmDeleteButton =
    document.getElementById("confirm-delete");

let bookToDelete = null;

// ========================================
// CONFIRMAÇÃO DE EXCLUSÃO
// ========================================

function showDeleteConfirmation(book, readingsCount) {
    bookToDelete = book;

    deleteMessage.textContent =
        MESSAGES.ui.confirmDeleteBook(book.title, readingsCount);

    deleteModal.classList.add("active");
}

function closeDeleteConfirmation() {
    bookToDelete = null;

    deleteModal.classList.remove("active");
}

cancelDeleteButton.addEventListener(
    "click",
    closeDeleteConfirmation
);

deleteModal.addEventListener("click", event => {
    if (event.target === deleteModal) {
        closeDeleteConfirmation();
    }
});

confirmDeleteButton.addEventListener("click", async () => {
    if (!bookToDelete) return;

    const book = bookToDelete;

    confirmDeleteButton.disabled = true;

    try {
        await deleteBook(book.id);

        closeDeleteConfirmation();

        // Limpa o formulário caso o livro excluído
        // esteja sendo editado.
        if (idInput.value === String(book.id)) {
            resetForm();
        }

        await renderBooks();

        showSuccess(MESSAGES.ui.bookDeleted);

    } catch (error) {
        closeDeleteConfirmation();

        alert(
            error.message ||
            MESSAGES.ui.bookDeleteFailed
        );

    } finally {
        confirmDeleteButton.disabled = false;
    }
});

// ========================================
// ELEMENTOS DOS TEMAS
// ========================================

const newThemeInput =
    document.getElementById("new-theme");

const addThemeButton =
    document.getElementById("add-theme-button");

const themeError =
    document.getElementById("theme-error");

// ========================================
// ELEMENTOS DA PRIMEIRA LEITURA
// ========================================

const firstReadingSection =
    document.getElementById("first-reading-section");

const addFirstReading =
    document.getElementById("add-first-reading");

const firstReadingFields =
    document.getElementById("first-reading-fields");

const firstStatus =
    document.getElementById("first-status");

const firstYear =
    document.getElementById("first-year");

const firstGrade =
    document.getElementById("first-grade");

const firstPriority =
    document.getElementById("first-priority");

const firstRecommended =
    document.getElementById("first-recommended");

const firstNotes =
    document.getElementById("first-notes");

// ========================================
// MENSAGENS DE ERRO
// ========================================

const bookErrorIds = {
    title: "title-error",
    publicationYear: "publicationYear-error",
    authorIds: "authors-error",
    themeIds: "themes-error",
    form: "form-error",
    mode: "mode-error",
    content: "content-error",
    status: "first-status-error",
    yearRead: "first-year-error",
    grade: "first-grade-error",
    priority: "first-priority-error"
};

function clearBookErrors() {
    Object.values(bookErrorIds).forEach(id => {
        const element = document.getElementById(id);

        if (element) {
            element.textContent = "";
        }
    });

    themeError.textContent = "";
}

function showBookErrors(errors) {
    clearBookErrors();

    const generalMessages = [];

    errors.forEach(error => {
        const elementId = bookErrorIds[error.field];

        const element = elementId
            ? document.getElementById(elementId)
            : null;

        if (element) {
            element.textContent = error.message;
        } else {
            generalMessages.push(error.message);
        }
    });

    if (generalMessages.length > 0) {
        alert(generalMessages.join("\n"));
    }
}

// ========================================
// CARREGAR AUTORES
// ========================================

async function loadAuthors() {
    const authors = await getAuthors();

    // Ordena os autores alfabeticamente pelo nome.
    const sortedAuthors = [...authors].sort((a, b) =>
        a.name.localeCompare(b.name, "en", {
            sensitivity: "base"
        })
    );

    authorsSelect.replaceChildren();

    sortedAuthors.forEach(author => {
        const option = new Option(
            author.name,
            String(author.id)
        );

        authorsSelect.add(option);
    });
}

// PESQUISAR AUTORES

authorSearch.addEventListener("input", () => {
    const search = authorSearch.value.toLowerCase().trim();

    Array.from(authorsSelect.options).forEach(option => {
        option.hidden = !option.textContent
            .toLowerCase()
            .includes(search);
    });
});

// ========================================
// CARREGAR TEMAS
// ========================================

async function loadThemes(selectedIds = []) {
    const themes = await getThemes();

    themesSelect.replaceChildren();

    themes.forEach(theme => {
        const option = new Option(
            theme.name,
            String(theme.id)
        );

        option.selected = selectedIds.some(
            id => Number(id) === Number(theme.id)
        );

        themesSelect.add(option);
    });
}

// ========================================
// CRIAR NOVO TEMA
// ========================================

addThemeButton.addEventListener("click", async () => {
    themeError.textContent = "";

    const name = newThemeInput.value.trim();

    try {
        const selectedIds = Array.from(
            themesSelect.selectedOptions
        ).map(option => Number(option.value));

        const newTheme = await saveTheme(name);

        selectedIds.push(Number(newTheme.id));

        await loadThemes(selectedIds);

        newThemeInput.value = "";
        newThemeInput.focus();

    } catch (error) {
        themeError.textContent =
            error.errors?.[0]?.message ||
            error.message ||
            MESSAGES.ui.themeCreateFailed;
    }
});

// ========================================
// CONTROLE DA PRIMEIRA LEITURA
// ========================================

let previousFirstStatus = "Want to read";

function updateFirstReadingFields() {
    const enabled = addFirstReading.checked;

    firstReadingFields.hidden = !enabled;

    const status = firstStatus.value;

    const completedOrAbandoned =
        status === "Read" ||
        status === "Abandoned";

    firstYear.disabled =
        !enabled || !completedOrAbandoned;

    firstGrade.disabled =
        !enabled || !completedOrAbandoned;

    firstPriority.disabled =
        !enabled || status !== "Want to read";
}

// ========================================
// CONFIRMAÇÃO DE MUDANÇA DE STATUS
// ========================================

function handleFirstStatusChange() {
    const newStatus = firstStatus.value;

    const completedOrAbandoned =
        newStatus === "Read" ||
        newStatus === "Abandoned";

    const willLoseYear =
        !completedOrAbandoned &&
        firstYear.value !== "";

    const willLoseGrade =
        !completedOrAbandoned &&
        firstGrade.value !== "";

    const willLosePriority =
        newStatus !== "Want to read" &&
        firstPriority.value !== "";

    if (
        willLoseYear ||
        willLoseGrade ||
        willLosePriority
    ) {
        const confirmed = confirm(
            MESSAGES.ui.statusClearsFields
        );

        if (!confirmed) {
            firstStatus.value = previousFirstStatus;
            updateFirstReadingFields();
            return;
        }
    }

    if (!completedOrAbandoned) {
        firstYear.value = "";
        firstGrade.value = "";
    }

    if (newStatus !== "Want to read") {
        firstPriority.value = "";
    }

    previousFirstStatus = newStatus;

    updateFirstReadingFields();
    clearBookErrors();
}

// ========================================
// EVENTOS DA PRIMEIRA LEITURA
// ========================================

addFirstReading.addEventListener(
    "change",
    updateFirstReadingFields
);

firstStatus.addEventListener(
    "change",
    handleFirstStatusChange
);

// ========================================
// COLETAR DADOS DA PRIMEIRA LEITURA
// ========================================

function collectFirstReading() {
    if (!addFirstReading.checked) {
        return null;
    }

    return {
        status: firstStatus.value,

        yearRead:
            firstYear.value === ""
                ? null
                : Number(firstYear.value),

        grade:
            firstGrade.value === ""
                ? null
                : Number(firstGrade.value),

        recommendedBy:
            firstRecommended.value.trim() || null,

        priority:
            firstPriority.value || null,

        notes:
            firstNotes.value.trim() || null
    };
}

// ========================================
// LIMPAR FORMULÁRIO
// ========================================

function resetForm() {
    form.reset();

    idInput.value = "";

    formHeading.textContent = "Add New Book";

    cancelButton.hidden = true;

    newThemeInput.value = "";

    firstReadingSection.hidden = false;

    addFirstReading.checked = false;

    previousFirstStatus = firstStatus.value;

    clearBookErrors();
    updateFirstReadingFields();
}

// ========================================
// EDITAR LIVRO
// ========================================

function editBook(book) {
    clearBookErrors();

    newThemeInput.value = "";

    idInput.value = book.id;

    titleInput.value = book.title;

    yearInput.value =
        book.publicationYear ?? "";

    formSelect.value =
        book.form ?? "";

    modeSelect.value =
        book.mode ?? "";

    contentSelect.value =
        book.content ?? "";

    Array.from(authorsSelect.options).forEach(option => {
        option.selected = (
            book.authorIds ?? []
        ).some(id => Number(id) === Number(option.value));
    });

    Array.from(themesSelect.options).forEach(option => {
        option.selected = (
            book.themeIds ?? []
        ).some(id => Number(id) === Number(option.value));
    });

    firstReadingSection.hidden = true;

    addFirstReading.checked = false;

    firstStatus.value = "Want to read";
    firstYear.value = "";
    firstGrade.value = "";
    firstPriority.value = "";
    firstRecommended.value = "";
    firstNotes.value = "";

    previousFirstStatus = firstStatus.value;

    updateFirstReadingFields();

    formHeading.textContent = "Edit Book";

    cancelButton.hidden = false;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    titleInput.focus();
}

// ========================================
// MOSTRAR LIVROS CADASTRADOS
// ========================================

async function renderBooks() {
    const books = await getBooks();
    const authors = await getAuthors();
    const themes = await getThemes();

    booksList.replaceChildren();

    const search = bookSearch.value.toLowerCase().trim();

    const filteredBooks = books.filter(book => {
        const titleMatches = book.title
            .toLowerCase()
            .includes(search);

        const authorMatches = (book.authorIds ?? [])
            .some(id => {
                const author = authors.find(
                    item => Number(item.id) === Number(id)
                );

                return author?.name
                    .toLowerCase()
                    .includes(search);
            });

        return titleMatches || authorMatches;
    });

    if (filteredBooks.length === 0) {
        const message = document.createElement("p");

        message.textContent = search
            ? MESSAGES.ui.booksNotFound
            : MESSAGES.ui.booksEmpty;

        booksList.appendChild(message);

        return;
    }

    filteredBooks.forEach(book => {
        const item = document.createElement("div");

        item.className = "book-item";

        const information =
            document.createElement("div");

        const title = document.createElement("strong");

        title.textContent = book.title;

        const year = document.createElement("p");

        year.textContent =
            "Publication year: " +
            (book.publicationYear ?? "-");

        const authorNames = (book.authorIds ?? [])
            .map(id => {
                const author = authors.find(
                    item => Number(item.id) === Number(id)
                );

                return author?.name;
            })
            .filter(Boolean);

        const authorText =
            document.createElement("p");

        authorText.textContent =
            "Authors: " +
            (
                authorNames.length > 0
                    ? authorNames.join(", ")
                    : "-"
            );

        const themeNames = (book.themeIds ?? [])
            .map(id => {
                const theme = themes.find(
                    item => Number(item.id) === Number(id)
                );

                return theme?.name;
            })
            .filter(Boolean);

        const themeText =
            document.createElement("p");

        themeText.textContent =
            "Themes: " +
            (
                themeNames.length > 0
                    ? themeNames.join(", ")
                    : "-"
            );

        information.append(
            title,
            year,
            authorText,
            themeText
        );

        const actions =
            document.createElement("div");

        actions.className = "book-actions";

        // Botão Edit
        const editButton =
            document.createElement("button");

        editButton.type = "button";
        editButton.className = "edit-button";

        editButton.innerHTML =
            '<i class="fa-solid fa-pen"></i> Edit';

        editButton.addEventListener("click", () => {
            editBook(book);
        });

        // Botão Delete
        const deleteButton =
            document.createElement("button");

        deleteButton.type = "button";
        deleteButton.className = "delete-button";

        deleteButton.innerHTML =
            '<i class="fa-solid fa-trash"></i> Delete';

        deleteButton.addEventListener("click", async () => {
            try {
                const readings = await getReadings();

                const count = readings.filter(
                    reading =>
                        Number(reading.bookId) === Number(book.id)
                ).length;

                showDeleteConfirmation(book, count);

            } catch (error) {
                alert(
                    error.message ||
                    MESSAGES.ui.bookDeletePrepareFailed
                );
            }
        });

        actions.append(
            editButton,
            deleteButton
        );

        item.append(
            information,
            actions
        );

        booksList.appendChild(item);
    });
}

// ========================================
// ATUALIZAR A LISTA ENQUANTO DIGITA
// ========================================

bookSearch.addEventListener("input", renderBooks);

// ========================================
// COLETAR DADOS DO LIVRO
// ========================================

function collectBook() {
    const selectedAuthors = Array.from(
        authorsSelect.selectedOptions
    ).map(option => Number(option.value));

    const selectedThemes = Array.from(
        themesSelect.selectedOptions
    ).map(option => Number(option.value));

    return {
        title: titleInput.value.trim(),

        authorIds: selectedAuthors,

        publicationYear:
            yearInput.value === ""
                ? null
                : Number(yearInput.value),

        form:
            formSelect.value || null,

        mode:
            modeSelect.value || null,

        content:
            contentSelect.value || null,

        themeIds: selectedThemes
    };
}

// ========================================
// SALVAR LIVRO
// ========================================

form.addEventListener("submit", async event => {
    event.preventDefault();

    clearBookErrors();

    const book = collectBook();

    const errors = validateBook(book);

    if (errors.length > 0) {
        showBookErrors(errors);
        return;
    }

    try {
        const isNewBook = idInput.value === "";

        if (isNewBook) {
            const firstReading = collectFirstReading();

            await createBookWithReading(
                book,
                firstReading
            );

        } else {
            await updateBook(
                Number(idInput.value),
                book
            );
        }

        resetForm();

        await renderBooks();

        if (isNewBook) {
            showSuccess(MESSAGES.ui.bookSaved);
        } else {
            showSuccess(MESSAGES.ui.bookUpdated);
        }

    } catch (error) {
        if (error.errors?.length) {
            showBookErrors(error.errors);

        } else {
            alert(
                error.message ||
                MESSAGES.ui.bookSaveFailed
            );
        }
    }
});

// ========================================
// CANCELAR EDIÇÃO
// ========================================

cancelButton.addEventListener(
    "click",
    resetForm
);

// ========================================
// INICIAR A PÁGINA
// ========================================

async function start() {
    try {
        await initializeStore();

        await loadAuthors();

        await loadThemes();

        previousFirstStatus = firstStatus.value;

        updateFirstReadingFields();

        await renderBooks();

    } catch (error) {
        console.error(
            "Could not initialize Books page:",
            error
        );

        alert(MESSAGES.ui.booksLoadFailed);
    }
}

start();