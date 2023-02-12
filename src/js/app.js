const API_KEY = "b259b5ac-2262-41fc-bcfc-14c64322b713";
const API_URL_TOP = 
    "https://kinopoiskapiunofficial.tech/api/v2.2/films/top?type=TOP_100_POPULAR_FILMS";
const API_URL_SEARCH = 
    "https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-keyword?keyword=";
const API_URL_DETAILS = 
    "https://kinopoiskapiunofficial.tech/api/v2.2/films/";

const form = document.querySelector('form');
const search = document.querySelector('.header__search');

const modalElement = document.querySelector('.modal');
const paginationList = document.querySelector('.pagination__list')

function getClassByRate(vote) {
    if(vote >= 7) {
        return "green"
    }
    else if(vote > 5) {
        return "orange"
    }
    else {
        return "red"
    }
}

// =================== MAIN ===================== //


function showMovies(data) {
    const moviesElement = document.querySelector(".movies");
    moviesElement.innerHTML = "";    

    data.films.forEach(movie => {
        const card = document.createElement("div");

        card.classList.add("movie");
        card.innerHTML = `
            <div class="movie__cover-inner">
                <img 
                    src="${movie.posterUrlPreview}" 
                    class="movie__cover" 
                    alt="${movie.nameRu}" 
                />
                <div class="movie__cover--darkened"></div>
            </div>
            <div class="movie__info">
                <div class="movie__title">
                    ${movie.nameRu}
                </div>
                <div class="movie__category">
                    ${movie.genres.map(genre => ` ${genre.genre}`)}
                </div>
                ${
                    movie.rating > 0 
                    ? 
                    `
                    <div class="movie__average movie__average--${getClassByRate(movie.rating)}">
                        ${movie.rating}
                    </div>
                    `
                    :
                    ""
                }
            </div>
        `;
        card.addEventListener("click", () => openModal(movie.filmId))
        moviesElement.appendChild(card);
    });
}




// =================== PAGINATION ===================== //



let currentPage;
let currentLink = API_URL_TOP;


const nextButton = document.querySelector('#next')
const previousButton = document.querySelector('#previous')


async function makeRequest(url, page = 1) {
    currentPage = page;
    currentLink = url;

    try {
        const response = await fetch(url + `&page=${page}`, {
            method: 'GET',
            headers: {
                'X-API-KEY': API_KEY,
                'Content-Type': 'application/json',
            }
        })
        if(response.ok) {
            const data = await response.json()
            availablePages = data.pagesCount
            console.log(typeof data, response, data)
            return data
        }
    }
    catch {
        throw new Error("Something is going wrong!")
    }
}



function clearPagination() {
    let _children = Array.from(paginationList.children)


    _children.forEach(el => {
        if(el.classList.contains("pagination__item--active")) {
            el.classList.remove("pagination__item--active")
        }
    })
}




function displayPagination(start, end) {
    return new Promise(resolve => {
        for(let i = start; i <= end; i++) {
            // ======== Добавление элемента ==========
            const el = document.createElement("li")
    
            el.classList.add("pagination__item")
            if(i === 1) {
                el.classList.add("pagination__item--active")
            }

            el.innerText =`${i.toString()}`
            paginationList.appendChild(el)
            resolve()
        }
    })
}

function activateButtons(start = 1, end = 2, total) {
    return new Promise(resolve => {
        displayPagination(start, end)
            .then(() => {
                nextButton.addEventListener("click", () => {
                    if(end !== total) {
                        end += 1
                        start += 1
                        paginationList.innerHTML = ""
                    
                        displayPagination(start, end)
                        activatePagination()
                    }
                })
                
                previousButton.addEventListener("click", () => {
                    if(start !== 1) {
                        end -= 1
                        start -= 1
                        paginationList.innerHTML = ""
                    
                        displayPagination(start, end)
                        activatePagination()
                    }
                }) 
                resolve()
            })
    })
}



async function activatePagination() {
    return new Promise(resolve => {
        let _children = Array.from(paginationList.children)

        _children.forEach(el => {
            el.addEventListener("click", e => {
                if(parseInt(e.target.innerText) !== currentPage) {
                    clearPagination()
                    makeRequest(currentLink, parseInt(e.target.innerText))
                        .then(data => {
                            showMovies(data)
                        })
                        .then(() => {
                            e.target.classList.add(
                                "pagination__item--active"
                            )
                        })
                        .finally(() => {
                            window.scrollTo({
                                top: 0,
                                behavior: 'smooth'
                            })
                            resolve()
                        })   
                }
            })
        })
    })
}

makeRequest(API_URL_TOP)
    .then(data => {
        paginationList.innerHTML = ""
        return data
    })
    .then(data => {
        showMovies(data)
        activateButtons(1, 10, 30).then(() => activatePagination())
    })





form.addEventListener('submit', e => {
    e.preventDefault();

    if(search.value) {
        makeRequest(API_URL_SEARCH + search.value)
            .then(data => {
                paginationList.innerHTML = ""
                return data
            })
            .then(data => {
                showMovies(data)
                activateButtons(1, 10, 30).then(() => activatePagination())
            })
        search.value = "";
    }
});


// async function main() {
//     // Modal window

//     async function openModal(id) {
//         getMovies(API_URL_DETAILS + id).then(responseData => {
//             modalElement.classList.add("modal--show");
//             document.body.classList.add("stop-scrolling");
        
//             modalElement.innerHTML = `
//                 <div class="modal__card">
//                     <img class="modal__movie-backdrop" src="${responseData.posterUrl}" alt="">
//                     <h2>
//                         <span class="modal__movie-title">${responseData.nameRu} - ${responseData.year}г</span> 
//                     </h2>
//                     <ul class="modal__movie-info">
//                         <div class="loader"></div>
//                         <li class="modal__movie-genre">
//                             Жанр(ы):
//                             <p>
//                                 ${responseData.genres.map(genre => ` <span>${genre.genre}</span>`)}
//                             </p>
//                         </li>
//                         ${
//                             responseData.filmLength > 0
//                             ?
//                             `
//                                 <li class="modal__movie-runtime">
//                                     Время: ${responseData.filmLength} минут
//                                 </li>
//                             `
//                             :
//                             ""
//                         }
//                         <li>
//                             Сайт: 
//                             <a class="modal__movie-site" href="${responseData.webUrl}">
//                                 ${responseData.webUrl}
//                             </a>
//                         </li>
//                         <li class="modal__movie-overview">
//                             Описание:
//                             <p>
//                                 ${responseData.description}
//                             </p>
//                         </li>
//                     </ul>
//                     <button type="button" class="modal__button-close">Закрыть</button>
//                 </div>
//             `;
        
//             const btnClose = document.querySelector(".modal__button-close");
//             btnClose.addEventListener("click", () => closeModal());
//         })
//     }

//     function closeModal() {
//         modalElement.classList.remove("modal--show");
//         document.body.classList.remove("stop-scrolling");
//     }


//     window.addEventListener("click", event => {
//         if(event.target === modalElement) {
//             closeModal();
//         }
//     });
    
//     window.addEventListener("keydown", event => {
//         if(event.keyCode === 27) {
//             closeModal();
//         }
//     });


//     // Main section

//     async function getMovies(url) {
//         const response = await fetch(url, {
//             method: 'GET',
//             headers: {
//                 'X-API-KEY': API_KEY,
//                 'Content-Type': 'application/json',
//             },
//         });
//         const responseData = await response.json();
//         return responseData
//     }

//     // function showMovies(data) {
//     //     const moviesElement = document.querySelector(".movies");
//     //     moviesElement.innerHTML = "";    
    
//     //     data.films.forEach(movie => {
//     //         const card = document.createElement("div");
    
//     //         card.classList.add("movie");
//     //         card.innerHTML = `
//     //             <div class="movie__cover-inner">
//     //                 <img 
//     //                     src="${movie.posterUrlPreview}" 
//     //                     class="movie__cover" 
//     //                     alt="${movie.nameRu}" 
//     //                 />
//     //                 <div class="movie__cover--darkened"></div>
//     //             </div>
//     //             <div class="movie__info">
//     //                 <div class="movie__title">
//     //                     ${movie.nameRu}
//     //                 </div>
//     //                 <div class="movie__category">
//     //                     ${movie.genres.map(genre => ` ${genre.genre}`)}
//     //                 </div>
//     //                 ${
//     //                     movie.rating > 0 
//     //                     ? 
//     //                     `
//     //                     <div class="movie__average movie__average--${getClassByRate(movie.rating)}">
//     //                         ${movie.rating}
//     //                     </div>
//     //                     `
//     //                     :
//     //                     ""
//     //                 }
//     //             </div>
//     //         `;
//     //         card.addEventListener("click", () => openModal(movie.filmId))
//     //         moviesElement.appendChild(card);
//     //     });
//     // }



//     getMovies(API_URL_TOP).then(data => showMovies(data));
// }

// main()






// Modal 


