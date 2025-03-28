// Constants and initial variables
let currentPage = 1; // Start with the first page
const bookslimit = 10; // Number of items per page
const totalPages = 21; // total pages in api
let allBooks = [];
let filteredBooks = [];

// DOM elements
const searchInput = document.querySelector('#search');
const gridBtn = document.querySelector('.toggle button.grid-view');
const listBtn = document.querySelector('.toggle button.list-view');
const container = document.querySelector('.grid-container');
const sortSelect = document.querySelector('.sort');
const paginationEl = document.querySelector('.pagination');

// Fetch all books from the API
async function fetchAllBooks() {
    const pagePromises = [];
    for (let page = 1; page <= totalPages; page++) {
        const url = `https://api.freeapi.app/api/v1/public/books?page=${page}&limit=${bookslimit}`;
        const options = { method: 'GET', headers: { accept: 'application/json' } };
        pagePromises.push(fetch(url, options).then(res => res.json()));
    }
    try {
        const results = await Promise.all(pagePromises);
        allBooks = results.flatMap(result => (result.success ? result.data.data : []));
        filteredBooks = allBooks; 
        renderPagination(); 
        displayBooks(currentPage); 
    } catch (error) {
        console.error("Error fetching all books:", error);
    }
}

// Display books based on the current page
function displayBooks(page) {
    const startIndex = (page - 1) * bookslimit;
    const endIndex = startIndex + bookslimit;
    const booksToDisplay = filteredBooks.slice(startIndex, endIndex);
    loadBooks(booksToDisplay);
    renderPagination();
}

// Load books into the grid container
function loadBooks(books) {
    container.innerHTML = ""; 
    books.forEach((book) => {
        const { imageLinks, title, authors, description, publishedDate, previewLink } = book.volumeInfo || {};
        const thumbnail = imageLinks?.thumbnail || "https://placehold.co/600x400";
        const authorText = authors?.join(", ") || "Unknown Author";
        const dateText = publishedDate || "Unknown Date";
        const descText = description || "No description available";

        const gridCard = document.createElement("div");
        gridCard.classList.add("card");

        gridCard.innerHTML = `
            <div class="image-container">
                <img src="${thumbnail}" alt="Book Cover">
            </div>
            <div class="book-description">
                <h2 class="book-title">${title}</h2>
                <h3 class="book-author">Author: ${authorText}</h3>
                <p class="book-summary">${descText}</p>
                <a class="show-more" href="${previewLink}" target="_blank">Show More</a>
                <p class="publish-date">Published Date: ${dateText}</p>
            </div>
        `;

        container.appendChild(gridCard);
    });
}

// Update pagination controls
function renderPagination() {
    const prevButton = document.querySelector(".prev-btn");
    const nextButton = document.querySelector(".next-btn");
    const pageInfo = document.querySelector(".page-info");

    pageInfo.textContent = `Page ${currentPage} of ${Math.ceil(filteredBooks.length / bookslimit)}`;

    // Enable/Disable previous button
    prevButton.disabled = currentPage === 1;
    // Enable/Disable next button
    nextButton.disabled = currentPage === Math.ceil(filteredBooks.length / bookslimit);
}

// Pagination navigation
function nextPage() {
    if (currentPage < Math.ceil(filteredBooks.length / bookslimit)) {
        currentPage++;
        displayBooks(currentPage);
    }
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        displayBooks(currentPage);
    }
}

// Search books
function searchBook() {
    const searchQuery = searchInput.value.toLowerCase();
    filteredBooks = allBooks.filter(book => {
        const title = (book.volumeInfo?.title || "").toLowerCase();
        const authors = (book.volumeInfo?.authors || []).join(",").toLowerCase();
        return title.includes(searchQuery) || authors.includes(searchQuery);
    });
    currentPage = 1; // Reset to the first page
    displayBooks(currentPage);
}

// Sort books
function sortBooks() {
    const sortValue = sortSelect.value;
    filteredBooks.sort((a, b) => {
        if (sortValue === 'title-asc') {
            return a.volumeInfo?.title.localeCompare(b.volumeInfo?.title);
        } else if (sortValue === 'title-desc') {
            return b.volumeInfo?.title.localeCompare(a.volumeInfo?.title);
        } else if (sortValue === 'date-asc') {
            return (a.volumeInfo?.publishedDate || "").localeCompare(b.volumeInfo?.publishedDate || "");
        } else if (sortValue === 'date-desc') {
            return (b.volumeInfo?.publishedDate || "").localeCompare(a.volumeInfo?.publishedDate || "");
        }
    });
    currentPage = 1; // Reset to the first page
    displayBooks(currentPage);
}

// Toggle between grid and list view
gridBtn.addEventListener('click', () => {
    gridBtn.classList.add('active');
    listBtn.classList.remove('active');
    container.style.display = "grid";
});

listBtn.addEventListener('click', () => {
    listBtn.classList.add('active');
    gridBtn.classList.remove('active');
    container.style.display = "block";
});

// Event listeners
searchInput.addEventListener("input", searchBook);
sortSelect.addEventListener("change", sortBooks);
document.querySelector(".prev-btn").addEventListener("click", previousPage);
document.querySelector(".next-btn").addEventListener("click", nextPage);

// Initialize when DOM is loaded
fetchAllBooks()