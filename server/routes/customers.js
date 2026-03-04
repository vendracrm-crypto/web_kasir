const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database/mysql');
const { authMiddleware } = require('../middleware/auth');

// Get all customers
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM customers WHERE 1=1';
    let params = [];
    
    if (search) {
      query += ' AND (name LIKE ? OR phone LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [customers] = await db.query(query, params);
    
    const formattedCustomers = customers.map(c => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      email: c.email,
      address: c.address,
      points: c.loyalty_points || 0,
      totalSpent: parseFloat(c.total_spent),
      visitCount: c.visit_count,
      createdAt: c.created_at
    }));
    
    res.json(formattedCustomers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get customer by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const [customers] = await db.query('SELECT * FROM customers WHERE id = ?', [req.params.id]);
    if (customers.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    const [transactions] = await db.query('SELECT * FROM transactions WHERE customer_id = ?', [req.params.id]);
    
    const customer = customers[0];
    res.json({
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      points: customer.loyalty_points || 0,
      totalSpent: parseFloat(customer.total_spent),
      visitCount: customer.visit_count,
      transactions
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create customer
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;
    
    console.log('Creating customer:', { name, phone, email, address });
    
    const [result] = await db.query(
      'INSERT INTO customers (name, phone, email, address) VALUES (?, ?, ?, ?)',
      [name, phone || '-', email || '-', address || '-']
    );
    
    const [newCustomer] = await db.query('SELECT * FROM customers WHERE id = ?', [result.insertId]);
    
    if (!newCustomer || newCustomer.length === 0) {
      throw new Error('Customer created but not found in database');
    }
    
    const customer = newCustomer[0];
    
    const response = {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      points: customer.points || 0,
      totalSpent: parseFloat(customer.total_spent || 0),
      visitCount: customer.visit_count || 0
    };
    
    console.log('Customer created successfully:', response);
    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update customer
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;
    
    await db.query(
      'UPDATE customers SET name = ?, phone = ?, email = ?, address = ? WHERE id = ?',
      [name, phone, email, address, req.params.id]
    );
    
    const [updatedCustomer] = await db.query('SELECT * FROM customers WHERE id = ?', [req.params.id]);
    if (updatedCustomer.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    const customer = updatedCustomer[0];
    res.json({
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      points: customer.points,
      totalSpent: parseFloat(customer.total_spent),
      visitCount: customer.visit_count
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete customer
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM customers WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
