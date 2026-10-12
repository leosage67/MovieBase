import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import "./style.css";


import {
    getMovieDetails,
    getPosterUrl
} from "./api.js";


import {
    getLists,
    getActiveList,
    getActiveListId,
    setActiveListId,
    saveLists,
    removeMovie,
    moveMovie,
    updateRating,
    updateMovieGenres
} from "./rankings.js";


// ------------------------------------
// GET LIST ID FROM URL
// ------------------------------------

const params =
    new URLSearchParams(
        window.location.search
    );


const requestedListId =
    params.get("list");


if (requestedListId) {

    setActiveListId(
        requestedListId
    );
}


// ------------------------------------
// ELEMENTS
// ------------------------------------

const listTitle =
    document.getElementById(
        "list-title"
    );


const listDescription =
    document.getElementById(
        "list-description"
    );


const movieList =
    document.getElementById(
        "movie-list"
    );


const loading =
    document.getElementById(
        "list-loading"
    );


const empty =
    document.getElementById(
        "list-empty"
    );


const sortSelect =
    document.getElementById(
        "sort-select"
    );


const addMoviesButton =
    document.getElementById(
        "add-movies-button"
    );


const emptyAddButton =
    document.getElementById(
        "empty-add-button"
    );


const sortDescription =
    document.getElementById(
        "sort-description"
    );


// ------------------------------------
// CURRENT LIST
// ------------------------------------

function getCurrentList() {

    const lists =
        getLists();


    const id =
        requestedListId ||
        getActiveListId();


    return lists.find(
        list => list.id === id
    );
}


// ------------------------------------
// HTML SAFETY
// ------------------------------------

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


// ------------------------------------
// FORMAT DATE
// ------------------------------------

function formatDate(
    timestamp
) {

    if (!timestamp) {

        return "Date not recorded";
    }


    return new Date(
        timestamp
    ).toLocaleDateString(
        undefined,
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    );
}


// ------------------------------------
// GET GENRE TEXT
// ------------------------------------

function getGenreText(
    movie
) {

    if (
        Array.isArray(movie.genres) &&
        movie.genres.length > 0
    ) {

        return movie.genres.join(
            ", "
        );
    }


    return "Genre unavailable";
}


// ------------------------------------
// SORT MOVIES
// ------------------------------------

function sortMovies(
    movies,
    method
) {

    const sorted =
        [...movies];


    if (
        method === "rank"
    ) {

        return sorted;
    }


    if (
        method === "date-newest"
    ) {

        return sorted.sort(
            (a, b) =>
                Number(
                    b.movie.addedAt || 0
                ) -
                Number(
                    a.movie.addedAt || 0
                )
        );
    }


    if (
        method === "date-oldest"
    ) {

        return sorted.sort(
            (a, b) =>
                Number(
                    a.movie.addedAt || 0
                ) -
                Number(
                    b.movie.addedAt || 0
                )
        );
    }


    if (
        method === "rating-high"
    ) {

        return sorted.sort(
            (a, b) => {

                const ratingA =
                    Number(
                        a.movie.personalRating || 0
                    );


                const ratingB =
                    Number(
                        b.movie.personalRating || 0
                    );


                // Unrated movies go to bottom

                if (
                    ratingA === 0 &&
                    ratingB !== 0
                ) {

                    return 1;
                }


                if (
                    ratingB === 0 &&
                    ratingA !== 0
                ) {

                    return -1;
                }


                return ratingB - ratingA;
            }
        );
    }


    if (
        method === "rating-low"
    ) {

        return sorted.sort(
            (a, b) => {

                const ratingA =
                    Number(
                        a.movie.personalRating || 0
                    );


                const ratingB =
                    Number(
                        b.movie.personalRating || 0
                    );


                // Unrated movies go to bottom

                if (
                    ratingA === 0 &&
                    ratingB !== 0
                ) {

                    return 1;
                }


                if (
                    ratingB === 0 &&
                    ratingA !== 0
                ) {

                    return -1;
                }


                return ratingA - ratingB;
            }
        );
    }


    if (
        method === "genre"
    ) {

        return sorted.sort(
            (a, b) =>
                getGenreText(
                    a.movie
                ).localeCompare(
                    getGenreText(
                        b.movie
                    )
                )
        );
    }


    return sorted;
}


// ------------------------------------
// DISPLAY MOVIE
// ------------------------------------

function renderMovies() {

    const list =
        getCurrentList();


    if (!list) {

        window.location.href =
            "./rankings.html";

        return;
    }


    listTitle.textContent =
        list.name;


    listDescription.textContent =
        `${list.movies.length} ${
            list.movies.length === 1
                ? "movie"
                : "movies"
        } in this list`;


    document.title =
        `MovieRank | ${list.name}`;


    addMoviesButton.href =
        `./movies.html?list=${encodeURIComponent(
            list.id
        )}`;


    emptyAddButton.href =
        `./movies.html?list=${encodeURIComponent(
            list.id
        )}`;


    loading.classList.add(
        "d-none"
    );


    if (
        list.movies.length === 0
    ) {

        empty.classList.remove(
            "d-none"
        );


        movieList.innerHTML =
            "";


        return;
    }


    empty.classList.add(
        "d-none"
    );


    const indexedMovies =
        list.movies.map(
            (movie, index) => ({
                movie,
                originalIndex: index
            })
        );


    const sortedMovies =
        sortMovies(
            indexedMovies,
            sortSelect.value
        );


    movieList.innerHTML =
        sortedMovies.map(
            item => {

                const movie =
                    item.movie;


                const index =
                    item.originalIndex;


                const year =
                    movie.release_date
                        ? movie.release_date.substring(
                            0,
                            4
                        )
                        : "N/A";


                const personalRating =
                    Number(
                        movie.personalRating || 0
                    );


                const tmdbRating =
                    movie.vote_average
                        ? movie.vote_average.toFixed(1)
                        : "N/A";


                return `

                    <article
                        class="ranking-item
                               rounded-4
                               p-3"
                    >

                        <div
                            class="row
                                   align-items-center
                                   g-3"
                        >


                            <!-- RANK -->

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


                            <!-- POSTER -->

                            <div
                                class="col-3
                                       col-md-1"
                            >

                                <img
                                    src="${getPosterUrl(
                                        movie.poster_path
                                    )}"
                                    class="ranking-poster rounded"
                                    alt="${escapeHTML(
                                        movie.title
                                    )} poster"
                                >

                            </div>


                            <!-- TITLE -->

                            <div
                                class="col-7
                                       col-md-3"
                            >

                                <h5
                                    class="fw-bold mb-1"
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


                                <div
                                    class="small
                                           text-secondary"
                                >
                                    Added:
                                    ${formatDate(
                                        movie.addedAt
                                    )}
                                </div>

                            </div>


                            <!-- GENRE -->

                            <div
                                class="col-6
                                       col-md-2"
                            >

                                <div
                                    class="small
                                           text-secondary
                                           mb-1"
                                >
                                    Genre
                                </div>


                                <div
                                    class="fw-semibold"
                                >
                                    ${escapeHTML(
                                        getGenreText(
                                            movie
                                        )
                                    )}
                                </div>

                            </div>


                            <!-- RATINGS -->

                            <div
                                class="col-6
                                       col-md-2"
                            >

                                <div
                                    class="small
                                           text-secondary
                                           mb-1"
                                >
                                    Ratings
                                </div>


                                <div
                                    class="rating
                                           small"
                                >
                                    TMDB ★ ${tmdbRating}
                                </div>


                                <select
                                    class="form-select
                                           form-select-sm
                                           mt-2"
                                    data-rating-index="${index}"
                                >

                                    <option
                                        value="0"
                                        ${
                                            personalRating === 0
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        My Rating
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
                                                        personalRating ===
                                                        value
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


                            <!-- ACTIONS -->

                            <div
                                class="col-12
                                       col-md-3"
                            >

                                <div
                                    class="d-flex
                                           flex-wrap
                                           gap-2
                                           justify-content-md-end"
                                >

                                    <button
                                        type="button"
                                        class="btn
                                               btn-outline-light
                                               btn-sm"
                                        data-action="up"
                                        data-index="${index}"
                                    >
                                        ↑
                                    </button>


                                    <button
                                        type="button"
                                        class="btn
                                               btn-outline-light
                                               btn-sm"
                                        data-action="down"
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
                                        data-action="remove"
                                        data-index="${index}"
                                    >
                                        Remove
                                    </button>

                                </div>

                            </div>

                        </div>

                    </article>

                `;
            }
        ).join("");
}


// ------------------------------------
// LOAD MISSING GENRES
// ------------------------------------

async function loadMissingGenres() {

    const list =
        getCurrentList();


    if (!list) {
        return;
    }


    const missing =
        list.movies.filter(
            movie =>
                !Array.isArray(
                    movie.genres
                ) ||
                movie.genres.length === 0
        );


    if (
        missing.length === 0
    ) {

        return;
    }


    try {

        await Promise.all(
            missing.map(
                async movie => {

                    try {

                        const details =
                            await getMovieDetails(
                                movie.id
                            );


                        const genres =
                            details.genres
                                ?.map(
                                    genre =>
                                        genre.name
                                ) || [];


                        updateMovieGenres(
                            movie.id,
                            genres,
                            list.id
                        );

                    } catch (error) {

                        console.error(
                            `Could not load genres for ${movie.title}`,
                            error
                        );
                    }

                }
            )
        );


        renderMovies();

    } catch (error) {

        console.error(error);
    }
}


// ------------------------------------
// SORT CHANGE
// ------------------------------------

sortSelect.addEventListener(
    "change",
    () => {

        updateSortDescription();

        renderMovies();

    }
);


// ------------------------------------
// SORT DESCRIPTION
// ------------------------------------

function updateSortDescription() {

    const descriptions = {

        rank:
            "Showing movies in their saved ranking order.",

        "date-newest":
            "Showing the movies you added most recently first.",

        "date-oldest":
            "Showing the movies you added earliest first.",

        "rating-high":
            "Showing your highest personal ratings first.",

        "rating-low":
            "Showing your lowest personal ratings first.",

        genre:
            "Showing movies alphabetically by genre."

    };


    sortDescription.textContent =
        descriptions[
            sortSelect.value
        ] || "";
}


// ------------------------------------
// BUTTONS
// ------------------------------------

movieList.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                "[data-action]"
            );


        if (!button) {
            return;
        }


        const index =
            Number(
                button.dataset.index
            );


        const action =
            button.dataset.action;


        if (
            action === "up"
        ) {

            moveMovie(
                index,
                -1,
                getCurrentList().id
            );
        }


        if (
            action === "down"
        ) {

            moveMovie(
                index,
                1,
                getCurrentList().id
            );
        }


        if (
            action === "remove"
        ) {

            removeMovie(
                index,
                getCurrentList().id
            );
        }


        renderMovies();
    }
);


// ------------------------------------
// RATING DROPDOWN
// ------------------------------------

movieList.addEventListener(
    "change",
    event => {

        const select =
            event.target.closest(
                "[data-rating-index]"
            );


        if (!select) {
            return;
        }


        const index =
            Number(
                select.dataset.ratingIndex
            );


        updateRating(
            index,
            select.value,
            getCurrentList().id
        );


        renderMovies();

    }
);


// ------------------------------------
// START
// ------------------------------------

renderMovies();

updateSortDescription();

loadMissingGenres();