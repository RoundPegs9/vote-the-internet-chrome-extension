/**
 * Define Canvas
 */
var ctx = document.getElementById('analytics').getContext('2d');
var dotw = document.getElementById('avg_hours').getContext('2d');
var hpw = document.getElementById('hours_week').getContext('2d');

/**
 * Retrieve data from shared local session (Chrome)
 */
chrome.storage.sync.get("zen_daily_metrics", zen_data => {
    zen_data = zen_data.zen_daily_metrics;
    if (zen_data && zen_data.timeline) {
        var X = [],
            Y = [],
            Y_prime = [],
            hours = {f : 0, nf : 0};
        
        /**
         * Day of the weeek Flow cast (new feature: June 23)
         */
        var weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            hour_days = new Array(weekdays.length).fill(0),
            avg_day = new Array(weekdays.length).fill(0),
            index_day = new Array(weekdays.length).fill(0); //calculates average number of hours in that day of the week


        Object.keys(zen_data.timeline).map(function (key) {
            X.push(key);
            
            
            
            let f = parseFloat(zen_data.timeline[key] / 3600).toPrecision(3),
                nf = parseFloat(( 57600 /** assuming 8 hours of sleep **/ - zen_data.timeline[key] ) / 3600 ).toPrecision(3);
            
            /**
             * Generate day of the week projection
             */
            let temp_date_parse = new Date(key).getDay();
            index_day[temp_date_parse] += 1;
            hour_days[temp_date_parse] += parseFloat(f);
            delete temp_date_parse;


            hours.f += parseFloat(f);
            hours.nf += parseFloat(nf);
            Y.push(f);
            Y_prime.push(nf);
        });
        
        // setter for avg. # hours/day
        for(let i = 0; i < weekdays.length; i++)
        {
            avg_day[i] = parseFloat((hour_days[i] / index_day[i]).toPrecision(3)); //sets the avg. # of hours per day
        }
        /**
         * pointer deletion
         */
        delete index_day;
        delete hour_days; 

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


        /**
         * Create Chart for Avg. # hours per day visualization
         */
        var histChart = new Chart(dotw, {
            type: 'bar',
            data: {
                labels: weekdays,
                datasets: [{
                    label: 'Average number of Hours in flow per day',
                    data: avg_day,
                    fill: false,
                    backgroundColor: [
                        "rgba(255, 99, 132, 0.2)",
                        "rgba(255, 159, 64, 0.2)",
                        "rgba(255, 205, 86, 0.2)",
                        "rgba(75, 192, 192, 0.2)",
                        "rgba(54, 162, 235, 0.2)",
                        "rgba(153, 102, 255, 0.2)",
                        "rgba(49, 162, 27, 0.2)"
                    ],
                    borderColor: [
                        'rgb(255, 99, 132)',
                        "rgb(255, 159, 64)",
                        "rgb(255, 205, 86)",
                        "rgb(75, 192, 192)",
                        "rgb(54, 162, 235)",
                        "rgb(153, 102, 255)",
                        "rgb(49, 162, 27)"
                    ],
                    borderWidth: 2
                }/** ,{
                    type: 'line',
                    data : avg_day,
                    label : 'Avg. #hours per day',
                    fill: false,
                    borderColor: ["rgb(0, 0, 0)"],
                    backgroundColor: [
                        'rgb(255, 99, 132)',
                        "rgb(255, 159, 64)",
                        "rgb(255, 205, 86)",
                        "rgb(75, 192, 192)",
                        "rgb(54, 162, 235)",
                        "rgb(153, 102, 255)",
                        "rgb(49, 162, 27)"
                    ],
                    borderWidth : 1.5

                }*/]
            },
            options: {
                responsive: true,
                title: {
                    display: true,
                    text: 'Average number of Hours in Flow given Day of the Week'
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
                            labelString: 'Days of the Week'
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

        /**
         * Create a chart for #hours per week
         */
        var hours_week = [];
        var Y_prime_copy = [...Y_prime];
        while(Y_prime_copy.length)
        {
            hours_week.push(parseFloat((Y_prime_copy.splice(0, 6).reduce((a, b) => parseFloat(a + b), 0)/3600).toPrecision(3)));
        }

        var num_weeks = Array.from({ length: hours_week.length }, (_, i) => i+1);
        
        new Chart(hpw, {
            type: 'bar',
            data: {
                labels: num_weeks,
                datasets: [{
                    label: 'Hours worked per week',
                    data: hours_week,
                    fill: false,
                    backgroundColor: [
                        "rgba(255, 99, 132, 0.2)",
                        "rgba(255, 159, 64, 0.2)",
                        "rgba(255, 205, 86, 0.2)",
                        "rgba(75, 192, 192, 0.2)",
                        "rgba(54, 162, 235, 0.2)",
                        "rgba(153, 102, 255, 0.2)",
                        "rgba(49, 162, 27, 0.2)"
                    ],
                    borderColor: [
                        'rgb(255, 99, 132)',
                        "rgb(255, 159, 64)",
                        "rgb(255, 205, 86)",
                        "rgb(75, 192, 192)",
                        "rgb(54, 162, 235)",
                        "rgb(153, 102, 255)",
                        "rgb(49, 162, 27)"
                    ],
                    borderWidth: 2
                }/** ,{
                    type: 'line',
                    data : avg_day,
                    label : 'Avg. #hours per day',
                    fill: false,
                    borderColor: ["rgb(0, 0, 0)"],
                    backgroundColor: [
                        'rgb(255, 99, 132)',
                        "rgb(255, 159, 64)",
                        "rgb(255, 205, 86)",
                        "rgb(75, 192, 192)",
                        "rgb(54, 162, 235)",
                        "rgb(153, 102, 255)",
                        "rgb(49, 162, 27)"
                    ],
                    borderWidth : 1.5

                }*/]
            },
            options: {
                responsive: true,
                title: {
                    display: true,
                    text: 'Hours worked in a week'
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
                            labelString: 'Week number'
                        }
                    }],
                    yAxes: [{
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Hours'
                        }
                    }]
                }
            }
        });
    }
});