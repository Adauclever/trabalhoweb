import { MESSAGES } from "./messages.js";
export function validateBook(book) {
    const errors = [];
    const currentYear = new Date().getFullYear();

    // TITLE
    if (
        typeof book.title !== "string" ||
        book.title.trim() === ""
    ) {
        errors.push({
            field: "title",
            message: MESSAGES.validation.titleRequired
        });
    }

    // PUBLICATION YEAR
    if (book.publicationYear != null && book.publicationYear !== "") {
        if (
            !Number.isInteger(book.publicationYear) ||
            book.publicationYear === 0 ||
            book.publicationYear > currentYear
        ) {
            errors.push({
                field: "publicationYear",
                message: MESSAGES.validation.invalidYear
            });
        }
    }

    // FORM
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
            message: MESSAGES.validation.invalidForm
        });
    }

    // MODE
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
            message: MESSAGES.validation.invalidMode
        });
    }

    // CONTENT
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
            message: MESSAGES.validation.invalidContent
        });
    }

    // AUTHORS AND THEMES
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
                message: MESSAGES.validation.invalidSelection(field)
            });
        }
    }

    return errors;
}


export function validateAuthor(author) {
    const errors = [];
    const now = new Date();

    const today = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, "0"),
        String(now.getDate()).padStart(2, "0")
    ].join("-");

    // NAME
    if (
        typeof author.name !== "string" ||
        author.name.trim() === ""
    ) {
        errors.push({
            field: "name",
            message: MESSAGES.validation.authorNameRequired
        });
    }

    // DATE VALIDATION
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

    // BIRTH DATE
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
                message: MESSAGES.validation.birthDate
            });
        }
    }

    // DEATH DATE
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
                message: MESSAGES.validation.deathDate
            });
        }
    }

    // CHRONOLOGICAL ORDER
    if (
        author.birthDate &&
        author.deathDate &&
        validDate(author.birthDate) &&
        validDate(author.deathDate) &&
        author.deathDate <= author.birthDate
    ) {
        errors.push({
            field: "deathDate",
            message: MESSAGES.validation.deathAfterBirth
        });
    }

    // COUNTRY
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
            message: MESSAGES.validation.invalidCountry
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
        "Low",
        "Medium",
        "High"
    ];

    // BOOK REFERENCE
    if (
        !book ||
        !Number.isInteger(reading.bookId) ||
        reading.bookId <= 0 ||
        reading.bookId !== book.id
    ) {
        errors.push({
            field: "bookId",
            message: MESSAGES.validation.selectBook
        });
    }

    // STATUS
    if (!validStatuses.includes(reading.status)) {
        errors.push({
            field: "status",
            message: MESSAGES.validation.invalidStatus
        });
    }

    const completedOrAbandoned =
        reading.status === "Read" ||
        reading.status === "Abandoned";

    // YEAR READ
    if (
        reading.status === "Read" &&
        (
            reading.yearRead == null ||
            reading.yearRead === ""
        )
    ) {
        errors.push({
            field: "yearRead",
            message: MESSAGES.validation.yearReadRequired
        });
    }

    if (
        reading.yearRead != null &&
        reading.yearRead !== ""
    ) {
        if (!completedOrAbandoned) {
            errors.push({
                field: "yearRead",
                message: MESSAGES.validation.yearReadNotAllowed
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
                message: MESSAGES.validation.invalidYearRead
            });
        }
    }

    // GRADE
    if (
        reading.grade != null &&
        reading.grade !== ""
    ) {
        if (!completedOrAbandoned) {
            errors.push({
                field: "grade",
                message: MESSAGES.validation.gradeNotAllowed
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
                message: MESSAGES.validation.gradeRange
            });
        }
    }

    // PRIORITY
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
                message: MESSAGES.validation.priorityNotAllowed
            });
        }
    }

    // RECOMMENDED BY
    if (
        reading.recommendedBy != null &&
        typeof reading.recommendedBy !== "string"
    ) {
        errors.push({
            field: "recommendedBy",
            message: MESSAGES.validation.recommendedByText
        });
    }

    // NOTES
    if (
        reading.notes != null &&
        typeof reading.notes !== "string"
    ) {
        errors.push({
            field: "notes",
            message: MESSAGES.validation.notesText
        });
    }

    return errors;
}