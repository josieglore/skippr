const pgClient = require('../models/database');

function displayOrders(req, res) {
  const { restId } = req.params;
  const values = [restId];
  const displayOrdersStr = 'SELECT oi.fk_orders, oi.fk_menu_item, r.rest_name, u.user_firstname, u.user_lastname FROM order_items AS oi INNER JOIN orders as o ON oi.fk_orders = o.order_id  INNER JOIN restaurants as r ON o.fk_rest_id = r.rest_id INNER JOIN users as u ON o.fk_user_id = u.user_id WHERE o.order_ready = false AND r.rest_id = $1;';
  pgClient.query(displayOrdersStr, values, (err, result) => {
    if (err) res.status(400).json({ error: 'Unable to retrieve orders' });
    else res.status(200).json(result.rows);
  });
}

function submitOrder(req, res) {
  const { userId, restId, menuItems } = req.body;
  const idValues = [userId, restId];
  const createOrderStr = 'INSERT INTO orders (order_ready, fk_user_id, fk_rest_id) VALUES (false, (SELECT user_id from users WHERE user_id = $1 ), (SELECT rest_id from restaurants WHERE     rest_id = $2 )) RETURNING order_id;';
  pgClient.query(createOrderStr, idValues, (err, result) => {
    if (err) res.status(400).json({ error: 'Unable to submit order' });
    else {
      const orderId = result.rows[0].order_id;
      Promise.all(menuItems.map((item) => {
        const itemValues = [orderId, item];
        const insertItemStr = 'INSERT INTO order_items (fk_orders, fk_menu_item) VALUES ($1, (SELECT menu_item_id from menu_items WHERE menu_item_id = $2)) RETURNING order_items.order_item_id AS order_item_id;';
        return pgClient.query(insertItemStr, itemValues);
      }))
        .then(() => res.status(200).json({
          message: 'Your order was submitted successfully',
          orderId,
        }))
        .catch(() => res.status(400).json({ error: 'Unable to submit order. Please try again.' }));
    }
  });
}

module.exports = { displayOrders, submitOrder };
