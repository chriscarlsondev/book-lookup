'use strict';

// URL for Open Library's Search API
const openLibrarySearchURL = 'https://openlibrary.org/search.json';
const youTubeSearchURL = 'https://www.googleapis.com/youtube/v3/search';
let youTubeAPIKey = '';

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
    $('#js-related-videos').empty();

    // make sure that Book Details are hidden
    $('#js-book-details').addClass('hidden');

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

function displayRelatedVideos(responseJson) {
    $('#js-related-videos').empty();
    let relatedVideosString = '<h3>Related Videos</h3>';
    // iterate through the items array
    for (let i = 0; i < responseJson.items.length; i++) {
        // for each video object in the items 
        //array, add a list item to the results 
        //list with the video title, description,
        //and thumbnail
        relatedVideosString += `<iframe width=\"500\" height=\"300\" src=\"https://www.youtube.com/embed/${responseJson.items[i].id.videoId}?controls=1&modestbranding=1&showinfo=0\" frameborder=\"0\" allow=\"accelerometer; encrypted-media; gyroscope;\" allowfullscreen></iframe>`;
    }
    $('#js-related-videos').append(relatedVideosString);
}

function getYouTubeVideos(query) {
    const params = {
        key: youTubeAPIKey,
        q: query,
        part: 'snippet',
        maxResults: 5
    };
    const queryString = formatQueryParams(params);
    const url = youTubeSearchURL + '?' + queryString;
    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => displayRelatedVideos(responseJson))
        .catch(err => {
            $('#js-error-message').text(`Something went wrong: ${err.message}`);
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
    let bookCoverURL = `https://covers.openlibrary.org/b/isbn/${responseJson.docs[0].isbn[responseJson.docs[0].isbn.length-1]}-L.jpg`;
    bookDetailsString += `<h2> ${bookTitle} </h2><img src=\"${bookCoverURL}\" class=\"book-cover-large\"><h3>Book Details</h3>`;
    if ("author_name" in responseJson.docs[0]) {
        bookDetailsString += `Author: ${responseJson.docs[0].author_name}<br>`;
    }
    if ("edition_count" in responseJson.docs[0]) {
        bookDetailsString += `Edition: ${responseJson.docs[0].edition_count}<br>`;
    }
    if ("publisher" in responseJson.docs[0]) {
        bookDetailsString += `Publisher: ${responseJson.docs[0].publisher[responseJson.docs[0].publisher.length - 1]}<br>`;
    }
    if ("publish_year" in responseJson.docs[0]) {
        bookDetailsString += `Year Published: ${responseJson.docs[0].publish_year[responseJson.docs[0].publish_year.length - 1]}<br>`;
    }
    if ("isbn" in responseJson.docs[0]) {
        bookDetailsString += `ISBN: ${responseJson.docs[0].isbn[responseJson.docs[0].isbn.length - 1]}<br>`;
    }
    $('#js-book-details').append(bookDetailsString);
    // display book details section
    $('#js-book-details').removeClass('hidden');

    let query = bookTitle + " book " + responseJson.docs[0].author_name;

    getYouTubeVideos(query);
    $('#js-related-videos').removeClass('hidden');
}

// call appropriate functions based on interactions
function watchPage() {
    $('form').submit(event => {
        event.preventDefault();
        const searchTitle = $('#js-book-title').val();
        const searchAuthor = $('#js-book-author').val();
        youTubeAPIKey = $('#js-youtube-api-key').val();
        performBookSearch(searchTitle, searchAuthor);
    });
    $('#js-book-search-results-list').on('click', 'a', function () {
        event.preventDefault();
        performBookDetails($(this).attr('id'));
    });
}

// call the watchPage function after the page is done loading
$(watchPage);