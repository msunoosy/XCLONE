import express from 'express'
import protectRoute from '../middleware/protectRoute.js'
import { getNotificaton,deleteNotification } from '../controllers/notification.controller.js'

const router =express.Router()

router.get('/',protectRoute,getNotificaton)
router.delete('/',protectRoute,deleteNotification)

export default router
