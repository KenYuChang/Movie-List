const BASE_URL = "https://movie-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/movies/";
const POSTER_URL = BASE_URL + "/posters/";
const MOVIES_PER_PAGE = 12;
const movies = []; //電影總清單
let filteredMovies = []; //搜尋清單

const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const paginator = document.querySelector("#paginator");
const switchMode = document.querySelector("#switch-mode");

function renderMovieList(data) {
  if (dataPanel.dataset.mode === "card-mode") {
    let rawHTML = "";
    data.forEach((item) => {
      // title, image, id
      rawHTML += `<div class="col-sm-3">
    <div class="mb-2">
      <div class="card">
        <img src="${
          POSTER_URL + item.image
        }" class="card-img-top" alt="Movie Poster">
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${
            item.id
          }">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${
            item.id
          }">+</button>
        </div>
      </div>
    </div>
  </div>`;
    });
    dataPanel.innerHTML = rawHTML;
  } else if (dataPanel.dataset.mode === "list-mode") {
    let rawHTML = "";
    data.forEach((item) => {
      // title, image, id
      rawHTML += `
      <ul class="list-group col-sm-12 mb-2">
        <li class="list-group-item d-flex justify-content-between align-items-center">
          <h5 class="card-title">${item.title}</h5>
          <div>
            <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal"
              data-id="${item.id}">More</button>
            <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
          </div>
        </li> 
      </ul>`;
    });

    dataPanel.innerHTML = rawHTML;
  }
}

function renderPaginator(amount) {
  //計算總頁數
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE);
  //製作 template
  let rawHTML = "";

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`;
  }
  //放回 HTML
  paginator.innerHTML = rawHTML;
}

function getMoviesByPage(page) {
  // 如果filteredMovies 是有東西的，就給我filteredMovies 沒有的話給我movies
  const data = filteredMovies.length ? filteredMovies : movies;
  //計算起始 index
  const startIndex = (page - 1) * MOVIES_PER_PAGE;
  //回傳切割後的新陣列
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE);
}

//modal 頁面
function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title");
  const modalImage = document.querySelector("#movie-modal-image");
  const modalDate = document.querySelector("#movie-modal-date");
  const modalDescription = document.querySelector("#movie-modal-description");

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results;
    modalTitle.innerText = data.title;
    modalDate.innerText = "Release date: " + data.release_date;
    modalDescription.innerText = data.description;
    modalImage.innerHTML = `<img src="${
      POSTER_URL + data.image
    }" alt="movie-poster" class="img-fluid">`;
  });
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
  const movie = movies.find((movie) => movie.id === id);

  if (list.some((movie) => movie.id === id)) {
    return alert("此電影已經在收藏清單中！");
  }

  list.push(movie);
  localStorage.setItem("favoriteMovies", JSON.stringify(list));
}
//mode 切換功能
function switchDisplayMode(displayMode) {
  if (dataPanel.dataset.mode === displayMode) return;
  dataPanel.dataset.mode = displayMode;
}
// mode監聽器
switchMode.addEventListener("click", function onSwitchClicked(event) {
  if (event.target.matches("#card-mode-btn")) {
    switchDisplayMode("card-mode");
    renderMovieList(getMoviesByPage(1));
  } else if (event.target.matches("#list-mode-btn")) {
    switchDisplayMode("list-mode");
    renderMovieList(getMoviesByPage(1));
  }
});

// listen to data panel
dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(Number(event.target.dataset.id));
  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id));
  }
});

//listen to search form
searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();

  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  );

  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`);
  }
  renderPaginator(filteredMovies.length);
  renderMovieList(getMoviesByPage(1));
});

// listen to paginator
paginator.addEventListener("click", function onPaginatorClicked(event) {
  if (event.target.tagName !== "A") return;
  const page = Number(event.target.dataset.page);
  renderMovieList(getMoviesByPage(page));
});
// send request to index api
axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results);
    renderPaginator(movies.length);
    renderMovieList(getMoviesByPage(1));
  })
  .catch((err) => console.log(err));
