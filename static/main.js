// Check if dark mode is active
const isDarkMode = document.body.classList.contains('dark');

// Initial chart setup with improved styling
const chartOptions1 = {
    layout: {
        background: { type: 'solid', color: isDarkMode ? '#111827' : 'white' },
        textColor: isDarkMode ? '#f3f4f6' : '#1f2937',
        fontFamily: 'Inter, sans-serif',
    },
    grid: {
        vertLines: {
            color: isDarkMode ? 'rgba(55, 65, 81, 0.5)' : 'rgba(229, 231, 235, 0.8)',
            style: 1, // Solid line style
        },
        horzLines: {
            color: isDarkMode ? 'rgba(55, 65, 81, 0.5)' : 'rgba(229, 231, 235, 0.8)',
            style: 1, // Solid line style
        },
    },
    crosshair: {
        mode: LightweightCharts.CrosshairMode.Normal,
        vertLine: {
            color: isDarkMode ? 'rgba(156, 163, 175, 0.5)' : 'rgba(75, 85, 99, 0.3)',
            width: 1,
            style: 2, // Dashed line
        },
        horzLine: {
            color: isDarkMode ? 'rgba(156, 163, 175, 0.5)' : 'rgba(75, 85, 99, 0.3)',
            width: 1,
            style: 2, // Dashed line
        },
    },
    timeScale: {
        visible: false,
        borderColor: isDarkMode ? '#374151' : '#e5e7eb',
        timeVisible: true,
        secondsVisible: false,
    },
    rightPriceScale: {
        borderColor: isDarkMode ? '#374151' : '#e5e7eb',
        scaleMargins: {
            top: 0.1, 
            bottom: 0.2,
        },
    },
    width: document.getElementById('chart').clientWidth,
    height: document.getElementById('chart').clientHeight,
};

const chartOptions2 = {
    layout: {
        background: { type: 'solid', color: isDarkMode ? '#111827' : 'white' },
        textColor: isDarkMode ? '#f3f4f6' : '#1f2937',
        fontFamily: 'Inter, sans-serif',
    },
    grid: {
        vertLines: {
            color: isDarkMode ? 'rgba(55, 65, 81, 0.5)' : 'rgba(229, 231, 235, 0.8)',
            style: 1,
        },
        horzLines: {
            color: isDarkMode ? 'rgba(55, 65, 81, 0.5)' : 'rgba(229, 231, 235, 0.8)',
            style: 1,
        },
    },
    crosshair: {
        mode: LightweightCharts.CrosshairMode.Normal,
        vertLine: {
            color: isDarkMode ? 'rgba(156, 163, 175, 0.5)' : 'rgba(75, 85, 99, 0.3)',
            width: 1,
            style: 2,
        },
        horzLine: {
            color: isDarkMode ? 'rgba(156, 163, 175, 0.5)' : 'rgba(75, 85, 99, 0.3)',
            width: 1,
            style: 2,
        },
    },
    timeScale: {
        visible: true,
        borderColor: isDarkMode ? '#374151' : '#e5e7eb',
        timeVisible: true,
        secondsVisible: false,
    },
    rightPriceScale: {
        borderColor: isDarkMode ? '#374151' : '#e5e7eb',
        scaleMargins: {
            top: 0.1, 
            bottom: 0.2,
        },
    },
    width: document.getElementById('chart').clientWidth,
    height: document.getElementById('rsiChart').clientHeight,
};

const chart = LightweightCharts.createChart(document.getElementById('chart'), chartOptions1);
const candlestickSeries = chart.addSeries(
    LightweightCharts.CandlestickSeries,
    {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    }
);
const emaLine = chart.addSeries(
    LightweightCharts.LineSeries,
    { color: 'blue', lineWidth: 2 }
);

const rsiChart = LightweightCharts.createChart(document.getElementById('rsiChart'),chartOptions2);
const rsiLine = rsiChart.addSeries(
    LightweightCharts.LineSeries,
    { color: 'red', lineWidth: 2}
);

let autoUpdateInterval;

// Fetch data function
function fetchData(ticker, timeframe, emaPeriod, rsiPeriod) {
    fetch(`/api/data/${ticker}/${timeframe}/${emaPeriod}/${rsiPeriod}`)
        .then(response => response.json())
        .then(data => {
            candlestickSeries.setData(data.candlestick);
            emaLine.setData(data.ema);
            rsiLine.setData(data.rsi);

            
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

// Fetch NVDA data on page load with default timeframe (daily), EMA period (20) and RSI period (14)
window.addEventListener('load', () => {
    fetchData('NVDA', '1d', 20, 14);
    loadWatchlist();
});

// Handle data fetching on button click
document.getElementById('fetchData').addEventListener('click', () => {
    const ticker = document.getElementById('ticker').value;
    const timeframe = document.getElementById('timeframe').value;
    const emaPeriod = document.getElementById('emaPeriod').value;
    const rsiPeriod = document.getElementById('rsiPeriod').value;
    fetchData(ticker, timeframe, emaPeriod, rsiPeriod);
});

// Handle auto-update functionality
document.getElementById('autoUpdate').addEventListener('change', (event) => {
    if (event.target.checked) {
        const frequency = document.getElementById('updateFrequency').value * 1000;
        autoUpdateInterval = setInterval(() => {
            const ticker = document.getElementById('ticker').value;
            const timeframe = document.getElementById('timeframe').value;
            const emaPeriod = document.getElementById('emaPeriod').value;
            const rsiPeriod = document.getElementById('rsiPeriod').value;
            fetchData(ticker, timeframe, emaPeriod, rsiPeriod);
        }, frequency);
    } else {
        clearInterval(autoUpdateInterval);
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    chart.resize(document.getElementById('chart').clientWidth, document.getElementById('chart').clientHeight);
    rsiChart.resize(document.getElementById('rsiChart').clientWidth, document.getElementById('rsiChart').clientHeight);
});

// Theme toggle functionality for DaisyUI
document.getElementById('themeToggle').addEventListener('click', () => {
    const currentTheme = document.body.getAttribute('data-theme');
    const darkIcon = document.querySelector('.dark-icon');
    const lightIcon = document.querySelector('.light-icon');
    
    if (currentTheme === 'light') {
        // Switch to dark theme
        document.body.setAttribute('data-theme', 'dark');
        darkIcon.classList.add('hidden');
        lightIcon.classList.remove('hidden');
        
        // Update chart options for dark theme
        chart.applyOptions({
            layout: {
                background: { type: 'solid', color: '#1f2937' },
                textColor: '#f3f4f6',
            },
            grid: {
                vertLines: {
                    color: 'rgba(55, 65, 81, 0.5)',
                },
                horzLines: {
                    color: 'rgba(55, 65, 81, 0.5)',
                },
            },
            rightPriceScale: {
                borderColor: '#374151',
            },
            timeScale: {
                borderColor: '#374151',
            },
        });
        
        rsiChart.applyOptions({
            layout: {
                background: { type: 'solid', color: '#1f2937' },
                textColor: '#f3f4f6',
            },
            grid: {
                vertLines: {
                    color: 'rgba(55, 65, 81, 0.5)',
                },
                horzLines: {
                    color: 'rgba(55, 65, 81, 0.5)',
                },
            },
            rightPriceScale: {
                borderColor: '#374151',
            },
            timeScale: {
                borderColor: '#374151',
            },
        });
    } else {
        // Switch to light theme
        document.body.setAttribute('data-theme', 'light');
        darkIcon.classList.remove('hidden');
        lightIcon.classList.add('hidden');
        
        // Update chart options for light theme
        chart.applyOptions({
            layout: {
                background: { type: 'solid', color: 'white' },
                textColor: '#1f2937',
            },
            grid: {
                vertLines: {
                    color: 'rgba(229, 231, 235, 0.8)',
                },
                horzLines: {
                    color: 'rgba(229, 231, 235, 0.8)',
                },
            },
            rightPriceScale: {
                borderColor: '#e5e7eb',
            },
            timeScale: {
                borderColor: '#e5e7eb',
            },
        });
        
        rsiChart.applyOptions({
            layout: {
                background: { type: 'solid', color: 'white' },
                textColor: '#1f2937',
            },
            grid: {
                vertLines: {
                    color: 'rgba(229, 231, 235, 0.8)',
                },
                horzLines: {
                    color: 'rgba(229, 231, 235, 0.8)',
                },
            },
            rightPriceScale: {
                borderColor: '#e5e7eb',
            },
            timeScale: {
                borderColor: '#e5e7eb',
            },
        });
    }
});

// Load watchlist symbols from the server with real quotes
function loadWatchlist() {
    // Show loading state
    const watchlistItems = document.getElementById('watchlistItems');
    watchlistItems.innerHTML = `
        <div class="flex justify-center items-center p-8">
            <span class="loading loading-spinner loading-md text-primary"></span>
            <span class="ml-2">Loading quotes...</span>
        </div>
    `;
    
    fetch('/api/symbols')
        .then(response => response.json())
        .then(symbolsData => {
            watchlistItems.innerHTML = '';
            
            if (symbolsData.length === 0) {
                const emptyState = document.createElement('div');
                emptyState.className = 'flex flex-col items-center justify-center p-6 text-center text-opacity-70';
                emptyState.innerHTML = `
                    <i class="fas fa-list text-3xl mb-2 text-primary opacity-50"></i>
                    <p>No symbols in watchlist</p>
                    <button class="btn btn-sm btn-outline btn-primary mt-2">Add Symbol</button>
                `;
                watchlistItems.appendChild(emptyState);
                return;
            }
            
            symbolsData.forEach(symbolData => {
                const item = document.createElement('div');
                item.className = 'card bg-base-100 hover:bg-base-200 shadow-sm hover:shadow cursor-pointer transition-all';
                
                // Format the data
                const price = symbolData.price ? symbolData.price.toFixed(2) : 'N/A';
                const changePercent = symbolData.change ? symbolData.change.toFixed(2) : 0;
                const isPositive = changePercent > 0;
                const changeClass = isPositive ? 'text-success' : (changePercent < 0 ? 'text-error' : 'text-gray-500');
                const changeIcon = isPositive ? 'caret-up' : (changePercent < 0 ? 'caret-down' : 'minus');
                
                // Create tooltip with more info
                const tooltipContent = `${symbolData.name || symbolData.symbol} (${symbolData.currency})`;
                
                item.innerHTML = `
                    <div class="card-body p-3" data-tip="${tooltipContent}">
                        <div class="flex justify-between items-center">
                            <div>
                                <h3 class="font-bold">${symbolData.symbol}</h3>
                                <div class="text-xs opacity-70 truncate max-w-32" title="${symbolData.name || symbolData.symbol}">
                                    ${symbolData.name || 'Yahoo Finance'}
                                </div>
                            </div>
                            <div class="text-right">
                                <div class="font-medium">${symbolData.currency} ${price}</div>
                                <div class="text-xs ${changeClass}">
                                    <i class="fas fa-${changeIcon} mr-1"></i>
                                    ${changePercent}%
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                item.addEventListener('click', () => {
                    document.getElementById('ticker').value = symbolData.symbol;
                    // Add active indicator
                    document.querySelectorAll('.card.border-primary').forEach(el => {
                        el.classList.remove('border-primary', 'border');
                    });
                    item.classList.add('border-primary', 'border');
                    
                    fetchData(symbolData.symbol, document.getElementById('timeframe').value, document.getElementById('emaPeriod').value, document.getElementById('rsiPeriod').value);
                });
                
                watchlistItems.appendChild(item);
            });
            
            // Add a refresh button at the bottom
            const refreshButton = document.createElement('button');
            refreshButton.className = 'btn btn-sm btn-ghost gap-2 mt-4 w-full';
            refreshButton.innerHTML = `<i class="fas fa-sync-alt"></i> Refresh Quotes`;
            refreshButton.addEventListener('click', loadWatchlist);
            watchlistItems.appendChild(refreshButton);
        })
        .catch(error => {
            console.error('Error loading watchlist:', error);
            watchlistItems.innerHTML = `
                <div class="alert alert-error shadow-lg">
                    <i class="fas fa-exclamation-circle"></i>
                    <span>Error loading watchlist data</span>
                    <button class="btn btn-sm btn-ghost" onclick="loadWatchlist()">Retry</button>
                </div>
            `;
        });
}

// Sync visible logical range between charts
function syncVisibleLogicalRange(chart1, chart2) {
    chart1.timeScale().subscribeVisibleLogicalRangeChange(timeRange => {
        chart2.timeScale().setVisibleLogicalRange(timeRange);
    });

    chart2.timeScale().subscribeVisibleLogicalRangeChange(timeRange => {
        chart1.timeScale().setVisibleLogicalRange(timeRange);
    });
}


syncVisibleLogicalRange(chart, rsiChart);

// Sync crosshair position between charts
function getCrosshairDataPoint(series, param) {
    if (!param.time) {
        return null;
    }
    const dataPoint = param.seriesData.get(series);
    return dataPoint || null;
}

function syncCrosshair(chart, series, dataPoint) {
    if (dataPoint) {
        chart.setCrosshairPosition(dataPoint.value, dataPoint.time, series);
        return;
    }
    chart.clearCrosshairPosition();
}

chart.subscribeCrosshairMove(param => {
    const dataPoint = getCrosshairDataPoint(candlestickSeries, param);
    syncCrosshair(rsiChart, rsiLine, dataPoint);
});

rsiChart.subscribeCrosshairMove(param => {
    const dataPoint = getCrosshairDataPoint(rsiLine, param);
    syncCrosshair(chart, candlestickSeries, dataPoint);
});
