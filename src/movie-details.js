import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import "./style.css";


import {
    getMovieDetails,
    getPosterUrl
} from "./api.js";


import {
    getActiveList,
    isMovieInList,
    addMovie
} from "./rankings.js";


// ------------------------------------
// GET MOVIE ID
// ------------------------------------

const params =
    new URLSearchParams(
        window.location.search
    );


const movieId =
    Number(
        params.get("id")
    );


// ------------------------------------
// ELEMENTS
// ------------------------------------

const loading =
    document.getElementById(
        "movie-loading"
    );


const errorMessage =
    document.getElementById(
        "movie-error"
    );


const content =
    document.getElementById(
        "movie-content"
    );


const poster =
    document.getElementById(
        "movie-poster"
    );


const title =
    document.getElementById(
        "movie-title"
    );


const rating =
    document.getElementById(
        "movie-rating"
    );


const meta =
    document.getElementById(
        "movie-meta"
    );


const genres =
    document.getElementById(
        "movie-genres"
    );


const overview =
    document.getElementById(
        "movie-overview"
    );


const trailerContainer =
    document.getElementById(
        "trailer-container"
    );


const addButton =
    document.getElementById(
        "add-movie-button"
    );


// ------------------------------------
// HTML SAFETY
// ------------------------------------

function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value || "";


    return div.innerHTML;
}


// ------------------------------------
// LOAD MOVIE
// ------------------------------------

async function loadMovie() {

    if (
        !movieId
    ) {

        showError();

        return;
    }


    try {

        const movie =
            await getMovieDetails(
                movieId
            );


        displayMovie(
            movie
        );


    } catch (error) {

        console.error(
            error
        );


        showError();
    }
}


// ------------------------------------
// DISPLAY MOVIE
// ------------------------------------

function displayMovie(
    movie
) {

    loading.classList.add(
        "d-none"
    );


    content.classList.remove(
        "d-none"
    );


    document.title =
        `MovieRank | ${movie.title}`;


    // Poster

    poster.src =
        getPosterUrl(
            movie.poster_path,
            "w780"
        );


    poster.alt =
        `${movie.title} poster`;


    // Title

    title.textContent =
        movie.title;


    // Rating

    rating.textContent =
        `★ ${
            movie.vote_average
                ? movie.vote_average.toFixed(1)
                : "N/A"
        } / 10 TMDB`;


    // Meta

    const year =
        movie.release_date
            ? movie.release_date.substring(
                0,
                4
            )
            : "N/A";


    const runtime =
        movie.runtime
            ? `${movie.runtime} min`
            : "Runtime unavailable";


    meta.textContent =
        `${year} • ${runtime}`;


    // Genres

    if (
        movie.genres &&
        movie.genres.length > 0
    ) {

        genres.innerHTML =
            movie.genres
                .map(
                    genre => `
                        <span
                            class="badge
                                   text-bg-secondary
                                   me-2"
                        >
                            ${escapeHTML(
                                genre.name
                            )}
                        </span>
                    `
                )
                .join("");

    } else {

        genres.innerHTML =
            "";
    }


    // Description

    overview.textContent =
        movie.overview ||
        "No description is available for this movie.";


    // Trailer

    displayTrailer(
        movie.videos
    );


    // Add button

    updateAddButton(
        movie
    );


    addButton.addEventListener(
        "click",
        () => {

            addMovie(
                movie
            );


            updateAddButton(
                movie
            );


            showToast(
                `"${movie.title}" was added to your list.`
            );

        }
    );
}


// ------------------------------------
// TRAILER
// ------------------------------------

function displayTrailer(
    videoData
) {

    if (
        !videoData ||
        !videoData.results ||
        videoData.results.length === 0
    ) {

        trailerContainer.innerHTML = `

            <div
                class="alert alert-secondary"
            >

                No trailer is available
                for this movie.

            </div>

        `;

        return;
    }


    // Prefer official YouTube trailers

    let trailer =
        videoData.results.find(
            video =>
                video.site === "YouTube" &&
                video.type === "Trailer" &&
                video.official === true
        );


    // Fallback to any YouTube trailer

    if (!trailer) {

        trailer =
            videoData.results.find(
                video =>
                    video.site === "YouTube" &&
                    video.type === "Trailer"
            );
    }


    // Fallback to YouTube teaser

    if (!trailer) {

        trailer =
            videoData.results.find(
                video =>
                    video.site === "YouTube" &&
                    video.type === "Teaser"
            );
    }


    if (!trailer) {

        trailerContainer.innerHTML = `

            <div
                class="alert alert-secondary"
            >

                No YouTube trailer is available
                for this movie.

            </div>

        `;

        return;
    }


    const iframe =
        document.createElement(
            "iframe"
        );


    iframe.src =
        `https://www.youtube.com/embed/${encodeURIComponent(
            trailer.key
        )}`;


    iframe.title =
        `${trailer.name || "Movie"} trailer`;


    iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";


    iframe.allowFullscreen =
        true;


    iframe.loading =
        "lazy";


    iframe.className =
        "w-100 h-100";


    iframe.style.border =
        "0";


    trailerContainer.innerHTML =
        "";


    trailerContainer.appendChild(
        iframe
    );
}


// ------------------------------------
// ADD BUTTON
// ------------------------------------

function updateAddButton(
    movie
) {

    const activeList =
        getActiveList();


    const alreadyAdded =
        isMovieInList(
            movie.id
        );


    if (
        alreadyAdded
    ) {

        addButton.disabled =
            true;


        addButton.textContent =
            `Already in ${activeList.name}`;


        addButton.classList.remove(
            "btn-primary"
        );


        addButton.classList.add(
            "btn-secondary"
        );

    } else {

        addButton.disabled =
            false;


        addButton.textContent =
            `Add to ${activeList.name}`;


        addButton.classList.remove(
            "btn-secondary"
        );


        addButton.classList.add(
            "btn-primary"
        );
    }
}


// ------------------------------------
// ERROR
// ------------------------------------

function showError() {

    loading.classList.add(
        "d-none"
    );


    errorMessage.classList.remove(
        "d-none"
    );
}


// ------------------------------------
// TOAST
// ------------------------------------

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


// ------------------------------------
// START
// ------------------------------------

loadMovie();