const moment = require('moment');

exports.calculateMin = (startDate, endDate) => {
    var start_date = moment(startDate, 'YYYY-MM-DD HH:mm:ss');
    var end_date = moment(endDate, 'YYYY-MM-DD HH:mm:ss');
    var duration = moment.duration(end_date.diff(start_date));
    var min = duration.asMinutes;
    return min;
}