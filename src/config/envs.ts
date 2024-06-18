import 'dotenv/config';
import * as Joi from 'joi';

interface EnvVars {
  PORT: number;
  JWT_SECRET: string;
  DATABASE_URL: string;
}

const envVarsSchema: Joi.ObjectSchema = Joi.object({
  PORT: Joi.number().default(3000),
  JWT_SECRET: Joi.string().required(),
  DATABASE_URL: Joi.string().required(),
}).unknown(true);

const { error, value } = envVarsSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars = value;

export const envs = {
  port: envVars.PORT,
  jwtSecret: envVars.JWT_SECRET,
  databaseUrl: envVars.DATABASE_URL,
};
