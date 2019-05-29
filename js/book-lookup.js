'use strict';

// URL for Open Library's Search API
const openLibrarySearchURL = 'https://openlibrary.org/search.json';

// function convert our parameters into a valid query string
function formatQueryParams(params) {
    const queryItems = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    return queryItems.join('&');
}

// function to display all of the search results returned in the JSON object
function displayBookSearchResults(responseJson) {
    // if there are previous results, remove them
    $('#js-book-search-results-list').empty();
    $('#js-error-message-text').empty();

    // make sure that Book Details are hidden
    $('#js-book-details').addClass('hidden');
    $('#js-back-to-results').addClass('hidden');

    let totalValidResults = 0;
    let printString = '';
    // iterate through the data array
    if (responseJson.numFound == 0) {
        $('#js-error-message-text').text('No results found.');
    } else {
        for (let i = 0; i < responseJson.docs.length; i++) {
            if (("title" in responseJson.docs[i]) && ("isbn" in responseJson.docs[i])) {
                printString += `<li id=\"${responseJson.docs[i].isbn[0]}\"><p class="search-results-book-details">`;
                // if we have a valid ISBN, try to include the book cover
                let lastISBN = responseJson.docs[i].isbn.length - 1;
                printString += `<img src = \"https://covers.openlibrary.org/b/isbn/${responseJson.docs[i].isbn[lastISBN]}-M.jpg\" alt="Cover of ${responseJson.docs[i].title}" class="book-cover-thumbnail">`;
                if (("title" in responseJson.docs[i]) && ("subtitle" in responseJson.docs[i])) {
                    printString += `Title: <a href=\"#\" id=\"` + lastISBN + `\">${responseJson.docs[i].title}: ${responseJson.docs[i].subtitle}</a>`;
                } else {
                    printString += `Title: <a href=\"#\" id=\"` + `${responseJson.docs[i].isbn[0]}` + `\">${responseJson.docs[i].title}</a>`;
                }
                if ("publish_year" in responseJson.docs[i]) {
                    printString += ' (' + responseJson.docs[i].publish_year[responseJson.docs[i].publish_year.length - 1] + ')<br>';
                }
                printString += '</p></li>';
            }
        }
    }
    $('#js-book-search-results-list').append(printString);
    //display the results section  
    $('#js-book-search-results').removeClass('hidden');
}
// function to call search API
function performBookSearch(searchTitle, searchAuthor) {
    const params = {
        author: searchAuthor,
        title: searchTitle,
        sort: 'new',
        lang: 'eng'
    };
    const queryString = formatQueryParams(params);
    const url = openLibrarySearchURL + '?' + queryString;
    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => displayBookSearchResults(responseJson))
        .catch(err => {
            $('#js-error-message-text').text(`Error: ${err}`);
        });
}

// function to call book API
function getBookDetails(ISBN) {
    const params = {
        isbn: ISBN,
    };
    const queryString = formatQueryParams(params);
    const url = openLibrarySearchURL + '?' + queryString;
    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => displayBookDetails(responseJson))
        .catch(err => {
            $('#js-error-message-text').text(`Error: ${err}`);
        });
}

function displayBookDetails(responseJson) {
    // hide search results section
    $('#js-book-search-results').addClass('hidden');
    // if there are previous book details displayed, remove them
    $('#js-book-details').empty();
    let bookDetailsString = '';
    let bookTitle = '';
    // if there is a subtitle, include the subtitle as part of the title
    if ("subtitle" in responseJson.docs[0]) {
        bookTitle = responseJson.docs[0].title + ': ' + responseJson.docs[0].subtitle;
    } else {
        bookTitle = responseJson.docs[0].title;
    }
    let bookCoverURL = `https://covers.openlibrary.org/b/isbn/${responseJson.docs[0].isbn[0]}-L.jpg`;
    bookDetailsString += `<h2> ${bookTitle} </h2><img src=\"${bookCoverURL}\" class=\"book-cover-large\"><h3>Book Details</h3>`;
    if ("author_name" in responseJson.docs[0]) {
        bookDetailsString += `Author(s): ${responseJson.docs[0].author_name}<br>`;
    }
    if ("publisher" in responseJson.docs[0]) {
        bookDetailsString += `Publisher: ${responseJson.docs[0].publisher[0]}<br>`;
    }
    if ("publish_year" in responseJson.docs[0]) {
        bookDetailsString += `Most Recent Year Published: ${responseJson.docs[0].publish_year[responseJson.docs[0].publish_year.length - 1]}<br>`;

    }
    if ("first_publish_year" in responseJson.docs[0]) {
        bookDetailsString += `First Year Published: ${responseJson.docs[0].first_publish_year}<br>`;
    }
    if ("isbn" in responseJson.docs[0]) {
        bookDetailsString += `ISBN: ${responseJson.docs[0].isbn[0]}<br>`;
    }
    $('#js-book-details').append(bookDetailsString);
    // display book details section
    $('#js-book-details').removeClass('hidden');
    $('#js-back-to-results').removeClass('hidden');
}

function performBackToResults() {
    $('#js-book-details').addClass('hidden');
    $('#js-back-to-results').addClass('hidden');
    $('#js-book-search-results').removeClass('hidden');
}
// call appropriate functions based on interactions
function watchPage() {
    $('#btn-search').click(event => {
        event.preventDefault();
        const searchTitle = $('#js-book-title').val();
        const searchAuthor = $('#js-book-author').val();
        performBookSearch(searchTitle, searchAuthor);
    });
    $('#js-book-search-results-list').on('click', 'a', function () {
        event.preventDefault();
        getBookDetails($(this).attr('id'));
    });
    $('#btn-back-to-results').click(event => {
        event.preventDefault();
        performBackToResults();
    });
}

// call the watchPage function after the page is done loading
$(watchPage);