# Reading Tracker — Delivery 1

Web application for managing books, authors, themes, and reading records, developed for the Web Development semester assignment at Universidade Federal de Alfenas (UNIFAL-MG).

## Team members

> **Complete this section before submitting.** Use the names and student IDs of every team member. The team composition declared here must remain the same for Delivery 2.

| Name | Student ID |
| --- | --- |
| **[FULL NAME]** | **[STUDENT ID]** |

## Technologies

- HTML5, CSS3, and vanilla JavaScript (ES modules)
- Browser `localStorage` for persistent data
- `fetch()` for loading the instructor's `seed.json`
- No frontend framework, backend, database, package manager, or build tool is required for Delivery 1
- **Java version:** not applicable to Delivery 1; Java 21+ and Spring Boot are planned for Delivery 2

## How to run — step by step

1. Download or clone this repository to your computer.
2. Open the **`reading-tracker`** folder in Visual Studio Code.
3. Install the **Live Server** extension in VS Code if it is not already installed.
4. Right-click `index.html` and choose **Open with Live Server**.
5. The application opens in the browser. Use **Home**, **Books**, **Authors**, and **Reading Log** to navigate.
6. On first use in a browser origin, the application loads `data/seed.json` and saves its records in `localStorage` automatically.
7. On subsequent visits, the application keeps your changes instead of loading the seed again.
8. To restore the instructor's initial data, use **Home → Reset Data**, read the confirmation message, and confirm. **This replaces all current records.** Use **Download Backup** first if you need a JSON export of your changes.

**Important:** Do **not** open `index.html` directly using `file://`, because the application loads `seed.json` using `fetch()`. Use Live Server or another simple static HTTP server. A Java installation is **not required** to run Delivery 1.

## Initial data

The instructor-provided JSON file is stored at `data/seed.json`. It contains:

| Resource | Count |
| --- | ---: |
| Countries | 27 |
| Authors | 101 |
| Themes | 135 |
| Books | 143 |
| Readings | 143 |

The seed includes 115 **Read**, 12 **Paused**, and 16 **Want to read** records. The country list is fixed. Theme names are unique ignoring letter case.

## Core requirement checklist

The statuses below reflect the functionalities implemented and manually tested for Delivery 1. The instructor's grading is independent of this self-review.

| ID | Requirement | Status | Implementation |
| --- | --- | --- | --- |
| FR-01 | Manage authors | **Implemented** | Add, view, edit, delete; prevent deletion when referenced by books |
| FR-02 | Manage books | **Implemented** | Add, view, edit, delete; select authors and themes; create a theme in the book form |
| FR-03 | Manage readings | **Implemented** | Add, edit, delete; optional first reading on book creation; cascade-delete readings with confirmation |
| FR-04 | Status workflow | **Implemented** | Five statuses; conditional year/grade/priority; confirmation before discarding incompatible values |
| FR-05 | Reading log | **Implemented** | Sort by title, authors, status, year read, and grade; missing values last; default year descending then ID ascending |
| FR-06 | Validation | **Implemented** | Validate author, book, and reading rules; display field errors; reject invalid saves |
| FR-07 | Seed data | **Implemented** | First-use import; localStorage persistence; Reset Data with confirmation |

### Additional features

- Export current browser records as a JSON backup using the **Download Backup** button. The application does **not** currently provide a button to re-import this backup.

Optional requirements FR-08 through FR-18 were not claimed as implemented in this delivery.

## Project structure

```text
reading-tracker/
├── index.html
├── books.html
├── authors.html
├── readings.html
├── style.css
├── data/
│   └── seed.json
├── js/
│   ├── home.js
│   ├── authors.js
│   ├── books.js
│   ├── readings.js
│   ├── validation.js
│   ├── seed.js
│   └── store.js
└── README.md
```

- `js/store.js` centralizes asynchronous data access and persistence.
- `js/validation.js` contains domain validation rules.
- `js/seed.js` loads and checks the instructor-provided seed file.
- The other JavaScript modules control individual pages and their interaction with the user.

## Testing

Manual scenarios covered author CRUD, book and theme CRUD, multiple readings per book, status transitions, sort ordering, validation edge cases, first-use seed loading, persistence after browser reload, and Reset Data. These were tested using VS Code Live Server.

Before submitting, also verify the layout on a narrow/mobile viewport and confirm that the publicly accessible GitHub repository contains this README and `data/seed.json`.

## AI usage disclosure

AI tools were used in this assignment, as allowed by the instructor. The assistance and affected areas are disclosed below. All submitted code and explanations should be reviewed and understood by the student(s).

| Tool | Used for | Parts affected |
| --- | --- | --- |
| ChatGPT (OpenAI) | Step-by-step development guidance; explanation and review of requirements; proposing, generating and revising HTML/CSS/JavaScript code; debugging; validation, status workflow, localStorage and seed import; preparation of manual test cases and project documentation | `index.html`, `books.html`, `authors.html`, `readings.html`, `style.css`, `js/*.js`, `README.md` |

The original seed data in `data/seed.json` was supplied by the instructor and was not invented by the AI tool. This table should be expanded if any other AI tool was used on this assignment.

## Delivery 2 planning

Delivery 2 will replace the localStorage implementation with a Java 21+ Spring Boot 4.x REST backend and persistent storage. This README describes **Delivery 1 only**; API endpoints and the demonstration video will be documented for Delivery 2.
