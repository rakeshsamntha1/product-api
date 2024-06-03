const express = require('express');
const productRoutes = require('./routes/products');

const app = express();
const PORT = process.env.PORT || 3005;

app.use(express.json());
app.use('/public', express.static('public'));
app.use('/api', productRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
