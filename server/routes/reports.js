const express = require('express');
const router = express.Router();
const db = require('../database/mysql');
const { authMiddleware } = require('../middleware/auth');

// Get dashboard stats
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    // Today's stats
    const [todayStats] = await db.query(`
      SELECT 
        COUNT(*) as transaction_count,
        COALESCE(SUM(total_amount), 0) as total_sales
      FROM transactions
      WHERE DATE(created_at) = CURDATE()
    `);
    
    // Total stats
    const [totalStats] = await db.query(`
      SELECT 
        COALESCE(SUM(total_amount), 0) as total_sales,
        COUNT(*) as transaction_count
      FROM transactions
    `);
    
    const [customerCount] = await db.query('SELECT COUNT(*) as count FROM customers');
    const [productCount] = await db.query('SELECT COUNT(*) as count FROM products');
    
    // Low stock products
    const [lowStockProducts] = await db.query('SELECT * FROM products WHERE stock < min_stock ORDER BY stock ASC LIMIT 10');
    
    // Best selling products
    const [bestSelling] = await db.query(`
      SELECT 
        p.id, p.name, p.sku, p.price,
        c.name as category,
        COALESCE(SUM(ti.quantity), 0) as totalSold,
        COALESCE(SUM(ti.subtotal), 0) as revenue
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN transaction_items ti ON p.id = ti.product_id
      GROUP BY p.id, p.name, p.sku, p.price, c.name
      ORDER BY totalSold DESC
      LIMIT 5
    `);
    
    // Recent transactions
    const [recentTransactions] = await db.query(`
      SELECT 
        t.id, 
        t.invoice_number as invoiceNumber,
        c.name as customer_name,
        t.total_amount as total,
        t.created_at as createdAt
      FROM transactions t
      LEFT JOIN customers c ON t.customer_id = c.id
      ORDER BY t.created_at DESC
      LIMIT 5
    `);
    
    res.json({
      today: {
        sales: parseFloat(todayStats[0].total_sales),
        transactions: todayStats[0].transaction_count
      },
      total: {
        sales: parseFloat(totalStats[0].total_sales),
        transactions: totalStats[0].transaction_count,
        customers: customerCount[0].count,
        products: productCount[0].count
      },
      lowStockProducts,
      bestSelling: bestSelling.map(b => ({
        ...b,
        totalSold: parseInt(b.totalSold),
        revenue: parseFloat(b.revenue)
      })),
      recentTransactions
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get sales report
router.get('/sales', authMiddleware, async (req, res) => {
  try {
    const { groupBy = 'day' } = req.query;
    
    let dateFormat;
    if (groupBy === 'day') {
      dateFormat = '%Y-%m-%d';
    } else if (groupBy === 'month') {
      dateFormat = '%Y-%m';
    } else if (groupBy === 'year') {
      dateFormat = '%Y';
    }
    
    const [report] = await db.query(`
      SELECT 
        DATE_FORMAT(created_at, ?) as date,
        COALESCE(SUM(total_amount), 0) as sales,
        COUNT(*) as transactions
      FROM transactions
      GROUP BY DATE_FORMAT(created_at, ?)
      ORDER BY date ASC
    `, [dateFormat, dateFormat]);
    
    res.json(report.map(r => ({
      date: r.date,
      sales: parseFloat(r.sales),
      transactions: r.transactions
    })));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get inventory report
router.get('/inventory', authMiddleware, async (req, res) => {
  try {
    const [report] = await db.query(`
      SELECT 
        p.*,
        COALESCE(SUM(ti.quantity), 0) as sold,
        (p.stock * p.price) as stockValue
      FROM products p
      LEFT JOIN transaction_items ti ON p.id = ti.product_id
      GROUP BY p.id
    `);
    
    res.json(report.map(r => ({
      ...r,
      sold: parseInt(r.sold),
      stockValue: parseFloat(r.stockValue)
    })));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============================================
// Export Vendra CSV - Compatible with Vendra CRM Import
// ============================================
router.get('/export-vendra', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = '';
    let params = [];
    
    if (startDate && endDate) {
      dateFilter = ' AND DATE(t.created_at) BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }
    
    const [rows] = await db.query(`
      SELECT 
        t.invoice_number,
        t.created_at,
        t.payment_method,
        t.currency,
        t.tax_amount,
        c.name as customer_name,
        c.phone as customer_phone,
        c.email as customer_email,
        p.brand,
        cat.name as item_group,
        p.name as item_name,
        p.sku as item_sku,
        ti.quantity as qty,
        ti.unit_price as price,
        ti.add_on_price,
        ti.discount_percent,
        ti.discount_amount,
        ti.subtotal as amount,
        ti.cost_per_unit,
        ti.total_cost,
        ti.profit,
        ti.paid_to_brand
      FROM transactions t
      JOIN transaction_items ti ON t.id = ti.transaction_id
      JOIN products p ON ti.product_id = p.id
      LEFT JOIN categories cat ON p.category_id = cat.id
      LEFT JOIN customers c ON t.customer_id = c.id
      WHERE 1=1 ${dateFilter}
      ORDER BY t.created_at ASC, t.invoice_number ASC
    `, params);
    
    // Build CSV
    const headers = [
      'order no', 'order time', 'customer name', 'customer phone', 'customer email',
      'brand', 'item group', 'item name', 'item sku', 'qty', 'currency',
      'price', 'add-on price', 'discount percent', 'discount amount', 'amount',
      'tax amount', 'cost perunit', 'total cost', 'profit', 'paid to brand', 'payment type'
    ];
    
    const formatDate = (date) => {
      const d = new Date(date);
      return d.getFullYear() + '-' + 
             String(d.getMonth() + 1).padStart(2, '0') + '-' +
             String(d.getDate()).padStart(2, '0') + ' ' +
             String(d.getHours()).padStart(2, '0') + ':' +
             String(d.getMinutes()).padStart(2, '0') + ':' +
             String(d.getSeconds()).padStart(2, '0');
    };
    
    const paymentMap = {
      'cash': 'CASH',
      'card': 'CARD',
      'qris': 'QRIS',
      'transfer': 'TRANSFER',
      'debit': 'DEBIT',
      'credit': 'CREDIT',
      'ewallet': 'EWALLET'
    };
    
    const csvRows = rows.map(row => [
      row.invoice_number,
      formatDate(row.created_at),
      row.customer_name || 'Customer',
      row.customer_phone || '',
      row.customer_email || '',
      row.brand || 'General',
      row.item_group || 'General',
      row.item_name,
      row.item_sku,
      row.qty,
      row.currency || 'IDR',
      row.price,
      row.add_on_price || 0,
      row.discount_percent || 0,
      row.discount_amount || 0,
      row.amount,
      row.tax_amount || 0,
      row.cost_per_unit || 0,
      row.total_cost || 0,
      row.profit || 0,
      row.paid_to_brand || row.amount,
      paymentMap[row.payment_method] || 'CASH'
    ].join(','));
    
    const csv = [headers.join(','), ...csvRows].join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=vendra-export-${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
    
  } catch (error) {
    console.error('Export Vendra error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Export Vendra as JSON (for preview)
router.get('/export-vendra-preview', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = '';
    let params = [];
    
    if (startDate && endDate) {
      dateFilter = ' AND DATE(t.created_at) BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }
    
    const [rows] = await db.query(`
      SELECT 
        t.invoice_number as orderNo,
        t.created_at as orderTime,
        t.payment_method as paymentType,
        t.currency,
        c.name as customerName,
        c.phone as customerPhone,
        c.email as customerEmail,
        p.brand,
        cat.name as itemGroup,
        p.name as itemName,
        p.sku as itemSku,
        ti.quantity as qty,
        ti.unit_price as price,
        ti.add_on_price as addOnPrice,
        ti.discount_percent as discountPercent,
        ti.discount_amount as discountAmount,
        ti.subtotal as amount,
        t.tax_amount as taxAmount,
        ti.cost_per_unit as costPerUnit,
        ti.total_cost as totalCost,
        ti.profit,
        ti.paid_to_brand as paidToBrand
      FROM transactions t
      JOIN transaction_items ti ON t.id = ti.transaction_id
      JOIN products p ON ti.product_id = p.id
      LEFT JOIN categories cat ON p.category_id = cat.id
      LEFT JOIN customers c ON t.customer_id = c.id
      WHERE 1=1 ${dateFilter}
      ORDER BY t.created_at DESC
      LIMIT 100
    `, params);
    
    const totalCount = await db.query(`
      SELECT COUNT(*) as count
      FROM transactions t
      JOIN transaction_items ti ON t.id = ti.transaction_id
      WHERE 1=1 ${dateFilter}
    `, params);
    
    res.json({
      total: totalCount[0][0].count,
      preview: rows
    });
    
  } catch (error) {
    console.error('Export preview error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
