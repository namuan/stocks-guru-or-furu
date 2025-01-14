// backend/static/js/main.js

document.addEventListener('DOMContentLoaded', () => {
    const welcomeScreen = document.getElementById('welcome-screen');
    const startGameBtn = document.getElementById('start-game-btn');
    const gameScreen = document.getElementById('game-screen');
    const resultScreen = document.getElementById('result-screen');
    const nextRoundBtn = document.getElementById('next-round-btn');

    const stockName = document.getElementById('stock-name');
    const scoreSpan = document.getElementById('score');

    const userPredictionSpan = document.getElementById('user-prediction');
    const actualOutcomeSpan = document.getElementById('actual-outcome');

    let currentScore = 0;
    let currentChart = null; // Variable to store the current Chart instance

    // Hardcoded stock data for Release 1
    const stockData = {
        ticker: 'AAPL',
        company: 'Apple Inc.',
        prices: [150, 152, 149, 153, 155, 157, 160], // Last data point is hidden
        actualChange: 'up' // Possible values: 'up' or 'down'
    };

    let userPrediction = '';

    // Initialize Welcome Screen
    startGameBtn.addEventListener('click', () => {
        welcomeScreen.classList.remove('active');
        gameScreen.classList.add('active');
        loadGame();
    });

    // Load Game Screen
    function loadGame() {
        stockName.textContent = `${stockData.company} (${stockData.ticker})`;

        // If a Chart instance already exists, destroy it before creating a new one
        if (currentChart) {
            currentChart.destroy();
        }

        // Create initial chart with hidden last week
        const ctx = document.getElementById('stock-chart').getContext('2d');
        currentChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: stockData.prices.slice(0, -1).map((_, index) => `Day ${index + 1}`),
                datasets: [{
                    label: 'Price',
                    data: stockData.prices.slice(0, -1), // Hide last data point
                    borderColor: 'blue',
                    fill: false
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Days'
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Price ($)'
                        }
                    }
                }
            }
        });

        // Handle Prediction Buttons
        const predictButtons = document.querySelectorAll('.predict-btn');
        predictButtons.forEach(button => {
            button.addEventListener('click', () => {
                userPrediction = button.getAttribute('data-prediction');
                evaluatePrediction();
            });
        });
    }

    // Evaluate User Prediction
    function evaluatePrediction() {
        // Destroy the existing chart before creating a new one
        if (currentChart) {
            currentChart.destroy();
        }

        // Reveal the complete price chart
        const ctx = document.getElementById('stock-chart').getContext('2d');
        currentChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: stockData.prices.map((_, index) => `Day ${index + 1}`),
                datasets: [{
                    label: 'Price',
                    data: stockData.prices, // Show all data points
                    borderColor: 'blue',
                    fill: false
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Days'
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Price ($)'
                        }
                    }
                }
            }
        });

        // Determine if prediction was correct
        const outcome = stockData.actualChange;
        let isCorrect = false;

        if (userPrediction === outcome) {
            isCorrect = true;
            currentScore += 1;
            scoreSpan.textContent = currentScore;
        }

        // Update Result Screen
        userPredictionSpan.textContent = userPrediction.toUpperCase();
        actualOutcomeSpan.textContent = outcome.toUpperCase();
        resultScreen.classList.add('active');
        gameScreen.classList.remove('active');
    }

    // Handle Next Round Button
    nextRoundBtn.addEventListener('click', () => {
        resultScreen.classList.remove('active');
        gameScreen.classList.add('active');
        loadGame();
    });
});