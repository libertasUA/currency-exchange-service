const { default: httpStatus } = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { exchangeService } = require("../services");

const createExchange = catchAsync(async (req, res) => {
  const result = await exchangeService.createExchange(req.body);
  res.status(httpStatus.CREATED).json(result).end();
});

module.exports = {
  createExchange,
};
