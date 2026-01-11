/**
 * Real-world example using the StoreUserRequest schema from api-processed.json
 * This demonstrates how x-validation-messages are converted to Zod schemas
 */

import { generateZodClientFromOpenAPI } from "./lib/src/index";
import * as fs from "fs";

// Read the actual API schema
const apiDoc = JSON.parse(fs.readFileSync("./api-processed.json", "utf8"));

async function generateClient() {
    console.log("Generating Zod client from OpenAPI spec with x-validation-messages support...\n");

    const outputPath = "./generated-client-example.ts";
    
    await generateZodClientFromOpenAPI({
        openApiDoc: apiDoc,
        distPath: outputPath,
        options: {
            withDescription: true,  // Enable to see backend validation notes
            withDefaultValues: true,
        }
    });

    console.log(`✅ Generated client saved to: ${outputPath}`);
    console.log("\nLook for the following schemas to see validation messages:");
    console.log("  - StoreUserRequest (comprehensive validation example)");
    console.log("  - selected_services (array with nested validation messages)");
    console.log("\nValidation message features:");
    console.log("  ✓ Custom error messages for min/max/regex/email");
    console.log("  ✓ Backend-only validations (exists, unique, same) noted in descriptions");
    console.log("  ✓ Proper required/optional handling");
    console.log("  ✓ Nested object and array support");
    
    // Read a sample of the generated output to show the user
    const generatedContent = fs.readFileSync(outputPath, "utf8");
    const storeUserRequestMatch = generatedContent.match(
        /StoreUserRequest.*?=.*?z\.object\({[\s\S]*?}\).*?;/
    );
    
    if (storeUserRequestMatch) {
        console.log("\n📋 Sample - StoreUserRequest schema (truncated):");
        console.log("─".repeat(80));
        console.log(storeUserRequestMatch[0].substring(0, 1000) + "\n  ...");
        console.log("─".repeat(80));
    }
}

generateClient().catch(console.error);
