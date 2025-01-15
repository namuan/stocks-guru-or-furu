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

    // Prediction Buttons
    const predictButtons = document.querySelectorAll('.predict-btn');

    // Game State Variables
    let currentScore = 0;
    let currentChart = null;
    let currentStockData = null;
    let userPrediction = '';
    let totalPredictions = 0;
    let correctPredictions = 0;

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

    var defaultApexChartOptions = {
        chart: {
            type: 'candlestick',
            height: 350
        },
        xaxis: {
            type: 'datetime',
        },
        yaxis: {
            tooltip: {
                enabled: true
            },
            labels: {
                formatter: function(value) {
                    return '$' + value.toFixed(2);
                }
            }
        },
        tooltip: {
            custom: ({}) => ``
        }
    };

    function resetGame() {
        currentScore = 0;
        totalPredictions = 0;
        correctPredictions = 0;
        scoreSpan.textContent = '0';
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
        const {ticker, company, ohlc, visibleDays} = currentStockData;
        stockName.textContent = `${company} (${ticker})`;

        // Add question text
        document.getElementById('prediction-question').textContent =
            `Based on this 3-month price history, how do you think ${ticker} stock will perform over the next week?`;

        if (currentChart) {
            currentChart.destroy();
        }

        const options = {
            ...defaultApexChartOptions,
            series: [{
                data: ohlc.map(item => ({
                    x: new Date(item.x),
                    y: item.y
                })).slice(0, visibleDays)
            }]
        };

        currentChart = new ApexCharts(document.querySelector("#apex-chart"), options);
        currentChart.render();
    }

    function evaluatePrediction() {
        const {ticker, prices, ohlc, visibleDays, predictionDays, actualChange} = currentStockData;
        const lastVisiblePrice = prices[visibleDays - 1];
        const futurePrice = prices[visibleDays + predictionDays - 1];
        const percentageChange = ((futurePrice - lastVisiblePrice) / lastVisiblePrice * 100);

        let resultSummary;
        if (userPrediction === actualChange) {
            resultSummary = `Correct! ${ticker} went ${actualChange} ${percentageChange.toFixed(2)}%`;
        } else {
            resultSummary = `Not quite. ${ticker} went ${actualChange} ${percentageChange.toFixed(2)}%`;
        }
        document.getElementById('result-title').textContent = resultSummary;

        let pointsEarned = 0;
        totalPredictions++;

        if (userPrediction === actualChange) {
            pointsEarned = 10;
            currentScore += pointsEarned;
            correctPredictions++;
            scoreSpan.textContent = currentScore;
        }

        if (totalPredictions >= 10) {
            document.getElementById('final-score').textContent = currentScore;
            document.getElementById('total-predictions').textContent = totalPredictions;
            document.getElementById('correct-predictions').textContent = correctPredictions;

            gameScreen.classList.remove('active');
            resultScreen.classList.remove('active');
            gameOverScreen.classList.add('active');
            return;
        }

        const lastVisibleOhlc = ohlc[visibleDays - 1];
        if (currentChart) {
            currentChart.destroy();
        }

        const options = {
            ...defaultApexChartOptions,
            series: [{
                data: ohlc.map(item => ({
                    x: new Date(item.x),
                    y: item.y
                }))
            }],
            annotations: {
                xaxis: [{
                    x: new Date(lastVisibleOhlc.x).getTime(),
                    borderColor: '#775DD0',
                    label: {
                        style: {
                            color: '#fff',
                            background: '#775DD0'
                        },
                    }
                }]
            }
        };

        currentChart = new ApexCharts(document.querySelector("#apex-result-chart"), options);
        currentChart.render();

        document.getElementById('points-earned').textContent = pointsEarned;
        gameScreen.classList.remove('active');
        resultScreen.classList.add('active');
    }
});