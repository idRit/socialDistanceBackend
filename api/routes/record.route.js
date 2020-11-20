module.exports = app => {
    const authMiddleware = require('../middlewares/auth.middleware');
    const utilMiddleware = require('../middlewares/utils.middleware');
    const record = require('../controllers/record.controller');

    app.get('/api/activateProfile/:id', authMiddleware.checkToken, record.activateProfile);

    app.post('/api/updateLocation', authMiddleware.checkToken, record.updateLocation);
    app.post('/api/updateBluetoothScore', authMiddleware.checkToken, record.updateBluetoothScore);
    app.post('/api/updateInfected', authMiddleware.checkToken, record.updateInfected);

    app.get('/api/innerCircle/verifyQRcode/:self_id/:ref_id', authMiddleware.checkToken, record.verifyQRcode);
    app.get('/api/innerCircle/getAllInnerCircleEmails/:self_id', authMiddleware.checkToken, record.getAllInnerCircleEmails);
    app.get('/api/innerCircle/removeInnerCircle/:self_id/:ref_id', authMiddleware.checkToken, record.removeFromIC);

    app.get('/api/score/getAllScores/:self_id', authMiddleware.checkToken, record.getMonthScores);
    app.get('/api/score/travelData/:self_id', authMiddleware.checkToken, record.travelData);
    app.get('/api/getProfileCurrentScores/:self_id', authMiddleware.checkToken, record.getProfileCurrentScores);

    app.get('/api/transferAll', record.transferAll);

    // app.get('/api/general/calcDistance/:s_lat/:s_lng/:r_lat/:r_lng', utilMiddleware.calcDistance);
}
