import { Schema } from '@hyperjump/json-schema-core';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { UUID } from './uuid.mjs';
const dialectId = 'https://json-schema.org/draft/2020-12/schema';
Schema.setConfig(dialectId, "jrefToken", "$ref");
const privateBag = new WeakMap();
export class SchemaLoader {
    /**
     * @param { String } jsonSchemaFilePath 
    */
    constructor(jsonSchemaFilePath) {
        jsonSchemaFilePath = resolve(jsonSchemaFilePath);
        if (!existsSync(jsonSchemaFilePath)) {
            throw new Error(`${jsonSchemaFilePath} not found.`);
        }
        privateBag.set(this, { jsonSchemaFilePath, isLoaded: false, schema: null, Id: null });
    }
    /**
     * @returns { Boolean }
    */
    get isLoaded() {
        const { isLoaded } = privateBag.get(this);
        return isLoaded;
    }
    /**
     * @returns { UUID }
    */
    get Id() {
        const { Id } = privateBag.get(this);
        return Id;
    }
    /**
     * @returns { import('@hyperjump/json-schema/experimental').SchemaDocument }
    */
    get schema() {
        const { schema: { schema } } = privateBag.get(this);
        return schema;
    }
    async load() {
        const bag = privateBag.get(this);
        const { jsonSchemaFilePath } = bag;
        const { default: schemaObj } = await import(pathToFileURL(jsonSchemaFilePath), { assert: { type: 'json' } });
        const { $id, $schema } = schemaObj;
        if ($schema && dialectId !== $schema) {
            throw new Error(`no support for the ${$schema} dialect.`);
        }
        Schema.add(schemaObj, $id, dialectId);
        bag.schema = await Schema.get($id);
        bag.isLoaded = true;
        bag.Id = new UUID(JSON.stringify(bag.schema));
    }
}