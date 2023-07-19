 let {Router} = require('express')
const router = Router()
const multer = require('multer');
const upload = multer({ dest: 'uploads/' })
const userController = require("../controller/userController")
const userTokens = require("../middlewears/userToken")


router.post("/register",userController.userRegistration)
router.get("/user",userController.getUser)
router.post("/logout",userController.logout)
router.post('/login', userController.login);
router.get('/services/:id',userTokens,userController.servicesById)
router.get('/user/:id/verify/:token',userController.mailVerify)
router.get('/servicer/:id',userController.getServicer)
router.get('/slots',userController.slots)
router.get('/date',userController.getDate)
router.post('/book/:slotId/:serviceId/:userId', userController.bookSlot);
router.get("/appointments",userController.getAppointment)
router.get("/cancel-appointments/:id",userController.cancelAppointment)
router.patch("/edit-profile",upload.single('image'),userController.editProfile)

module.exports = router
