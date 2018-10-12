import axios from 'axios'
const R = require('ramda');
const parseString = require('xml2js').parseString;

export function bookSearch(query, page) {

  return (dispatch) => {
    dispatch(fetchingBooks())
    axios.get('https://www.goodreads.com/search/index.xml?key=rgMebNe9PaPTpob7TImEw&q=' + query + '&page=' + page, { crossdomain: true })
      .then(function (response) {
        parseString(response.data, { trim: true }, function (err, convertedResult) {
          if (err) throw err

          let booksData = convertedResult.GoodreadsResponse.search[0].results[0].work
          if (booksData) {

            let formatedData = R.map(extractBook, booksData)

            if (page === 1) {
              let results = convertedResult.GoodreadsResponse.search[0]['total-results'][0]
              dispatch(updateBooks(formatedData))
              dispatch(updateTotalResults(results))
            }
            else {
              dispatch(addBooks(formatedData))
              let results = convertedResult.GoodreadsResponse.search[0]['total-results'][0]
              dispatch(updateTotalResults(results))

            }
          }
          else if (page === 1) {
            dispatch({
              type: "RECEIVE_BOOKS", payload: {
                books: []
              }
            })
          }
          else {
            //no more results 
            console.log('no more results ')
            dispatch({
              type: "NO_MORE_RESULTS"
            })
          }

        });
      })
      .catch(function (error) {
        console.log(error);
        console.log('no more results ')
        dispatch({
          type: "NO_MORE_RESULTS"
        })
      })
  }

}

export function getSingleBookDetails(id) {
  return (dispatch) => {
    dispatch(addSingleBook({}))
    axios.get('https://www.goodreads.com/book/show.xml?key=rgMebNe9PaPTpob7TImEw&id=' + id, { crossdomain: true })
      .then(async function (response) {

        await parseString(response.data, { trim: true }, function (err, convertedResult) {
          if (err) throw err
          let details = convertedResult.GoodreadsResponse
          let bookDetails = {
            name: details.book[0].title[0],
            author: details.book[0].authors[0].author[0].name[0],
            avg_rating: details.book[0].average_rating[0],
            total_rating: details.book[0].ratings_count[0],
            imageURL: details.book[0].image_url[0]
          }
          console.log('addSingleBook')
          dispatch(addSingleBook(bookDetails))
        });

      })
      .catch(function (error) {
        console.log(error);
        dispatch(addSingleBook({
          name: 'Not Found',
          author: 'Not Found',
          avg_rating: 'Not Found',
          total_rating: 'Not Found',
          // imageURL:  'Not Found',
        }))
      })
  }
}

const extractBook = (bookObj) => {
  return {
    id: bookObj.best_book[0].id[0]._,
    book: bookObj.best_book[0].title[0],
    author: bookObj.best_book[0].author[0].name[0],
    // average_rating: book.average_rating[0],
    // totalReviews: book.ratings_count[0]._,
    // imageURL: book.best_book[0].image_url[0]
  }
}

export function addBooks(books) {
  return {
    type: "ADD_BOOKS",
    payload: {
      books: books
    }
  }
}

export function addSingleBook(book) {
  return {
    type: "SINGLE_BOOK",
    payload: {
      book: book
    }
  }
}

export function fetchingBooks() {
  return {
    type: "BOOKS_FETCHING"
  }
}

export function updateBooks(books) {
  return {
    type: "RECEIVE_BOOKS", payload: {
      books: books
    }
  }
}

export function updateTotalResults(results) {
  return {
    type: "RECEIVE_RESULTS",
    payload: {
      results: results
    }
  }
}