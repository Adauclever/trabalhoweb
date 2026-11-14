import { MESSAGES } from "./messages.js";
import {
    validateAuthor,
    validateBook,
    validateReading
} from "./validation.js";

import { loadSeedData } from "./seed.js";

const STORAGE_KEY = "readingTrackerData";


// ========================================
// INICIALIZAÇÃO E RESTAURAÇÃO DOS DADOS
// ========================================

// Carrega os dados iniciais somente no primeiro acesso.
export async function initializeStore() {
    if (localStorage.getItem(STORAGE_KEY) !== null) {
        return { loadedFromSeed: false };
    }

    const data = await loadSeedData();

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );

    return { loadedFromSeed: true };
}


// Restaura os dados oficiais.
export async function resetToSeed() {
    const data = await loadSeedData();

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );

    return data;
}


// Cria um backup dos dados atuais.
export async function getDataBackup() {
    const data = getData();

    if (!data) {
        throw new Error(
            MESSAGES.store.noDataToBackup
        );
    }

    return JSON.stringify(data, null, 2);
}


// ========================================
// ACESSO AOS DADOS
// ========================================

function getData() {
    const savedData = localStorage.getItem(STORAGE_KEY);

    return JSON.parse(savedData);
}


// ========================================
// TRATAMENTO DE ERROS
// ========================================

function throwValidationErrors(errors) {
    if (errors.length > 0) {
        throw {
            status: 400,
            message: "Validation failed",
            errors
        };
    }
}


// ========================================
// VALIDAR REFERÊNCIAS DE LIVROS
// ========================================

function validateBookReferences(book, data) {
    const errors = [];

    if (Array.isArray(book.authorIds)) {
        for (const id of book.authorIds) {
            if (
                !data.authors.some(
                    author => Number(author.id) === Number(id)
                )
            ) {
                errors.push({
                    field: "authorIds",
                    message: MESSAGES.store.selectExistingAuthors
                });

                break;
            }
        }
    }

    if (Array.isArray(book.themeIds)) {
        for (const id of book.themeIds) {
            if (
                !data.themes.some(
                    theme => Number(theme.id) === Number(id)
                )
            ) {
                errors.push({
                    field: "themeIds",
                    message: MESSAGES.store.selectExistingThemes
                });

                break;
            }
        }
    }

    return errors;
}


// ========================================
// LIVROS
// ========================================

export async function getBooks() {
    const data = getData();

    return data.books;
}


export async function saveBook(book) {
    const data = getData();

    throwValidationErrors([
        ...validateBook(book),
        ...validateBookReferences(book, data)
    ]);

    const nextId = data.books.reduce(
        (max, item) => Math.max(max, Number(item.id)),
        0
    ) + 1;

    const newBook = {
        ...book,
        id: nextId
    };

    data.books.push(newBook);

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );

    return newBook;
}


// ========================================
// AUTORES
// ========================================

export async function getAuthors() {
    const data = getData();

    return data.authors;
}


// ========================================
// PAÍSES
// ========================================

export async function getCountries() {
    const data = getData();

    return data.countries;
}


// ========================================
// SALVAR AUTOR
// ========================================

export async function saveAuthor(author) {
    const data = getData();

    const cleanAuthor = {
        ...author,
        name: typeof author.name === "string"
            ? author.name.trim()
            : ""
    };

    throwValidationErrors(
        validateAuthor(cleanAuthor)
    );

    if (
        cleanAuthor.countryId != null &&
        !data.countries.some(
            country =>
                Number(country.id) === Number(cleanAuthor.countryId)
        )
    ) {
        throwValidationErrors([{
            field: "countryId",
            message: MESSAGES.store.selectExistingCountry
        }]);
    }

    const duplicate = data.authors.some(item =>
        item.name.trim().toLocaleLowerCase("en-US") ===
            cleanAuthor.name.toLocaleLowerCase("en-US") &&
        Number(item.id) !== Number(cleanAuthor.id)
    );

    if (duplicate) {
        throw {
            status: 409,
            message: MESSAGES.store.authorExists,
            errors: [{
                field: "name",
                message: MESSAGES.store.authorExists
            }]
        };
    }

    if (cleanAuthor.id == null) {
        const nextId = data.authors.reduce(
            (max, item) => Math.max(max, Number(item.id)),
            0
        ) + 1;

        cleanAuthor.id = nextId;

        data.authors.push(cleanAuthor);

    } else {
        const index = data.authors.findIndex(
            item =>
                Number(item.id) === Number(cleanAuthor.id)
        );

        if (index === -1) {
            throw {
                status: 404,
                message: MESSAGES.store.authorNotFound,
                errors: []
            };
        }

        data.authors[index] = cleanAuthor;
    }

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );

    return cleanAuthor;
}


// ========================================
// EXCLUIR AUTOR
// ========================================

export async function deleteAuthor(id) {
    const data = getData();

    const authorId = Number(id);

    // Verifica se o autor existe.
    const authorExists = data.authors.some(
        author => Number(author.id) === authorId
    );

    if (!authorExists) {
        throw { status: 404, message: MESSAGES.store.authorNotFound, errors: [] };
    }

    // Procura todos os livros associados ao autor.
    const associatedBooks = data.books.filter(book =>
        (book.authorIds ?? []).some(
            id => Number(id) === authorId
        )
    );

    // Impede a exclusão caso existam livros associados.
    if (associatedBooks.length > 0) {
        const titles = associatedBooks.map(book => book.title).join(", ");

        throw {
            status: 409,
            message: MESSAGES.store.authorLinked(associatedBooks.length, titles),
            errors: []
        };
    }

    // Remove o autor.
    data.authors = data.authors.filter(
        author => Number(author.id) !== authorId
    );

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );

    return true;
}


// ========================================
// LEITURAS
// ========================================

export async function getReadings() {
    return getData().readings;
}


// ========================================
// SALVAR LEITURA
// ========================================

export async function saveReading(reading) {
    const data = getData();

    const book = data.books.find(
        item => Number(item.id) === Number(reading.bookId)
    );

    throwValidationErrors(
        validateReading(reading, book)
    );

    if (reading.id == null) {
        const nextId = data.readings.reduce(
            (max, item) => Math.max(max, Number(item.id)),
            0
        ) + 1;

        const newReading = {
            ...reading,
            id: nextId
        };

        data.readings.push(newReading);

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(data)
        );

        return newReading;
    }

    const index = data.readings.findIndex(
        item => Number(item.id) === Number(reading.id)
    );

    if (index === -1) {
        throw {
            status: 404,
            message: MESSAGES.store.readingNotFound,
            errors: []
        };
    }

    const updatedReading = {
        ...reading
    };

    data.readings[index] = updatedReading;

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );

    return updatedReading;
}


// ========================================
// EXCLUIR LEITURA
// ========================================

export async function deleteReading(id) {
    const data = getData();

    const readingId = Number(id);

    const exists = data.readings.some(
        reading => Number(reading.id) === readingId
    );

    if (!exists) {
        throw { status: 404, message: MESSAGES.store.readingNotFound, errors: [] };
    }

    data.readings = data.readings.filter(
        reading => Number(reading.id) !== readingId
    );

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );

    return true;
}


// ========================================
// ATUALIZAR LIVRO
// ========================================

export async function updateBook(id, updatedBook) {
    const data = getData();

    const bookId = Number(id);

    const index = data.books.findIndex(
        book => Number(book.id) === bookId
    );

    if (index === -1) {
        throw {
            status: 404,
            message: MESSAGES.store.bookNotFound,
            errors: []
        };
    }

    const book = {
        ...updatedBook,
        id: bookId
    };

    const errors = [
        ...validateBook(book),
        ...validateBookReferences(book, data)
    ];

    // Verifica se a edição tornaria leituras inválidas.
    const linkedReadings = data.readings.filter(
        reading => Number(reading.bookId) === bookId
    );

    for (const reading of linkedReadings) {
        const readingErrors = validateReading(
            reading,
            book
        );

        if (readingErrors.length > 0) {
            errors.push({
                field: "publicationYear",
                message: MESSAGES.store.readingConflict
            });

            break;
        }
    }

    throwValidationErrors(errors);

    data.books[index] = book;

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );

    return book;
}


// ========================================
// EXCLUIR LIVRO
// ========================================

export async function deleteBook(id) {
    const data = getData();

    const bookId = Number(id);

    // Verifica se o livro existe.
    const exists = data.books.some(
        book => Number(book.id) === bookId
    );

    if (!exists) {
        throw { status: 404, message: MESSAGES.store.bookNotFound, errors: [] };
    }

    // Conta as leituras associadas.
    const readingCount = data.readings.filter(
        reading => Number(reading.bookId) === bookId
    ).length;

    // Remove o livro.
    data.books = data.books.filter(
        book => Number(book.id) !== bookId
    );

    // Remove também as leituras associadas.
    data.readings = data.readings.filter(
        reading => Number(reading.bookId) !== bookId
    );

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );

    return readingCount;
}


// ========================================
// TEMAS
// ========================================

export async function getThemes() {
    return getData().themes;
}


// ========================================
// CRIAR TEMA
// ========================================

export async function saveTheme(name) {
    const data = getData();

    const cleanName = name.trim();

    if (cleanName === "") {
        throw {
            status: 400,
            message: "Validation failed",
            errors: [{
                field: "name",
                message: MESSAGES.store.themeRequired
            }]
        };
    }

    // Impede nomes duplicados.
    const duplicate = data.themes.find(theme =>
        theme.name.trim().toLocaleLowerCase("en-US") ===
        cleanName.toLocaleLowerCase("en-US")
    );

    if (duplicate) {
        throw {
            status: 409,
            message: MESSAGES.store.themeExistsShort,
            errors: [{
                field: "name",
                message: MESSAGES.store.themeExists
            }]
        };
    }

    // Gera o próximo ID.
    const nextId = data.themes.reduce(
        (max, theme) => Math.max(max, Number(theme.id)),
        0
    ) + 1;

    const newTheme = {
        id: nextId,
        name: cleanName
    };

    data.themes.push(newTheme);

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );

    return newTheme;
}


// ========================================
// CRIAR LIVRO COM PRIMEIRA LEITURA
// ========================================

export async function createBookWithReading(book, firstReading) {
    const data = getData();

    // 1. Valida o livro.
    const bookErrors = [
        ...validateBook(book),
        ...validateBookReferences(book, data)
    ];

    if (bookErrors.length > 0) {
        throw {
            status: 400,
            message: "Validation failed",
            errors: bookErrors
        };
    }

    // 2. Confere autores e temas existentes.
    const validAuthors = (book.authorIds ?? []).every(id =>
        data.authors.some(
            author => Number(author.id) === Number(id)
        )
    );

    const validThemes = (book.themeIds ?? []).every(id =>
        data.themes.some(
            theme => Number(theme.id) === Number(id)
        )
    );

    if (!validAuthors || !validThemes) {
        throw {
            status: 400,
            message: MESSAGES.store.invalidAuthorOrTheme,
            errors: []
        };
    }

    // 3. Calcula o próximo ID do livro.
    const nextBookId = data.books.reduce(
        (max, item) => Math.max(max, Number(item.id)),
        0
    ) + 1;

    const newBook = {
        ...book,
        id: nextBookId
    };

    let newReading = null;

    // 4. Prepara a primeira leitura, quando solicitada.
    if (firstReading !== null) {
        const nextReadingId = data.readings.reduce(
            (max, item) => Math.max(max, Number(item.id)),
            0
        ) + 1;

        newReading = {
            ...firstReading,
            id: nextReadingId,
            bookId: nextBookId
        };

        // 5. Valida a leitura antes de salvar.
        const readingErrors = validateReading(
            newReading,
            newBook
        );

        if (readingErrors.length > 0) {
            throw {
                status: 400,
                message: "Validation failed",
                errors: readingErrors
            };
        }
    }

    // 6. Salva os registros.
    data.books.push(newBook);

    if (newReading !== null) {
        data.readings.push(newReading);
    }

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );

    return {
        book: newBook,
        reading: newReading
    };
}