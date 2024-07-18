import { pathToFileURL } from 'node:url';
import { ModelClasses } from './lib/model-classes.mjs';
import { SchemaLoader } from './lib/schema-loader.mjs';
/**
 * @param { String } jsonSchemaFilePath
*/
export async function getModels(jsonSchemaFilePath) {
    const schemaLoader = new SchemaLoader(jsonSchemaFilePath);
    await schemaLoader.load();
    const exportFilePath = ModelClasses.create(schemaLoader);
    return await import(pathToFileURL(exportFilePath));
}