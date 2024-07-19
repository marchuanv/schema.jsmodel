import { Schema } from '@hyperjump/json-schema-core';
import camelcase from 'camelcase';
import { existsSync } from 'node:fs';
import { basename, dirname, extname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { getPathSegments, isMatchingPathSegments } from './path-segments.mjs';
import { TypeMap } from './type-map.mjs';
import { walkDir } from './walk-dir.mjs';
const dialectId = 'https://json-schema.org/draft/2020-12/schema';
Schema.setConfig(dialectId, "jrefToken", "$ref");
const privateBag = new WeakMap();
export class SchemaLoader {
    /**
     * @param { String } jsonSchemaFilePath
     * @param { String } schemaName
    */
    constructor(jsonSchemaFilePath, schemaName) {
        if (jsonSchemaFilePath === null || jsonSchemaFilePath === undefined || typeof jsonSchemaFilePath !== 'string' || jsonSchemaFilePath.replace(/\s/g, '') === '') {
            throw new Error(`The jsonSchemaFilePath argument is null, undefined or not a valid string`);
        }
        if (schemaName === null || schemaName === undefined || typeof schemaName !== 'string' || schemaName.replace(/\s/g, '') === '') {
            throw new Error(`The schemaName argument is null, undefined or not a valid string`);
        }
        schemaName = camelcase(schemaName, { pascalCase: true }).toLowerCase();
        let _jsonSchemaFilePath = resolve(jsonSchemaFilePath);
        const runningDirPath = process.cwd();
        const sourcePathSegments = getPathSegments(_jsonSchemaFilePath);
        const jsonSchemaFilePathMatches = [];
        walkDir(runningDirPath, (filePath) => {
            const pathSegments = getPathSegments(filePath);
            if (isMatchingPathSegments(pathSegments, sourcePathSegments)) {
                jsonSchemaFilePathMatches.push(filePath);
            }
        });
        if (jsonSchemaFilePathMatches.length !== 1) {
            throw new Error(`more than one file match for: ${_jsonSchemaFilePath}`);
        }
        _jsonSchemaFilePath = jsonSchemaFilePathMatches[0];
        if (!existsSync(_jsonSchemaFilePath)) {
            throw new Error(`${_jsonSchemaFilePath} not found.`);
        }
        privateBag.set(this, {
            jsonSchemaFilePath: _jsonSchemaFilePath,
            isLoaded: false,
            schema: null,
            Id: null,
            schemaDirPath: null,
            schemaName
        });
    }
    /**
     * @returns { String }
    */
    get schemaDirPath() {
        const { schemaDirPath } = privateBag.get(this);
        return schemaDirPath;
    }
    /**
     * @returns { String }
    */
    get schemaName() {
        const { schemaName } = privateBag.get(this);
        return schemaName;
    }
    /**
     * @returns { Boolean }
    */
    get isLoaded() {
        const { isLoaded } = privateBag.get(this);
        return isLoaded;
    }
    /**
     * @returns { Object }
    */
    get schema() {
        const { schema: { schema } } = privateBag.get(this);
        return schema;
    }
    async load() {
        const bag = privateBag.get(this);
        const { jsonSchemaFilePath } = bag;
        const extName = extname(jsonSchemaFilePath);
        bag.schemaDirPath = dirname(jsonSchemaFilePath);
        bag.schemaName = basename(jsonSchemaFilePath).replace(extName, '');
        const { default: schemaObj } = await import(pathToFileURL(jsonSchemaFilePath), { assert: { type: 'json' } });
        const { $id, $schema } = schemaObj;
        if ($schema && dialectId !== $schema) {
            throw new Error(`no support for the ${$schema} dialect.`);
        }
        Schema.add(schemaObj, $id, dialectId);
        const { schema } = await Schema.get($id);
        await validateSchema(schema);
        bag.schema = schema;
        bag.isLoaded = true;
    }
}
async function validateSchema(_schema) {
    let { $id, type, properties } = _schema;
    const idSplit = $id.split('/');
    if (idSplit.length <= 1) {
        throw new Error('invalid schema Id');
    }
    const urlBaseName = idSplit[0];
    const className = camelcase(urlBaseName, { pascalCase: true });
    if (!className.toLowerCase().endsWith('model')) {
        throw new Error('expected schema $id naming to end with model');
    }
    const propertyKeys = Object.keys(properties);
    if (propertyKeys.length > 0) {
        for (const propKey of propertyKeys) {
            const propValue = properties[propKey];
            const { type, $ref } = propValue;
            if ($ref) {
                const propSchema = await Schema.get($ref);
                await validateSchema(propSchema);
            } else if (type === 'object') {
                throw new Error(`expected a $ref for property ${propKey}.\r\nNote: every property that is type: 'object' needs a seperate schema with an $id`);
            }
            TypeMap.resolve(type);
        }
    }
    TypeMap.resolve(type);
};