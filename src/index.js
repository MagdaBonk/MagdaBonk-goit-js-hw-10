import './css/styles.css';
import _debounce from 'lodash.debounce';
import { Notify } from 'notiflix';
import fetchCountries from './fetchCountries';

const DEBOUNCE_DELAY = 300;

const searchBox = document.querySelector('#search-box');
const countryList = document.querySelector('.country-list');
const countryInfo = document.querySelector('.country-info');

searchBox.addEventListener('input', _debounce(inputListener, DEBOUNCE_DELAY));

function inputListener(event) {
  countryList.innerHTML = '';
  countryInfo.innerHTML = '';
  const countryName = event.target.value;
  if (countryName.length) {
    RenderCountries(countryName);
  }
}

function createReturnButton() {
  const returnButton = document.createElement('button');
  returnButton.textContent = 'Clear results';
  returnButton.classList.add('return-button');
  countryList.prepend(returnButton);
  returnButton.addEventListener('click', () => {
    countryList.innerHTML = '';
    countryInfo.innerHTML = '';
    searchBox.value = '';
  });
}

const onlyLettersAndSpaces = str => {
  return /^[A-Za-z\s]*$/.test(str);
};

function RenderCountries(countryName) {
  if (onlyLettersAndSpaces(countryName)) {
    fetchCountries(countryName)
      .then(searchResult => {
        renderCountryList(searchResult);
        const items = document.querySelectorAll('.country-list__item');
        items.forEach(item =>
          item.addEventListener('click', () => {
            const countryName = item.querySelector('#countryName').innerHTML;
            const foundName = searchResult.find(
              ({ name }) => name === countryName
            );
            const newInfo = getMoreInfo(foundName);
            const frontReplaced = newInfo.replaceAll('undefined', '');
            countryInfo.innerHTML = frontReplaced;
            createReturnButton(countryName);
          })
        );
        if (searchResult.length === 1) {
          createReturnButton(countryName);
        }
      })
      .catch(error => {
        console.log(error);
        Notify.failure('Oops, there is no country with that name');
      });
  } else {
    Notify.info('You can use only letters and spaces');
  }
}

function renderCountryList(countries) {
  if (countries.length > 10) {
    Notify.info('Too many matches found. Please enter a more specific name.');
  } else if (countries.length >= 2 && countries.length <= 10) {
    countryList.innerHTML = '';
    countryInfo.innerHTML = '';
    const allCountries = countries
      .map(country => {
        return `<li class='name country-list__item'><img src='${country.flags.svg}' class='name__img'><p id='countryName'>${country.name}</p></li>`;
      })
      .join(' ');
    const frontReplaced = allCountries.replaceAll('undefined', '');
    countryList.innerHTML = frontReplaced;
  } else {
    countryList.innerHTML = '';
    const allCountries = countries
      .map(country => getMoreInfo(country))
      .join(' ');

    const frontReplaced = allCountries.replaceAll('undefined', '');
    countryInfo.innerHTML = frontReplaced;
  }
}

function getMoreInfo(country) {
  countryList.innerHTML = '';
  const parsedLanguages = country.languages.map(lang => lang.name).join(', ');
  return (
    `<ul class='country-info__list'>
      <li class='name'><img src='${country.flags.svg}' class='name__img' alt='Flag of ${country.name}'><p class='country-info__name'><b>${country.name}</b></p></li>
      <li class='country-info__item'><b>Capital:</b> ` +
    (country.capital !== undefined ? `${country.capital}` : '-') +
    `</li>
      <li class='country-info__item'><b>Population:</b> ${country.population}</li>
      <li class='country-info__item'><b>Language` +
    (country.languages.length > 1 ? 's' : '') +
    `:</b> ${parsedLanguages}</li></ul>`
  );
}
