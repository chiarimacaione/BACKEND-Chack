import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
    console.log("Ruta /status alcanzada");
    res.json({ status: 'Server is running' });
});


export default router;
