//Global variables
const baseURL = "http://localhost:3000";
const basePath = "/books";


//This is the code that runs.
document.addEventListener('DOMContentLoaded', () => {
  main();
})


//Main execution function that runs when the DOM content loads.
function main(){

  fetchLibrary().then((library) => {
  
  addEventListenersOnButtons(library);

  });
}



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

//An about menu function that handles the click on about.
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



//A new book function that renders the track new book section when the track new book button is clicked.
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
                            <input type="text" id="last_location" name="last_location" placeholder="Home">

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




//A new book function that handles the form submit event in the track new book section.
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

    fetchDateFromWorldTimeAPI(event).then((date) =>{
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





//An existing book function that renders the track exisitng book section when the track exisiting book button is clicked.
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

                            <label for="last_place">Last Location:</label>
                            <input type="text" id="last_location" name="last_location" placeholder="Home">

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





//An existing book function that handles the form submit event in the track existing book section.
function handleExistingSubmit(event, library){
  event.preventDefault();
  const formData = new FormData(event.target);
  const searchId = formData.get("id");
  console.log(formData.get("last_location"));

  try{
    //Validation for the data entered in the form.
    const idInvalid = isNaN(searchId) || searchId === "" || Number.isInteger(searchId) || parseInt(searchId) < 0;
   
     if (idInvalid)
         throw("Ensure that you've provided a valid ID that is contained within your library.");

    let index = 0;
    const emptyKeyArray = checkObject(formData);
    console.log(emptyKeyArray);

    console.log(formData.get("author"));
    for (; index < library.length ; ++index){
      if (library[index]["id"] === searchId){

        for (key of emptyKeyArray){
          event.target[key].value = library[index][key];
        }
        break;
      }
    }
    console.log(formData.get("author"));
    console.log(formData.get("last_location"));


    //if the record is found, then proceed to process it by patching the server and rendering the updated record.
    if (index !== library.length){

      fetchDateFromWorldTimeAPI(formData).then((data) => {
        const date = data[0];
        const input = data[1];
        console.log(input);
        console.log(input.get("author"));
        const book = {
                  title:           input.get("title"),
                  author:          input.get("author"),
                  page_count:      input.get("page_count"),
                  last_location:   input.get("last_location"),
                  bookmarked_page: input.get("bookmarked_page"),
                  highlights:      input.get("highlights"),
                }
        
        book.last_read = `${date}`;
        book["id"] = `${searchId}`;

        patchToServer(book).then((book) => {
          library[index] = book;
          console.log(library[index])

          document.querySelector("#content").innerHTML = "";
          renderCard(book);
        }
        )

      })
    } else {
      alert ("ID is  not in your library.");
    }

  }catch(error){
    alert(error);

  }finally{
    event.target.reset();
  }

  //This function is a helper for the handleExistingSubmit handler, it is meant to check the form for blank spaces.
  //If there are any blank spaces, the records in the database will persist, if there fields have values, then the database records will be overwritten.
  function checkObject(formData) {
    let emptyKeyArray = [];

    if (formData.get("title") === "") emptyKeyArray.push("title");
    if (formData.get("author") === "") emptyKeyArray.push("author");
    if (formData.get("page_count")=== "") emptyKeyArray.push("page_count");
    if (formData.get("last_location") === "") emptyKeyArray.push("last_location");
    if (formData.get("bookmarked_page") === "") emptyKeyArray.push ("bookmarked_page");
    if (formData.get("highlights") === "") emptyKeyArray.push ("highlights");

    return emptyKeyArray;
  }
}





//A search function that renders the search book section when the search book button is clicked.
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




//A search book function that handles the form submit event in the search book section.
function handleSearchSubmit(event, library){
  event.preventDefault();
  
  //Case of search by ID
  if (event.target.search_by.value === "id"){
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



//A Library function that renders the library section when the library button is clicked.
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


async function patchToServer(book){
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

  return book;
}



//Fetching the date from a public API.
async function fetchDateFromWorldTimeAPI(input) {
  console.log(input);
  const timezone = "Africa/Nairobi";
  const url = `http://worldtimeapi.org/api/timezone/${timezone}`;

  const date = await fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      const dateTime = new Date(data.datetime);
      const date = dateTime.toLocaleDateString(undefined, { timeZone: timezone });
      console.log(`The current date in ${timezone} is: ${date}`);
      return date;
    })
    .catch((error) => {
      console.error(`Fetch error: ${error}`);
    });

  return [date, input];
}



/*************************************************************/
/*         Functions that reduce code redundancy             */
/*************************************************************/
//A render card function that acts as a template whenever a card needs to be rendered.
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


function constructBook(bookEntry){
  const book = {
    title:           bookEntry["title"].value,
    author:          bookEntry["author"].value,
    page_count:      bookEntry["page_count"].value,
    last_location:   bookEntry["last_location"].value,
    bookmarked_page: bookEntry["bookmarked_page"].value,
    highlights:      bookEntry["highlights"].value,
  }

  return book;
}
