let gameActive = false;
let roundInterval;
let flashInterval;
let highScore = 0;
let currentScore = 0;
let currentIndex = 0;
const introSequence = ['red', 'blue', 'yellow', 'green', 'red blue', 'yellow green', 'red yellow blue green', 'red yellow blue green'];
let answerSequence = [];
const colorPanels = ['red', 'blue', 'yellow', 'green'];
const intervalTime = 1000;

function readyGameOnLoad(){
    const playButton = document.querySelector(".game-play");
    const stopButton = document.querySelector(".game-stop");
    const hiScoreEl = document.querySelector(".hi-score");
    const currentScoreEl = document.querySelector(".current-score");
    const introText = document.querySelector(".intro");
    const gameMarquee = document.querySelector(".game-marquee");

    playButton.addEventListener("click", startGame);
    stopButton.addEventListener("click", stopGame);
    colorPanels.forEach(primePanels);

    function primePanels(color) {
        document.querySelector(`.${color}-panel`).addEventListener("click", (event) => {
            if (gameActive) {
                answerSequence.push(color);
            }
        });
    }

    function stopGame(event) {
        if (gameActive) {
            gameActive = !gameActive;
            playButton.style.color = 'white';
            stopButton.style.color = 'white';
            introText.style.display = 'flex';
            gameMarquee.style.display = 'none';
            clearActiveTiles();
        }
        if (roundInterval)
            clearInterval(roundInterval);
        if (flashInterval)
            clearInterval(flashInterval);
    }

    function clearActiveTiles() {
        colorPanels.map( (color) => document.querySelector(`.${color}-panel`).classList.remove(`${color}-panel-active`));
    }

    async function startGame(event) {
        if (!gameActive) {
            gameActive = !gameActive;
            stopButton.style.color = 'red';
            playButton.style.color = 'white';
            introText.style.display = 'none';
            gameMarquee.style.display = 'flex';
            gameMarquee.innerHTML = "<h3>Starting Game...</h3>"
            const gameSequence = [];
            currentScore = 0;
            updateCurrentScore();
            await playSequence(introSequence, 500);
            clearActiveTiles();
            console.log("Intro completed");
            // Main Game Loop
            while (gameActive) {
                answerSequence = [];
                gameSequence.push(colorPanels[Math.floor(Math.random() * colorPanels.length)]);
                gameMarquee.innerHTML = `<h3>Prepare for Round ${gameSequence.length}...</h3>`;
                await sleep(2000);
                gameMarquee.innerHTML = `<h3>Round ${gameSequence.length}...</h3>`;
                await sleep(2000);
                await playSequence(gameSequence);
                clearActiveTiles();
                await sleep(500);
                gameMarquee.innerHTML = `<h3>Checking Round ${gameSequence.length} Answer...</h3>`;
                let correctAnswer = false;
                let wrongAnswer = false;
                let correctCount = 0
                // User Input Loop
                while (gameActive && !correctAnswer && !wrongAnswer ) {
                    let correctSoFar = true;
                    for (let i=0; i < answerSequence.length; i++) {
                        if (correctSoFar && i >= gameSequence.length) break;
                        correctSoFar = answerSequence[i] === gameSequence[i];
                        correctCount = i + 1;
                    }
                    wrongAnswer = !correctSoFar;
                    correctAnswer = correctSoFar && answerSequence.length >= gameSequence.length;
                    // sleep to prevent deadlock
                    await sleep(100);
                }

                currentScore += wrongAnswer ? correctCount * 5 : gameSequence.length * 5;
                highScore = Math.max(highScore, currentScore);
                updateCurrentScore();
                updateHiScore();
                if (wrongAnswer) break;
            }
            stopGame();
        }

        function updateCurrentScore(){
            const score = `00000${currentScore}`
            currentScoreEl.innerHTML = score.substr(score.length-5);
        }

        function updateHiScore(){
            const score = `00000${highScore}`
            hiScoreEl.innerHTML = score.substr(score.length-5);
        }
    }

    function playSequence(seq, timeout) {
        currentIndex = 0;
        let delay = false;
        return new Promise((resolve, reject) => {
            roundInterval = setInterval(() => {
                if (!gameActive) {
                    clearInterval(roundInterval);
                    resolve(seq);
                }
                if (!delay) {
                    const outgoingColors = seq?.[currentIndex - 1];
                    const incomingColors = seq?.[currentIndex];
                    if (outgoingColors) {
                        outgoingColors.split(' ').map((color) => {
                            const outgoingPanel = document.querySelector(`.${color}-panel`);
                            outgoingPanel.classList.remove(`${color}-panel-active`);
                        });
                    }
                    if (incomingColors) {
                        incomingColors.split(' ').map((color) => {
                            const incomingPanel = document.querySelector(`.${color}-panel`);
                            incomingPanel.classList.add(`${color}-panel-active`);
                        });
                    } else {
                        clearInterval(roundInterval);
                        resolve(seq);
                    }
                    currentIndex++;
                } else {
                    clearActiveTiles();
                }
                delay = !delay;
            }, timeout ?? intervalTime);
        });
    }
}

async function sleep(time) {
    return new Promise((res) => setTimeout(() => {res(true)}, time));
}