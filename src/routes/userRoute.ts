 let {Router} = require('express')
const router = Router()
const multer = require('multer');
const upload = multer({ dest: 'uploads/' })
const userController = require("../controller/userController")
const userTokens = require("../middlewears/userToken")


router.post("/register",userController.userRegistration)
router.get("/user",userTokens,userController.getUser)
router.post("/logout",userController.logout)
router.post('/login', userController.login);
router.get('/services/:id',userTokens,userController.servicesById)
router.get('/user/:id/verify/:token',userController.mailVerify)
router.get('/servicer/:id',userTokens,userController.getServicer)
router.get('/slots',userTokens,userController.slots)
router.get('/date',userTokens,userController.getDate)
router.post('/book/:slotId/:serviceId/:userId',userTokens,userController.bookSlot);
router.get("/appointments",userTokens,userController.getAppointment)
router.get("/cancel-appointments/:id",userTokens,userController.cancelAppointment)
router.patch("/edit-profile",userTokens, upload.single('image'),userController.editProfile)
router.post("/googleLog",userController.googleLogin)

module.exports = router
