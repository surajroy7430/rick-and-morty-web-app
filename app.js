
let baseUrl = "https://rickandmortyapi.com/api/character";
let allCharacters = [];
let currentPage = 1;
let charPerPage = 6;

document.addEventListener("DOMContentLoaded", () => {
    fetchCharacters();

    // Footer Clock
    function updateClock() {
        const now = new Date();
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        const dayName = days[now.getDay()];
        const monthName = months[now.getMonth()];
        const day = now.getDate();
        const year = now.getFullYear();

        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        const formattedTime = `${hours}:${minutes}:${seconds} - ${dayName} ${monthName} ${day}, ${year}`;
        document.getElementById('clock').textContent = formattedTime;
    }
    setInterval(updateClock, 1000);
    updateClock();

    let themeToggle = getElementById("themeToggle");
    let themeIcon = getElementById("themeIcon");

    function applyTheme(theme) {
        if (theme === "dark") {
            document.body.classList.add("dark-theme");
            themeIcon.className = "ph-fill ph-sun";
        }
        else {
            document.body.classList.remove("dark-theme");
            themeIcon.className = "ph-fill ph-moon";
        }
        localStorage.setItem("theme", theme);
    }
    let savedTheme = localStorage.getItem("theme") || "light";
    applyTheme(savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            let isDark = document.body.classList.contains("dark-theme");
            applyTheme(isDark ? "light" : "dark");
        });
    }

    let backButton = getElementById("goBack");
    if (backButton) {
        backButton.addEventListener("click", () => {
            localStorage.removeItem("characterId");
            window.location.href = "index.html";
        });
    }
});

function getElementById(id) {
    return document.getElementById(id);
}

function isDetailsPage() {
    return window.location.pathname.includes("character-details.html");
}

let fetchCharacters = async () => {
    let listMsg = getElementById("listMsg");

    if (isDetailsPage()) {
        let charId = localStorage.getItem("characterId");
        if (charId) {
            try {
                let res = await fetch(`${baseUrl}/${charId}`);
                let data = await res.json();

                showCharacterDetails([data]);
            } catch (error) {
                listMsg.textContent = error.message;
                listMsg.style.color = "red";
            }
        }

        let randomBtn = getElementById("randomCharacterBtn");
        if (randomBtn) {
            randomBtn.addEventListener("click", async () => {
                if(randomBtn.disabled) return;

                randomBtn.disabled = true;
                try {
                    let totalCharacters = 826;
                    let randomId = Math.floor(Math.random() * totalCharacters) + 1;

                    let res = await fetch(`${baseUrl}/${randomId}`);
                    let data = await res.json();

                    localStorage.setItem("characterId", randomId);
                    showCharacterDetails([data]);
                } catch (error) {
                    listMsg.textContent = error.message;
                    listMsg.style.color = "red";
                } finally {
                    setTimeout(() => {
                        randomBtn.disabled = false;
                    }, 1000);
                }
            });
        }
    }
    else {
        let pagination = getElementById("pagination");

        try {
            let res = await fetch(`${baseUrl}`);
            let data = await res.json();

            allCharacters = data.results;

            if (!allCharacters || allCharacters.length === 0) {
                listMsg.textContent = "No data available";
                listMsg.style.color = "red";
                pagination.innerHTML = "";
                allCharacters = [];
                return;
            }

            listMsg.textContent = "";
            renderPagination();
            displayCharacters(getCharacterForPage());
        } catch (error) {
            console.log(error)
            listMsg.textContent = error.message;
            listMsg.style.color = "red";
            pagination.innerHTML = "";
            allCharacters = [];
        }
    }
}

function getCharacterForPage() {
    let start = (currentPage - 1) * charPerPage;
    let end = start + charPerPage;
    return allCharacters.slice(start, end);
}

let displayCharacters = (characters) => {
    let characterLists = getElementById("character-lists");
    characterLists.innerHTML = "";

    characters.forEach(char => {
        let card = document.createElement("div");
        card.className = "character-card";

        card.innerHTML = `
            <img src="${char.image}" alt="${char.name}">
            <div class="card-content">
                <h2>
                    <a class="character-link">
                        ${char.name}
                    </a>
                    <small> (${char.gender})</small>
                </h2>
                <p class="species">Species: ${char.species}</p>
                <p class="status">Status: ${char.status}</p>
            </div>
        `;

        card.querySelector(".character-link").addEventListener("click", (e) => {
            e.preventDefault();

            let characterName = e.target.textContent.trim();

            let foundCharacter = allCharacters.find(c => c.name === characterName);
            if (foundCharacter) {
                localStorage.setItem("characterId", foundCharacter.id);
                window.location.href = "character-details.html";
            }
        })

        characterLists.appendChild(card);
    });
}

let renderPagination = () => {
    if (isDetailsPage()) return;

    let pagination = getElementById("pagination");
    pagination.innerHTML = "";

    let totalPages = Math.ceil(allCharacters.length / charPerPage);

    let prevButton = document.createElement("button");
    prevButton.classList.add("prev-btn");
    prevButton.textContent = "Prev";
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            displayCharacters(getCharacterForPage());;
            renderPagination();
        }
    })
    pagination.appendChild(prevButton);

    let nextButton = document.createElement("button");
    nextButton.classList.add("next-btn");
    nextButton.textContent = "Next";
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener("click", () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayCharacters(getCharacterForPage());
            renderPagination();
        }
    })
    pagination.appendChild(nextButton);
}

function showCharacterDetails(characters) {
    let details = getElementById("character-details");

    if (!details || !characters || characters.length === 0) {
        return;
    }

    let char = characters[0];
    let statusColor = char.status === "Alive" ? "#16a34a" : char.status === "Dead" ? "#dc2626" : "gray";

    details.innerHTML = `
        <div class="detailed-card">
            <img src="${char.image}" alt="${char.name}">
            <div class="card-content">
                <h2>
                    <a>${char.name}</a>
                    <small> (${char.gender})</small>
                </h2>
                <p class="statusAndSpecies">
                    <strong style="color: ${statusColor};">${char.status}</strong>
                    <span> - ${char.species}</span>
                </p>
                <div class="origin-location">
                    <p>Origin Location:</p>
                    <a>
                        ${char.origin.name}
                    </a>
                </div>
                <div class="current-location">
                    <p>Current Location:</p>
                    <a>
                        ${char.location.name}
                    </a>
                </div>
                <div class="episodes">
                    <p>Total Episodes: ${char.episode.length}</p>
                </div>
            </div>
        </div>
    `;
}