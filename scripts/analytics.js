var ctx = document.getElementById('analytics').getContext('2d');

chrome.storage.sync.get("zen_daily_metrics", zen_data => {
    zen_data = zen_data.zen_daily_metrics;
    if (zen_data && zen_data.timeline) {
        var X = [],
            Y = [];
        Object.keys(zen_data.timeline).map(function (key) {
            X.push(key);
            Y.push(zen_data.timeline[key] / 3600);
        });
        var myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: X,
                datasets: [{
                    label: '# hours in Zen over time',
                    data: Y,
                    fill: false,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                title: {
                    display: true,
                    text: 'Zen (# Hour) vs. Time (Day)'
                },
                tooltips: {
                    mode: 'index',
                    intersect: false,
                },
                hover: {
                    mode: 'nearest',
                    intersect: true
                },
                scales: {
                    xAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Day'
                        }
                    }],
                    yAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Time (hour)'
                        }
                    }]
                }
            }
        });
    }
});