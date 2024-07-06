import { Schema } from '@hyperjump/json-schema-core';
import { SchemaLoader } from './schema-loader.mjs';
const dialectId = 'https://json-schema.org/draft/2020-12/schema';
Schema.setConfig(dialectId, "jrefToken", "$ref");
export class SchemaModel {
    /**
     * @param { SchemaLoader }
    */
    constructor(schemaLoader) {
        const targetType = new.target;
        if (schemaLoader === null || schemaLoader === undefined || !(schemaLoader instanceof SchemaLoader)) {
            throw new Error(`The schemaLoader argument is null, undefined or not an instance of ${SchemaLoader.name}`);
        }
        if (!schemaLoader.isLoaded) {
            throw new Error('schema is not loaded.');
        }
        let foundSchema = null;
        walkSchema(schema, (_schema) => {
            if (_schema.title === targetType.name) {
                foundSchema = _schema;
            }
        });
        for (const reqProperty of foundSchema.required) {
            const desc = Reflect.getOwnPropertyDescriptor(targetType.prototype, reqProperty);
            if (desc === undefined || desc === null) {
                throw new Error(`${reqProperty} property is required.`);
            }
            if (desc.get === undefined || desc.get === null) {
                throw new Error(`${reqProperty} get property is required.`);
            }
        }
    }
    /**
     * @return { Object }
    */
    get(property) {
    }
    /**
     * @param { Object } property
    */
    set(property) {
    }
}
function walkSchema(_schema, callback) {
    let { type, properties } = _schema;
    for (const propKey of Object.keys(properties)) {
        const { type } = properties[propKey];
        if (type === 'object') {
            callback(properties[propKey]);
        }
    }
    if (type === 'object') {
        callback(properties[propKey]);
    }
};