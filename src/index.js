import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const loadBtn = document.querySelector('.load-more');
let page = 1;
let lastSearchQuery = '';

form.addEventListener('submit', onSubmit);

async function onSubmit(e) {
  e.preventDefault();
  const inputValue = form.elements.searchQuery.value.trim();
  if (inputValue === '') {
    return;
  }
  axiosPosts(inputValue);
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

async function axiosPosts(inputValue) {
  if (inputValue !== lastSearchQuery) {
    gallery.innerHTML = ''; // Видалити попередню розмітку
    page = 1; // Обнулити значення сторінки
  }

  const URL = 'https://pixabay.com/api/';
  const API_KEY = '38929728-c9c9689bf16ca978c8f2f11e7';
  const params = new URLSearchParams({
    key: API_KEY,
    q: inputValue,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    page: page,
    per_page: 40,
  });
  page += 1;
  try {
    const { data } = await axios.get(`${URL}?key=${API_KEY}&${params}`);
    const { hits } = data;
    if (hits.length === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }
    gallery.insertAdjacentHTML('beforeend', addMarkup({ hits }));
    loadBtn.style.display = 'block';
    loadBtn.addEventListener('click', () => {
      axiosPosts(inputValue);
    });
    const lightbox = new SimpleLightbox('.gallery a', {
      captions: true,
      captionPosition: 'bottom',
      captionsData: 'alt',
      captionDelay: 500,
      animationSpeed: 500,
      fadeSpeed: 1000,
    });
    lightbox.refresh();
  } catch (error) {
    Notiflix.Notify.failure(error.message);
  }
}
