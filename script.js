// ========================================
// BookLoop JavaScript
// Add, View, Search, Filter, Edit and Delete
// ========================================


// You can paste this at the VERY TOP of your script.js file
document.getElementById('google-login-btn').addEventListener('click', () => {
  // This will send the user to our Worker's login route
  window.location.href = '/api/login';
});

// ------------------------------------------
// Below this, keep all your existing JavaScript code!
// (For example, any code you already wrote for your books or website)
// ------------------------------------------



document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("searchInput");
    const categoryFilter = document.getElementById("categoryFilter");
    const bookContainer = document.getElementById("bookContainer");
    const noResults = document.getElementById("noResults");

    const addBookForm = document.getElementById("addBookForm");
    const formMessage = document.getElementById("formMessage");
    const imageInput = document.getElementById("bookImage");

    // ----------------------------------------
    // Load saved books
    // ----------------------------------------
    function getSavedBooks() {
        try {
            const saved = JSON.parse(
                localStorage.getItem("bookloopBooks") || "[]"
            );

            return Array.isArray(saved) ? saved : [];
        } catch (error) {
            return [];
        }
    }

    // ----------------------------------------
    // Save books
    // ----------------------------------------
    function saveBooks(books) {
        try {
            localStorage.setItem(
                "bookloopBooks",
                JSON.stringify(books)
            );

            return true;
        } catch (error) {
            return false;
        }
    }

    // ----------------------------------------
    // Show a custom Yes / No confirmation
    // ----------------------------------------
    function showConfirmModal(title, message, callback) {
        let modal = document.getElementById("customModal");

        if (!modal) {
            modal = document.createElement("div");
            modal.id = "customModal";

            modal.style.cssText = `
                display: none;
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.65);
                z-index: 99999;
                align-items: center;
                justify-content: center;
                padding: 20px;
                box-sizing: border-box;
            `;

            modal.innerHTML = `
                <div style="
                    background: white;
                    color: #222;
                    padding: 24px;
                    border-radius: 12px;
                    width: 100%;
                    max-width: 350px;
                    box-sizing: border-box;
                ">
                    <h3 id="modalTitle">Confirm action</h3>
                    <p id="modalMessage"></p>

                    <div style="
                        display: flex;
                        gap: 12px;
                        margin-top: 20px;
                    ">
                        <button type="button" id="modalNoBtn"
                            style="
                                flex: 1;
                                padding: 12px;
                                background: #74776f;
                                color: white;
                                border: none;
                                border-radius: 6px;
                                cursor: pointer;
                            ">
                            No
                        </button>

                        <button type="button" id="modalYesBtn"
                            style="
                                flex: 1;
                                padding: 12px;
                                background: #3984d6;
                                color: white;
                                border: none;
                                border-radius: 6px;
                                cursor: pointer;
                            ">
                            Yes
                        </button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
        }

        modal.querySelector("#modalTitle").textContent = title;
        modal.querySelector("#modalMessage").textContent = message;
        modal.style.display = "flex";

        // Replace the buttons to prevent duplicate listeners
        const oldYes = modal.querySelector("#modalYesBtn");
        const oldNo = modal.querySelector("#modalNoBtn");

        const yesButton = oldYes.cloneNode(true);
        const noButton = oldNo.cloneNode(true);

        oldYes.replaceWith(yesButton);
        oldNo.replaceWith(noButton);

        yesButton.addEventListener("click", function () {
            modal.style.display = "none";
            callback(true);
        });

        noButton.addEventListener("click", function () {
            modal.style.display = "none";
            callback(false);
        });
    }

    // ----------------------------------------
    // Create a book card
    // ----------------------------------------
    function createBookCard(book) {
        const card = document.createElement("div");
        card.className = "book-card";

        card.dataset.title = book.title || "";
        card.dataset.author = book.author || "";
        card.dataset.category = book.category || "";

        // Book cover
        const image = document.createElement("img");

        image.alt = "Cover of " + book.title;

        image.src = book.image ||
            "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=500&q=80";

        card.appendChild(image);

        // Book title
        const title = document.createElement("h3");
        title.textContent = book.title || "Untitled Book";
        card.appendChild(title);

        // Author
        const author = document.createElement("p");
        author.textContent = "Author: " + (book.author || "Unknown");
        card.appendChild(author);

        // Category
        const category = document.createElement("p");
        category.textContent =
            "Category: " + (book.category || "Uncategorized")
                .replace("-", " ");
        card.appendChild(category);

        // Condition
        const condition = document.createElement("p");
        condition.textContent =
            "Condition: " + (book.condition || "Not specified");
        card.appendChild(condition);

        // Description
        if (book.description) {
            const description = document.createElement("p");
            description.textContent =
                "Description: " + book.description;
            card.appendChild(description);
        }

        // ------------------------------------
        // View Book button
        // ------------------------------------
        const viewButton = document.createElement("button");

        viewButton.type = "button";
        viewButton.className = "swap-button";
        viewButton.textContent = "View Book";

        viewButton.addEventListener("click", function () {
            alert(
                "Book: " + book.title +
                "\nAuthor: " + book.author +
                "\nCategory: " + book.category +
                "\nCondition: " + book.condition +
                "\nDescription: " +
                (book.description || "Not provided")
            );
        });

        card.appendChild(viewButton);

        // ------------------------------------
        // Edit Book button
        // ------------------------------------
        const editButton = document.createElement("button");

        editButton.type = "button";
        editButton.className = "swap-button";
        editButton.textContent = "Edit Book";

        editButton.style.display = "block";
        editButton.style.width = "calc(100% - 36px)";
        editButton.style.margin = "10px 18px 0";
        editButton.style.cursor = "pointer";

        editButton.addEventListener("click", function () {
            // Toggle the editing form
            const existingForm =
                card.querySelector(".edit-book-form");

            if (existingForm) {
                existingForm.remove();
                editButton.textContent = "Edit Book";
                return;
            }

            // Original sample books cannot be edited here
            const savedBooks = getSavedBooks();

            const bookIndex = savedBooks.findIndex(function (savedBook) {
                return savedBook.id === book.id;
            });

            if (bookIndex === -1) {
                alert(
                    "This is an original sample book. " +
                    "Please try editing a book you added using the form."
                );
                return;
            }

            // Build the editing form
            const editForm = document.createElement("form");

            editForm.className = "edit-book-form";

            editForm.style.cssText = `
                display: flex;
                flex-direction: column;
                gap: 12px;
                margin: 15px 18px;
                padding: 15px;
                background: #f4f4f4;
                border-radius: 8px;
                box-sizing: border-box;
            `;

            editForm.innerHTML = `
                <h3 style="margin: 0 0 5px;">Edit Book Details</h3>

                <label>
                    Book Title
                    <input name="title" type="text" required
                        style="display:block;width:100%;padding:10px;
                        margin-top:5px;box-sizing:border-box;">
                </label>

                <label>
                    Author
                    <input name="author" type="text" required
                        style="display:block;width:100%;padding:10px;
                        margin-top:5px;box-sizing:border-box;">
                </label>

                <label>
                    Category
                    <input name="category" type="text" required
                        style="display:block;width:100%;padding:10px;
                        margin-top:5px;box-sizing:border-box;">
                </label>

                <label>
                    Condition
                    <input name="condition" type="text" required
                        style="display:block;width:100%;padding:10px;
                        margin-top:5px;box-sizing:border-box;">
                </label>

                <label>
                    Description
                    <textarea name="description" rows="3"
                        style="display:block;width:100%;padding:10px;
                        margin-top:5px;box-sizing:border-box;"></textarea>
                </label>

                <label>
                    Change Cover Image (optional)
                    <input name="image" type="file" accept="image/*"
                        style="display:block;width:100%;margin-top:5px;">
                </label>

                <button type="submit" class="main-button">
                    Save Changes
                </button>

                <button type="button" class="cancel-edit swap-button">
                    Cancel
                </button>
            `;

            // Fill the form with current information
            editForm.elements.title.value = book.title || "";
            editForm.elements.author.value = book.author || "";
            editForm.elements.category.value = book.category || "";
            editForm.elements.condition.value = book.condition || "";
            editForm.elements.description.value =
                book.description || "";

            // Place the form directly below the Edit button
            editButton.insertAdjacentElement("afterend", editForm);

            editButton.textContent = "Close Editor";

            // Cancel editing
            editForm.querySelector(".cancel-edit")
                .addEventListener("click", function () {
                    editForm.remove();
                    editButton.textContent = "Edit Book";
                });

            // Save the edited information
            editForm.addEventListener("submit", async function (event) {
                event.preventDefault();

                const newTitle =
                    editForm.elements.title.value.trim();

                const newAuthor =
                    editForm.elements.author.value.trim();

                const newCategory =
                    editForm.elements.category.value.trim();

                const newCondition =
                    editForm.elements.condition.value.trim();

                const newDescription =
                    editForm.elements.description.value.trim();

                const imageFile = editForm.elements.image.files[0];

                if (
                    !newTitle ||
                    !newAuthor ||
                    !newCategory ||
                    !newCondition
                ) {
                    alert(
                        "Please complete the title, author, category, and condition."
                    );
                    return;
                }

                // Keep the old cover unless a new image is selected
                let newImage = savedBooks[bookIndex].image || "";

                if (imageFile) {
                    if (!imageFile.type.startsWith("image/")) {
                        alert("Please select a valid image file.");
                        return;
                    }

                    if (imageFile.size > 1024 * 1024) {
                        alert("Please choose an image smaller than 1 MB.");
                        return;
                    }

                    try {
                        newImage = await new Promise(function (resolve, reject) {
                            const reader = new FileReader();

                            reader.onload = function () {
                                resolve(reader.result);
                            };

                            reader.onerror = function () {
                                reject(new Error("Could not read image."));
                            };

                            reader.readAsDataURL(imageFile);
                        });
                    } catch (error) {
                        alert("Could not load that image. Please try another.");
                        return;
                    }
                }

                // Ask before saving the edits
                showConfirmModal(
                    "Save Changes",
                    'Do you want to save the changes to "' +
                    newTitle + '"?',
                    function (confirmed) {
                        if (!confirmed) return;

                        // Get the latest list in case storage changed
                        const latestBooks = getSavedBooks();

                        const latestIndex = latestBooks.findIndex(
                            function (savedBook) {
                                return savedBook.id === book.id;
                            }
                        );

                        if (latestIndex === -1) {
                            alert("This book could not be found in storage.");
                            return;
                        }

                        latestBooks[latestIndex] = {
                            ...latestBooks[latestIndex],
                            title: newTitle,
                            author: newAuthor,
                            category: newCategory,
                            condition: newCondition,
                            description: newDescription,
                            image: newImage
                        };

                        if (!saveBooks(latestBooks)) {
                            alert(
                                "Could not save changes. Please try again."
                            );
                            return;
                        }

                        // Replace the card with the updated version
                        const updatedCard =
                            createBookCard(latestBooks[latestIndex]);

                        card.replaceWith(updatedCard);

                        filterBooks();

                        if (formMessage) {
                            formMessage.textContent =
                                "Book updated successfully!";
                        }
                    }
                );
            });
        });

        card.appendChild(editButton);

        // ------------------------------------
        // Delete Book button
        // ------------------------------------
        const deleteButton = document.createElement("button");

        deleteButton.type = "button";
        deleteButton.className = "delete-button";
        deleteButton.textContent = "Delete Book";

        deleteButton.addEventListener("click", function () {
            showConfirmModal(
                "Delete Book",
                'Are you sure you want to delete "' +
                book.title + '"?',
                function (confirmed) {
                    if (!confirmed) return;

                    const savedBooks = getSavedBooks();

                    const updatedBooks = savedBooks.filter(
                        function (savedBook) {
                            return savedBook.id !== book.id;
                        }
                    );

                    if (updatedBooks.length === savedBooks.length) {
                        alert(
                            "Only books added through the Add Book form " +
                            "can be deleted."
                        );
                        return;
                    }

                    if (!saveBooks(updatedBooks)) {
                        alert(
                            "Could not delete the book. Please try again."
                        );
                        return;
                    }

                    card.remove();
                    filterBooks();

                    if (formMessage) {
                        formMessage.textContent =
                            "Book deleted successfully.";
                    }
                }
            );
        });

        card.appendChild(deleteButton);

        return card;
    }

    // ----------------------------------------
    // Search and filter books
    // ----------------------------------------
    function filterBooks() {
        if (!bookContainer) return;

        const searchText = searchInput
            ? searchInput.value.trim().toLowerCase()
            : "";

        const selectedCategory = categoryFilter
            ? categoryFilter.value
            : "all";

        const cards = bookContainer.querySelectorAll(".book-card");

        let visibleCount = 0;

        cards.forEach(function (card) {
            const title =
                (card.dataset.title || "").toLowerCase();

            const author =
                (card.dataset.author || "").toLowerCase();

            const category =
                (card.dataset.category || "").toLowerCase();

            const matchesSearch =
                title.includes(searchText) ||
                author.includes(searchText) ||
                category.includes(searchText);

            const matchesCategory =
                selectedCategory === "all" ||
                category === selectedCategory.toLowerCase();

            if (matchesSearch && matchesCategory) {
                card.style.display = "";
                visibleCount++;
            } else {
                card.style.display = "none";
            }
        });

        if (noResults) {
            noResults.hidden = visibleCount !== 0;
        }
    }

    // ----------------------------------------
    // View original sample books in HTML
    // ----------------------------------------
    window.showBook = function (title) {
        if (!bookContainer) return;

        const card = Array.from(
            bookContainer.querySelectorAll(".book-card")
        ).find(function (item) {
            return item.dataset.title === title;
        });

        if (!card) return;

        const paragraphs = card.querySelectorAll("p");

        alert(
            "Book: " + title +
            "\n" + (paragraphs[0]?.textContent || "") +
            "\n" + (paragraphs[1]?.textContent || "") +
            "\n" + (paragraphs[2]?.textContent || "")
        );
    };

    // Search listeners
    if (searchInput) {
        searchInput.addEventListener("input", filterBooks);
    }

    if (categoryFilter) {
        categoryFilter.addEventListener("change", filterBooks);
    }

    // ----------------------------------------
    // Add a new book
    // ----------------------------------------
    if (addBookForm) {
        addBookForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            if (formMessage) {
                formMessage.textContent = "";
            }

            const title =
                document.getElementById("bookTitle").value.trim();

            const author =
                document.getElementById("bookAuthor").value.trim();

            const category =
                document.getElementById("bookCategory").value;

            const condition =
                document.getElementById("bookCondition").value;

            const description =
                document.getElementById("bookDescription").value.trim();

            const imageFile =
                imageInput && imageInput.files
                    ? imageInput.files[0]
                    : null;

            if (!title || !author || !category || !condition) {
                if (formMessage) {
                    formMessage.textContent =
                        "Please complete all required fields.";
                }
                return;
            }

            let image = "";

            if (imageFile) {
                if (!imageFile.type.startsWith("image/")) {
                    formMessage.textContent =
                        "Please choose a valid image file.";
                    return;
                }

                if (imageFile.size > 1024 * 1024) {
                    formMessage.textContent =
                        "Please choose an image smaller than 1 MB.";
                    return;
                }

                try {
                    image = await new Promise(function (resolve, reject) {
                        const reader = new FileReader();

                        reader.onload = function () {
                            resolve(reader.result);
                        };

                        reader.onerror = function () {
                            reject(new Error("Could not read image."));
                        };

                        reader.readAsDataURL(imageFile);
                    });
                } catch (error) {
                    formMessage.textContent =
                        "Could not read that image. Please try another.";
                    return;
                }
            }

            const newBook = {
                id: Date.now().toString() +
                    Math.random().toString(16).slice(2),
                title: title,
                author: author,
                category: category,
                condition: condition,
                description: description,
                image: image
            };

            const savedBooks = getSavedBooks();

            savedBooks.push(newBook);

            if (!saveBooks(savedBooks)) {
                formMessage.textContent =
                    "Could not save the book. Try removing the cover image and submitting again.";
                return;
            }

            if (bookContainer) {
                bookContainer.appendChild(createBookCard(newBook));
            }

            if (formMessage) {
                formMessage.textContent =
                    "Success! Your book has been added.";
            }

            addBookForm.reset();
            filterBooks();

            const booksSection = document.getElementById("books");

            if (booksSection) {
                booksSection.scrollIntoView({
                    behavior: "smooth"
                });
            }
        });
    }

    // ----------------------------------------
    // Display previously saved books
    // ----------------------------------------
    function renderSavedBooks() {
        if (!bookContainer) return;

        const savedBooks = getSavedBooks();

        savedBooks.forEach(function (book) {
            bookContainer.appendChild(createBookCard(book));
        });
    }

    // ----------------------------------------
    // Start BookLoop
    // ----------------------------------------
    if (bookContainer) {
        renderSavedBooks();
        filterBooks();
    }
});