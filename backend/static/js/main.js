// backend/static/js/main.js

document.addEventListener('DOMContentLoaded', () => {
    // Screen Elements
    const welcomeScreen = document.getElementById('welcome-screen');
    const loadingScreen = document.getElementById('loading-screen');
    const gameScreen = document.getElementById('game-screen');
    const resultScreen = document.getElementById('result-screen');
    const errorScreen = document.getElementById('error-screen');

    // Buttons
    const startGameBtn = document.getElementById('start-game-btn');
    const nextRoundBtn = document.getElementById('next-round-btn');
    const retryBtn = document.getElementById('retry-btn');
    const backHomeBtn = document.getElementById('back-home-btn');

    // Game Elements
    const stockName = document.getElementById('stock-name');
    const scoreSpan = document.getElementById('score');
    const userPredictionSpan = document.getElementById('user-prediction');
    const actualOutcomeSpan = document.getElementById('actual-outcome');

    // Prediction Buttons
    const predictButtons = document.querySelectorAll('.predict-btn');

    let currentScore = 0;
    let currentChart = null; // To manage Chart.js instances
    let currentStockData = null; // To store fetched stock data
    let userPrediction = '';

    // Event Listeners
    startGameBtn.addEventListener('click', () => {
        welcomeScreen.classList.remove('active');
        loadingScreen.classList.add('active');
        fetchStockData();
    });

    nextRoundBtn.addEventListener('click', () => {
        resultScreen.classList.remove('active');
        loadingScreen.classList.add('active');
        fetchStockData();
    });

    retryBtn.addEventListener('click', () => {
        errorScreen.classList.remove('active');
        loadingScreen.classList.add('active');
        fetchStockData();
    });

    backHomeBtn.addEventListener('click', () => {
        errorScreen.classList.remove('active');
        welcomeScreen.classList.add('active');
    });

    // Handle Prediction Buttons
    predictButtons.forEach(button => {
        button.addEventListener('click', () => {
            userPrediction = button.getAttribute('data-prediction');
            evaluatePrediction();
        });
    });

    // Function to Fetch Stock Data from Backend
    function fetchStockData() {
        fetch('/api/get_stock')
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    throw new Error(data.error);
                }
                currentStockData = data;
                loadingScreen.classList.remove('active');
                gameScreen.classList.add('active');
                loadGame();
            })
            .catch(error => {
                loadingScreen.classList.remove('active');
                errorScreen.classList.add('active');
                document.getElementById('error-message').textContent = error.message || 'An unexpected error occurred.';
                console.error('Error fetching stock data:', error);
            });
    }

    // Function to Load Game Screen with Fetched Data
    function loadGame() {
        const { ticker, company, prices, dates } = currentStockData;
        stockName.textContent = `${company} (${ticker})`;

        // Hide the last data point (hidden) and use the rest for the initial chart
        const visiblePrices = prices.slice(0, -1);
        const visibleDates = dates.slice(0, -1);

        // Destroy existing chart if any
        if (currentChart) {
            currentChart.destroy();
        }

        const ctx = document.getElementById('stock-chart').getContext('2d');
        currentChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: visibleDates,
                datasets: [{
                    label: 'Price ($)',
                    data: visiblePrices,
                    borderColor: 'blue',
                    fill: false
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    tooltip: {
                        enabled: true
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Date'
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
    }

    // Function to Evaluate User Prediction
    function evaluatePrediction() {
        const { prices, dates, actualChange } = currentStockData;

        // Determine actual outcome
        const actual = actualChange; // 'up' or 'down'

        // Update score if prediction matches actual outcome
        if (userPrediction === actual) {
            currentScore += 1;
            scoreSpan.textContent = currentScore;
        }

        // Reveal the hidden data point
        // Show the complete chart
        if (currentChart) {
            currentChart.destroy();
        }

        const ctx = document.getElementById('stock-chart').getContext('2d');
        currentChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Price ($)',
                    data: prices,
                    borderColor: 'blue',
                    fill: false
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    tooltip: {
                        enabled: true
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Date'
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

        // Update Result Screen
        userPredictionSpan.textContent = userPrediction.toUpperCase();
        actualOutcomeSpan.textContent = actual.toUpperCase();

        // Show Result Screen
        gameScreen.classList.remove('active');
        resultScreen.classList.add('active');
    }
});