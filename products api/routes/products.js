const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
const dataFilePath = path.join(__dirname, '../data/products.json');
const upload = multer({ dest: 'public/images/' });

const readData = () => {
  const data = fs.readFileSync(dataFilePath, 'utf-8');
  return JSON.parse(data);
};

const writeData = (data) => {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
};

//Insert 
router.post('/products', upload.single('productImage'), (req, res) => {
  const { productId, productName, productDescription, isActive } = req.body;
  const productImage = req.file ? req.file.filename : null;
  const products = readData();

  const newProduct = {
    productId: productId || uuidv4(),
    productName,
    productDescription,
    productImage,
    isActive: JSON.parse(isActive)
  };

  products.push(newProduct);
  writeData(products);
  res.status(201).json(newProduct);
});

// Get 
router.get('/products/:id', (req, res) => {
  const products = readData();
  const product = products.find(p => p.productId === req.params.id);

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  res.json(product);
});

// Getactive products
router.get('/products', (req, res) => {
  const { page = 1 } = req.query;
  const products = readData();
  const activeProducts = products.filter(p => p.isActive);
  const pageSize = 10;
  const paginatedProducts = activeProducts.slice((page - 1) * pageSize, page * pageSize);

  res.json(paginatedProducts);
});

// Update product through id
router.put('/products/:id', upload.single('productImage'), (req, res) => {
  const { productName, productDescription, isActive } = req.body;
  const productImage = req.file ? req.file.filename : null;
  const products = readData();
  const productIndex = products.findIndex(p => p.productId === req.params.id);

  if (productIndex === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }

  products[productIndex] = {
    ...products[productIndex],
    productName,
    productDescription,
    isActive: JSON.parse(isActive),
    ...(productImage && { productImage })
  };

  writeData(products);
  res.json(products[productIndex]);
});

// Delete product through id
router.delete('/products/:id', (req, res) => {
  const products = readData();
  const newProducts = products.filter(p => p.productId !== req.params.id);

  if (products.length === newProducts.length) {
    return res.status(404).json({ message: 'Product not found' });
  }

  writeData(newProducts);
  res.status(204).send();
});

module.exports = router;
