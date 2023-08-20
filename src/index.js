import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const loadBtn = document.querySelector('.load-more');
const lightbox = new SimpleLightbox('.gallery a', {
  captions: true,
  captionPosition: 'bottom',
  captionsData: 'alt',
  captionDelay: 500,
  animationSpeed: 500,
  fadeSpeed: 1000,
});
let page = 1;
let inputValue = '';
const perPage = 40;

form.addEventListener('submit', onSubmit);

loadBtn.addEventListener('click', () => {
  axiosPosts(inputValue);
});

async function onSubmit(e) {
  e.preventDefault();
  inputValue = form.elements.searchQuery.value.trim();
  if (inputValue === '') {
    return;
  }
  gallery.innerHTML = '';
  page = 1;
  axiosPosts(inputValue);

  return inputValue;
}

async function axiosPosts(inputValue) {
  const URL = 'https://pixabay.com/api/';
  const API_KEY = '38929728-c9c9689bf16ca978c8f2f11e7';
  const params = new URLSearchParams({
    key: API_KEY,
    q: inputValue,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    page: page,
    per_page: perPage,
  });
  const { data } = await axios.get(`${URL}?key=${API_KEY}&${params}`);
  workWithData({ data });
}

function workWithData({ data }) {
  try {
    const { hits } = data;
    const { totalHits } = data;
    console.log(totalHits);
    const totalPages = totalHits / perPage;

    if (hits.length === 0) {
      loadBtn.style.display = 'none';
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }
    loadBtn.style.display = 'block';
    gallery.insertAdjacentHTML('beforeend', addMarkup({ hits }));

    lightbox.refresh();
    page += 1;
    if (page > totalPages) {
      loadBtn.style.display = 'none';
      Notiflix.Notify.failure(
        "We're sorry, but you've reached the end of search results."
      );
      return;
    }
  } catch (error) {
    Notiflix.Notify.failure(error);
  }
}

function addMarkup({ hits }) {
  const markup = hits
    .map(
      ({
        webformatURL,
        tags,
        largeImageURL,
        likes,
        views,
        comments,
        downloads,
      }) =>
        `<a href='${largeImageURL}'><div class="photo-card">
        <div class = 'photo-window'>
  <img src="${webformatURL}" alt="${tags}" loading="lazy" width=360px/></div>
  <div class="info">
    <p class="info-item">
      <b>Likes</b>
      ${likes}
    </p>
    <p class="info-item">
      <b>Views</b>
      ${views}
    </p>
    <p class="info-item">
      <b>Comments</b>
      ${comments}
    </p>
    <p class="info-item">
      <b>Downloads</b>
      ${downloads}
    </p>
  </div>
</div></a>`
    )
    .join('');
  return markup;
}
