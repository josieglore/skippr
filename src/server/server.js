require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const userController = require('./controllers/user-controller');
const orderController = require('./controllers/order-controller');
const restaurantController = require('./controllers/restaurant-controller');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.get('/user/restaurants', restaurantController.displayRests);
app.get('/user/restaurants/:fkRestId', restaurantController.getRestMenu);
app.get('/restaurant/orders/:restId', orderController.displayOrders);

app.post('/user/login', userController.verifyUser);
app.post('/restaurant/login', restaurantController.verifyRest);
app.post('/signup', userController.createUser);
app.post('/user/order', orderController.submitOrder);

app.listen(3000);
