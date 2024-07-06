import camelcase from "camelcase";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { SchemaLoader } from "./schema-loader.mjs";
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from "node:path";
const __dirname = dirname(fileURLToPath(import.meta.url));
const classTemplate = readFileSync(path.join(__dirname, 'template', 'class.tpl'), 'utf8');
const classGetterPropertyTemplate = readFileSync(path.join(__dirname, 'template', 'class-getter-property.tpl'), 'utf8');
const classSetterPropertyTemplate = readFileSync(path.join(__dirname, 'template', 'class-setter-property.tpl'), 'utf8');
const modelClassImportTemplate = readFileSync(path.join(__dirname, 'template', 'model-class-import.tpl'), 'utf8');
const modelClassExportTemplate = readFileSync(path.join(__dirname, 'template', 'model-class-export.tpl'), 'utf8');
export class ModelClasses {
    /**
     * @param { SchemaLoader }
     * @returns { String } exports file path
    */
    static create(schemaLoader) {
        if (schemaLoader === null || schemaLoader === undefined || !(schemaLoader instanceof SchemaLoader)) {
            throw new Error(`The schemaLoader argument is null, undefined or not an instance of ${SchemaLoader.name}`);
        }
        if (!schemaLoader.isLoaded) {
            throw new Error('schema is not loaded.');
        }
        const modelsDirPath = path.resolve(path.join(__dirname, '../cache', schemaLoader.Id.toString()));
        if (!existsSync(modelsDirPath)) {
            mkdirSync(modelsDirPath, { recursive: true });
        }
        const modelFileInfo = createModelClass(modelsDirPath, schemaLoader.schema);
        let modelClassExports = '';
        for (const { modelFilePath, modelClassName } of modelFileInfo) {
            const modelFileName = path.basename(modelFilePath);
            const modelClassExport = modelClassExportTemplate
                .replace(/\{\{modelClassName\}\}/g, modelClassName)
                .replace(/\{\{modelClassFileName\}\}/g, modelFileName);
            modelClassExports = `${modelClassExports}\r\n${modelClassExport}`;
        }
        const exportsFilePath = path.join(modelsDirPath, 'export.mjs');
        writeFileSync(exportsFilePath, modelClassExports);
    }
}
/**
 * @param { String } modelsDirPath 
 * @param { Object } schema 
 * @returns { Array<{ modelFilePath: String, modelClassName: String }> } model file info
 */
function createModelClass(modelsDirPath, schema) {
    let modelFileInfo = [];
    if (!existsSync(modelsDirPath)) {
        throw new Error(`${modelsDirPath} directory does not exist`);
    }
    let { title, properties } = schema;
    let className = camelcase(title, { pascalCase: true });
    className = `${className}Model`;
    let script = classTemplate.replace(/\{\{className\}\}/g, className);
    for (const propertyName of Object.keys(properties)) {
        let { type } = properties[propertyName];
        if (type === 'object') {
            const _schema = properties[propertyName];
            _schema.title = propertyName;
            const _modelFileInfo = createModelClass(modelsDirPath, properties[propertyName]);
            modelFileInfo = modelFileInfo.concat(_modelFileInfo);
            let className = camelcase(propertyName, { pascalCase: true });
            className = `${className}Model`;
            let fileName = _schema.title.replace(/\s/g, '-').toLowerCase();
            fileName = `${fileName}-model.mjs`;
            const modelClassImportScript = modelClassImportTemplate
                .replace(/\{\{modelClassName\}\}/g, className)
                .replace(/\{\{modelClassFileName\}\}/g, fileName);
            script = script.replace(/\{\{modelClassImport\}\}/g, `${modelClassImportScript}\r\n{{modelClassImport}}`);
            type = className;
        } else {
            switch (type) {
                case 'string': {
                    type = String.name;
                    break;
                }
                case 'integer': {
                    type = Number.name;
                    break;
                }
                case 'number': {
                    type = Number.name;
                    break;
                }
                case 'bool': {
                    type = Boolean.name;
                    break;
                }
                case 'boolean': {
                    type = Boolean.name;
                    break;
                }
                case 'array': {
                    type = Array.name;
                    break;
                }
                default: {
                    throw new Error(`could not resolve type: ${type}`);
                }
            }
        }
        const getterPropertyScript = classGetterPropertyTemplate
            .replace(/\{\{propertyName\}\}/g, propertyName)
            .replace(/\{\{propertyType\}\}/g, type);
        const setterPropertyScript = classSetterPropertyTemplate
            .replace(/\{\{propertyName\}\}/g, propertyName)
            .replace(/\{\{propertyType\}\}/g, type);
        script = script.replace(/\{\{property\}\}/g, `${getterPropertyScript}\r\n${setterPropertyScript}\r\n{{property}}`);
    }
    script = script.replace(/\{\{property\}\}/g, '');
    script = script.replace(/\{\{modelClassImport\}\}/g, '');
    let fileName = title.replace(/\s/g, '-').toLowerCase();
    fileName = `${fileName}-model.mjs`;
    const modelFilePath = path.join(modelsDirPath, fileName);
    writeFileSync(modelFilePath, script);
    modelFileInfo.push({ modelFilePath, modelClassName: className });
    return modelFileInfo;
}