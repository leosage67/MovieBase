const STORAGE_KEY = "movieRankrRankings";


// Available categories
export const CATEGORIES = [
    "Favorites",
    "Must Watch",
    "Action",
    "Comedy",
    "Drama",
    "Horror",
    "Sci-Fi"
];


// Get saved rankings
export function getRankings() {

    const saved =
        localStorage.getItem(STORAGE_KEY);

    if (!saved) {
        return [];
    }

    try {
        return JSON.parse(saved);
    } catch {
        return [];
    }
}


// Save rankings
export function saveRankings(rankings) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(rankings)
    );
}


// Check if movie is already ranked
export function isMovieRanked(movieId) {

    const rankings = getRankings();

    return rankings.some(
        movie => movie.id === movieId
    );
}


// Add movie
export function addMovie(movie) {

    const rankings = getRankings();

    if (
        rankings.some(
            item => item.id === movie.id
        )
    ) {
        return rankings;
    }

    rankings.push({
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        release_date: movie.release_date,
        vote_average: movie.vote_average,
        category: "Favorites",
        personalRating: 0
    });

    saveRankings(rankings);

    return rankings;
}


// Remove movie
export function removeMovie(index) {

    const rankings = getRankings();

    rankings.splice(index, 1);

    saveRankings(rankings);

    return rankings;
}


// Move movie
export function moveMovie(index, direction) {

    const rankings = getRankings();

    const newIndex =
        index + direction;

    if (
        newIndex < 0 ||
        newIndex >= rankings.length
    ) {
        return rankings;
    }

    [
        rankings[index],
        rankings[newIndex]
    ] = [
        rankings[newIndex],
        rankings[index]
    ];

    saveRankings(rankings);

    return rankings;
}


// Change category
export function updateCategory(
    index,
    category
) {

    const rankings = getRankings();

    rankings[index].category =
        category;

    saveRankings(rankings);

    return rankings;
}


// Change personal rating
export function updateRating(
    index,
    rating
) {

    const rankings = getRankings();

    rankings[index].personalRating =
        Number(rating);

    saveRankings(rankings);

    return rankings;
}