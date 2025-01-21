const dotenv = require("dotenv");
const path = require("path");
const Joi = require("joi");

dotenv.config({ path: path.join(__dirname, "../../.env") });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string()
      .valid("production", "development", "test")
      .required(),
    PORT: Joi.number().default(3000),
    DB_USER: Joi.string().required().description("Database user"),
    DB_PASSWORD: Joi.string().required().description("Database password"),
    DB_NAME: Joi.string().required().description("Database name"),
    DB_HOST: Joi.string().required().description("Database host"),
    DB_PORT: Joi.number().default(5432).required().description("Database host"),
    DB_DIALECT: Joi.string()
      .default("mysql")
      .required()
      .description("Database dialect"),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: "key" } })
  .validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  db: {
    username: envVars.DB_USER,
    password: envVars.DB_PASSWORD,
    database: envVars.DB_NAME,
    host: envVars.DB_HOST,
    dialect: envVars.DB_DIALECT,
    port: envVars.DB_PORT,
    operatorsAliases: 0,
  },
};
