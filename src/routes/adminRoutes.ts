let adminExpress =  require('express')
let a_route = adminExpress()
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); 
let adminController = require('../controller/adminController')

a_route.post('/login',adminController.adminLogin)
a_route.get('/customers',adminController.getUsers)
a_route.post('/block/:id',adminController.blockUser)
a_route.get('/counselor',adminController.getCounselor)
a_route.post('/block-Counselor/:id',adminController.blockCounselor)
a_route.post('/unblock-Counselor/:id',adminController.unblockCounselor)
a_route.patch('/accept-counselor',adminController.AcceptCounselor)
a_route.delete('/counselor/:id',adminController.DeclineCounselor)
a_route.post('/add-service', upload.single('image'), adminController.addService);
a_route.get('/services',adminController.getServices)
a_route.get('/cookie',adminController.getCookie)
a_route.get("/getAppointment",adminController.getAppointment)
a_route.post('/logout',adminController.logout)
a_route.get('/getRevenue',adminController.getRevenue)
a_route.post('/list-services/:id',adminController.ListService)
a_route.post('/unlist-services/:id',adminController.unListService)

module.exports = a_route