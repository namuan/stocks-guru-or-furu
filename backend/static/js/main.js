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
    const endGameBtn = document.getElementById('end-game-btn');
    const retryBtn = document.getElementById('retry-btn');
    const backHomeBtn = document.getElementById('back-home-btn');

    // Game Elements
    const stockName = document.getElementById('stock-name');
    const scoreSpan = document.getElementById('score');
    const userPredictionSpan = document.getElementById('user-prediction');
    const actualOutcomeSpan = document.getElementById('actual-outcome');

    // Prediction Buttons
    const predictButtons = document.querySelectorAll('.predict-btn');
    const streakSpan = document.getElementById('streak');
    let currentStreak = 0;

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

    endGameBtn.addEventListener('click', () => {
        resultScreen.classList.remove('active');
        welcomeScreen.classList.add('active');
        currentScore = 0;
        currentStreak = 0;
        scoreSpan.textContent = '0';
        streakSpan.textContent = '0';
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

        // For debugging
        console.log('Visible Prices:', visiblePrices);
        console.log('Visible Dates:', visibleDates);

        // Destroy existing chart if any
        if (currentChart) {
            currentChart.destroy();
            currentStreak += 1;
        } else {
            currentStreak = 0;
        }
        streakSpan.textContent = currentStreak;

        const ctx = document.getElementById('stock-chart').getContext('2d');

        // Ensure we're working with valid numbers
        const chartData = visiblePrices.map(price => ({
            y: parseFloat(price),
            x: price // Keep original value for debugging
        }));

        console.log('Chart Data:', chartData);

        currentChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: visibleDates,
                datasets: [{
                    label: 'Stock Price',
                    data: visiblePrices.map(price => parseFloat(price)), // Convert to numbers
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.1,
                    borderWidth: 2,
                    fill: false,
                    pointRadius: 4,
                    pointBackgroundColor: 'rgb(75, 192, 192)',
                    pointBorderColor: '#fff',
                    pointHoverRadius: 6,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return `Price: $${context.raw.toFixed(2)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'category',
                        display: true,
                        title: {
                            display: true,
                            text: 'Date',
                            font: {
                                size: 14
                            }
                        },
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: 'Price ($)',
                            font: {
                                size: 14
                            }
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toFixed(2);
                            }
                        }
                    }
                }
            }
        });
    }

    // Function to Evaluate User Prediction
    function evaluatePrediction() {
        const { prices, dates } = currentStockData;
        const lastPrice = prices[prices.length - 1];
        const previousPrice = prices[prices.length - 2];
        const percentageChange = ((lastPrice - previousPrice) / previousPrice * 100);

        // Determine actual outcome category based on percentage change
        function determineCategory(change) {
            if (change <= -3) return "very bearish";
            if (change <= -1) return "bearish";
            if (change >= 3) return "very bullish";
            if (change >= 1) return "bullish";
            return "neutral";
        }

        const actualCategory = determineCategory(percentageChange);

        // Calculate points for this round
        let pointsEarned = 0;
        if (userPrediction === actualCategory) {
            pointsEarned = 10;
            currentScore += pointsEarned;
            scoreSpan.textContent = currentScore;
        }

        // Destroy existing chart if any
        if (currentChart) {
            currentChart.destroy();
        }

        // Create new chart with all data points
        const ctx = document.getElementById('result-chart').getContext('2d');

        // Convert prices to numbers and add highlight for the last point
        const chartData = prices.map((price, index) => parseFloat(price));
        const backgroundColors = prices.map((_, index) =>
            index === prices.length - 1 ? 'red' : 'rgb(75, 192, 192)'
        );

        currentChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Stock Price',
                    data: chartData,
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.1,
                    borderWidth: 2,
                    fill: false,
                    pointRadius: (ctx) => ctx.dataIndex === prices.length - 1 ? 6 : 4,
                    pointBackgroundColor: backgroundColors,
                    pointBorderColor: '#fff',
                    pointHoverRadius: 6,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return `Price: $${context.raw.toFixed(2)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'category',
                        display: true,
                        title: {
                            display: true,
                            text: 'Date',
                            font: {
                                size: 14
                            }
                        },
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: 'Price ($)',
                            font: {
                                size: 14
                            }
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toFixed(2);
                            }
                        }
                    }
                }
            }
        });

        // Update Result Screen
        userPredictionSpan.textContent = userPrediction.toUpperCase();
        actualOutcomeSpan.textContent = actualCategory.toUpperCase();
        document.getElementById('percentage-change').textContent = `${percentageChange.toFixed(2)}%`;
        document.getElementById('points-earned').textContent = pointsEarned;

        // Show Result Screen
        gameScreen.classList.remove('active');
        resultScreen.classList.add('active');
    }
});