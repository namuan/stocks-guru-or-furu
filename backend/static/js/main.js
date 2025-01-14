// backend/static/js/main.js

document.addEventListener('DOMContentLoaded', () => {
    // Screen Elements
    const welcomeScreen = document.getElementById('welcome-screen');
    const loadingScreen = document.getElementById('loading-screen');
    const gameScreen = document.getElementById('game-screen');
    const resultScreen = document.getElementById('result-screen');
    const errorScreen = document.getElementById('error-screen');
    const gameOverScreen = document.getElementById('game-over-screen');

    // Buttons
    const startGameBtn = document.getElementById('start-game-btn');
    const nextRoundBtn = document.getElementById('next-round-btn');
    const endGameBtn = document.getElementById('end-game-btn');
    const retryBtn = document.getElementById('retry-btn');
    const backHomeBtn = document.getElementById('back-home-btn');
    const playAgainBtn = document.getElementById('play-again-btn');
    const gameOverHomeBtn = document.getElementById('game-over-home-btn');

    // Game Elements
    const stockName = document.getElementById('stock-name');
    const scoreSpan = document.getElementById('score');
    const userPredictionSpan = document.getElementById('user-prediction');
    const actualOutcomeSpan = document.getElementById('actual-outcome');

    // Prediction Buttons
    const predictButtons = document.querySelectorAll('.predict-btn');
    const streakSpan = document.getElementById('streak');

    // Game State Variables
    let currentStreak = 0;
    let currentScore = 0;
    let currentChart = null;
    let currentStockData = null;
    let userPrediction = '';
    let totalPredictions = 0;
    let correctPredictions = 0;
    let bestStreak = 0;

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
        document.getElementById('final-score').textContent = currentScore;
        document.getElementById('total-predictions').textContent = totalPredictions;
        document.getElementById('correct-predictions').textContent = correctPredictions;
        document.getElementById('best-streak').textContent = bestStreak;
        gameOverScreen.classList.add('active');
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

    playAgainBtn.addEventListener('click', () => {
        gameOverScreen.classList.remove('active');
        loadingScreen.classList.add('active');
        resetGame();
        fetchStockData();
    });

    gameOverHomeBtn.addEventListener('click', () => {
        gameOverScreen.classList.remove('active');
        welcomeScreen.classList.add('active');
        resetGame();
    });

    // Handle Prediction Buttons
    predictButtons.forEach(button => {
        button.addEventListener('click', () => {
            userPrediction = button.getAttribute('data-prediction');
            evaluatePrediction();
        });
    });

    function resetGame() {
        currentScore = 0;
        currentStreak = 0;
        totalPredictions = 0;
        correctPredictions = 0;
        scoreSpan.textContent = '0';
        streakSpan.textContent = '0';
    }

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

    function loadGame() {
        const { ticker, company, prices, dates, visibleDays } = currentStockData;
        stockName.textContent = `${company} (${ticker})`;

        // Add question text
        document.getElementById('prediction-question').textContent =
            `Based on this 3-month price history, how do you think ${ticker} stock will perform over the next week?`;

        const visiblePrices = prices.slice(0, visibleDays);
        const visibleDates = dates.slice(0, visibleDays);

        if (currentChart) {
            currentChart.destroy();
            currentStreak += 1;
        } else {
            currentStreak = 0;
        }
        streakSpan.textContent = currentStreak;

        const ctx = document.getElementById('stock-chart').getContext('2d');
        const chartData = visiblePrices.map(price => ({
            y: parseFloat(price),
            x: price
        }));

        currentChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: visibleDates,
                datasets: [{
                    label: 'Stock Price',
                    data: visiblePrices.map(price => parseFloat(price)),
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
                        },
                        ticks: {
                            maxTicksLimit: 10,
                            maxRotation: 45,
                            minRotation: 45
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

    function evaluatePrediction() {
        const { prices, dates, visibleDays, predictionDays } = currentStockData;
        const lastVisiblePrice = prices[visibleDays - 1];
        const futurePrice = prices[visibleDays + predictionDays - 1];
        const percentageChange = ((futurePrice - lastVisiblePrice) / lastVisiblePrice * 100);

        function determineCategory(change) {
            if (change <= -3) return "very bearish";
            if (change <= -1) return "bearish";
            if (change >= 3) return "very bullish";
            if (change >= 1) return "bullish";
            return "neutral";
        }

        const actualCategory = determineCategory(percentageChange);

        let resultSummary;
        if (userPrediction === actualCategory) {
            resultSummary = `Correct! The stock went ${actualCategory} (${percentageChange.toFixed(2)}%)`;
        } else {
            resultSummary = `Not quite. The stock went ${actualCategory} (${percentageChange.toFixed(2)}%)`;
        }
        document.getElementById('result-title').textContent = resultSummary;

        let pointsEarned = 0;
        totalPredictions++;

        if (userPrediction === actualCategory) {
            pointsEarned = 10;
            currentScore += pointsEarned;
            correctPredictions++;
            scoreSpan.textContent = currentScore;
        }

        bestStreak = Math.max(bestStreak, currentStreak);

        if (totalPredictions >= 10) {
            document.getElementById('final-score').textContent = currentScore;
            document.getElementById('total-predictions').textContent = totalPredictions;
            document.getElementById('correct-predictions').textContent = correctPredictions;
            document.getElementById('best-streak').textContent = bestStreak;

            gameScreen.classList.remove('active');
            resultScreen.classList.remove('active');
            gameOverScreen.classList.add('active');
            return;
        }

        if (currentChart) {
            currentChart.destroy();
        }

        const ctx = document.getElementById('result-chart').getContext('2d');
        const chartData = prices.map(price => parseFloat(price));

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
                    pointRadius: (ctx) => {
                        if (ctx.dataIndex === visibleDays + predictionDays - 1) return 8;
                        if (ctx.dataIndex === visibleDays - 1) return 8;
                        return 4;
                    },
                    pointBackgroundColor: (ctx) => {
                        if (ctx.dataIndex === visibleDays + predictionDays - 1) return 'red';
                        if (ctx.dataIndex === visibleDays - 1) return 'blue';
                        return 'rgb(75, 192, 192)';
                    },
                    pointBorderColor: (ctx) => {
                        if (ctx.dataIndex === visibleDays + predictionDays - 1 || ctx.dataIndex === visibleDays - 1) {
                            return '#fff';
                        }
                        return '#fff';
                    },
                    pointBorderWidth: (ctx) => {
                        if (ctx.dataIndex === visibleDays + predictionDays - 1 || ctx.dataIndex === visibleDays - 1) {
                            return 2;
                        }
                        return 1;
                    },
                    pointHoverRadius: 8,
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
                                let label = `Price: $${context.raw.toFixed(2)}`;
                                if (context.dataIndex === visibleDays + predictionDays - 1) {
                                    label += ' (Final Price)';
                                } else if (context.dataIndex === visibleDays - 1) {
                                    label += ' (Reference Price)';
                                }
                                return label;
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
                        },
                        ticks: {
                            maxTicksLimit: 10,
                            maxRotation: 45,
                            minRotation: 45
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

        userPredictionSpan.textContent = userPrediction.toUpperCase();
        actualOutcomeSpan.textContent = actualCategory.toUpperCase();
        document.getElementById('percentage-change').textContent = `${percentageChange.toFixed(2)}%`;
        document.getElementById('points-earned').textContent = pointsEarned;

        gameScreen.classList.remove('active');
        resultScreen.classList.add('active');
    }
});