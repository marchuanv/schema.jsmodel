import { pathToFileURL } from 'node:url';
import { ModelClasses } from './lib/model-classes.mjs';
import { SchemaLoader } from './lib/schema-loader.mjs';
const jsonSchemaFilePath = process.argv[2];
const schemaLoader = new SchemaLoader(jsonSchemaFilePath);
await schemaLoader.load();
const exportFilePath = ModelClasses.create(schemaLoader);
const exported = await import(pathToFileURL(exportFilePath));
const keys = Object.keys(exported);
for (const key of keys) {
    module.exports[key] = exported[key];
}