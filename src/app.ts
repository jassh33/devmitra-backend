import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import path from 'path';
import pujaRoutes from './routes/pujaRoutes';
import vendorPujaRoutes from './routes/vendorPujaRoutes';
import vendorRoutes from './routes/vendorRoutes';
import availabilityRoutes from './routes/availabilityRoutes';
import bookingRoutes from './routes/bookingRoutes';
import paymentRoutes from './routes/paymentRoutes';
import adminJs, { buildAdminRouter } from './admin/admin';
import authRoutes from './routes/authRoutes';
import uploadRoutes from './routes/uploadRoutes';
import homeRoutes from './routes/homeRoutes';

dotenv.config();

const app = express();
const adminRouter = buildAdminRouter();

app.use(cors());
app.use(express.json());

app.use(
    '/public',
    express.static(path.join(__dirname, '../public'))
);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/pujas', pujaRoutes);
app.use('/api/vendor-pujas', vendorPujaRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/home', homeRoutes);
app.use(adminJs.options.rootPath, adminRouter);

app.get('/', (req, res) => {
    res.json({ message: 'Dev Mitra Backend Running 🚀' });
});

export default app;