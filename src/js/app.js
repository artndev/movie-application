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
const noResults = document.querySelector('.no__results')

const paginationList = document.querySelector('.pagination__list')
const paginationWrapper = document.querySelector('.pagination__wrapper')

const nextButton = document.querySelector('#next')
const previousButton = document.querySelector('#previous')
let currentPage;

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


// =================== MODAL ===================== //


function closeModal() {
    modalElement.classList.remove("modal--show");
    document.body.classList.remove("stop-scrolling");
}


function openModal(id) {
    makeRequest(API_URL_DETAILS + id)
        .then(data => {
            console.log(`Movie with ID-${id} details =>`, data)
            modalElement.classList.add("modal--show");
            document.body.classList.add("stop-scrolling");

            modalElement.innerHTML = `
              <div class="modal__card">
                <img class="modal__movie-backdrop" src="${data.posterUrl}" alt="">
                <h2>
                  <span class="modal__movie-title">${data.nameRu}</span>
                  <span class="modal__movie-release-year"> - ${data.year}г.</span>
                </h2>
                <ul class="modal__movie-info">
                  <div class="loader"></div>
                  <li class="modal__movie-genre">
                     <b>Жанр(ы):</b> 
                     <p>
                        ${data.genres.map((el) => ` <em>${el.genre}</em>`)}
                     </p>
                  </li>
                    ${
                        data.filmLength 
                        ? 
                        `
                        <li class="modal__movie-runtime">
                            <b>Время:</b> ${data.filmLength} мин.
                        </li>` 
                        : 
                        ''
                    }
                  <li>
                    <b>Сайт:</b>
                    <p>
                        <a class="modal__movie-site" href="${data.webUrl}">
                            ${data.webUrl}
                        </a>
                    </p>
                  </li>
                  ${
                        data.description
                        ?
                            data.description.trim().length > 210
                            ?
                            `
                            <li class="modal__movie-overview">
                                <b>Краткое описание</b>:
                                <p>
                                    ${data.description.trim().slice(0, 210)}
                                    <a 
                                        class="modal__movie-site" 
                                        style="text-decoration: none;"
                                        href="${data.webUrl}">
                                    ...</a>
                                </p>
                            </li>`
                            :
                            `
                            <li class="modal__movie-overview">
                                <b>Описание</b>:
                                <p>
                                    ${data.description}
                                </p>
                            </li>`
                        :
                        ''
                  }
                </ul>
                <button type="button" class="modal__button-close">
                    <i class="fa-solid fa-xmark"></i>
                </button>
              </div>
            `
            gsap.timeline()
                .to(".modal", {
                    duration: 0.3,
                    ease: "in",
                    backgroundColor: "rgba(0, 0, 0, 0.5)"
                })
                .fromTo(".modal__card", 
                    { 
                        duration: 0.5,
                        ease: "none",
                        transform: "translateY(-100vh)"
                    },
                    {
                        duration: 0.5,
                        ease: "in",
                        transform: "translateY(0vh)"
                    }
                )

            const closeButton = document.querySelector(".modal__button-close");
            closeButton.addEventListener("click", () => {
                gsap.timeline()
                    .to(".modal__card", {
                        duration: 0.5,
                        ease: "out",
                        transform: "translateY(-100vh)"
                    })
                    .to(".modal", {
                        duration: 0.3,
                        ease: "out",
                        backgroundColor: "rgba(0, 0, 0, 0)",
                        onComplete: () => closeModal()
                    })
            });
        })
  }


// =================== MAIN ===================== //


function showMovies(data) {
    const moviesElement = document.querySelector(".movies");
    moviesElement.innerHTML = "";    

    data.films
        .filter(el => { return el.nameRu })
        .forEach(movie => {
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
                        ${movie.genres.map(genre => ` <em>${genre.genre}</em>`)}
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


function clearPagination() {
    let _children = Array.from(paginationList.children)


    _children.forEach(el => {
        if(el.classList.contains("pagination__item--active")) {
            el.classList.remove("pagination__item--active")
        }
    })
}


async function makeRequest(url, page = 0) {
    currentPage = page;

    console.log("Current page ->", currentPage)
    try {
        const response = 
        await fetch(
            `${url.replace(" ", "%20")}${page !== 0 ? `&page=${page}` : ""}`, 
            {
            method: 'GET',
            headers: {
                'X-API-KEY': API_KEY,
                'Content-Type': 'application/json',
            }
        })
        const data = await response.json()
        console.group(`Answer on ${url}` + `&page=${page}`)
        console.log(response, data)
        console.groupEnd()
        return data
    }
    catch {
        throw new Error("A trouble was appeared with the response!")
    }     
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
        else 
            el.classList.add("pagination__item")
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





function initializePagination(url, amount, perPage) {
        let start = 1
        let end = start + perPage - 1
        activatePagination(url, start, end)


        nextButton.removeAllEventListeners()
        previousButton.removeAllEventListeners()

        function nextPage() {
            console.group("Next page ->")
            console.log(start, end)
            console.groupEnd()
            if(end !== amount) {
                start += perPage
                end += perPage
        
                activatePagination(url, start, end)
            }  
        }

        function previousPage() {
            console.group("<- Previous page")
            console.log(start, end)
            console.groupEnd()
            if(start > 1) {
                start -= perPage
                end -= perPage

                activatePagination(url, start, end)
            } 
        }

        nextButton.addEventListenerNew("click", () => {
            nextPage()
        })
        
        previousButton.addEventListenerNew("click", () => {
            previousPage()
        })

        window.addEventListener("keypress", e => {
            if(e.key.toLowerCase() === "e") {
                nextPage()
            }
            else if(e.key.toLowerCase() === "q") {
                previousPage()
            }
        })
}



makeRequest(API_URL_TOP, 1)
    .then(data => {
        showMovies(data)
        return data
    }).then(data => {
        const pages = data.pagesCount > 20 ? 20 : data.pagesCount

        initializePagination(
            API_URL_TOP, 
            pages, 
            1
        )
    })


form.addEventListener('submit', e => {
    e.preventDefault();

    if(search.value) {
        makeRequest(API_URL_SEARCH + search.value, 1)
            .then(data => {
                showMovies(data)
                return data
            }).then(data => {
                const pages = data.pagesCount > 20 ? 20 : data.pagesCount

                if(pages > 0) {
                    initializePagination(
                        API_URL_SEARCH + search.value, 
                        pages, 
                        1
                    )
                    paginationWrapper.style.display = "flex"
                    noResults.style.display = "none"
                }
                else {
                    paginationWrapper.style.display = "none"
                    noResults.style.display = "flex"
                }
            }).finally(() => {
                search.value = ""
            })
    }
});











