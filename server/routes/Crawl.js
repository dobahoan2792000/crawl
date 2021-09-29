import express from 'express'

import { crawl30 } from '../controllers/crawlController.js'
const router = express.Router();

router.get('/crawl30', crawl30)



export default router
