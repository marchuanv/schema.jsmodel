import schemaInfo from '../../schema.info.json' assert { type: 'json' };
import { ModelClasses } from './lib/model-classes.mjs';
import { SchemaLoader } from './lib/schema-loader.mjs';
export async function generate() {
    const schemaInfoNames = Object.keys(schemaInfo);
    for (const schemaInfoName of schemaInfoNames) {
        const { jsonSchemaFilePath } = schemaInfo[schemaInfoName];
        const schemaLoader = new SchemaLoader(jsonSchemaFilePath, schemaInfoName);
        await schemaLoader.load();
        ModelClasses.create(schemaLoader);
    }
}