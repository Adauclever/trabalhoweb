import {
    validateAuthor,
    validateBook,
    validateReading
} from "./validation.js";

import { loadSeedData } from "./seed.js";

const STORAGE_KEY = "readingTrackerData";

// Load on first use, preserving existing browser data on later visits.
export async function initializeStore() {
    if (localStorage.getItem(STORAGE_KEY) !== null) {
        return { loadedFromSeed: false };
    }

    // Fetch and validate before changing localStorage.
    const data = await loadSeedData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return { loadedFromSeed: true };
}

// Restore the official data only after the user confirms in the interface.
export async function resetToSeed() {
    // If loading fails, the user's existing data remains untouched.
    const data = await loadSeedData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return data;
}

// Export a copy of current data before a destructive reset.
export async function getDataBackup() {
    const data = getData();
    if (!data) throw new Error("No application data is available to back up.");
    return JSON.stringify(data, null, 2);
}

// Recupera os dados salvos
function getData() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    return JSON.parse(savedData);
}


function throwValidationErrors(errors) {
    if (errors.length > 0) {
        throw {
            status: 400,
            message: "Validation failed",
            errors
        };
    }
}

function validateBookReferences(book, data) {
    const errors = [];

    if (Array.isArray(book.authorIds)) {
        for (const id of book.authorIds) {
            if (!data.authors.some(author => author.id === id)) {
                errors.push({
                    field: "authorIds",
                    message: "Select existing authors."
                });
                break;
            }
        }
    }

    if (Array.isArray(book.themeIds)) {
        for (const id of book.themeIds) {
            if (!data.themes.some(theme => theme.id === id)) {
                errors.push({
                    field: "themeIds",
                    message: "Select existing themes."
                });
                break;
            }
        }
    }

    return errors;
}

// Retorna todos os livros
export async function getBooks() {
    const data = getData();
    return data.books;
}

// Salva um novo livro

export async function saveBook(book) {
    const data = getData();

    throwValidationErrors([
        ...validateBook(book),
        ...validateBookReferences(book, data)
    ]);

    const nextId = data.books.reduce(
        (max, item) => Math.max(max, item.id),
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



// Retorna todos os autores
export async function getAuthors() {
    const data = getData();
    return data.authors;
}

// Retorna os países disponíveis
export async function getCountries() {
    const data = getData();
    return data.countries;
}

// Cria ou atualiza um autor

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
            country => country.id === cleanAuthor.countryId
        )
    ) {
        throwValidationErrors([{
            field: "countryId",
            message: "Select an existing country."
        }]);
    }

    const duplicate = data.authors.some(item =>
        item.name.trim().toLocaleLowerCase("en-US") ===
            cleanAuthor.name.toLocaleLowerCase("en-US") &&
        item.id !== cleanAuthor.id
    );

    if (duplicate) {
        throw {
            status: 409,
            message: "Author name already exists.",
            errors: [{
                field: "name",
                message: "Author name already exists."
            }]
        };
    }

    if (cleanAuthor.id == null) {
        const nextId = data.authors.reduce(
            (max, item) => Math.max(max, item.id),
            0
        ) + 1;

        cleanAuthor.id = nextId;
        data.authors.push(cleanAuthor);

    } else {
        const index = data.authors.findIndex(
            item => item.id === cleanAuthor.id
        );

        if (index === -1) {
            throw {
                status: 404,
                message: "Author not found.",
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

// Exclui um autor e Impede a exclusão de autores associados a livros
export async function deleteAuthor(id) {
    const data = getData();

    const authorId = Number(id);

    // Verifica se o autor existe
    const authorExists = data.authors.some(
        author => Number(author.id) === authorId
    );

    if (!authorExists) {
        throw new Error("Author not found.");
    }

    // Procura os livros associados ao autor
    const associatedBooks = data.books.filter(book =>
        (book.authorIds || []).some(
            id => Number(id) === authorId
        )
    );

    // Impede a exclusão caso existam livros associados
    if (associatedBooks.length > 0) {
        const error = new Error(
            "This author cannot be deleted because they are associated with books."
        );

        error.books = associatedBooks.map(book => book.title);

        throw error;
    }

    // Remove o autor somente se não houver associações
    data.authors = data.authors.filter(
        author => Number(author.id) !== authorId
    );

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );

    return true;
}

export async function getReadings() {
    return getData().readings;
}


export async function saveReading(reading) {
    const data = getData();

    const book = data.books.find(
        item => item.id === reading.bookId
    );

    throwValidationErrors(
        validateReading(reading, book)
    );

    if (reading.id == null) {
        const nextId = data.readings.reduce(
            (max, item) => Math.max(max, item.id),
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
        item => item.id === reading.id
    );

    if (index === -1) {
        throw {
            status: 404,
            message: "Reading not found.",
            errors: []
        };
    }

    const updatedReading = { ...reading };

    data.readings[index] = updatedReading;

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );
    return updatedReading;
}


export async function deleteReading(id) {
    const data = getData();

    const readingId = Number(id);

    const exists = data.readings.some(
        reading => Number(reading.id) === readingId
    );

    if (!exists) {
        throw new Error("Reading not found.");
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



export async function updateBook(id, updatedBook) {
    const data = getData();

    const index = data.books.findIndex(
        book => book.id === id
    );

    if (index === -1) {
        throw {
            status: 404,
            message: "Book not found.",
            errors: []
        };
    }

    const book = {
        ...updatedBook,
        id
    };

    const errors = [
        ...validateBook(book),
        ...validateBookReferences(book, data)
    ];

    // Verifica se a edição tornaria leituras inválidas.
    const linkedReadings = data.readings.filter(
        reading => reading.bookId === id
    );

    for (const reading of linkedReadings) {
        const readingErrors = validateReading(
            reading,
            book
        );

        if (readingErrors.length > 0) {
            errors.push({
                field: "publicationYear",
                message:
                    "This change conflicts with an existing reading. " +
                    "Check its year and the book's publication year."
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


export async function deleteBook(id) {
    const data = getData();

    const exists = data.books.some(
        book => book.id === id
    );

    if (!exists) {
        throw {
            status: 404,
            message: "Book not found.",
            errors: []
        };
    }

    const readingCount = data.readings.filter(
        reading => reading.bookId === id
    ).length;

    data.books = data.books.filter(
        book => book.id !== id
    );

    // Exclui também as leituras associadas
    data.readings = data.readings.filter(
        reading => reading.bookId !== id
    );

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );

    return readingCount;
}


// Retorna todos os temas
export async function getThemes() {
    return getData().themes;
}

// Cria um novo tema
export async function saveTheme(name) {
    const data = getData();

    const cleanName = name.trim();

    if (cleanName === "") {
        throw {
            status: 400,
            message: "Validation failed",
            errors: [{
                field: "name",
                message: "Theme name is required."
            }]
        };
    }

    // Impede nomes duplicados
    const duplicate = data.themes.find(theme =>
        theme.name.trim().toLocaleLowerCase("en-US") ===
        cleanName.toLocaleLowerCase("en-US")
    );

    if (duplicate) {
        throw {
            status: 409,
            message: "Theme already exists.",
            errors: [{
                field: "name",
                message: "A theme with this name already exists."
            }]
        };
    }

    // Gera um ID maior que todos os existentes
    const nextId = data.themes.reduce(
        (max, theme) => Math.max(max, theme.id),
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

export async function createBookWithReading(book, firstReading) {
    const data = getData();

    // 1. Valida o livro
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

    // 2. Confere autores e temas existentes
    const validAuthors = (book.authorIds ?? []).every(id =>
        data.authors.some(author => author.id === id)
    );

    const validThemes = (book.themeIds ?? []).every(id =>
        data.themes.some(theme => theme.id === id)
    );

    if (!validAuthors || !validThemes) {
        throw {
            status: 400,
            message: "Invalid author or theme selection.",
            errors: []
        };
    }

    // 3. Calcula o próximo ID do livro
    const nextBookId = data.books.reduce(
        (max, item) => Math.max(max, item.id),
        0
    ) + 1;

    const newBook = {
        ...book,
        id: nextBookId
    };

    let newReading = null;

    // 4. Prepara a primeira leitura, quando solicitada
    if (firstReading !== null) {
        const nextReadingId = data.readings.reduce(
            (max, item) => Math.max(max, item.id),
            0
        ) + 1;

        newReading = {
            ...firstReading,
            id: nextReadingId,
            bookId: nextBookId
        };

        // 5. Valida a leitura antes de salvar
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

    // 6. Salva os dois registros em uma única gravação
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
