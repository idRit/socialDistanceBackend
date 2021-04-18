module.exports = (app) => {
    const user = require('../controllers/auth.controller');
    const middleware = require('../middlewares/auth.middleware');

    app.post('/api/login', user.login);
    app.post('/api/signup', user.signup);

    app.post('/api/generate-otp', user.generateOtp);
    app.post('/api/verify-otp', user.validateOtp);
    
    // app.post('/api/forgotPass', user.forgotPass);
    // app.post('/api/changePass', middleware.checkToken, user.changePass);
} 