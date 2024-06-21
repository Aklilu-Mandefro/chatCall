const express = require('express');
const userController = require('./../controllers/userController');
const router = express.Router();

router.post('/signup', userController.signup);
router.post('/signin', userController.signin);
router.get('/logout', userController.logout);
router.post('/forgotPassword', userController.forgotPassword);
router.patch('/resetPassword/:token', userController.resetPassword);
router.get('/login', userController.login);
router.get('/register', userController.register);
router.get('/forgot_password', userController.forgot_password);
router.get('/reset_password', userController.reset_password);
router.get('/', userController.index);

module.exports = router;