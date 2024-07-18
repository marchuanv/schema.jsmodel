import schemaInfo from '../../schema.info.json' assert { type: 'json' };
import { ModelClasses } from './lib/model-classes.mjs';
import { SchemaLoader } from './lib/schema-loader.mjs';
import { SchemaModel } from './lib/schema-model.mjs';
(async () => {
    const schemaInfoKeys = Object.keys(schemaInfo);
    for (const key of schemaInfoKeys) {
        const { jsonSchemaFilePath } = schemaInfo[key];
        const schemaLoader = new SchemaLoader(jsonSchemaFilePath);
        await schemaLoader.load();
        ModelClasses.create(schemaLoader);
    }
})().catch(err => console.log(err));
export { SchemaModel };

