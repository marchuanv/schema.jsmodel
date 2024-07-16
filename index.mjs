import { pathToFileURL } from 'node:url';
import crypto from 'node:crypto';
import { ModelClasses } from './lib/model-classes.mjs';
import { SchemaLoader } from './lib/schema-loader.mjs';
import { SchemaModel } from './lib/schema-model.mjs';
/**
 * @param { SchemaLoader } schemaLoader
 * @returns { Array<{ type: class, instance: SchemaModel }> }
*/
export async function getModels(schemaLoader) {
    if (schemaLoader === null || schemaLoader === undefined || !(schemaLoader instanceof SchemaLoader)) {
        throw new Error(`The schemaLoader argument is null, undefined or not an instance of ${SchemaLoader.name}`);
    }
    await schemaLoader.load();
    const exportFilePath = ModelClasses.create(schemaLoader);
    const exportedModels = await import(pathToFileURL(exportFilePath));
    let models = [];
    for (const modelKey of Object.keys(exportedModels)) {
        const ModelClass = exportedModels[modelKey];
        models.push({ type: ModelClass, instance: new ModelClass(schemaLoader) });
    }
    return models;
}
export { SchemaLoader, SchemaModel };