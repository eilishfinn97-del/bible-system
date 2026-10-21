
const API_URL = "https://bible-api.com/";

const result = document.getElementById("result");
const statusText = document.getElementById("status");
const referenceInput = document.getElementById("referenceInput");

document.getElementById("searchForm").addEventListener(
    "submit",
    function (event) {
        event.preventDefault();
        searchVerse(referenceInput.value);
    }
);

async function fetchPassage(reference) {
    const url = API_URL + encodeURIComponent(reference.trim());
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Passage not found. Check the reference.");
    }

    return await response.json();
}

async function searchVerse(reference) {
    if (!reference.trim()) return;

    statusText.textContent = "Loading Bible passage...";
    result.replaceChildren();

    try {
        const data = await fetchPassage(reference);

        const heading = document.createElement("h3");
        heading.textContent = data.reference;
        result.appendChild(heading);

        const translation = document.createElement("p");
        translation.textContent =
            "Translation: " + data.translation_name;
        result.appendChild(translation);

        data.verses.forEach(function (verse) {
            const paragraph = document.createElement("p");
            paragraph.className = "verse";

            const number = document.createElement("strong");
            number.textContent = verse.verse;

            paragraph.appendChild(number);
            paragraph.appendChild(
                document.createTextNode(verse.text.trim())
            );

            result.appendChild(paragraph);
        });

        const saveButton = document.createElement("button");
        saveButton.textContent = "♡ Save to Favorites";

        saveButton.addEventListener("click", function () {
            saveFavorite(data);
        });

        result.appendChild(saveButton);
        statusText.textContent = "Passage loaded successfully.";

    } catch (error) {
        result.textContent = error.message;
        statusText.textContent =
            "Unable to load the passage. Check your connection and try again.";
    }
}

async function getRandomVerse() {
    const references = [
        "Psalm 23:1",
        "Proverbs 3:5-6",
        "Philippians 4:13",
        "Jeremiah 29:11",
        "John 3:16",
        "Romans 8:28"
    ];

    const reference =
        references[Math.floor(Math.random() * references.length)];

    try {
        const data = await fetchPassage(reference);

        document.getElementById("dailyReference").textContent =
            data.reference;

        document.getElementById("dailyVerse").textContent =
            data.text.trim();

    } catch (error) {
        document.getElementById("dailyVerse").textContent =
            "Unable to load the verse. Please try again.";
    }
}

function getFavorites() {
    try {
        return JSON.parse(localStorage.getItem("bibleFavorites")) || [];
    } catch {
        return [];
    }
}

function saveFavorite(data) {
    const favorites = getFavorites();

    const exists = favorites.some(
        item => item.reference === data.reference
    );

    if (exists) {
        alert("This passage is already in your favorites.");
        return;
    }

    favorites.push({
        reference: data.reference,
        text: data.text.trim(),
        translation: data.translation_name
    });

    localStorage.setItem("bibleFavorites", JSON.stringify(favorites));
    displayFavorites();
    alert("Verse saved to your favorites!");
}

function displayFavorites() {
    const list = document.getElementById("favoriteList");
    list.replaceChildren();

    const favorites = getFavorites();

    if (favorites.length === 0) {
        list.textContent = "No favorite verses saved yet.";
        return;
    }

    favorites.forEach(function (item, index) {
        const card = document.createElement("div");
        card.className = "favorite-card";

        const heading = document.createElement("h3");
        heading.textContent = item.reference;

        const passage = document.createElement("p");
        passage.textContent = item.text;

        const readButton = document.createElement("button");
        readButton.textContent = "Read Again";
        readButton.addEventListener("click", function () {
            searchVerse(item.reference);
            document.getElementById("reader").scrollIntoView();
        });

        const removeButton = document.createElement("button");
        removeButton.textContent = "Remove";
        removeButton.addEventListener("click", function () {
            const updated = getFavorites();
            updated.splice(index, 1);
            localStorage.setItem(
                "bibleFavorites",
                JSON.stringify(updated)
            );
            displayFavorites();
        });

        card.append(heading, passage, readButton, removeButton);
        list.appendChild(card);
    });
}

getRandomVerse();
displayFavorites();

