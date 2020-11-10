const haversine = require('haversine')

module.exports = (lat1, lon1, lat2, lon2) => {
    const points = [
        {
            latitude: lat1,
            longitude: lon1
        },
        {
            latitude: lat2,
            longitude: lon2
        }
    ];

    let distance = haversine(points[0], points[1], {threshold: 1, unit: 'meter'});

    return distance;
}