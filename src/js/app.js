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

const nextButton = document.querySelector('#next')
const previousButton = document.querySelector('#previous')


async function makeRequest(url, page = 1) {
    currentPage = page;

    console.log(currentPage)
    try {
        const response = await fetch(url + `&page=${page}`, {
            method: 'GET',
            headers: {
                'X-API-KEY': API_KEY,
                'Content-Type': 'application/json',
            }
        })
        const data = await response.json()
        availablePages = data.pagesCount
        console.log(typeof data, response, data)
        return data
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
    paginationList.innerHTML = ""
    for(let i = start; i <= end; i++) {
        const el = document.createElement("li");
        if(i === currentPage) {
            el.classList.add(
                "pagination__item", 
                "pagination__item--active"
            )
        }
        else {
            el.classList.add("pagination__item")
        }
        el.innerText = `${String(i)}`
        paginationList.appendChild(el)
    } 
    return Array.from(paginationList.children)
}

function activatePagination(url, start, end) {
    let _children = displayPagination(start, end)

    _children.forEach(el => {
        el.addEventListener("click", e => {
            const num = parseInt(e.target.innerText)
            console.log(num)

            if(num !== currentPage) {
                clearPagination()
                makeRequest(url, num)
                    .then(data => { showMovies(data) })
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
                    })   
            }
        })
    }) 
}



let x, y;

function initializePagination(url, amount, perPage) {
        let start = 1
        let end = start + perPage - 1
        activatePagination(url, start, end)

        console.log(start, end)

        nextButton.removeAllEventListeners()
        previousButton.removeAllEventListeners()
        
        function nextButtonClick (e) {
            if(
                (e.target.tagName.toLowerCase() === "button")
                &&
                (end !== amount)
            ) {
                console.log(e)
                start += perPage
                end += perPage
        
                activatePagination(url, start, end)
            }         
        }

        function previousButtonClick (e) {
            if(
                (e.target.tagName.toLowerCase() === "button") 
                && 
                (start > 1)
            ) {
                start -= perPage
                end -= perPage
                activatePagination(url, start, end)
            } 
        }
        
        nextButton.addEventListenerNew("click", (e) => {
            console.log(start, end)
            nextButtonClick(e)
        })
        

        previousButton.addEventListenerNew("click", (e) => {
            console.log(start, end)
            previousButtonClick(e)
        })
}




// TODO: ВЫНЕСТИ ЭТУ ЗАПИСЬ В ОТДЕЛЬНЫЙ ФАЙЛ - СДЕЛАТЬ ЗАПУСК ЕДИНОЖДЫМ
// !!! ЗАПУСКАЕТСЯ ПОСТОЯННО, ПРИ КАЖДОМ ОБНОВЛЕНИИ СТРАНИЦЫ
// !!! И ДАЖЕ ПРИ ПОИСКЕ, ПОЭТОМУ В ОУТПУТЕ ДУБЛИРУЮТСЯ ЗАПИСИ
// makeRequest(API_URL_TOP + search.value)
// .then(data => {
//     showMovies(data)
//     return data
// }).then(data => {
//     // console.log(data.pagesCount)
//     const pages = data.pagesCount > 20 ? 20 : data.pagesCount
//     paginationList.innerHTML = ""

//     initializePagination(
//         API_URL_TOP + search.value, 
//         20, 
//         5
//     )
// })



form.addEventListener('submit', e => {
    e.preventDefault();

    if(search.value) {
        makeRequest(API_URL_SEARCH + search.value)
            .then(data => {
                showMovies(data)
                return data
            }).then(data => {
                // console.log(data.pagesCount)
                const pages = data.pagesCount > 20 ? 20 : data.pagesCount

                initializePagination.call(
                    pages, 
                    API_URL_SEARCH + search.value, 
                    pages, 
                    1
                )
            })
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


