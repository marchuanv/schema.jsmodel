import { pathToFileURL } from "node:url";
import { ModelClasses } from "./lib/model-classes.mjs";
import { SchemaLoader } from "./lib/schema-loader.mjs";
import { SchemaModel } from "./lib/schema-model.mjs";
import { existsSync } from 'node:fs';
/**
 * @returns { Array<SchemaModel> }
*/
export async function getModels(schemaFilePath) {
    if (!existsSync(schemaFilePath)) {
        throw new Error(`${schemaFilePath} file not found.`);
    }
    const schemaLoader = new SchemaLoader(schemaFilePath);
    await schemaLoader.load();
    const exportFilePath = ModelClasses.create(schemaLoader);
    return await import(pathToFileURL(exportFilePath));
}