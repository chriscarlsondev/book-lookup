'use strict';

// put your own value below!
const openLibraryURL = 'http://openlibrary.org/search.json';


function formatQueryParams(params) {
    const queryItems = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    return queryItems.join('&');
}

function displayResults(responseJson) {
    // if there are previous results, remove them
    $('#js-book-search-results-list').empty();
    console.log(responseJson);
    let printString = `<p>Total of ${responseJson.numFound} Results Found</p>`;
    // iterate through the data array
    for (let i = 0; i < responseJson.docs.length; i++) {
        printString += '<li><p class="search-results-book-details">';
        // if we have a valid ISBN, try to include the book cover
        if (responseJson.docs[i].isbn != undefined) {
            printString += `<img src = \"http://covers.openlibrary.org/b/isbn/${responseJson.docs[i].isbn[responseJson.docs[i].isbn.length-1]}-M.jpg\" alt="Cover of ${responseJson.docs[i].title}" class="book-cover-thumbnail">`;
        }
        if (responseJson.docs[i].title != undefined) {
            printString += `Title: ${responseJson.docs[i].title}<br>`;
        }
        if (responseJson.docs[i].author_name != undefined) {
            printString += `Author: ${responseJson.docs[i].author_name}<br>`;
        }
        if (responseJson.docs[i].publish_year != undefined) {
            printString += `Edition: ${responseJson.docs[i].edition_count}<br>`;
        }
        if (responseJson.docs[i].publisher != undefined) {
            printString += `Publisher: ${responseJson.docs[i].publisher[responseJson.docs[i].publisher.length-1]}<br>`;
        }
        if (responseJson.docs[i].publish_year != undefined) {
            printString += `Year Published: ${responseJson.docs[i].publish_year[responseJson.docs[i].publish_year.length-1]}<br>`;
        }
        if (responseJson.docs[i].isbn != undefined) {
            printString += `ISBN: ${responseJson.docs[i].isbn[responseJson.docs[i].isbn.length-1]}<br>`;
        }
        printString += '</p></li>';
    }
    $('#js-book-search-results-list').append(printString);
    //display the results section  
    $('#js-book-search-results-list').removeClass('hidden');
};

function getBookResults(searchTitle, searchAuthor) {
    const params = {
        author: searchAuthor,
        title: searchTitle
    };
    const queryString = formatQueryParams(params);
    const url = openLibraryURL + '?' + queryString;
    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => displayResults(responseJson))
        .catch(err => {
            $('#js-error-message').text(`Error: ${err}`);
        });

}

function watchForm() {
    $('form').submit(event => {
        event.preventDefault();
        const searchTitle = $('#js-book-title').val();
        const searchAuthor = $('#js-book-author').val();
        getBookResults(searchTitle, searchAuthor);
    });
}

$(watchForm);