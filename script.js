document.addEventListener("DOMContentLoaded", () => {
    const gameBoard = document.getElementById("game-board");
    const guessInput = document.getElementById("guess-input");
    const submitGuess = document.getElementById("submit-guess");
    const errorMessage = document.getElementById("error-message");
    const gameStatus = document.getElementById("game-status");
    const fireworksCanvas = document.getElementById("fireworks-canvas");

    let word = "";
    let attempts = 0;
    let guessedWords = [];

    async function validateWord(word) {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        return response.ok;
    }

    async function startGame() {
        let validWord = false;
        while (!validWord) {
            word = prompt("Enter a 5-letter word for your friend to guess:").toUpperCase();
            if (word.length === 5 && await validateWord(word)) {
                validWord = true;
            } else {
                alert("Please enter a valid 5-letter word.");
            }
        }
        gameStatus.textContent = "Welcome to Wordle with Friends! You have 6 attempts to guess the word.";
        guessInput.value = "";
        guessInput.focus();
    }

    function updateBoard() {
        gameBoard.innerHTML = "";
        guessedWords.forEach(guess => {
            guess.split("").forEach((letter, index) => {
                const letterBox = document.createElement("div");
                letterBox.classList.add("letter-box");
                letterBox.textContent = letter;
                if (word[index] === letter) {
                    letterBox.classList.add("correct");
                } else if (word.includes(letter)) {
                    letterBox.classList.add("present");
                } else {
                    letterBox.classList.add("absent");
                }
                gameBoard.appendChild(letterBox);
            });
        });
    }

    function checkWin(guess) {
        return guess === word;
    }

    function disableGame() {
        guessInput.disabled = true;
        submitGuess.disabled = true;
    }

    function triggerFireworks() {
        const context = fireworksCanvas.getContext("2d");
        fireworksCanvas.width = window.innerWidth;
        fireworksCanvas.height = window.innerHeight;

        let particles = [];
        let colors = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF"];

        function createParticle(x, y) {
            return {
                x,
                y,
                size: Math.random() * 5 + 2,
                velocityX: (Math.random() - 0.5) * 10,
                velocityY: (Math.random() - 0.5) * 10,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: 1,
            };
        }

        function render() {
            context.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);

            particles.forEach((particle, index) => {
                context.globalAlpha = particle.alpha;
                context.fillStyle = particle.color;
                context.beginPath();
                context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                context.fill();

                particle.x += particle.velocityX;
                particle.y += particle.velocityY;
                particle.alpha -= 0.02;

                if (particle.alpha <= 0) {
                    particles.splice(index, 1);
                }
            });

            requestAnimationFrame(render);
        }

        function burst(x, y) {
            for (let i = 0; i < 50; i++) {
                particles.push(createParticle(x, y));
            }
        }

        fireworksCanvas.addEventListener("click", (event) => {
            burst(event.clientX, event.clientY);
        });

        burst(fireworksCanvas.width / 2, fireworksCanvas.height / 2);
        render();
    }

    submitGuess.addEventListener("click", async () => {
        const guess = guessInput.value.toUpperCase().trim();

        if (guess.length !== 5) {
            errorMessage.textContent = "Please enter a 5-letter word.";
            return;
        }

        if (guessedWords.includes(guess)) {
            errorMessage.textContent = "You have already guessed this word.";
            return;
        }

        if (!(await validateWord(guess))) {
            errorMessage.textContent = "This is not a valid word. Please try again.";
            return;
        }

        errorMessage.textContent = "";
        guessedWords.push(guess);
        attempts++;

        updateBoard();

        if (checkWin(guess)) {
            gameStatus.textContent = "Congratulations! You've guessed the word!";
            disableGame();
            triggerFireworks();
        } else if (attempts >= 6) {
            gameStatus.textContent = `Game Over! The word was ${word}.`;
            disableGame();
        }

        guessInput.value = "";
    });

    startGame();
});
