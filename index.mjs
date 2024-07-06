import { pathToFileURL } from "node:url";
import { ModelClasses } from "./lib/model-classes.mjs";
import { SchemaLoader } from "./lib/schema-loader.mjs";
import { SchemaModel } from "./lib/schema-model.mjs";
/**
 * @param { SchemaLoader } schemaLoader
 * @returns { Array<SchemaModel> }
*/
export async function getModels(schemaLoader) {
    if (schemaLoader === null || schemaLoader === undefined || !(schemaLoader instanceof SchemaLoader)) {
        throw new Error(`The schemaLoader argument is null, undefined or not an instance of ${SchemaLoader.name}`);
    }
    await schemaLoader.load();
    const exportFilePath = ModelClasses.create(schemaLoader);
    return await import(pathToFileURL(exportFilePath));
}
export { SchemaLoader, SchemaModel };