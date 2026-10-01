const API_BASE = "https://api.themoviedb.org/3";

const IMAGE_BASE = "https://image.tmdb.org/t/p/";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;


// Get data from TMDB
export async function tmdbFetch(endpoint, params = {}) {

    if (!API_KEY) {
        throw new Error("TMDB API key is missing.");
    }

    const url = new URL(`${API_BASE}${endpoint}`);

    const searchParams = {
        ...params,
        api_key: API_KEY
    };

    Object.entries(searchParams).forEach(([key, value]) => {
        url.searchParams.set(key, value);
    });

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(
            `TMDB request failed: ${response.status}`
        );
    }

    return response.json();
}


// Popular movies
export async function getPopularMovies(page = 1) {

    return tmdbFetch(
        "/movie/popular",
        {
            language: "en-US",
            page
        }
    );
}


// Search movies
export async function searchMovies(query) {

    return tmdbFetch(
        "/search/movie",
        {
            query,
            language: "en-US",
            page: 1,
            include_adult: false
        }
    );
}


// Get one movie's details
export async function getMovieDetails(movieId) {

    return tmdbFetch(
        `/movie/${movieId}`,
        {
            language: "en-US"
        }
    );
}


// Build poster URL
export function getPosterUrl(path, size = "w500") {

    if (!path) {
        return "https://placehold.co/500x750?text=No+Poster";
    }

    return `${IMAGE_BASE}${size}${path}`;
}


// Build backdrop URL
export function getBackdropUrl(path, size = "w1280") {

    if (!path) {
        return "";
    }

    return `${IMAGE_BASE}${size}${path}`;
}