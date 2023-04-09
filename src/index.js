//Global variables
const baseURL = "http://localhost:3000";
const basePath = "/books";


//This is the code that runs.
document.addEventListener('DOMContentLoaded', () => {
  // fetchDateFromWorldTimeAPI();
  main();
})


//Main execution function that runs when the DOM content loads.
function main(){

  fetchLibrary().then((library) => {
  
  addEventListenersOnButtons(library);

  });
}

  // <label for="last_read">Date Last Read:</label>
  //                           <input type="text" id="last_read" name="last_read"></input>

/******************************************************/
/* Functions that add event listeners to DOM elements */
/******************************************************/
function addEventListenersOnButtons(library){
  document.querySelector("#about").addEventListener("click", () => handleAbout(library));
  document.querySelector("#newBook").addEventListener("click", () => handleNewBook(library));
  document.querySelector("#existingBook").addEventListener("click", () => handleExistingBook(library));
  document.querySelector("#search").addEventListener("click", () => handleSearch(library));
  document.querySelector("#library").addEventListener("click", () => handleLibrary(library));
}




/**************************************************/
/* Function Handlers that act on triggered events */
/**************************************************/
function handleAbout(library){

 const info = document.querySelector("#info");

 info.innerHTML = ` 
                  <article>
                    <h1>Welcome to Kitabu</h1>
                    <p><strong>A one-size-fits-all, portable bookmark that allows you to:</strong></p>
                    <ul>
                      <li><strong>Bookmark</strong> the page you are currently on in each of your books.</li>
                      <li>Store your favourite quotes from a book as <strong>highlights</strong>.</li>
                      <li>Remember the <strong>latest location</strong> you were at while you were reading a book.</li>
                      <li>Remember the <strong>latest day</strong> you read each of your books.</li>
                    </ul>
                  </article>
                  `;
  
  const details = document.querySelector("#details");

  details.innerHTML = `
                      <img id="bookmark" src="./assets/open-flying-old-books_1232-2096.avif" alt="Books image">
                      `
  
  const content = document.querySelector("#content");

  content.innerHTML= `
                    <img id="fillImage" src="./assets/915703.jpg" alt="Books image">
                      `;
}



function handleNewBook(library){
 const info = document.querySelector("#info");

 info.innerHTML = ` 
                    <article>
                      <h1>Tracking new book tips</h1>
                      <p>The track new book section allows you to create a new book record. Here are some useful tips:</p>
                      <ul>
                        <li>For best experience, provide information for all the fields.</li>
                        <li>Forgot to include information in a field? No problem, navigate to the track existing book section to edit.</li>
                        <li>
                          If you would like to add a highlight, we recommend you start the record with the page number followed by a colon
                          e.g. 354: Do or do not, there is no try.
                        </li>
                        <li>Offer descriptive information for the location you last read your book so Kitabu can help you trace it.</li>
                      </ul>
                    </article>
                  `

 const details = document.querySelector("#details");

 details.innerHTML= `
                     <div class="form-container">
                        <form id="trackNewForm">
                            <label for="title">Title:</label>
                            <input type="text" id="title" name="title" placeholder="Diary of a Wimpy Kid">

                            <label for="author">Author:</label>
                            <input type="text" id="author" name="author" placeholder="Jeff Kinney">

                            <label for="page_count">Page Count:</label>
                            <input type="number" id="page_count" name="page_count" placeholder="221">

                            <label for="last_place">Last Location:</label>
                            <input type="text" id="last_location" name="last_place" placeholder="Home">

                            <label for="bookmarked_page">Bookmarked Page:</label>
                            <input type="number" id="bookmarked_page" name="bookmarked_page" placeholder="1">

                            <label for="highlights">Highlight:</label>
                            <textarea id="highlights" name="highlights" rows="5" placeholder="183: If this is what it takes to be a man, I am definitely not ready yet."></textarea>

                            <button type="submit">Submit</button>
                        </form>
                      </div>
                      `
  document.querySelector("#trackNewForm").addEventListener("submit", (event) => handleNewBookSubmit(event, library));
}


function handleNewBookSubmit(event, library){
  event.preventDefault();

  try{
    //Validation for the data entered in the form.
    const fieldEmpty = event.target.title.value === ""       || event.target.author.value === ""          || event.target.page_count.value === "" ||
                     event.target.last_location.value === "" || event.target.bookmarked_page.value === "" || event.target.highlights.value ==="";

    console.log(fieldEmpty);

    if (fieldEmpty)
         throw("All fields are required, ensure that the properties entered are valid.");

    let book = constructBook(event.target);
    let id   = library.reduce(function (accumulator, book){ if(accumulator < parseInt(book.id)) accumulator = book.id; return accumulator}, 0);
    book["id"] = `${++id}`;

    fetchDateFromWorldTimeAPI().then((date) =>{
      book.last_read = `${date}`;

      //Only update the local cache once the server has been posted to avoid the local site being ahead of the remote site increasing risk of data loss.
      postToServer(book).then(() => {
        library.push(book);
        const content = document.querySelector("#content");
        content.innerHTML = "";
        renderCard(book);
      })
    })
    
  }catch(error){
    alert(error);

  }finally {
    event.target.reset();
  }
}



function handleExistingBook(library){
  const info = document.querySelector("#info");

  info.innerHTML = ` 
                    <article>
                      <h1>Tracking existing book tips</h1>
                      <p>The track existing book section allows you to update a book record in your library. Here are some useful tips:</p>
                      <ul>
                        <li>To update a book record, you <strong>need the book ID</strong>.
                            Head over to the <strong>search section</strong> if you do not know the book id of the book you want to track</li>
                        <li>Any changes to the record you make are permanent so be careful not to change anything you don't mean to.</li>
                        <li>Always offer descriptive information for the location you last read the book.</li>
                        <li>
                          If you would like to add a highlight, we recommend you start the record with the page number followed by a colon
                          e.g. 354: Do or do not, there is no try.
                        </li>
                      </ul>
                    </article>
                  `

  const details = document.querySelector("#details");

  details.innerHTML= `
                     <div class="form-container">
                        <form id="trackExistingForm">
                            <label for="id">ID:</label>
                            <input type="text" id="id" name="id" placeholder="1">

                            <label for="title">Title:</label>
                            <input type="text" id="title" name="title" placeholder="Diary of a Wimpy Kid">

                            <label for="author">Author:</label>
                            <input type="text" id="author" name="author" placeholder="Jeff Kinney">

                            <label for="page_count">Page Count:</label>
                            <input type="number" id="page_count" name="page_count" placeholder="221">

                            <label for="last_read">Date Last Read:</label>
                            <input type="text" id="last_read" name="last_read">

                            <label for="last_place">Last Location:</label>
                            <input type="text" id="last_location" name="last_place" placeholder="Home">

                            <label for="bookmarked_page">Bookmarked Page:</label>
                            <input type="number" id="bookmarked_page" name="bookmarked_page" placeholder="1">

                            <label for="highlights">Highlight:</label>
                            <textarea id="highlights" name="highlights" rows="5" placeholder="183: If this is what it takes to be a man, I am definitely not ready yet."></textarea>

                            <button type="submit">Submit</button>
                        </form>
                      </div>
                      `
  document.querySelector("#trackExistingForm").addEventListener("submit", (event) => handleExistingSubmit(event, library));
}


function handleExistingSubmit(event, library){
  event.preventDefault();
  const searchId = `${event.target.id.value}`;

  try{
    //Validation for the data entered in the form.
    const idInvalid = isNaN(searchId) || searchId === "" || Number.isInteger(searchId) || parseInt(searchId) < 0
    const fieldEmpty = event.target.id.value === "" || event.target.title.value === "" || event.target.author.value || event.target.page_count.value === "" ||
                       event.target.last_location.value === "" || event.target.bookmarked_page.value === "" || event.target.highlights.value ===""
     if (idInvalid || fieldEmpty)
         throw("All fields are required, ensure that the properties entered are valid.");

    let index = 0;

    for (; index < library.length ; ++index){
      if (library[index]["id"] === searchId){
        console.log(library[index])
        library[index] = constructBook(event.target);
        console.log(library[index])
        library[index]["id"] = searchId;
        console.log(library[index]);
        found = true;
        break;
      }
    }


    //if the record is found, then proceed to process it by patching the server and rendering the updated record.
    if (index !== library.length){
      const book = constructBook(event.target);
      console.log(id);
      book["id"] = `${searchId}`;
      document.querySelector("#content").innerHTML = "";
      renderCard(book);

      patchToServer(book);
    }

  }catch(error){
    alert(error);

  }finally{
    event.target.reset();
  }
}


function handleSearch(library){
  const info = document.querySelector("#info");

  info.innerHTML = ` 
                    <article>
                      <h1>Searching tips</h1>
                      <p>The search book section allows you to search of for a book in your library. Here are some useful tips:</p>
                      <ul>
                        <li>You can search your library by the following criteria: ID, title, author and date last read</li>
                        <li>The search is not case sensitive so don't worry about casing.</li>
                        <li>Do not omit any spaces in your search query.</li>
                      </ul>
                    </article>
                  `

  const details = document.querySelector("#details");

  details.innerHTML= `
                    <div class="form-container">
                      <form id="searchForm">
                        <label for="search_by">Search by:</label>
                        <select id="search_by" name="search_by">
                          <option value="id">ID</option>
                          <option value="title">Title</option>
                          <option value="author">Author</option>
                          <option value="last_read">Date Last Read</option>
                       </select>

                        <label for="search_query">Search query:</label>
                        <input type="text" id="search_query" name="search_query">

                        <button type="submit">Search</button>
                      </form>
                    </div>
                    `

  document.querySelector("#searchForm").addEventListener("submit",  (event) => handleSearchSubmit(event, library));
}


function handleSearchSubmit(event, library){
  event.preventDefault();
  
  //Case of search by ID
  if (event.target.search_by.value === "id" ){
    try{
      const book = library.find(function(book) {return book.id === event.target.search_query.value});
      if (book === undefined) 
        throw("ID not found.");
      document.querySelector("#content").innerHTML = "";
      renderCard(book);

    }catch(exception){
      alert(exception);
    }
  }

  //Case of search by Title
  if (event.target.search_by.value === "title"){
    try{
      const books = library.filter(function(book) {return book.title.toLowerCase() === event.target.search_query.value.toLowerCase()});
      if (books.length === 0) throw ("Title is not in your library.")
      document.querySelector("#content").innerHTML = "";
      books.forEach((book) => renderCard(book));

    }catch (exception){
      alert(exception);
    }
    event.target.reset();
    return;
  }

  //Case of search by Author
  if (event.target.search_by.value === "author"){
    try{
      const books = library.filter(function(book) {return book.author.toLowerCase() === event.target.search_query.value.toLowerCase()});
      if (books.length === 0) throw("Author not found.")
      document.querySelector("#content").innerHTML = "";
      books.forEach((book) => renderCard(book));

    }catch(exception){
      alert(exception);
    }
    event.target.reset();
    return;
  }

  //Case of search by date last read
  if (event.target.search_by.value === "last_read"){
    try{
      const books = library.filter(function(book) {return book.last_read === event.target.search_query.value});
      if (books.length === 0) throw("No book in library matches the given date.")
      document.querySelector("#content").innerHTML = "";
      books.forEach((book) => renderCard(book));

    }catch (exception){
     alert(exception);
    }
    event.target.reset();
    return;
  }
}









function handleLibrary(library){

  const info = document.querySelector("#info");

  info.innerHTML = ` 
                    <article>
                      <h1>The Library</h1>
                      <p>The Library section allows you to view your bookmarks.</p>
                      <ul>
                        <li>You can use this section to check whether your changes have been saved.</li>
                        <li>The bookmarked page is bolded and in a different font color.</li>
                        <li>The bookmark with the most highlights has a different colour than the rest.</li>
                        <li>Future versions of Kitabu will have a functionality which sorts the bookmarks based on update frequency.</li>
                      </ul>
                    </article>
                    `
  cardTemplate = `<div class="card-container">`;


  for (book of library){
    cardTemplate += `
                    <div class="card">
                      <div class="title">Title: ${book["title"]}</div>
                      <div class="author">Author: ${book["author"]}</div>
                      <div class="page_count">Page Count: ${book["page_count"]}</div>
                      <div class="last_read">Date Last Read: ${book["last_read"]}</div>
                      <div class="last_place">Last Location: ${book["last_location"]}</div>
                      <div class="bookmarked_page">Bookmarked Page: <strong>${book["bookmarked_page"]}</strong></div>
                      <div class="highlights">Highlights: ${book["highlights"]}</div>
                      <div class="id">ID: <strong>${book["id"]}</strong></div>
                    </div>
                    `
  }

  cardTemplate += `</div>`;

  const content = document.querySelector("#content");
  content.innerHTML = cardTemplate;


  console.log(library);
}



function renderCard(book){
  let card =      `
                   <div class="card">
                     <div class="title">Title: ${book["title"]}</div>
                     <div class="author">Author: ${book["author"]}</div>
                     <div class="page_count">Page Count: ${book["page_count"]}</div>
                     <div class="last_read">Date Last Read: ${book["last_read"]}</div>
                     <div class="last_place">Last Location: ${book["last_location"]}</div>
                     <div class="bookmarked_page">Bookmarked Page: <strong>${book["bookmarked_page"]}</strong></div>
                     <div class="highlights">Highlights: ${book["highlights"]}</div>
                     <div class="id">ID: <strong>${book["id"]}</strong></div>
                  </div>
                 `;

  const content = document.querySelector("#content");
  content.innerHTML += card;
}



/***************************************************/
/*   Functions that communicate with the server.   */
/***************************************************/
async function fetchLibrary(){
  const sourceURL = baseURL + basePath;

  return fetch(sourceURL, {method: "GET"})
         .then((response) => response.json())
         .then((books) => books);
}


async function postToServer(book){
  console.log(book);
  const destinationURL = baseURL + basePath;

  fetch(destinationURL, {
    method: "POST",
    headers: {"Content-Type": "application/json",
             },
    body: JSON.stringify(book)
  })
  .then((response) => response.json())
  .then((book) => console.log(book))
  .catch((error) => console.error(error));
}


function patchToServer(book){
  const destinationURL = baseURL + basePath;
  
  fetch(destinationURL + `/${book.id}`, {
    method: "PATCH",
    headers: {"Content-Type": "application/json",
              "Accept": "application/json"
             },
    body: JSON.stringify(book) 
  })
  .then((response) => response.json())
  .then((book) => {console.log(book);})
  .catch((error) => console.error(error));
}



//Fetching the date from a public API.
async function fetchDateFromWorldTimeAPI(){
  const timezone = "Africa/Nairobi";
  const url = `http://worldtimeapi.org/api/timezone/${timezone}`;

  return fetch(url)
         .then(response => {
           if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
           }
           return response.json();
          })
         .then(data => {
           const dateTime = new Date(data.datetime);
           const date = dateTime.toLocaleDateString(undefined, {timeZone: timezone});
           console.log(`The current date in ${timezone} is: ${date}`);
           return date;
          })
         .catch(error => {
           console.error(`Fetch error: ${error}`);
          });
}


// function deleteFromServer(id){
//   const destinationURL = baseURL + basePath + "/" + id;

//   fetch(destinationURL, {method: "DELETE"}).then((response) => response.json()).then((movie) => {
//      console.log(movie);
//   })
// }

/*************************************************************/
/*         Functions that reduce code redundancy             */
/*************************************************************/
function constructBook(bookEntry){
  const book = {
    title:           bookEntry.title.value,
    author:          bookEntry.author.value,
    page_count:      bookEntry.page_count.value,
    // last_read:       bookEntry.last_read.value,
    last_location:   bookEntry.last_location.value,
    bookmarked_page: bookEntry.bookmarked_page.value,
    highlights:      bookEntry.highlights.value,
  }

  return book;
}













//  let buttonWithHandlerObjects = [
//                                   {id: "about" ,       handleFunction: "handleAbout"}, 
//                                   {id: "newBook",      handleFunction: "handleNewBook"},
//                                   {id: "existingBook", handleFunction: "handleExistingBook"},
//                                   {id: "search",       handleFunction: "handleSearch"},
//                                   {id: "library",      handleFunction: "handleLibrary"}
//                                  ];

//   for (button of buttonWithHandlerObjects){
//     bindEventListenerToHandler(button["id"], button["handleFunction"]);
//   }



// function bindEventListenerToHandler(id, handleFunction, event = "click"){
//   document.querySelector(`#${id}`).addEventListener(event, handleFunction);
// }

// function handleBuyTicket(event, movies){
//   const ticketNum = document.querySelector("#ticket-num");
//   let ticketNumInteger = parseInt(ticketNum.textContent, 10);

//   let movieList = document.querySelectorAll("#films li");
//   const currentMovieTitle = document.querySelector("#title");

//   movieList = Array.from(movieList);  

//   //Find the current movie being rendered by comparing the currently rendered title with the list of movie titles in the side menu.
//   const movieCurrentlyRendered = movieList.find((movie) => (movie.textContent === currentMovieTitle.textContent));

//   //If no ticket remaining, change button text and return.
//   if (ticketNumInteger === 0){
//     const buyTicket = document.querySelector("#buy-ticket");
//     buyTicket.textContent = "Sold Out";
    
//     movieCurrentlyRendered.classList.add("sold-out");

//     return;
//   }

//   ticketNumInteger -= 1;

//   ticketNum.textContent = `${ticketNumInteger}`;
//   movieCurrentlyRendered.dataset.tickets_sold = `${parseInt(movieCurrentlyRendered.dataset.tickets_sold, 10) + 1}`;

//   serverPatch(movieCurrentlyRendered);


//Deletes a movie and if it is the one being currently rendered, renders the one before it
// function handleDeleteMovie(event){
//   let currentId = event.target.dataset.id;

//   let movieList = document.querySelectorAll("ul#films > li");
//   movieList = Array.from(movieList);
//   console.log(movieList)

//   let deleteIndex = movieList.findIndex((movie) => movie.dataset.id === currentId);
//   let previousIndex = deleteIndex - 1;

//   //If it the first movie is to be deleted, then the previous movie is the one after it.
//   if (deleteIndex === 0){
//     previousIndex = deleteIndex + 1; 
//   }
  
//   let movieToDelete = movieList[deleteIndex];
  
//   const movieBeforeMovieToDelete = movieList[previousIndex];

//   const previousMovie = constructMovie(movieBeforeMovieToDelete);

//   const currentMovieTitle = document.querySelector("#title");

//   if (currentMovieTitle.textContent === movieToDelete.textContent){
//     renderCard(previousMovie);
//   }


//   movieToDelete.remove();
//   event.target.remove();

//   serverDelete(currentId);
// }


// function handleSideMenu(event){
//   renderCard(constructMovie(event.target));
// }


/*************************************************************/
/* Functions that render the information by DOM manipulation */
/*************************************************************/
// function renderCard(movie){
//   let poster = document.querySelector("#poster");
//   poster.src = movie.poster;
//   poster.alt = movie.title;

//   const card = document.querySelector(".card");

//   card.querySelector("#title").textContent      = movie.title;
//   card.querySelector("#runtime").textContent    = `${movie.runtime}` + " minutes";
//   card.querySelector("#film-info").textContent  = movie.description;
//   card.querySelector("#showtime").textContent   = movie.showtime;
//   card.querySelector("#ticket-num").textContent = `${parseInt(movie.capacity, 10) - parseInt(movie.tickets_sold, 10)}`;

//   const buyTicket = document.querySelector("#buy-ticket");

//   if (movie.capacity !== movie.tickets_sold){
//     buyTicket.textContent = "Buy Ticket";
//   } else {
//     buyTicket.textContent = "Sold Out";
//   }
// }


// function renderMovieInSideMenu(movie){
//   const movieTitle = document.createElement("li");
//   movieTitle.classList.add("film");
//   movieTitle.classList.add("item");
//   movieTitle.id = "li" + `${movie.id}`;
  
//   //Cache all the data of the movie from the server database in the dataset attribute(data-*) of the new movie list element.
//   //An alternative way to do this would be to create a single object to hold all the data in the dataset attribute, but for simplicity,
//   //all the data properties were stored in different variables in the dataset attribute.
//   movieTitle.dataset.capacity = movie.capacity;
//   movieTitle.dataset.tickets_sold = movie.tickets_sold;
//   movieTitle.dataset.id = movie.id;
//   movieTitle.dataset.runtime = movie.runtime;
//   movieTitle.dataset.showtime = movie.showtime;
//   movieTitle.dataset.description = movie.description;
//   movieTitle.dataset.poster = movie.poster;


//   //An event listener to the li element is added here instead of adding it in the addEventListeners section.
//   movieTitle.addEventListener("click", handleSideMenu);

//   movieTitle.textContent = movie.title;

//   const deleteButton = document.createElement("button");
//   deleteButton.textContent = "X";
//   deleteButton.addEventListener("click", handleDeleteMovie);
//   deleteButton.dataset.id = movie.id;

//   document.querySelector("#films").appendChild(movieTitle);
//   document.querySelector("#films").appendChild(deleteButton);
// }