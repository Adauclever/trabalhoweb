// VALIDA OS DADOS DE UM LIVRO

export function validateBook(book) {
    const errors = [];
    const currentYear = new Date().getFullYear();

    // VERIFICA SE O TÍTULO FOI INFORMADO
    if (
        typeof book.title !== "string" ||
        book.title.trim() === ""
    ) {
        errors.push({
            field: "title",
            message: "Book title is required."
        });
    }

    // VERIFICA O ANO DE PUBLICAÇÃO
    if (book.publicationYear != null && book.publicationYear !== "") {
        if (
            !Number.isInteger(book.publicationYear) ||
            book.publicationYear === 0 ||
            book.publicationYear > currentYear
        ) {
            errors.push({
                field: "publicationYear",
                message: "Enter a valid publication year."
            });
        }
    }

    // VERIFICA A FORMA DO LIVRO
    const validForms = [
        "Novel",
        "Novella",
        "Short Story",
        "Short Story Collection",
        "Play",
        "Essay",
        "Treatise",
        "Diary",
        "Graphic Novel"
    ];

    if (
        book.form != null &&
        book.form !== "" &&
        !validForms.includes(book.form)
    ) {
        errors.push({
            field: "form",
            message: "Select a valid book form."
        });
    }

    // VERIFICA O MODO DO LIVRO
    const validModes = [
        "Prose",
        "Drama",
        "Poetry",
        "Sequential Art"
    ];

    if (
        book.mode != null &&
        book.mode !== "" &&
        !validModes.includes(book.mode)
    ) {
        errors.push({
            field: "mode",
            message: "Select a valid mode."
        });
    }

    // VERIFICA O TIPO DE CONTEÚDO
    const validContents = [
        "Fiction",
        "Non-fiction"
    ];

    if (
        book.content != null &&
        book.content !== "" &&
        !validContents.includes(book.content)
    ) {
        errors.push({
            field: "content",
            message: "Select a valid content type."
        });
    }

    // VERIFICA AS SELEÇÕES DE AUTORES E TEMAS
    for (const field of ["authorIds", "themeIds"]) {
        const ids = book[field];

        if (
            !Array.isArray(ids) ||
            ids.some(id =>
                !Number.isInteger(id) || id <= 0
            ) ||
            new Set(ids).size !== ids.length
        ) {
            errors.push({
                field,
                message: `Invalid ${field} selection.`
            });
        }
    }

    return errors;
}



// VALIDA OS DADOS DE UM AUTOR

export function validateAuthor(author) {
    const errors = [];
    const now = new Date();

    const today = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, "0"),
        String(now.getDate()).padStart(2, "0")
    ].join("-");

    // VERIFICA SE O NOME FOI INFORMADO
    if (
        typeof author.name !== "string" ||
        author.name.trim() === ""
    ) {
        errors.push({
            field: "name",
            message: "Author name is required."
        });
    }

    // VERIFICA SE A DATA É VÁLIDA
    function validDate(value) {
        if (
            typeof value !== "string" ||
            !/^\d{4}-\d{2}-\d{2}$/.test(value)
        ) {
            return false;
        }

        const [year, month, day] =
            value.split("-").map(Number);

        const date = new Date(0);
        date.setFullYear(year, month - 1, day);

        return (
            date.getFullYear() === year &&
            date.getMonth() === month - 1 &&
            date.getDate() === day
        );
    }

    // VERIFICA A DATA DE NASCIMENTO
    if (
        author.birthDate != null &&
        author.birthDate !== ""
    ) {
        if (
            !validDate(author.birthDate) ||
            author.birthDate > today
        ) {
            errors.push({
                field: "birthDate",
                message: "Enter a valid birth date that is not in the future."
            });
        }
    }

    // VERIFICA A DATA DE FALECIMENTO
    if (
        author.deathDate != null &&
        author.deathDate !== ""
    ) {
        if (
            !validDate(author.deathDate) ||
            author.deathDate > today
        ) {
            errors.push({
                field: "deathDate",
                message: "Enter a valid death date that is not in the future."
            });
        }
    }

    // VERIFICA A ORDEM CRONOLÓGICA DAS DATAS
    if (
        author.birthDate &&
        author.deathDate &&
        validDate(author.birthDate) &&
        validDate(author.deathDate) &&
        author.deathDate <= author.birthDate
    ) {
        errors.push({
            field: "deathDate",
            message: "Death date must be after birth date."
        });
    }

    // VERIFICA O PAÍS SELECIONADO
    if (
        author.countryId != null &&
        author.countryId !== "" &&
        (
            !Number.isInteger(author.countryId) ||
            author.countryId <= 0
        )
    ) {
        errors.push({
            field: "countryId",
            message: "Select a valid country."
        });
    }

    return errors;
}



// VALIDA OS DADOS DE UMA LEITURA

export function validateReading(reading, book) {
    const errors = [];
    const currentYear = new Date().getFullYear();

    const validStatuses = [
        "Want to read",
        "Reading",
        "Paused",
        "Read",
        "Abandoned"
    ];

    const validPriorities = [
        "Low",
        "Medium",
        "High"
    ];

    // VERIFICA SE O LIVRO SELECIONADO É VÁLIDO
    if (
        !book ||
        !Number.isInteger(reading.bookId) ||
        reading.bookId <= 0 ||
        reading.bookId !== book.id
    ) {
        errors.push({
            field: "bookId",
            message: "Select a valid book."
        });
    }

    // VERIFICA O STATUS DA LEITURA
    if (!validStatuses.includes(reading.status)) {
        errors.push({
            field: "status",
            message: "Select a valid reading status."
        });
    }

    const completedOrAbandoned =
        reading.status === "Read" ||
        reading.status === "Abandoned";

    // VERIFICA O ANO DA LEITURA
    if (
        reading.status === "Read" &&
        (
            reading.yearRead == null ||
            reading.yearRead === ""
        )
    ) {
        errors.push({
            field: "yearRead",
            message: "Year read is required for Read status."
        });
    }

    if (
        reading.yearRead != null &&
        reading.yearRead !== ""
    ) {
        if (!completedOrAbandoned) {
            errors.push({
                field: "yearRead",
                message: "Year read is not allowed for this status."
            });
        } else if (
            !Number.isInteger(reading.yearRead) ||
            reading.yearRead < 1 ||
            reading.yearRead > currentYear ||
            (
                book?.publicationYear != null &&
                reading.yearRead < book.publicationYear
            )
        ) {
            errors.push({
                field: "yearRead",
                message: "Enter a valid reading year."
            });
        }
    }

    // VERIFICA A NOTA ATRIBUÍDA AO LIVRO
    if (
        reading.grade != null &&
        reading.grade !== ""
    ) {
        if (!completedOrAbandoned) {
            errors.push({
                field: "grade",
                message: "Grade is not allowed for this status."
            });
        } else if (
            typeof reading.grade !== "number" ||
            !Number.isFinite(reading.grade) ||
            reading.grade < 0 ||
            reading.grade > 10 ||
            !Number.isInteger(reading.grade * 2)
        ) {
            errors.push({
                field: "grade",
                message: "Grade must be 0 to 10 in steps of 0.5."
            });
        }
    }

    // VERIFICA A PRIORIDADE DA LEITURA
    if (
        reading.priority != null &&
        reading.priority !== ""
    ) {
        if (
            reading.status !== "Want to read" ||
            !validPriorities.includes(reading.priority)
        ) {
            errors.push({
                field: "priority",
                message: "Priority is only allowed for Want to read."
            });
        }
    }

    // VERIFICA QUEM RECOMENDOU O LIVRO
    if (
        reading.recommendedBy != null &&
        typeof reading.recommendedBy !== "string"
    ) {
        errors.push({
            field: "recommendedBy",
            message: "Recommended by must be text."
        });
    }

    // VERIFICA AS OBSERVAÇÕES DA LEITURA
    if (
        reading.notes != null &&
        typeof reading.notes !== "string"
    ) {
        errors.push({
            field: "notes",
            message: "Notes must be text."
        });
    }

    return errors;
}