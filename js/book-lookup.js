'use strict';

// URL for Open Library's Search API
const openLibrarySearchURL = 'https://openlibrary.org/search.json';
const openLibraryBookURL = 'https://openlibrary.org/api/books.json';

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

    // make sure that Book Details are hidden
    $('#js-book-details').addClass('hidden');

    console.log(responseJson);
    let totalValidResults = 0;
    let printString = '';
    // iterate through the data array
    for (let i = 0; i < responseJson.docs.length; i++) {
        if (("title" in responseJson.docs[i]) && ("isbn" in responseJson.docs[i])) {
            printString += `<li id=\"${responseJson.docs[i].isbn[responseJson.docs[i].isbn.length - 1]}\"><p class="search-results-book-details">`;
            // if we have a valid ISBN, try to include the book cover
            printString += `<img src = \"https://covers.openlibrary.org/b/isbn/${responseJson.docs[i].isbn[responseJson.docs[i].isbn.length - 1]}-M.jpg\" alt="Cover of ${responseJson.docs[i].title}" class="book-cover-thumbnail">`;
            if (("title" in responseJson.docs[i]) && ("subtitle" in responseJson.docs[i])) {
                printString += `Title: <a href=\"#\" id=\"` + `${responseJson.docs[i].isbn[responseJson.docs[i].isbn.length - 1]}` + `\">${responseJson.docs[i].title}: ${responseJson.docs[i].subtitle}</a><br>`;
            } else {
                printString += `Title: <a href=\"#\" id=\"` + `${responseJson.docs[i].isbn[responseJson.docs[i].isbn.length - 1]}` + `\">${responseJson.docs[i].title}</a><br>`;
            }
            if ("author_name" in responseJson.docs[i]) {
                printString += `Author: ${responseJson.docs[i].author_name}<br>`;
            }
            if ("edition_count" in responseJson.docs[i]) {
                printString += `Edition: ${responseJson.docs[i].edition_count}<br>`;
            }
            if ("publisher" in responseJson.docs[i]) {
                printString += `Publisher: ${responseJson.docs[i].publisher[responseJson.docs[i].publisher.length - 1]}<br>`;
            }
            if ("publish_year" in responseJson.docs[i]) {
                printString += `Year Published: ${responseJson.docs[i].publish_year[responseJson.docs[i].publish_year.length - 1]}<br>`;
            }
            if (responseJson.docs[i].isbn != undefined) {
                printString += `ISBN: ${responseJson.docs[i].isbn[responseJson.docs[i].isbn.length - 1]}<br>`;
            }
            printString += '</p></li>';
            totalValidResults++;
        }
    }
    let resultsString = `<p>Total of ${totalValidResults} Results Found</p>`;
    $('#js-book-search-results-list').append(resultsString);
    $('#js-book-search-results-list').append(printString);
    //display the results section  
    $('#js-book-search-results').removeClass('hidden');
};

// function to call search API
function performBookSearch(searchTitle, searchAuthor) {
    const params = {
        author: searchAuthor,
        title: searchTitle
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
            $('#js-error-message').text(`Error: ${err}`);
        });
}

// function to call book API
function performBookDetails(ISBN) {
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
            $('#js-error-message').text(`Error: ${err}`);
        });
}

function displayBookDetails(responseJson) {
    console.log(responseJson);
    // hide search results section
    $('#js-book-search-results').addClass('hidden');

    // if there are previous book details displayed, remove them
    $('#js-book-details').empty();
    let printString = '';
    let bookTitle = '';
    // if there is a subtitle, include the subtitle as part of the title
    if ("subtitle" in responseJson.docs[0]) {
        bookTitle = responseJson.docs[0].title + ': ' + responseJson.docs[0].subtitle;
    } else {
        bookTitle = responseJson.docs[0].title;
    }

    let bookAuthor = responseJson.docs[0].author_name;
    let bookCoverURL = `https://covers.openlibrary.org/b/isbn/${responseJson.docs[0].isbn[responseJson.docs[0].isbn.length-1]}-L.jpg`;
    let bookEdition = responseJson.docs[0].edition_count;
    let bookPublisher = responseJson.docs[0].publisher[responseJson.docs[0].publisher.length - 1];
    let bookYearPublished = responseJson.docs[0].publish_year[responseJson.docs[0].publish_year.length - 1];
    let bookISBN = responseJson.docs[0].isbn[0];
    printString += `<h1> ${bookTitle} </h1><img src=\"${bookCoverURL}\" class=\"book-cover-large\">`;
    printString += `<p>Book Author: ${bookAuthor}<br>
    Edition: ${bookEdition}<br>
    Publisher: ${bookPublisher}<br>
    Year Published: ${bookYearPublished}</p>`;
    $('#js-book-details').append(printString);
    // display book details section
    $('#js-book-details').removeClass('hidden');
}

// call appropriate functions based on interactions
function watchPage() {
    $('form').submit(event => {
        event.preventDefault();
        const searchTitle = $('#js-book-title').val();
        const searchAuthor = $('#js-book-author').val();
        performBookSearch(searchTitle, searchAuthor);
    });
    $('#js-book-search-results-list').on('click', 'a', function () {
        event.preventDefault();
        performBookDetails($(this).attr('id'));
    });
}

// call the watchPage function after the page is done loading
$(watchPage);