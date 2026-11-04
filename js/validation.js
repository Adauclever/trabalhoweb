
export function validateBook(book) {
    const errors = [];
    const currentYear = new Date().getFullYear();

    if (typeof book.title !== "string" ||
        book.title.trim() === "") {
        errors.push({
            field: "title",
            message: "Book title is required."
        });
    }

    if (book.publicationYear != null) {
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

    const validForms = [
        "Novel", "Novella", "Short Story",
        "Short Story Collection", "Play",
        "Essay", "Treatise", "Diary",
        "Graphic Novel"
    ];

    const validModes = [
        "Prose", "Drama", "Poetry", "Sequential Art"
    ];

    const validContents = ["Fiction", "Non-fiction"];

    if (book.form != null && !validForms.includes(book.form)) {
        errors.push({
            field: "form",
            message: "Select a valid book form."
        });
    }

    if (book.mode != null && !validModes.includes(book.mode)) {
        errors.push({
            field: "mode",
            message: "Select a valid mode."
        });
    }

    if (book.content != null &&
        !validContents.includes(book.content)) {
        errors.push({
            field: "content",
            message: "Select a valid content type."
        });
    }

    for (const field of ["authorIds", "themeIds"]) {
        const ids = book[field];

        if (!Array.isArray(ids) ||
            ids.some(id => !Number.isInteger(id) || id <= 0) ||
            new Set(ids).size !== ids.length) {
            errors.push({
                field,
                message: `Invalid ${field} selection.`
            });
        }
    }

    return errors;
}


export function validateAuthor(author) {
    const errors = [];

    if (typeof author.name !== "string" ||
        author.name.trim() === "") {
        errors.push({
            field: "name",
            message: "Author name is required."
        });
    }

    // Usa a data local, sem converter para UTC.
    const now = new Date();
    const today = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, "0"),
        String(now.getDate()).padStart(2, "0")
    ].join("-");

    function validDate(value) {
        if (typeof value !== "string" ||
            !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            return false;
        }

        const [year, month, day] = value.split("-").map(Number);
        const date = new Date(0);
        date.setFullYear(year, month - 1, day);

        return date.getFullYear() === year &&
            date.getMonth() === month - 1 &&
            date.getDate() === day;
    }

    if (author.birthDate != null) {
        if (!validDate(author.birthDate) ||
            author.birthDate > today) {
            errors.push({
                field: "birthDate",
                message: "Enter a valid birth date that is not in the future."
            });
        }
    }

    if (author.deathDate != null) {
        if (!validDate(author.deathDate) ||
            author.deathDate > today) {
            errors.push({
                field: "deathDate",
                message: "Enter a valid death date that is not in the future."
            });
        }
    }

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

    if (author.countryId != null &&
        (!Number.isInteger(author.countryId) ||
         author.countryId <= 0)) {
        errors.push({
            field: "countryId",
            message: "Select a valid country."
        });
    }

    return errors;
}


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
        "Low", "Medium", "High"
    ];

    if (!book || reading.bookId !== book.id) {
        errors.push({
            field: "bookId",
            message: "Select a valid book."
        });
    }

    if (!validStatuses.includes(reading.status)) {
        errors.push({
            field: "status",
            message: "Select a valid reading status."
        });
    }

    const completedOrAbandoned =
        reading.status === "Read" ||
        reading.status === "Abandoned";

    // YEAR READ

    if (reading.status === "Read" &&
        reading.yearRead == null) {
        errors.push({
            field: "yearRead",
            message: "Year read is required for Read status."
        });
    }

    if (reading.yearRead != null) {
        if (!completedOrAbandoned) {
            errors.push({
                field: "yearRead",
                message: "Year read is not allowed for this status."
            });
        } else if (
            !Number.isInteger(reading.yearRead) ||
            reading.yearRead <= 0 ||
            reading.yearRead > currentYear ||
            (book?.publicationYear != null &&
             reading.yearRead < book.publicationYear)
        ) {
            errors.push({
                field: "yearRead",
                message: "Enter a valid reading year."
            });
        }
    }

    // GRADE

    if (reading.grade != null) {
        if (!completedOrAbandoned) {
            errors.push({
                field: "grade",
                message: "Grade is not allowed for this status."
            });
        } else if (
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

    // PRIORITY

    if (reading.priority != null) {
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

    if (
    reading.status === "Read" &&
    (reading.yearRead === null ||
     reading.yearRead === undefined ||
     reading.yearRead === "")
) {
    errors.push({
        field: "yearRead",
        message: "Year read is required when status is Read."
    });
}

    return errors;


}

