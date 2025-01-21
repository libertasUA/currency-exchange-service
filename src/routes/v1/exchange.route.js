const express = require('express');
const validate = require('../../middlewares/validate');
const exchangeValidation = require('../../validations/exchange.validation');
const exchangeController = require('../../controllers/exchange.controller');

const router = express.Router();

router
    .route('/')
    .post(validate(exchangeValidation.createExchange), exchangeController.createExchange)


module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Exchanges
 *   description: Exchange management and retrieval
 */

/**
 * @swagger
 * /exchange:
 *   post:
 *     summary: Create a exchange
 *     description: Create a exchange
 *     tags: [Exchanges]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - baseCurrency
 *               - targetCurrency
 *               - amount
 *               - operationType
 *             properties:
 *               baseCurrency:
 *                 type: string
 *               targetCurrency:
 *                 type: string
 *               amount:
 *                 type: string
 *               operationType:
 *                  type: string
 *                  enum: [sell, buy]
 *             example:
 *               name: UAH
 *               email: USD
 *               amount: 1000
 *               operationType: sell
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/User'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 */