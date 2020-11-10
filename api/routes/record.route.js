module.exports = app => {
    const authMiddleware = require('../middlewares/auth.middleware');
    const utilMiddleware = require('../middlewares/utils.middleware');
    const record = require('../controllers/record.controller');

    app.get('/api/activateProfile/:id', authMiddleware.checkToken, record.activateProfile);

    app.post('/api/updateLocation', authMiddleware.checkToken, )

    app.get('/api/innerCircle/verifyQRcode/:self_id/:ref_id', authMiddleware.checkToken, record.verifyQRcode);
    app.delete('/api/innerCircle/removeInnerCircle/:self_id/:ref_id', authMiddleware.checkToken, record.removeFromIC);

    app.get('/api/score/getMonthScores/:self_id', authMiddleware.checkToken, record.getMonthScores);

    app.get('/api/general/calcDistance/:s_lat/:s_lng/:r_lat/:r_lng', utilMiddleware.calcDistance);
}
