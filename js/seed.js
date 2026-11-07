const SEED_PATH = "./data/seed.json";
const COLLECTIONS = ["countries", "authors", "themes", "books", "readings"];



// VERIFICA SE OS DADOS DO ARQUIVO SEED SÃO VÁLIDOS

function assert(condition, message) {
    if (!condition) {
        throw new Error(`Invalid seed.json: ${message}`);
    }
}



// VERIFICA SE OS IDs SÃO ÚNICOS E POSITIVOS

function uniquePositiveIds(records, type) {
    const ids = new Set();

    records.forEach((item, index) => {
        assert(item && typeof item === "object" && !Array.isArray(item),
            `${type}[${index}] must be an object.`);

        assert(Number.isInteger(item.id) && item.id > 0,
            `${type}[${index}] has an invalid ID.`);

        assert(!ids.has(item.id), `${type} contains a duplicate ID: ${item.id}.`);

        ids.add(item.id);
    });

    return ids;
}



// VALIDA OS DADOS DO ARQUIVO SEED

function validateSeed(data) {
    assert(data && typeof data === "object" && !Array.isArray(data),
        "expected a JSON object.");

    COLLECTIONS.forEach(key => assert(Array.isArray(data[key]),
        `missing ${key} array.`));

    const countryIds = uniquePositiveIds(data.countries, "countries");
    const authorIds = uniquePositiveIds(data.authors, "authors");
    const themeIds = uniquePositiveIds(data.themes, "themes");
    const bookIds = uniquePositiveIds(data.books, "books");

    uniquePositiveIds(data.readings, "readings");

    // Verifica os nomes dos países
    for (const item of data.countries) {
        assert(typeof item.name === "string" && item.name.trim(),
            `country ${item.id} has no name.`);
    }

    // Verifica os nomes dos temas
    for (const item of data.themes) {
        assert(typeof item.name === "string" && item.name.trim(),
            `theme ${item.id} has no name.`);
    }

    // Verifica os autores e seus países
    for (const item of data.authors) {
        assert(typeof item.name === "string" && item.name.trim(),
            `author ${item.id} has no name.`);

        assert(item.countryId == null || countryIds.has(item.countryId),
            `author ${item.id} references an unknown country.`);
    }

    // Verifica os livros e suas referências
    for (const item of data.books) {
        assert(typeof item.title === "string" && item.title.trim(),
            `book ${item.id} has no title.`);

        assert(Array.isArray(item.authorIds) &&
            item.authorIds.every(id => authorIds.has(id)),
            `book ${item.id} references an unknown author.`);

        assert(Array.isArray(item.themeIds) &&
            item.themeIds.every(id => themeIds.has(id)),
            `book ${item.id} references an unknown theme.`);
    }

    // Verifica se as leituras estão associadas a livros existentes
    for (const item of data.readings) {
        assert(bookIds.has(item.bookId),
            `reading ${item.id} references an unknown book.`);
    }

    return data;
}



// CARREGA OS DADOS DO ARQUIVO SEED.JSON

export async function loadSeedData() {
    let response;

    try {
        response = await fetch(SEED_PATH, { cache: "no-store" });

    } catch {
        throw new Error("Could not access seed.json. Open the project using Live Server.");
    }

    if (!response.ok) {
        throw new Error(`Could not load seed.json (HTTP ${response.status}).`);
    }

    let data;

    try {
        data = await response.json();

    } catch {
        throw new Error("seed.json is not valid JSON.");
    }

    return validateSeed(data);
}