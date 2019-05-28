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
        // if we have a valid OCLC, include the book cover
        if (responseJson.docs[i].oclc != undefined) {
            printString += `<img src = \"http://covers.openlibrary.org/b/oclc/${responseJson.docs[i].oclc}-S.jpg\" alt="Cover of ${responseJson.docs[i].title}" class="book-cover-thumbnail">`;
        }
        printString += `Title: ${responseJson.docs[i].title}<br>
                        Author: ${responseJson.docs[i].author_name}<br>
                        Publisher: ${responseJson.docs[i].publisher}</p></li>`;
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
            $('#js-error-message').text(`Something went wrong: $ {err.message}`);
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