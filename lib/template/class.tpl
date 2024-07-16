import { SchemaModel } from '../../lib/schema-model.mjs';
{{modelClassImport}}
export class {{className}} extends SchemaModel {
    get Id() {
        return super.get({ Id: String.prototype });
    }
{{property}}
}