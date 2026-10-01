import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import "./style.css";

import {
    getPopularMovies,
    searchMovies,
    getMovieDetails,
    getPosterUrl,
    getBackdropUrl
} from "./api.js";

import {
    CATEGORIES,
    getRankings,
    isMovieRanked,
    addMovie,
    removeMovie,
    moveMovie,
    updateCategory,
    updateRating
} from "./rankings.js";


// ------------------------------------
// PAGE SETUP
// ------------------------------------

const page =
    document.body.dataset.page;


// ------------------------------------
// ACTIVE NAVBAR LINK
// ------------------------------------

function setActiveNav() {

    const links =
        document.querySelectorAll(
            ".navbar-nav .nav-link"
        );

    links.forEach(link => {

        const target =
            link.dataset.page;

        if (target === page) {

            link.classList.add("active");

            link.setAttribute(
                "aria-current",
                "page"
            );
        }
    });
}

setActiveNav();


// ------------------------------------
// HTML SAFETY
// ------------------------------------

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value || "";

    return div.innerHTML;
}


// ------------------------------------
// MOVIE CARD
// ------------------------------------

function movieCard(movie) {

    const ranked =
        isMovieRanked(movie.id);

    const year =
        movie.release_date
            ? movie.release_date.substring(0, 4)
            : "N/A";

    const rating =
        movie.vote_average
            ? movie.vote_average.toFixed(1)
            : "N/A";

    return `
        <div class="col">

            <div class="card movie-card shadow-sm h-100">

                <img
                    src="${getPosterUrl(movie.poster_path)}"
                    class="card-img-top"
                    alt="${escapeHTML(movie.title)} poster"
                >

                <div class="card-body">

                    <h5 class="card-title fw-bold">
                        ${escapeHTML(movie.title)}
                    </h5>

                    <p class="text-secondary small mb-2">
                        ${year}
                    </p>

                    <p class="rating mb-3">
                        ★ ${rating} / 10
                    </p>

                    <p class="movie-description small mb-4">
                        ${escapeHTML(
                            movie.overview ||
                            "No description available."
                        )}
                    </p>

                    <div class="d-grid gap-2">

                        <button
                            class="btn btn-outline-light"
                            data-action="details"
                            data-id="${movie.id}"
                        >
                            View Details
                        </button>

                        <button
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
                                    ? "Already Ranked"
                                    : "Add to My Rankings"
                            }
                        </button>

                    </div>

                </div>

            </div>

        </div>
    `;
}


// ------------------------------------
// RENDER MOVIES
// ------------------------------------

function renderMovies(
    movies,
    container
) {

    if (!movies || movies.length === 0) {

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
        movies.map(movie => movieCard(movie))
            .join("");
}


// ------------------------------------
// LOAD POPULAR MOVIES
// ------------------------------------

async function loadPopularMovies(
    containerId,
    number = 8
) {

    const container =
        document.getElementById(
            containerId
        );

    if (!container) return;

    try {

        const data =
            await getPopularMovies();

        renderMovies(
            data.results.slice(0, number),
            container
        );

    } catch (error) {

        console.error(error);

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


// ------------------------------------
// SEARCH
// ------------------------------------

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

            const results =
                document.getElementById(
                    "search-results"
                );

            const query =
                input.value.trim();

            if (!query) return;

            results.innerHTML = `
                <div class="col-12">

                    <div class="alert alert-info">
                        Searching for
                        <strong>
                            ${escapeHTML(query)}
                        </strong>...
                    </div>

                </div>
            `;

            try {

                const data =
                    await searchMovies(query);

                renderMovies(
                    data.results.slice(0, 12),
                    results
                );

            } catch (error) {

                console.error(error);

                results.innerHTML = `
                    <div class="col-12">

                        <div class="alert alert-danger">
                            Search failed.
                        </div>

                    </div>
                `;
            }
        }
    );
}


// ------------------------------------
// MOVIE BUTTONS
// ------------------------------------

document.addEventListener(
    "click",
    async event => {

        const button =
            event.target.closest(
                "[data-action]"
            );

        if (!button) return;

        const action =
            button.dataset.action;

        const movieId =
            Number(button.dataset.id);


        // View movie details
        if (action === "details") {

            openMovieModal(movieId);

            return;
        }


        // Add to rankings
        if (action === "rank") {

            try {

                const movie =
                    await getMovieDetails(
                        movieId
                    );

                addMovie(movie);

                showToast(
                    `"${movie.title}" was added to My Rankings.`
                );

                button.textContent =
                    "Already Ranked";

                button.disabled =
                    true;

                button.classList.remove(
                    "btn-primary"
                );

                button.classList.add(
                    "btn-secondary"
                );

            } catch (error) {

                console.error(error);

                showToast(
                    "Could not add that movie."
                );
            }
        }
    }
);


// ------------------------------------
// MOVIE DETAILS MODAL
// ------------------------------------

async function openMovieModal(
    movieId
) {

    const modalElement =
        document.getElementById(
            "movieModal"
        );

    if (!modalElement) return;

    const title =
        document.getElementById(
            "modal-title"
        );

    const body =
        document.getElementById(
            "modal-body"
        );

    title.textContent =
        "Loading...";

    body.innerHTML = `
        <div class="text-center py-5">
            <div
                class="spinner-border"
                role="status"
            ></div>
        </div>
    `;


    const modal =
        bootstrap.Modal.getOrCreateInstance(
            modalElement
        );

    modal.show();


    try {

        const movie =
            await getMovieDetails(
                movieId
            );

        const year =
            movie.release_date
                ? movie.release_date.substring(0, 4)
                : "N/A";

        const genres =
            movie.genres
                ?.map(genre => genre.name)
                .join(", ") ||
            "Not listed";

        title.textContent =
            movie.title;

        body.innerHTML = `
            <div class="row g-4">

                <div class="col-md-4">

                    <img
                        src="${getPosterUrl(
                            movie.poster_path
                        )}"
                        class="img-fluid rounded"
                        alt="${escapeHTML(
                            movie.title
                        )} poster"
                    >

                </div>

                <div class="col-md-8">

                    <span class="badge text-bg-warning mb-3">
                        ★ ${
                            movie.vote_average
                                ? movie.vote_average.toFixed(1)
                                : "N/A"
                        } / 10
                    </span>

                    <p>
                        <strong>Released:</strong>
                        ${year}
                    </p>

                    <p>
                        <strong>Genres:</strong>
                        ${escapeHTML(genres)}
                    </p>

                    <p class="text-secondary">
                        ${escapeHTML(
                            movie.overview ||
                            "No overview available."
                        )}
                    </p>

                    <button
                        class="btn btn-primary"
                        data-action="rank"
                        data-id="${movie.id}"
                    >
                        Add to My Rankings
                    </button>

                </div>

            </div>
        `;

    } catch (error) {

        console.error(error);

        title.textContent =
            "Something went wrong.";

        body.innerHTML = `
            <div class="alert alert-danger">
                Could not load movie details.
            </div>
        `;
    }
}


// ------------------------------------
// TOAST
// ------------------------------------

function showToast(message) {

    const toast =
        document.getElementById(
            "site-toast"
        );

    if (!toast) return;

    const toastBody =
        toast.querySelector(
            ".toast-body"
        );

    toastBody.textContent =
        message;

    const toastInstance =
        bootstrap.Toast.getOrCreateInstance(
            toast
        );

    toastInstance.show();
}


// ------------------------------------
// HOME PAGE
// ------------------------------------

async function setupHomePage() {

    const popular =
        document.getElementById(
            "home-popular"
        );

    if (!popular) return;

    try {

        const data =
            await getPopularMovies();

        const movies =
            data.results;

        renderMovies(
            movies.slice(0, 6),
            popular
        );

        setupCarousel(movies.slice(0, 3));

    } catch (error) {

        console.error(error);
    }
}


function setupCarousel(movies) {

    const carousel =
        document.getElementById(
            "featured-slides"
        );

    if (!carousel) return;

    carousel.innerHTML =
        movies.map(
            (movie, index) => {

                return `
                    <div
                        class="carousel-item ${
                            index === 0
                                ? "active"
                                : ""
                        }"
                    >

                        <div class="row align-items-center g-4">

                            <div class="col-md-5">

                                <img
                                    src="${getBackdropUrl(
                                        movie.backdrop_path
                                    )}"
                                    class="img-fluid rounded-4"
                                    alt=""
                                >

                            </div>

                            <div class="col-md-7">

                                <span class="badge text-bg-primary mb-3">
                                    FEATURED
                                </span>

                                <h3 class="display-6 fw-bold">
                                    ${escapeHTML(
                                        movie.title
                                    )}
                                </h3>

                                <p class="rating">
                                    ★ ${
                                        movie.vote_average
                                            ? movie.vote_average.toFixed(1)
                                            : "N/A"
                                    } / 10
                                </p>

                                <p class="text-secondary">
                                    ${escapeHTML(
                                        movie.overview ||
                                        "No description available."
                                    )}
                                </p>

                                <button
                                    class="btn btn-light"
                                    data-action="details"
                                    data-id="${movie.id}"
                                >
                                    View Movie
                                </button>

                            </div>

                        </div>

                    </div>
                `;
            }
        ).join("");
}


// ------------------------------------
// RANKINGS PAGE
// ------------------------------------

function setupRankingsPage() {

    const rankingList =
        document.getElementById(
            "ranking-list"
        );

    if (!rankingList) return;


    renderRankings();


    const filter =
        document.getElementById(
            "category-filter"
        );


    filter.addEventListener(
        "change",
        renderRankings
    );


    rankingList.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-ranking-action]"
                );

            if (!button) return;

            const index =
                Number(
                    button.dataset.index
                );

            const action =
                button.dataset.rankingAction;


            if (action === "up") {

                moveMovie(
                    index,
                    -1
                );
            }


            if (action === "down") {

                moveMovie(
                    index,
                    1
                );
            }


            if (action === "remove") {

                removeMovie(index);
            }


            renderRankings();
        }
    );


    rankingList.addEventListener(
        "change",
        event => {

            const control =
                event.target.closest(
                    "[data-ranking-control]"
                );

            if (!control) return;

            const index =
                Number(
                    control.dataset.index
                );

            const action =
                control.dataset.rankingControl;


            if (action === "category") {

                updateCategory(
                    index,
                    control.value
                );
            }


            if (action === "rating") {

                updateRating(
                    index,
                    control.value
                );
            }


            renderRankings();
        }
    );
}


function renderRankings() {

    const rankingList =
        document.getElementById(
            "ranking-list"
        );

    if (!rankingList) return;


    const filter =
        document.getElementById(
            "category-filter"
        );


    const selectedCategory =
        filter.value;


    const rankings =
        getRankings();


    const filtered =
        rankings
            .map(
                (movie, index) => ({
                    movie,
                    index
                })
            )
            .filter(item => {

                if (
                    selectedCategory ===
                    "all"
                ) {
                    return true;
                }

                return (
                    item.movie.category ===
                    selectedCategory
                );
            });


    updateRankingStats(rankings);


    if (filtered.length === 0) {

        rankingList.innerHTML = `
            <div class="alert alert-secondary">
                Your ranking list is empty.
                Add movies from the Movies page.
            </div>
        `;

        return;
    }


    rankingList.innerHTML =
        filtered.map(
            item => {

                const movie =
                    item.movie;

                const index =
                    item.index;

                const year =
                    movie.release_date
                        ? movie.release_date.substring(
                            0,
                            4
                        )
                        : "N/A";


                return `
                    <div class="ranking-item rounded-4 p-3">

                        <div class="row align-items-center g-3">

                            <div class="col-2 col-md-1">

                                <div class="ranking-number">
                                    #${index + 1}
                                </div>

                            </div>


                            <div class="col-3 col-md-1">

                                <img
                                    src="${getPosterUrl(
                                        movie.poster_path
                                    )}"
                                    class="ranking-poster rounded"
                                    alt=""
                                >

                            </div>


                            <div class="col-7 col-md-4">

                                <h5 class="mb-1 fw-bold">
                                    ${escapeHTML(
                                        movie.title
                                    )}
                                </h5>

                                <p class="text-secondary small mb-1">
                                    ${year}
                                </p>

                                <span class="badge text-bg-warning">
                                    TMDB ★ ${
                                        movie.vote_average
                                            ? movie.vote_average.toFixed(1)
                                            : "N/A"
                                    }
                                </span>

                            </div>


                            <div class="col-6 col-md-2">

                                <label class="form-label small">
                                    Category
                                </label>

                                <select
                                    class="form-select form-select-sm"
                                    data-ranking-control="category"
                                    data-index="${index}"
                                >

                                    ${CATEGORIES.map(
                                        category => `
                                            <option
                                                value="${category}"
                                                ${
                                                    category ===
                                                    movie.category
                                                        ? "selected"
                                                        : ""
                                                }
                                            >
                                                ${category}
                                            </option>
                                        `
                                    ).join("")}

                                </select>

                            </div>


                            <div class="col-6 col-md-2">

                                <label class="form-label small">
                                    My Rating
                                </label>

                                <select
                                    class="form-select form-select-sm"
                                    data-ranking-control="rating"
                                    data-index="${index}"
                                >

                                    <option value="0">
                                        Unrated
                                    </option>

                                    ${Array.from(
                                        { length: 10 },
                                        (_, i) => {

                                            const rating =
                                                i + 1;

                                            return `
                                                <option
                                                    value="${rating}"
                                                    ${
                                                        Number(
                                                            movie.personalRating
                                                        ) ===
                                                        rating
                                                            ? "selected"
                                                            : ""
                                                    }
                                                >
                                                    ${rating}/10
                                                </option>
                                            `;
                                        }
                                    ).join("")}

                                </select>

                            </div>


                            <div class="col-12 col-md-2">

                                <div class="d-flex gap-2">

                                    <button
                                        class="btn btn-outline-light btn-sm"
                                        data-ranking-action="up"
                                        data-index="${index}"
                                    >
                                        ↑
                                    </button>

                                    <button
                                        class="btn btn-outline-light btn-sm"
                                        data-ranking-action="down"
                                        data-index="${index}"
                                    >
                                        ↓
                                    </button>

                                    <button
                                        class="btn btn-outline-danger btn-sm"
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
        ).join("");
}


function updateRankingStats(
    rankings
) {

    const total =
        document.getElementById(
            "total-movies"
        );

    const rated =
        document.getElementById(
            "average-rating"
        );

    const topCategory =
        document.getElementById(
            "top-category"
        );


    if (!total) return;


    total.textContent =
        rankings.length;


    const ratedMovies =
        rankings.filter(
            movie =>
                Number(
                    movie.personalRating
                ) > 0
        );


    if (ratedMovies.length === 0) {

        rated.textContent =
            "—";

    } else {

        const average =
            ratedMovies.reduce(
                (sum, movie) =>
                    sum +
                    Number(
                        movie.personalRating
                    ),
                0
            ) /
            ratedMovies.length;

        rated.textContent =
            average.toFixed(1);
    }


    if (rankings.length === 0) {

        topCategory.textContent =
            "—";

        return;
    }


    const counts = {};

    rankings.forEach(movie => {

        counts[movie.category] =
            (counts[movie.category] || 0) + 1;
    });


    const highest =
        Object.entries(counts)
            .sort(
                (a, b) =>
                    b[1] - a[1]
            )[0];


    topCategory.textContent =
        highest
            ? highest[0]
            : "—";
}


// ------------------------------------
// RUN PAGE FEATURES
// ------------------------------------

if (page === "home") {

    setupHomePage();
}


if (page === "movies") {

    loadPopularMovies(
        "popular-movies",
        12
    );
}


if (page === "rankings") {

    setupRankingsPage();
}