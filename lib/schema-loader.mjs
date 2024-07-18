import { Schema } from '@hyperjump/json-schema-core';
import camelcase from 'camelcase';
import { existsSync } from 'node:fs';
import { basename, dirname, extname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { getPathSegments, isMatchingPathSegments } from './path-segments.mjs';
import { UUID } from './uuid.mjs';
import { walkDir } from './walk-dir.mjs';
const dialectId = 'https://json-schema.org/draft/2020-12/schema';
Schema.setConfig(dialectId, "jrefToken", "$ref");
const privateBag = new WeakMap();
export class SchemaLoader {
    /**
     * @param { String } jsonSchemaFilePath 
    */
    constructor(jsonSchemaFilePath) {
        if (jsonSchemaFilePath === null || jsonSchemaFilePath === undefined || typeof jsonSchemaFilePath !== 'string' || jsonSchemaFilePath.replace(/\s/g, '') === '') {
            throw new Error(`The jsonSchemaFilePath argument is null, undefined or not a valid string`);
        }
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
            schemaName: null
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
        const walkSchema = (_schema, callback) => {
            let { title, properties } = _schema;
            for (const propKey of Object.keys(properties)) {
                const propValue = properties[propKey];
                const { type } = propValue;
                if (type === 'object') {
                    callback(propKey, propValue);
                }
            }
            callback(title, _schema);
        };
        walkSchema(schema, (name, _schema) => {
            if (!_schema.title) {
                _schema.title = name;
            }
            const _title = camelcase(_schema.title, { pascalCase: true });
            if (_title !== _schema.title) {
                _schema.title = `${_title}Model`;
            }
        });
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
        bag.schema = await Schema.get($id);
        bag.isLoaded = true;
        bag.Id = new UUID(JSON.stringify(bag.schema));
    }
}