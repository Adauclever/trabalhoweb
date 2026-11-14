import { MESSAGES } from "./messages.js";
import {
    initializeStore,
    getAuthors,
    getCountries,
    saveAuthor,
    deleteAuthor
} from "./store.js";

import { validateAuthor } from "./validation.js";

const form = document.getElementById("author-form");
const authorsList = document.getElementById("authors-list");
const countrySelect = document.getElementById("author-country");
const cancelButton = document.getElementById("cancel-edit");
const authorSearch = document.getElementById("author-search");

const authorIdInput = document.getElementById("author-id");
const authorNameInput = document.getElementById("author-name");
const birthDateInput = document.getElementById("birth-date");
const deathDateInput = document.getElementById("death-date");
const formHeading = document.getElementById("form-heading");

const successModal = document.getElementById("success-modal");
const successMessage = document.getElementById("success-message");
const successButton = document.getElementById("success-button");

const deleteModal = document.getElementById("delete-modal");
const deleteMessage = document.getElementById("delete-message");
const deleteTitle = deleteModal.querySelector("h2");

const cancelDeleteButton = document.getElementById("cancel-delete");
const confirmDeleteButton = document.getElementById("confirm-delete");

let authorToDelete = null;


// ========================================
// CARREGAR PAÍSES
// ========================================

async function loadCountries() {
    const countries = await getCountries();

    countrySelect.replaceChildren(
        new Option(MESSAGES.ui.unknown, "")
    );

    countries.forEach(country => {
        countrySelect.add(
            new Option(country.name, String(country.id))
        );
    });
}


// ========================================
// MENSAGENS DE ERRO
// ========================================

function clearErrors() {
    document.querySelectorAll(".field-error").forEach(element => {
        element.textContent = "";
    });
}

function showErrors(errors) {
    clearErrors();

    const fieldIds = {
    name: "name-error",
    countryId: "country-error",
    birthDate: "birth-error",
    deathDate: "death-error"
};

    errors.forEach(error => {
        const fieldId = fieldIds[error.field];

        if (fieldId) {
            document.getElementById(fieldId).textContent =
                error.message;
        } else {
            alert(error.message);
        }
    });
}


// ========================================
// LIMPAR FORMULÁRIO
// ========================================

function resetForm() {
    form.reset();

    authorIdInput.value = "";
    formHeading.textContent = "Add New Author";

    cancelButton.hidden = true;

    clearErrors();
}


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
// CONFIRMAÇÃO DE EXCLUSÃO
// ========================================

function showDeleteConfirmation(author) {
    authorToDelete = author;

    deleteTitle.textContent = "Delete Author?";

    deleteMessage.textContent =
        MESSAGES.ui.confirmDeleteAuthor(author.name);

    confirmDeleteButton.hidden = false;
    confirmDeleteButton.disabled = false;

    cancelDeleteButton.textContent = "Cancel";

    deleteModal.classList.add("active");
}


// ========================================
// MOSTRAR LIVROS ASSOCIADOS
// ========================================

function showAssociatedBooks(message) {
    deleteTitle.textContent = MESSAGES.ui.cannotDeleteAuthor;

    deleteMessage.textContent =
        message + "\n\n" + MESSAGES.ui.removeAuthorFirst;

    // Hide the delete button; Cancel becomes Close
    confirmDeleteButton.hidden = true;
    cancelDeleteButton.textContent = "Close";

    deleteModal.classList.add("active");
}


// ========================================
// FECHAR MODAL DE EXCLUSÃO
// ========================================

function closeDeleteConfirmation() {
    authorToDelete = null;

    deleteModal.classList.remove("active");

    // Restaura o modal original
    deleteTitle.textContent = "Delete Author?";

    confirmDeleteButton.hidden = false;
    confirmDeleteButton.disabled = false;

    cancelDeleteButton.textContent = "Cancel";
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


// ========================================
// CONFIRMAR EXCLUSÃO
// ========================================

confirmDeleteButton.addEventListener("click", async () => {
    if (!authorToDelete) return;

    const author = authorToDelete;

    confirmDeleteButton.disabled = true;

    try {
        await deleteAuthor(author.id);

        closeDeleteConfirmation();

        if (authorIdInput.value === String(author.id)) {
            resetForm();
        }

        await renderAuthors();

        showSuccess(MESSAGES.ui.authorDeleted);

    } catch (error) {

        // Verifica se existem livros associados
        if (error.status === 409) {
            showAssociatedBooks(error.message);
            return;
        }

        closeDeleteConfirmation();

        alert(
            error.message ||
            MESSAGES.ui.authorDeleteFailed
        );

    } finally {
        confirmDeleteButton.disabled = false;
    }
});


// ========================================
// EDITAR AUTOR
// ========================================

function editAuthor(author) {
    authorIdInput.value = author.id;
    authorNameInput.value = author.name;

    countrySelect.value = author.countryId ?? "";

    birthDateInput.value = author.birthDate ?? "";
    deathDateInput.value = author.deathDate ?? "";

    formHeading.textContent = "Edit Author";

    cancelButton.hidden = false;

    clearErrors();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ========================================
// EXIBIR AUTORES
// ========================================

async function renderAuthors() {
    const authors = await getAuthors();
    const countries = await getCountries();

    const search = authorSearch.value.trim().toLowerCase();

    const filteredAuthors = authors.filter(author =>
        author.name.toLowerCase().includes(search)
    );

    authorsList.replaceChildren();

    if (filteredAuthors.length === 0) {
        const message = document.createElement("p");

        message.textContent = search
            ? MESSAGES.ui.authorsNotFound
            : MESSAGES.ui.authorsEmpty;

        authorsList.appendChild(message);

        return;
    }

    filteredAuthors.forEach(author => {
        const item = document.createElement("div");
        item.className = "author-item";

        // Informações do autor
        const info = document.createElement("div");

        const name = document.createElement("strong");
        name.textContent = author.name;

        const nationality = document.createElement("p");

        const country = countries.find(
            item => Number(item.id) === Number(author.countryId)
        );

        nationality.textContent =
            country ? country.name : MESSAGES.ui.unknown;

        info.append(name, nationality);

        // Botões
        const actions = document.createElement("div");
        actions.className = "author-actions";

        // Botão Edit
        const editButton = document.createElement("button");

        editButton.type = "button";
        editButton.className = "edit-button";

        editButton.innerHTML =
            '<i class="fa-solid fa-pen"></i> Edit';

        editButton.addEventListener("click", () => {
            editAuthor(author);
        });

        // Botão Delete
        const deleteButton = document.createElement("button");

        deleteButton.type = "button";
        deleteButton.className = "delete-button";

        deleteButton.innerHTML =
            '<i class="fa-solid fa-trash"></i> Delete';

        deleteButton.addEventListener("click", () => {
            showDeleteConfirmation(author);
        });

        actions.append(editButton, deleteButton);

        item.append(info, actions);

        authorsList.appendChild(item);
    });
}


// ========================================
// PESQUISAR AUTORES
// ========================================

authorSearch.addEventListener("input", renderAuthors);


// ========================================
// SALVAR AUTOR
// ========================================

form.addEventListener("submit", async event => {
    event.preventDefault();

    clearErrors();

    const idValue = authorIdInput.value.trim();

    const isEditing = idValue !== "";

    const author = {
        id: isEditing ? Number(idValue) : null,

        name: authorNameInput.value.trim(),

        countryId:
            countrySelect.value === ""
                ? null
                : Number(countrySelect.value),

        birthDate: birthDateInput.value || null,

        deathDate: deathDateInput.value || null
    };

    const errors = validateAuthor(author);

    if (errors.length > 0) {
        showErrors(errors);
        return;
    }

    try {
        await saveAuthor(author);

        resetForm();

        await renderAuthors();

        if (isEditing) {
            showSuccess(MESSAGES.ui.authorUpdated);
        } else {
            showSuccess(MESSAGES.ui.authorSaved);
        }

    } catch (error) {
        if (error.errors?.length > 0) {
            showErrors(error.errors);
        } else {
            alert(
                error.message ||
                MESSAGES.ui.authorSaveFailed
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

        await loadCountries();

        await renderAuthors();

    } catch (error) {
        console.error("Could not initialize Authors:", error);

        alert(MESSAGES.ui.authorsLoadFailed);
    }
}

start();