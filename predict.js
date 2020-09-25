/**
 * This file predicts the time the user will work for based on 
 * their past activity.
 * Implemented using OLS.
 */

export class Predict {
    constructor() {
        this.hours = [];
    }
    gather_data(){
        // collect data into (x:day_number, y:hours_worked) tuple
        var Y = [];
        chrome.storage.sync.get("zen_daily_metrics", zen_data => {
            zen_data = zen_data.zen_daily_metrics;
            if (zen_data && zen_data.timeline) {
                Object.keys(zen_data.timeline).map(function (key) {
                    let f = parseFloat(zen_data.timeline[key] / 3600).toPrecision(3);
                    Y.push(parseFloat(f)); //get number of hours
                });
                console.log(Y);
            }
            console.log(Y);
            this.hours = Y;
        });
    }
    get_data()
    {
        return this.hours;
    }
}