import express from "express"
import cors from 'cors'
import 'dotenv/config'
import connectDB from "./config/db.js"
import authRoutes from './routes/authRoutes.js'
import leaveRoutes from './routes/leaveRoutes.js'

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.use('/api/auth',authRoutes)
app.use('/api/leaves',leaveRoutes)

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});