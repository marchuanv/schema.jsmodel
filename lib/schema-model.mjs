import { keys } from '@hyperjump/json-schema/instance/experimental';
import { SchemaLoader } from './schema-loader.mjs';
import { TypeMap } from './type-map.mjs';
const privateBag = new WeakMap();
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
        let schema = null;
        walkSchema(schemaLoader.schema, (_schema) => {
            if (_schema.title === targetType.name) {
                schema = _schema;
            }
        });
        if (schema === null || schema === undefined || typeof schema !== 'object') {
            throw new Error(`could not find schema for ${targetType.name}`);
        }
        const { properties, required } = JSON.parse(JSON.stringify(schema));
        for (const propKey of Object.keys(properties)) {
            if (required.some(key => key === propKey)) {
                const desc = Reflect.getOwnPropertyDescriptor(targetType.prototype, propKey);
                if (desc === undefined || desc === null) {
                    throw new Error(`${propKey} property is required.`);
                }
                if (desc.get === undefined || desc.get === null) {
                    throw new Error(`${propKey} get property is required.`);
                }
                if (desc.set === undefined || desc.set === null) {
                    throw new Error(`${propKey} set property is required.`);
                }
            }
            const { type, title } = properties[propKey];
            let typeMap = null;
            if (type === 'object') {
                typeMap = new TypeMap(title);
                typeMap.prototype = targetType.prototype;
            } else {
                typeMap = new TypeMap(type);
            }
            properties[propKey] = typeMap;
        }
        privateBag.set(this, { schema, properties });
    }
    /**
     * @return { Object }
    */
    get(property) {
        const key = Object.keys(property)[0];
        if (key === null || key === undefined) {
            throw new Error(`invalid property`);
        }
        const type = property[key];
        const typeMap = new TypeMap(type);
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
        callback(_schema);
    }
};