// import express from 'express';
// import cors from 'cors';
// import path from 'path';
// import hotelRoutes from './routes/hotelRoutes';

// const app = express();

// app.use(cors());
// app.use(express.json());
// app.use(express.static(path.join(__dirname, '../uploads')));

// app.use('/api', hotelRoutes);

// app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
//   console.error(err.stack);
//   res.status(500).json({ error: 'Something went wrong!' });
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// export default app;


import express from 'express';
import cors from 'cors';
import path from 'path';
import hotelRoutes from './routes/hotelRoutes';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../uploads')));

app.use('/api', hotelRoutes);

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Only start the server if this file is run directly
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;