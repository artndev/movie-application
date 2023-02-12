const API_KEY_Y = "b259b5ac-2262-41fc-bcfc-14c64322b713";
const URL = "https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-keyword?keyword=а&page=1"


async function test() {
    const data = await fetch(URL,
        {method: 'GET',
        headers: {
            'X-API-KEY': API_KEY_Y,
            'Content-Type': 'application/json',
        }}
    )
    const js = await data.json().then(data => {
        console.log(data)
    })
}

test()