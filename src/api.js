const API_BASE =
    "https://api.themoviedb.org/3";


const IMAGE_BASE =
    "https://image.tmdb.org/t/p/";


const API_KEY =
    import.meta.env.VITE_TMDB_API_KEY;


// ==================================================
// TMDB REQUEST
// ==================================================

export async function tmdbFetch(
    endpoint,
    params = {}
) {

    if (
        !API_KEY
    ) {

        throw new Error(
            "TMDB API key is missing."
        );

    }


    const url =
        new URL(
            `${API_BASE}${endpoint}`
        );


    const searchParams = {

        ...params,

        api_key:
            API_KEY

    };


    Object.entries(
        searchParams
    ).forEach(
        ([key, value]) => {

            url.searchParams.set(
                key,
                value
            );

        }
    );


    const response =
        await fetch(
            url
        );


    if (
        !response.ok
    ) {

        throw new Error(
            `TMDB request failed: ${response.status}`
        );

    }


    return response.json();
}


// ==================================================
// POPULAR
// ==================================================

export async function getPopularMovies(
    page = 1
) {

    return tmdbFetch(
        "/movie/popular",
        {
            language:
                "en-US",

            page
        }
    );
}


// ==================================================
// SEARCH
// ==================================================

export async function searchMovies(
    query,
    page = 1
) {

    return tmdbFetch(
        "/search/movie",
        {
            query,

            language:
                "en-US",

            page,

            include_adult:
                false
        }
    );
}


// ==================================================
// DETAILS + VIDEOS
// ==================================================

export async function getMovieDetails(
    movieId
) {

    return tmdbFetch(
        `/movie/${movieId}`,
        {
            language:
                "en-US",

            append_to_response:
                "videos"
        }
    );
}


// ==================================================
// POSTER
// ==================================================

export function getPosterUrl(
    path,
    size = "w500"
) {

    if (
        !path
    ) {

        return (
            "https://placehold.co/500x750?text=No+Poster"
        );

    }


    return (
        `${IMAGE_BASE}${size}${path}`
    );
}


// ==================================================
// BACKDROP
// ==================================================

export function getBackdropUrl(
    path,
    size = "w1280"
) {

    if (
        !path
    ) {

        return "";
    }


    return (
        `${IMAGE_BASE}${size}${path}`
    );
}