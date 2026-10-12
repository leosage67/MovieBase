const STORAGE_KEY =
    "movieRankrLists";

const ACTIVE_LIST_KEY =
    "movieRankrActiveList";


// ==================================================
// CREATE ID
// ==================================================

function createId() {

    if (
        crypto &&
        crypto.randomUUID
    ) {

        return crypto.randomUUID();

    }


    return Date.now().toString();
}


// ==================================================
// DEFAULT LIST
// ==================================================

function createDefaultLists() {

    return [

        {
            id:
                createId(),

            name:
                "My Favorites",

            movies:
                []
        }

    ];
}


// ==================================================
// NORMALIZE LISTS
// ==================================================

function normalizeLists(
    lists
) {

    let changed =
        false;


    lists.forEach(
        list => {

            if (
                !Array.isArray(
                    list.movies
                )
            ) {

                list.movies =
                    [];

                changed =
                    true;
            }


            list.movies.forEach(
                (movie, index) => {

                    if (
                        !movie.addedAt
                    ) {

                        movie.addedAt =
                            Date.now() -
                            (
                                (
                                    list.movies.length -
                                    index
                                )
                                * 60000
                            );

                        changed =
                            true;
                    }


                    if (
                        !Array.isArray(
                            movie.genres
                        )
                    ) {

                        movie.genres =
                            [];

                        changed =
                            true;
                    }


                    if (
                        movie.personalRating ===
                        undefined
                    ) {

                        movie.personalRating =
                            0;

                        changed =
                            true;
                    }

                }
            );

        }
    );


    if (
        changed
    ) {

        saveLists(
            lists
        );
    }


    return lists;
}


// ==================================================
// GET LISTS
// ==================================================

export function getLists() {

    const saved =
        localStorage.getItem(
            STORAGE_KEY
        );


    if (
        saved
    ) {

        try {

            const lists =
                JSON.parse(
                    saved
                );


            if (
                Array.isArray(
                    lists
                ) &&
                lists.length > 0
            ) {

                return normalizeLists(
                    lists
                );

            }

        } catch {

            console.log(
                "Could not read saved lists."
            );

        }

    }


    // ==============================================
    // OLD RANKING MIGRATION
    // ==============================================

    const oldRankings =
        localStorage.getItem(
            "movieRankrRankings"
        );


    if (
        oldRankings
    ) {

        try {

            const oldMovies =
                JSON.parse(
                    oldRankings
                );


            if (
                Array.isArray(
                    oldMovies
                )
            ) {

                const now =
                    Date.now();


                const movies =
                    oldMovies.map(
                        (movie, index) => ({

                            id:
                                movie.id,

                            title:
                                movie.title,

                            poster_path:
                                movie.poster_path,

                            release_date:
                                movie.release_date,

                            vote_average:
                                movie.vote_average,

                            personalRating:
                                movie.personalRating ||
                                0,

                            genres:
                                movie.genres ||
                                [],

                            addedAt:
                                now -
                                (
                                    (
                                        oldMovies.length -
                                        index
                                    )
                                    * 60000
                                )

                        })
                    );


                const migrated = [

                    {
                        id:
                            createId(),

                        name:
                            "My Favorites",

                        movies
                    }

                ];


                saveLists(
                    migrated
                );


                return migrated;
            }

        } catch {

            console.log(
                "Could not migrate old rankings."
            );

        }

    }


    const defaults =
        createDefaultLists();


    saveLists(
        defaults
    );


    return defaults;
}


// ==================================================
// SAVE
// ==================================================

export function saveLists(
    lists
) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
            lists
        )
    );
}


// ==================================================
// ACTIVE LIST ID
// ==================================================

export function getActiveListId() {

    const lists =
        getLists();


    const savedId =
        localStorage.getItem(
            ACTIVE_LIST_KEY
        );


    const valid =
        lists.some(
            list =>
                list.id ===
                savedId
        );


    if (
        valid
    ) {

        return savedId;
    }


    const firstId =
        lists[0].id;


    localStorage.setItem(
        ACTIVE_LIST_KEY,
        firstId
    );


    return firstId;
}


// ==================================================
// SET ACTIVE LIST
// ==================================================

export function setActiveListId(
    listId
) {

    const lists =
        getLists();


    const exists =
        lists.some(
            list =>
                list.id ===
                listId
        );


    if (
        !exists
    ) {

        return getActiveListId();
    }


    localStorage.setItem(
        ACTIVE_LIST_KEY,
        listId
    );


    return listId;
}


// ==================================================
// GET ACTIVE LIST
// ==================================================

export function getActiveList() {

    const lists =
        getLists();


    const id =
        getActiveListId();


    return (
        lists.find(
            list =>
                list.id ===
                id
        ) ||
        lists[0]
    );
}


// ==================================================
// CREATE LIST
// ==================================================

export function createList(
    name
) {

    const cleanName =
        name.trim();


    if (
        !cleanName
    ) {

        return getLists();
    }


    const lists =
        getLists();


    const newList = {

        id:
            createId(),

        name:
            cleanName,

        movies:
            []

    };


    lists.push(
        newList
    );


    saveLists(
        lists
    );


    setActiveListId(
        newList.id
    );


    return lists;
}


// ==================================================
// RENAME LIST
// ==================================================

export function renameList(
    listId,
    name
) {

    const cleanName =
        name.trim();


    if (
        !cleanName
    ) {

        return getLists();
    }


    const lists =
        getLists();


    const list =
        lists.find(
            item =>
                item.id ===
                listId
        );


    if (
        list
    ) {

        list.name =
            cleanName;

    }


    saveLists(
        lists
    );


    return lists;
}


// ==================================================
// DELETE LIST
// ==================================================

export function deleteList(
    listId
) {

    const lists =
        getLists();


    if (
        lists.length <= 1
    ) {

        return lists;
    }


    const wasActive =
        listId ===
        getActiveListId();


    const updated =
        lists.filter(
            list =>
                list.id !==
                listId
        );


    saveLists(
        updated
    );


    if (
        wasActive
    ) {

        setActiveListId(
            updated[0].id
        );
    }


    return updated;
}


// ==================================================
// MOVIE IN LIST?
// ==================================================

export function isMovieInList(
    movieId,
    listId =
        getActiveListId()
) {

    const lists =
        getLists();


    const list =
        lists.find(
            item =>
                item.id ===
                listId
        );


    if (
        !list
    ) {

        return false;
    }


    return list.movies.some(
        movie =>
            movie.id ===
            movieId
    );
}


// ==================================================
// ADD MOVIE
// ==================================================

export function addMovie(
    movie,
    listId =
        getActiveListId()
) {

    const lists =
        getLists();


    const list =
        lists.find(
            item =>
                item.id ===
                listId
        );


    if (
        !list
    ) {

        return lists;
    }


    const exists =
        list.movies.some(
            item =>
                item.id ===
                movie.id
        );


    if (
        exists
    ) {

        return lists;
    }


    list.movies.push({

        id:
            movie.id,

        title:
            movie.title,

        poster_path:
            movie.poster_path,

        release_date:
            movie.release_date,

        vote_average:
            movie.vote_average,

        personalRating:
            0,

        genres:
            Array.isArray(
                movie.genres
            )
                ? movie.genres.map(
                    genre =>
                        typeof genre ===
                        "string"
                            ? genre
                            : genre.name
                )
                : [],

        addedAt:
            Date.now()

    });


    saveLists(
        lists
    );


    return lists;
}


// ==================================================
// REMOVE MOVIE
// ==================================================

export function removeMovie(
    index,
    listId =
        getActiveListId()
) {

    const lists =
        getLists();


    const list =
        lists.find(
            item =>
                item.id ===
                listId
        );


    if (
        !list
    ) {

        return lists;
    }


    list.movies.splice(
        index,
        1
    );


    saveLists(
        lists
    );


    return lists;
}


// ==================================================
// MOVE MOVIE
// ==================================================

export function moveMovie(
    index,
    direction,
    listId =
        getActiveListId()
) {

    const lists =
        getLists();


    const list =
        lists.find(
            item =>
                item.id ===
                listId
        );


    if (
        !list
    ) {

        return lists;
    }


    const newIndex =
        index +
        direction;


    if (
        newIndex < 0 ||
        newIndex >=
            list.movies.length
    ) {

        return lists;
    }


    [
        list.movies[index],
        list.movies[newIndex]
    ] = [

        list.movies[newIndex],
        list.movies[index]

    ];


    saveLists(
        lists
    );


    return lists;
}


// ==================================================
// UPDATE RATING
// ==================================================

export function updateRating(
    index,
    rating,
    listId =
        getActiveListId()
) {

    const lists =
        getLists();


    const list =
        lists.find(
            item =>
                item.id ===
                listId
        );


    if (
        !list
    ) {

        return lists;
    }


    list.movies[index]
        .personalRating =
            Number(
                rating
            );


    saveLists(
        lists
    );


    return lists;
}


// ==================================================
// UPDATE GENRES
// ==================================================

export function updateMovieGenres(
    movieId,
    genres,
    listId
) {

    const lists =
        getLists();


    const list =
        lists.find(
            item =>
                item.id ===
                listId
        );


    if (
        !list
    ) {

        return lists;
    }


    const movie =
        list.movies.find(
            item =>
                item.id ===
                movieId
        );


    if (
        !movie
    ) {

        return lists;
    }


    movie.genres =
        Array.isArray(
            genres
        )
            ? genres
            : [];


    saveLists(
        lists
    );


    return lists;
}