const express = require("express");
// const docsRoute = require("./docs.route");
const config = require("../../config/config");
const exchangeRoute = require("./exchange.route");

const router = express.Router();

const defaultRoutes = [
  {
    path: "/exchanges",
    route: exchangeRoute,
  },
];

const devRoutes = [
  // routes available only in development mode
  // {
  //   path: "/docs",
  //   route: docsRoute,
  // },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === "development") {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
