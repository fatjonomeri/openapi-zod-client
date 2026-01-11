import { generateZodClientFromOpenAPI } from "./lib/src/index";
import * as fs from "fs";

const apiDoc = JSON.parse(fs.readFileSync("./api-processed.json", "utf8"));

async function generateSchemas() {
    await generateZodClientFromOpenAPI({
        openApiDoc: apiDoc,
        distPath: "./schemas.ts",
        options: {
            withDescription: true,      // Include descriptions (shows backend validations)
            withDefaultValues: true,
            exportSchemas: true,        // Export all schemas
            groupStrategy: "none",      // Don't group by tags
        }
    });

    console.log("✅ Generated schemas.ts");
    console.log("\nYou can now inspect the file to see all Zod schemas with validation messages!");
    console.log("\nKey schemas to check:");
    console.log("  - StoreUserRequest");
    console.log("  - Any other request schemas with validation");
}

generateSchemas().catch(console.error);
