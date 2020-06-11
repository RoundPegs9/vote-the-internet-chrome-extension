var ctx = document.getElementById('analytics').getContext('2d');

chrome.storage.sync.get("zen_daily_metrics", zen_data => {
    zen_data = zen_data.zen_daily_metrics;
    if (zen_data && zen_data.timeline) {
        var X = [],
            Y = [],
            Y_prime = [],
            hours = {f : 0, nf : 0};
        
        Object.keys(zen_data.timeline).map(function (key) {
            X.push(key);
            
            let f = parseFloat(zen_data.timeline[key] / 3600).toPrecision(3),
                nf = parseFloat(( 57600 /** assuming 8 hours of sleep **/ - zen_data.timeline[key] ) / 3600 ).toPrecision(3);
            hours.f += parseFloat(f);
            hours.nf += parseFloat(nf);
            Y.push(f);
            Y_prime.push(nf);
        });
        document.getElementById("d").textContent = Y.length;
        document.getElementById("f").textContent = hours.f.toPrecision(3);
        document.getElementById("nf").textContent = hours.nf.toPrecision(3);
        
        var myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: X,
                datasets: [{
                    label: 'Hours spent in flow',
                    data: Y,
                    fill: false,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)'
                    ],
                    borderWidth: 2
                },{
                    label: 'Hours not in flow',
                    data: Y_prime,
                    fill: false,
                    backgroundColor: [
                        'rgb(75, 192, 192)'
                    ],
                    borderColor: [
                        'rgb(75, 192, 192)'
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
                            labelString: 'Day (MM-DD-YYYY)'
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