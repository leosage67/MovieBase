import "bootstrap/dist/css/bootstrap.min.css";
import * as bootstrap from "bootstrap";

import "./style.css";


import {
    getPopularMovies,
    searchMovies,
    getMovieDetails,
    getPosterUrl,
    getBackdropUrl
} from "./api.js";


import {
    getLists,
    getActiveList,
    getActiveListId,
    setActiveListId,
    addMovie,
    isMovieInList,
    removeMovie,
    moveMovie,
    updateRating,
    createList,
    renameList,
    deleteList
} from "./rankings.js";


// ==================================================
// PAGE
// ==================================================

const page =
    document.body.dataset.page;


// ==================================================
// SEARCH STATE
// ==================================================

let currentSearchQuery = "";

let currentSearchPage = 1;

let totalSearchPages = 0;


// ==================================================
// NAVBAR
// ==================================================

function setActiveNav() {

    const links =
        document.querySelectorAll(
            ".navbar-nav .nav-link"
        );


    links.forEach(link => {

        if (
            link.dataset.page === page
        ) {

            link.classList.add(
                "active"
            );


            link.setAttribute(
                "aria-current",
                "page"
            );
        }

    });
}


setActiveNav();


// ==================================================
// HTML SAFETY
// ==================================================

function escapeHTML(
    value
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value || "";


    return div.innerHTML;
}


// ==================================================
// MOVIE CARD
// ==================================================

function movieCard(
    movie
) {

    const ranked =
        isMovieInList(
            movie.id
        );


    const activeList =
        getActiveList();


    const year =
        movie.release_date
            ? movie.release_date.substring(
                0,
                4
            )
            : "N/A";


    const rating =
        movie.vote_average
            ? movie.vote_average.toFixed(
                1
            )
            : "N/A";


    return `

        <div class="col">

            <div
                class="card
                       movie-card
                       shadow-sm
                       h-100"
            >

                <img
                    src="${getPosterUrl(
                        movie.poster_path
                    )}"
                    class="card-img-top"
                    alt="${escapeHTML(
                        movie.title
                    )} poster"
                >


                <div class="card-body">

                    <h5 class="card-title fw-bold">

                        ${escapeHTML(
                            movie.title
                        )}

                    </h5>


                    <p
                        class="text-secondary
                               small
                               mb-2"
                    >
                        ${year}
                    </p>


                    <p class="rating mb-3">

                        ★ ${rating} / 10

                    </p>


                    <p
                        class="movie-description
                               small
                               mb-4"
                    >

                        ${escapeHTML(
                            movie.overview ||
                            "No description available."
                        )}

                    </p>


                    <div
                        class="d-grid
                               gap-2
                               mt-auto"
                    >

                        <!-- DETAILS -->

                        <a
                            href="./movie-details.html?id=${movie.id}"
                            class="btn
                                   btn-outline-light"
                        >
                            View Details
                        </a>


                        <!-- ADD TO LIST -->

                        <button
                            type="button"
                            class="btn ${
                                ranked
                                    ? "btn-secondary"
                                    : "btn-primary"
                            }"
                            data-action="rank"
                            data-id="${movie.id}"
                            ${ranked ? "disabled" : ""}
                        >

                            ${
                                ranked
                                    ? `Already in ${escapeHTML(
                                        activeList.name
                                    )}`
                                    : `Add to ${escapeHTML(
                                        activeList.name
                                    )}`
                            }

                        </button>

                    </div>

                </div>

            </div>

        </div>

    `;
}


// ==================================================
// RENDER MOVIES
// ==================================================

function renderMovies(
    movies,
    container
) {

    if (
        !movies ||
        movies.length === 0
    ) {

        container.innerHTML = `

            <div class="col-12">

                <div class="alert alert-secondary">

                    No movies were found.

                </div>

            </div>

        `;

        return;
    }


    container.innerHTML =
        movies
            .map(
                movie =>
                    movieCard(movie)
            )
            .join("");
}


// ==================================================
// LOAD POPULAR MOVIES
// ==================================================

async function loadPopularMovies(
    containerId,
    number = 8
) {

    const container =
        document.getElementById(
            containerId
        );


    if (!container) {
        return;
    }


    try {

        const data =
            await getPopularMovies();


        renderMovies(
            data.results.slice(
                0,
                number
            ),
            container
        );

    } catch (error) {

        console.error(
            error
        );


        container.innerHTML = `

            <div class="col-12">

                <div class="alert alert-danger">

                    <strong>
                        Could not load movies.
                    </strong>

                    Check your TMDB API key.

                </div>

            </div>

        `;
    }
}


// ==================================================
// MOVIE SEARCH
// ==================================================

const searchForm =
    document.getElementById(
        "search-form"
    );


if (searchForm) {

    searchForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const input =
                document.getElementById(
                    "search-input"
                );


            const query =
                input.value.trim();


            if (!query) {
                return;
            }


            currentSearchQuery =
                query;


            currentSearchPage =
                1;


            await performMovieSearch();

        }
    );
}


// ==================================================
// PERFORM SEARCH
// ==================================================

async function performMovieSearch() {

    const results =
        document.getElementById(
            "search-results"
        );


    if (!results) {
        return;
    }


    const status =
        document.getElementById(
            "search-status"
        );


    const pagination =
        document.getElementById(
            "search-pagination"
        );


    results.innerHTML = `

        <div class="col-12">

            <div class="text-center py-5">

                <div
                    class="spinner-border text-primary"
                    role="status"
                ></div>


                <p class="text-secondary mt-3">
                    Searching TMDB...
                </p>

            </div>

        </div>

    `;


    if (status) {

        status.innerHTML =
            "";
    }


    if (pagination) {

        pagination.innerHTML =
            "";
    }


    try {

        const data =
            await searchMovies(
                currentSearchQuery,
                currentSearchPage
            );


        totalSearchPages =
            Math.min(
                Number(
                    data.total_pages || 0
                ),
                500
            );


        renderMovies(
            data.results,
            results
        );


        renderSearchStatus(
            data
        );


        renderSearchPagination(
            data
        );

    } catch (error) {

        console.error(
            error
        );


        results.innerHTML = `

            <div class="col-12">

                <div class="alert alert-danger">

                    <strong>
                        Search failed.
                    </strong>

                    Make sure your TMDB API key
                    is working.

                </div>

            </div>

        `;
    }
}


// ==================================================
// SEARCH STATUS
// ==================================================

function renderSearchStatus(
    data
) {

    const status =
        document.getElementById(
            "search-status"
        );


    if (!status) {
        return;
    }


    const total =
        Number(
            data.total_results || 0
        ).toLocaleString();


    status.innerHTML = `

        <div
            class="d-flex
                   flex-wrap
                   justify-content-between
                   align-items-center
                   gap-3"
        >

            <div>

                <h3 class="fw-bold mb-1">

                    Results for
                    "${escapeHTML(
                        currentSearchQuery
                    )}"

                </h3>


                <p
                    class="text-secondary
                           mb-0"
                >

                    ${total}
                    ${
                        data.total_results === 1
                            ? "movie"
                            : "movies"
                    }
                    found

                </p>

            </div>


            <span
                class="badge text-bg-dark"
            >

                Page
                ${data.page}
                of
                ${Math.min(
                    data.total_pages || 1,
                    500
                )}

            </span>

        </div>

    `;
}


// ==================================================
// PAGINATION
// ==================================================

function renderSearchPagination(
    data
) {

    const pagination =
        document.getElementById(
            "search-pagination"
        );


    if (!pagination) {
        return;
    }


    const totalPages =
        Math.min(
            Number(
                data.total_pages || 0
            ),
            500
        );


    if (
        totalPages <= 1
    ) {

        pagination.innerHTML =
            "";

        return;
    }


    const currentPage =
        Number(
            data.page
        );


    let html =
        "";


    // Previous

    html += `

        <li
            class="page-item ${
                currentPage <= 1
                    ? "disabled"
                    : ""
            }"
        >

            <button
                class="page-link"
                data-search-page="${
                    currentPage - 1
                }"
                ${
                    currentPage <= 1
                        ? "disabled"
                        : ""
                }
            >
                Previous
            </button>

        </li>

    `;


    // Page numbers

    const pages =
        getPageNumbers(
            currentPage,
            totalPages
        );


    pages.forEach(
        pageNumber => {

            if (
                pageNumber === "..."
            ) {

                html += `

                    <li
                        class="page-item disabled"
                    >

                        <span class="page-link">
                            ...
                        </span>

                    </li>

                `;

                return;
            }


            html += `

                <li
                    class="page-item ${
                        pageNumber === currentPage
                            ? "active"
                            : ""
                    }"
                >

                    <button
                        class="page-link"
                        data-search-page="${pageNumber}"
                    >
                        ${pageNumber}
                    </button>

                </li>

            `;
        }
    );


    // Next

    html += `

        <li
            class="page-item ${
                currentPage >= totalPages
                    ? "disabled"
                    : ""
            }"
        >

            <button
                class="page-link"
                data-search-page="${
                    currentPage + 1
                }"
                ${
                    currentPage >= totalPages
                        ? "disabled"
                        : ""
                }
            >
                Next
            </button>

        </li>

    `;


    pagination.innerHTML =
        html;
}


// ==================================================
// PAGE NUMBERS
// ==================================================

function getPageNumbers(
    currentPage,
    totalPages
) {

    const pages =
        [];


    if (
        totalPages <= 7
    ) {

        for (
            let i = 1;
            i <= totalPages;
            i++
        ) {

            pages.push(
                i
            );
        }


        return pages;
    }


    pages.push(
        1
    );


    if (
        currentPage > 4
    ) {

        pages.push(
            "..."
        );
    }


    const start =
        Math.max(
            2,
            currentPage - 1
        );


    const end =
        Math.min(
            totalPages - 1,
            currentPage + 1
        );


    for (
        let i = start;
        i <= end;
        i++
    ) {

        pages.push(
            i
        );
    }


    if (
        currentPage <
        totalPages - 3
    ) {

        pages.push(
            "..."
        );
    }


    pages.push(
        totalPages
    );


    return pages;
}


// ==================================================
// PAGINATION CLICKS
// ==================================================

document.addEventListener(
    "click",
    async event => {

        const button =
            event.target.closest(
                "[data-search-page]"
            );


        if (!button) {
            return;
        }


        const pageNumber =
            Number(
                button.dataset.searchPage
            );


        if (
            pageNumber < 1 ||
            pageNumber > totalSearchPages
        ) {

            return;
        }


        currentSearchPage =
            pageNumber;


        await performMovieSearch();


        const searchSection =
            document.getElementById(
                "search-form"
            );


        if (searchSection) {

            searchSection.scrollIntoView({
                behavior: "smooth"
            });

        }

    }
);


// ==================================================
// ADD MOVIE TO CURRENT LIST
// ==================================================

document.addEventListener(
    "click",
    async event => {

        const button =
            event.target.closest(
                '[data-action="rank"]'
            );


        if (!button) {
            return;
        }


        const movieId =
            Number(
                button.dataset.id
            );


        if (!movieId) {
            return;
        }


        try {

            const movie =
                await getMovieDetails(
                    movieId
                );


            addMovie(
                movie,
                getActiveListId()
            );


            const activeList =
                getActiveList();


            button.disabled =
                true;


            button.textContent =
                `Already in ${activeList.name}`;


            button.classList.remove(
                "btn-primary"
            );


            button.classList.add(
                "btn-secondary"
            );


            showToast(
                `"${movie.title}" was added to "${activeList.name}".`
            );


        } catch (error) {

            console.error(
                "Could not add movie:",
                error
            );


            showToast(
                "Could not add that movie."
            );
        }

    }
);


// ==================================================
// UPDATE ADD BUTTONS
// ==================================================

function updateRankButtons() {

    const buttons =
        document.querySelectorAll(
            '[data-action="rank"]'
        );


    const activeList =
        getActiveList();


    buttons.forEach(
        button => {

            const movieId =
                Number(
                    button.dataset.id
                );


            const ranked =
                isMovieInList(
                    movieId
                );


            button.disabled =
                ranked;


            button.textContent =
                ranked
                    ? `Already in ${activeList.name}`
                    : `Add to ${activeList.name}`;


            button.classList.toggle(
                "btn-primary",
                !ranked
            );


            button.classList.toggle(
                "btn-secondary",
                ranked
            );

        }
    );
}


// ==================================================
// CREATE LIST MODAL
// ==================================================

function openCreateListModal() {

    const modalElement =
        document.getElementById(
            "createListModal"
        );


    const input =
        document.getElementById(
            "new-list-name"
        );


    if (!modalElement) {
        return;
    }


    renderMovieListSelector();


    const modal =
        bootstrap.Modal.getOrCreateInstance(
            modalElement
        );


    modal.show();


    setTimeout(
        () => {

            if (input) {

                input.focus();

            }

        },
        300
    );
}


// ==================================================
// MOVIES PAGE LIST DROPDOWN
// ==================================================

// ==================================================
// MOVIES PAGE LIST SELECTOR
// ==================================================

function setupMoviesPage() {

    const selector =
        document.getElementById(
            "movie-list-select"
        );


    if (!selector) {
        return;
    }


    // ----------------------------------------------
    // CHECK URL FOR A SPECIFIC LIST
    // ----------------------------------------------

    const params =
        new URLSearchParams(
            window.location.search
        );


    const requestedList =
        params.get("list");


    if (requestedList) {

        const lists =
            getLists();


        const exists =
            lists.some(
                list =>
                    list.id ===
                    requestedList
            );


        if (exists) {

            setActiveListId(
                requestedList
            );
        }
    }


    // ----------------------------------------------
    // SHOW LISTS
    // ----------------------------------------------

    renderMovieListSelector();


    // ----------------------------------------------
    // DROPDOWN CHANGE
    // ----------------------------------------------

    selector.addEventListener(
        "change",
        () => {

            const selectedValue =
                selector.value;


            // CREATE NEW LIST

            if (
                selectedValue ===
                "__create__"
            ) {

                // Return dropdown to the
                // current list

                renderMovieListSelector();


                // Open modal

                openCreateListModal();


                return;
            }


            // Switch active list

            setActiveListId(
                selectedValue
            );


            renderMovieListSelector();


            updateRankButtons();

        }
    );


    // ----------------------------------------------
    // + NEW LIST BUTTON
    // ----------------------------------------------

    const createButton =
        document.getElementById(
            "create-list-button"
        );


    if (createButton) {

        createButton.addEventListener(
            "click",
            () => {

                openCreateListModal();

            }
        );

    }


    // ----------------------------------------------
    // CREATE LIST FORM
    // ----------------------------------------------

    const createForm =
        document.getElementById(
            "create-list-form"
        );


    if (createForm) {

        createForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();


                const input =
                    document.getElementById(
                        "new-list-name"
                    );


                const name =
                    input.value.trim();


                if (!name) {

                    input.focus();

                    return;
                }


                // Create list

                createList(
                    name
                );


                // Get the new active list

                const newList =
                    getActiveList();


                // Close modal

                const modalElement =
                    document.getElementById(
                        "createListModal"
                    );


                if (modalElement) {

                    const modal =
                        bootstrap.Modal
                            .getOrCreateInstance(
                                modalElement
                            );


                    modal.hide();
                }


                // Clear input

                input.value =
                    "";


                // Update dropdown

                renderMovieListSelector();


                // Update movie buttons

                updateRankButtons();


                // Confirmation

                showToast(
                    `"${newList.name}" was created.`
                );

            }
        );
    }
}


// ==================================================
// RENDER MOVIE LIST SELECTOR
// ==================================================

function renderMovieListSelector() {

    const selector =
        document.getElementById(
            "movie-list-select"
        );


    if (!selector) {
        return;
    }


    const lists =
        getLists();


    const activeId =
        getActiveListId();


    selector.innerHTML = `

        ${lists.map(
            list => `

                <option
                    value="${list.id}"
                    ${
                        list.id === activeId
                            ? "selected"
                            : ""
                    }
                >
                    ${escapeHTML(
                        list.name
                    )}
                </option>

            `
        ).join("")}


        <option
            value="__create__"
        >
            + Create New List
        </option>

    `;


    const label =
        document.getElementById(
            "selected-list-label"
        );


    if (label) {

        const activeList =
            getActiveList();


        label.textContent =
            activeList.name;
    }
}
// ==================================================
// RANKINGS PAGE
// ==================================================

function setupRankingsPage() {

    const rankingList =
        document.getElementById(
            "ranking-list"
        );


    if (!rankingList) {
        return;
    }


    renderRankingsPage();


    const selector =
        document.getElementById(
            "active-list-select"
        );


    if (selector) {

        selector.addEventListener(
            "change",
            () => {

                setActiveListId(
                    selector.value
                );


                renderRankingsPage();

            }
        );
    }


    // ----------------------------------------------
    // NEW LIST
    // ----------------------------------------------

    const newListButton =
        document.getElementById(
            "new-list-button"
        );


    if (newListButton) {

        newListButton.addEventListener(
            "click",
            () => {

                openRankingsListModal(
                    "create"
                );

            }
        );
    }


    // ----------------------------------------------
    // RENAME LIST
    // ----------------------------------------------

    const renameButton =
        document.getElementById(
            "rename-list-button"
        );


    if (renameButton) {

        renameButton.addEventListener(
            "click",
            () => {

                openRankingsListModal(
                    "rename"
                );

            }
        );
    }


    // ----------------------------------------------
    // DELETE LIST
    // ----------------------------------------------

    const deleteButton =
        document.getElementById(
            "delete-list-button"
        );


    if (deleteButton) {

        deleteButton.addEventListener(
            "click",
            () => {

                const active =
                    getActiveList();


                if (!active) {
                    return;
                }


                const confirmed =
                    window.confirm(
                        `Delete "${active.name}"?`
                    );


                if (!confirmed) {
                    return;
                }


                deleteList(
                    active.id
                );


                renderRankingsPage();

            }
        );
    }


    // ----------------------------------------------
    // OPEN LIST FROM LIST CARD
    // ----------------------------------------------

    const listsContainer =
        document.getElementById(
            "lists-container"
        );


    if (listsContainer) {

        listsContainer.addEventListener(
            "click",
            event => {

                const renameButton =
                    event.target.closest(
                        '[data-list-action="rename"]'
                    );


                if (renameButton) {

                    setActiveListId(
                        renameButton.dataset.listId
                    );


                    openRankingsListModal(
                        "rename"
                    );


                    return;
                }

            }
        );
    }


    // ----------------------------------------------
    // RANKING CONTROLS
    // ----------------------------------------------

    rankingList.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-ranking-action]"
                );


            if (!button) {
                return;
            }


            const index =
                Number(
                    button.dataset.index
                );


            const action =
                button.dataset.rankingAction;


            const active =
                getActiveList();


            if (!active) {
                return;
            }


            if (
                action === "up"
            ) {

                moveMovie(
                    index,
                    -1,
                    active.id
                );
            }


            if (
                action === "down"
            ) {

                moveMovie(
                    index,
                    1,
                    active.id
                );
            }


            if (
                action === "remove"
            ) {

                removeMovie(
                    index,
                    active.id
                );
            }


            renderRankingsPage();

        }
    );


    // ----------------------------------------------
    // RATING CONTROL
    // ----------------------------------------------

    rankingList.addEventListener(
        "change",
        event => {

            const select =
                event.target.closest(
                    "[data-ranking-control]"
                );


            if (!select) {
                return;
            }


            const index =
                Number(
                    select.dataset.index
                );


            const active =
                getActiveList();


            if (!active) {
                return;
            }


            updateRating(
                index,
                select.value,
                active.id
            );


            renderRankingsPage();

        }
    );


    // ----------------------------------------------
    // CREATE / RENAME FORM
    // ----------------------------------------------

    const listForm =
        document.getElementById(
            "list-form"
        );


    if (listForm) {

        listForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();


                const mode =
                    document.getElementById(
                        "list-mode"
                    ).value;


                const name =
                    document.getElementById(
                        "list-name"
                    ).value.trim();


                if (!name) {
                    return;
                }


                if (
                    mode === "create"
                ) {

                    createList(
                        name
                    );

                } else {

                    const listId =
                        document.getElementById(
                            "list-id"
                        ).value;


                    renameList(
                        listId,
                        name
                    );

                }


                const modalElement =
                    document.getElementById(
                        "listModal"
                    );


                if (modalElement) {

                    bootstrap.Modal
                        .getOrCreateInstance(
                            modalElement
                        )
                        .hide();
                }


                renderRankingsPage();

            }
        );
    }

}


// ==================================================
// RANKINGS MODAL
// ==================================================

function openRankingsListModal(
    mode
) {

    const modalElement =
        document.getElementById(
            "listModal"
        );


    if (!modalElement) {
        return;
    }


    const title =
        document.getElementById(
            "listModalTitle"
        );


    const submit =
        document.getElementById(
            "listModalSubmit"
        );


    const modeInput =
        document.getElementById(
            "list-mode"
        );


    const idInput =
        document.getElementById(
            "list-id"
        );


    const nameInput =
        document.getElementById(
            "list-name"
        );


    if (
        mode === "create"
    ) {

        title.textContent =
            "Create New List";


        submit.textContent =
            "Create List";


        modeInput.value =
            "create";


        idInput.value =
            "";


        nameInput.value =
            "";

    } else {

        const active =
            getActiveList();


        if (!active) {
            return;
        }


        title.textContent =
            "Rename List";


        submit.textContent =
            "Save Name";


        modeInput.value =
            "rename";


        idInput.value =
            active.id;


        nameInput.value =
            active.name;

    }


    bootstrap.Modal
        .getOrCreateInstance(
            modalElement
        )
        .show();


    setTimeout(
        () => {

            nameInput.focus();

        },
        300
    );
}


// ==================================================
// RENDER RANKINGS PAGE
// ==================================================

function renderRankingsPage() {

    const lists =
        getLists();


    const active =
        getActiveList();


    if (!active) {
        return;
    }


    renderLists(
        lists,
        active.id
    );


    renderActiveListSelector(
        lists,
        active.id
    );


    renderActiveRanking(
        active
    );


    updateRankingStats(
        lists,
        active
    );

}


// ==================================================
// RENDER LIST CARDS
// ==================================================

function renderLists(
    lists,
    activeId
) {

    const container =
        document.getElementById(
            "lists-container"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        lists
            .map(
                list => {

                    const ratedMovies =
                        list.movies.filter(
                            movie =>
                                Number(
                                    movie.personalRating || 0
                                ) > 0
                        );


                    const average =
                        ratedMovies.length
                            ? (
                                ratedMovies.reduce(
                                    (sum, movie) =>
                                        sum +
                                        Number(
                                            movie.personalRating
                                        ),
                                    0
                                ) /
                                ratedMovies.length
                            ).toFixed(1)
                            : "—";


                    const activeClass =
                        list.id === activeId
                            ? "border-primary"
                            : "border-secondary";


                    return `

                        <div class="col">

                            <div
                                class="card
                                       list-card
                                       bg-dark
                                       h-100
                                       ${activeClass}"
                            >

                                <div class="card-body">

                                    ${
                                        list.id === activeId
                                            ? `
                                                <span
                                                    class="badge
                                                           text-bg-primary
                                                           mb-2"
                                                >
                                                    CURRENT LIST
                                                </span>
                                            `
                                            : ""
                                    }


                                    <h5
                                        class="card-title fw-bold"
                                    >

                                        ${escapeHTML(
                                            list.name
                                        )}

                                    </h5>


                                    <p
                                        class="text-secondary
                                               mb-2"
                                    >

                                        ${list.movies.length}
                                        ${
                                            list.movies.length === 1
                                                ? "movie"
                                                : "movies"
                                        }

                                    </p>


                                    <p class="rating mb-4">

                                        ${
                                            average === "—"
                                                ? "Not rated yet"
                                                : `Average ★ ${average}/10`
                                        }

                                    </p>


                                    <div class="d-flex gap-2">

                                        <a
                                            class="btn
                                                   btn-primary
                                                   btn-sm"
                                            href="./listview.html?list=${encodeURIComponent(
                                                list.id
                                            )}"
                                        >
                                            Open List
                                        </a>


                                        <button
                                            type="button"
                                            class="btn
                                                   btn-outline-light
                                                   btn-sm"
                                            data-list-action="rename"
                                            data-list-id="${list.id}"
                                        >
                                            Rename
                                        </button>

                                    </div>

                                </div>

                            </div>

                        </div>

                    `;
                }
            )
            .join("");
}


// ==================================================
// ACTIVE LIST SELECTOR
// ==================================================

function renderActiveListSelector(
    lists,
    activeId
) {

    const select =
        document.getElementById(
            "active-list-select"
        );


    if (!select) {
        return;
    }


    select.innerHTML =
        lists
            .map(
                list => `

                    <option
                        value="${list.id}"
                        ${
                            list.id === activeId
                                ? "selected"
                                : ""
                        }
                    >
                        ${escapeHTML(
                            list.name
                        )}
                    </option>

                `
            )
            .join("");
}


// ==================================================
// ACTIVE RANKING
// ==================================================

function renderActiveRanking(
    active
) {

    const title =
        document.getElementById(
            "active-list-title"
        );


    const container =
        document.getElementById(
            "ranking-list"
        );


    if (!container) {
        return;
    }


    if (title) {

        title.textContent =
            active.name;
    }


    if (
        active.movies.length === 0
    ) {

        container.innerHTML = `

            <div class="alert alert-secondary">

                <h5 class="alert-heading">
                    This list is empty.
                </h5>


                <p class="mb-3">

                    Go to the
                    <a
                        href="./movies.html?list=${encodeURIComponent(
                            active.id
                        )}"
                        class="alert-link"
                    >
                        Movies page
                    </a>
                    to add movies.

                </p>

            </div>

        `;

        return;
    }


    container.innerHTML =
        active.movies
            .map(
                (movie, index) => {

                    const year =
                        movie.release_date
                            ? movie.release_date.substring(
                                0,
                                4
                            )
                            : "N/A";


                    return `

                        <div
                            class="ranking-item
                                   rounded-4
                                   p-3"
                        >

                            <div
                                class="row
                                       align-items-center
                                       g-3"
                            >


                                <div
                                    class="col-2
                                           col-md-1"
                                >

                                    <div
                                        class="ranking-number"
                                    >
                                        #${index + 1}
                                    </div>

                                </div>


                                <div
                                    class="col-3
                                           col-md-1"
                                >

                                    <img
                                        src="${getPosterUrl(
                                            movie.poster_path
                                        )}"
                                        class="ranking-poster rounded"
                                        alt=""
                                    >

                                </div>


                                <div
                                    class="col-7
                                           col-md-4"
                                >

                                    <h5
                                        class="mb-1
                                               fw-bold"
                                    >

                                        ${escapeHTML(
                                            movie.title
                                        )}

                                    </h5>


                                    <p
                                        class="text-secondary
                                               small
                                               mb-1"
                                    >
                                        ${year}
                                    </p>


                                    <span
                                        class="badge
                                               text-bg-warning"
                                    >

                                        TMDB ★ ${
                                            movie.vote_average
                                                ? movie.vote_average.toFixed(
                                                    1
                                                )
                                                : "N/A"
                                        }

                                    </span>

                                </div>


                                <div
                                    class="col-6
                                           col-md-2"
                                >

                                    <label
                                        class="form-label
                                               small"
                                    >
                                        My Rating
                                    </label>


                                    <select
                                        class="form-select
                                               form-select-sm"
                                        data-ranking-control
                                        data-index="${index}"
                                    >

                                        <option
                                            value="0"
                                            ${
                                                Number(
                                                    movie.personalRating || 0
                                                ) === 0
                                                    ? "selected"
                                                    : ""
                                            }
                                        >
                                            Unrated
                                        </option>


                                        ${Array.from(
                                            {
                                                length: 10
                                            },
                                            (_, i) => {

                                                const value =
                                                    i + 1;


                                                return `

                                                    <option
                                                        value="${value}"
                                                        ${
                                                            Number(
                                                                movie.personalRating || 0
                                                            ) === value
                                                                ? "selected"
                                                                : ""
                                                        }
                                                    >
                                                        ${value}/10
                                                    </option>

                                                `;
                                            }
                                        ).join("")}

                                    </select>

                                </div>


                                <div
                                    class="col-12
                                           col-md-4"
                                >

                                    <div
                                        class="d-flex
                                               flex-wrap
                                               gap-2"
                                    >

                                        <button
                                            type="button"
                                            class="btn
                                                   btn-outline-light
                                                   btn-sm"
                                            data-ranking-action="up"
                                            data-index="${index}"
                                        >
                                            ↑
                                        </button>


                                        <button
                                            type="button"
                                            class="btn
                                                   btn-outline-light
                                                   btn-sm"
                                            data-ranking-action="down"
                                            data-index="${index}"
                                        >
                                            ↓
                                        </button>


                                        <a
                                            href="./movie-details.html?id=${movie.id}"
                                            class="btn
                                                   btn-outline-light
                                                   btn-sm"
                                        >
                                            Details
                                        </a>


                                        <button
                                            type="button"
                                            class="btn
                                                   btn-outline-danger
                                                   btn-sm"
                                            data-ranking-action="remove"
                                            data-index="${index}"
                                        >
                                            Remove
                                        </button>

                                    </div>

                                </div>

                            </div>

                        </div>

                    `;
                }
            )
            .join("");
}


// ==================================================
// RANKING STATS
// ==================================================

function updateRankingStats(
    lists,
    active
) {

    const totalLists =
        document.getElementById(
            "total-lists"
        );


    const activeMovies =
        document.getElementById(
            "active-movies"
        );


    const average =
        document.getElementById(
            "active-average"
        );


    if (!totalLists) {
        return;
    }


    totalLists.textContent =
        lists.length;


    activeMovies.textContent =
        active.movies.length;


    const ratedMovies =
        active.movies.filter(
            movie =>
                Number(
                    movie.personalRating || 0
                ) > 0
        );


    if (
        ratedMovies.length === 0
    ) {

        average.textContent =
            "—";

        return;
    }


    const result =
        ratedMovies.reduce(
            (sum, movie) =>
                sum +
                Number(
                    movie.personalRating
                ),
            0
        ) /
        ratedMovies.length;


    average.textContent =
        result.toFixed(1);
}


// ==================================================
// TOAST
// ==================================================

function showToast(
    message
) {

    const toast =
        document.getElementById(
            "site-toast"
        );


    if (!toast) {
        return;
    }


    const body =
        toast.querySelector(
            ".toast-body"
        );


    body.textContent =
        message;


    bootstrap.Toast
        .getOrCreateInstance(
            toast
        )
        .show();
}


// ==================================================
// HOME PAGE
// ==================================================

async function setupHomePage() {

    const popular =
        document.getElementById(
            "home-popular"
        );


    if (!popular) {
        return;
    }


    try {

        const data =
            await getPopularMovies();


        const movies =
            data.results;


        renderMovies(
            movies.slice(
                0,
                6
            ),
            popular
        );


        setupCarousel(
            movies.slice(
                0,
                3
            )
        );

    } catch (error) {

        console.error(
            error
        );
    }
}


// ==================================================
// HOME CAROUSEL
// ==================================================

function setupCarousel(
    movies
) {

    const carousel =
        document.getElementById(
            "featured-slides"
        );


    if (!carousel) {
        return;
    }


    carousel.innerHTML =
        movies.map(
            (movie, index) => `

                <div
                    class="carousel-item ${
                        index === 0
                            ? "active"
                            : ""
                    }"
                >

                    <div
                        class="row
                               align-items-center
                               g-4"
                    >

                        <div
                            class="col-md-5"
                        >

                            <img
                                src="${getBackdropUrl(
                                    movie.backdrop_path
                                )}"
                                class="img-fluid rounded-4"
                                alt=""
                            >

                        </div>


                        <div
                            class="col-md-7"
                        >

                            <span
                                class="badge
                                       text-bg-primary
                                       mb-3"
                            >
                                FEATURED
                            </span>


                            <h3
                                class="display-6
                                       fw-bold"
                            >

                                ${escapeHTML(
                                    movie.title
                                )}

                            </h3>


                            <p class="rating">

                                ★ ${
                                    movie.vote_average
                                        ? movie.vote_average.toFixed(
                                            1
                                        )
                                        : "N/A"
                                } / 10

                            </p>


                            <p
                                class="text-secondary"
                            >

                                ${escapeHTML(
                                    movie.overview ||
                                    "No description available."
                                )}

                            </p>


                            <a
                                href="./movie-details.html?id=${movie.id}"
                                class="btn btn-light"
                            >
                                View Movie
                            </a>

                        </div>

                    </div>

                </div>

            `
        ).join("");
}


// ==================================================
// START PAGE FEATURES
// ==================================================

if (
    page === "home"
) {

    setupHomePage();

}


if (
    page === "movies"
) {

    setupMoviesPage();


    loadPopularMovies(
        "popular-movies",
        12
    );

}


if (
    page === "rankings"
) {

    setupRankingsPage();

}