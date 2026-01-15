import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as dotenv from "dotenv";

async function bootstrap() {
  // Load environment files with precedence: .env.<NODE_ENV>.local -> .env -> process.env
  const env = process.env.NODE_ENV || "development";

  // Attempt to load env files from both the current process cwd and the package directory
  // so that start scripts invoked from the monorepo root still pick up package-local .env files.
  const path = require("path");
  const packageDirLocal = path.resolve(__dirname, "..", "..");
  const localEnvPath = path.join(packageDirLocal, `.env.${env}.local`);
  const packageEnvPath = path.join(packageDirLocal, `.env`);

  console.log(`[main] loading env from: cwd .env.${env}.local and package ${localEnvPath}`);

  // Load package-local env first, then fallback to cwd env.
  dotenv.config({ path: localEnvPath });
  dotenv.config({ path: packageEnvPath });
  dotenv.config();

  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api");

  // Enable CORS for the frontend origin (default to localhost:5173)
  // Allow configuring one or multiple frontend origins (comma-separated). Default to common dev/preview ports.
  const frontendOrigin: string | string[] = process.env.FRONTEND_ORIGIN
    ? process.env.FRONTEND_ORIGIN.split(",")
    : ["http://localhost:5173", "http://localhost:4173"];
  app.enableCors({ origin: frontendOrigin, credentials: true });

  await app.listen(process.env.PORT || 3000);
  const frontendDisplay = Array.isArray(frontendOrigin)
    ? frontendOrigin.join(",")
    : frontendOrigin;
  console.log(
    `Server running on port ${process.env.PORT || 3000} (CORS allowed: ${frontendDisplay})`,
  );
}
void bootstrap();
