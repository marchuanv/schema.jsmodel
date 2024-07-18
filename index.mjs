import { pathToFileURL } from 'node:url';
import { ModelClasses } from './lib/model-classes.mjs';
import { SchemaLoader } from './lib/schema-loader.mjs';
import { SchemaModel } from './lib/schema-model.mjs';
const jsonSchemaFilePath = process.argv[2];
(async () => {
    const schemaLoader = new SchemaLoader(jsonSchemaFilePath);
    await schemaLoader.load();
    const exportFilePath = ModelClasses.create(schemaLoader);
    return await import(pathToFileURL(exportFilePath));
})().catch(err => console.log(err));
export { SchemaModel };

