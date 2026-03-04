const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database/mysql');
const { authMiddleware } = require('../middleware/auth');

// Get all transactions
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = `
      SELECT 
        t.id,
        t.invoice_number as invoiceNumber,
        t.total_amount as total,
        t.payment_method as paymentMethod,
        t.payment_amount as amountPaid,
        t.change_amount as changeAmount,
        t.discount_amount as discount,
        t.created_at as createdAt,
        c.name as customer_name,
        u.username as cashier_name
      FROM transactions t
      LEFT JOIN customers c ON t.customer_id = c.id
      LEFT JOIN users u ON t.cashier_id = u.id
      WHERE 1=1
    `;
    let params = [];
    
    if (startDate && endDate) {
      query += ' AND DATE(t.created_at) BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }
    
    query += ' ORDER BY t.created_at DESC';
    
    const [transactions] = await db.query(query, params);
    
    // Get items for each transaction
    for (let transaction of transactions) {
      const [items] = await db.query(
        `SELECT ti.*, p.name, p.sku 
         FROM transaction_items ti
         LEFT JOIN products p ON ti.product_id = p.id
         WHERE ti.transaction_id = ?`,
        [transaction.id]
      );
      transaction.items = items;
      transaction.customer = { name: transaction.customer_name || 'Pelanggan Umum' };
      transaction.cashier = transaction.cashier_name || 'Admin';
      transaction.change = transaction.changeAmount;
      transaction.status = 'Selesai'; // Add status
    }
    
    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get transaction by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const [transactions] = await db.query('SELECT * FROM transactions WHERE id = ?', [req.params.id]);
    if (transactions.length === 0) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    const [items] = await db.query('SELECT * FROM transaction_items WHERE transaction_id = ?', [req.params.id]);
    
    res.json({
      ...transactions[0],
      items
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create transaction (Checkout)
router.post('/', authMiddleware, async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { items, customer, paymentMethod, amountPaid, discount = 0 } = req.body;
    
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal - discount;
    const change = amountPaid - total;
    
    if (amountPaid < total) {
      throw new Error('Pembayaran kurang');
    }
    
    const invoiceNumber = 'INV-' + Date.now();
    const pointsEarned = Math.floor(total / 1000);
    
    const [result] = await connection.query(
      `INSERT INTO transactions 
       (invoice_number, customer_id, cashier_id, total_amount, payment_method, 
        payment_amount, change_amount, discount_amount, points_earned) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        invoiceNumber, 
        customer?.id || null, 
        req.user.id,
        total, 
        paymentMethod, 
        amountPaid, 
        change, 
        discount,
        pointsEarned
      ]
    );
    
    const transactionId = result.insertId;
    
    for (const item of items) {
      const costPerUnit = item.cost || 0;
      const totalCost = costPerUnit * item.quantity;
      const itemSubtotal = item.price * item.quantity;
      const itemProfit = itemSubtotal - totalCost;
      
      await connection.query(
        `INSERT INTO transaction_items 
         (transaction_id, product_id, quantity, unit_price, subtotal, 
          add_on_price, discount_percent, discount_amount, cost_per_unit, total_cost, profit, paid_to_brand) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [transactionId, item.id, item.quantity, item.price, itemSubtotal,
         item.addOnPrice || 0, item.discountPercent || 0, item.discountAmount || 0,
         costPerUnit, totalCost, itemProfit, item.paidToBrand || itemSubtotal]
      );
      
      await connection.query(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.id]
      );
    }
    
    if (customer && customer.id) {
      await connection.query(
        `UPDATE customers 
         SET total_spent = total_spent + ?, 
             visit_count = visit_count + 1,
             loyalty_points = loyalty_points + ?
         WHERE id = ?`,
        [total, pointsEarned, customer.id]
      );
    }
    
    await connection.commit();
    
    const [newTransaction] = await connection.query(
      `SELECT t.*, u.username as cashier_name, c.name as customer_name 
       FROM transactions t
       LEFT JOIN users u ON t.cashier_id = u.id
       LEFT JOIN customers c ON t.customer_id = c.id
       WHERE t.id = ?`, 
      [transactionId]
    );
    
    const [transactionItems] = await connection.query(
      `SELECT ti.*, p.name, p.sku 
       FROM transaction_items ti
       LEFT JOIN products p ON ti.product_id = p.id
       WHERE ti.transaction_id = ?`, 
      [transactionId]
    );
    
    res.status(201).json({
      id: transactionId,
      invoiceNumber,
      total,
      change,
      paymentMethod,
      items: transactionItems,
      customer: { id: customer?.id, name: customer?.name || 'Pelanggan Umum' },
      cashier: newTransaction[0].cashier_name,
      createdAt: newTransaction[0].created_at
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('Transaction error:', error);
    res.status(500).json({ message: 'Transaction failed', error: error.message });
  } finally {
    connection.release();
  }
});

module.exports = router;
