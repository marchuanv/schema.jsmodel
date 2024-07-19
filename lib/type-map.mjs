import { UUID } from './uuid.mjs';

const privateBag = new WeakMap();
class Types { }
privateBag.set(Types, []);
privateBag.get(Types).push({ typeName: String.name, prototype: String.prototype, schemaType: 'string' });
privateBag.get(Types).push({ typeName: Number.name, prototype: Number.prototype, schemaType: 'number' });
privateBag.get(Types).push({ typeName: Object.name, prototype: Object.prototype, schemaType: 'object' });
privateBag.get(Types).push({ typeName: Number.name, prototype: Number.prototype, schemaType: 'integer' });
privateBag.get(Types).push({ typeName: Boolean.name, prototype: Boolean.prototype, schemaType: 'boolean' });
privateBag.get(Types).push({ typeName: Array.name, prototype: Array.prototype, schemaType: 'array' });
export class TypeMap extends UUID {
    /**
     * @param { String | prototype } type
    */
    constructor(type) {
        const found = privateBag.get(Types).find(x => x.typeName === type || x.prototype === type || x.schemaType === type);
        if (!found) {
            throw new Error(`${type.name ? type.name : type} not found.`);
        }
        const { typeName } = found;
        const typeMapId = { guid: '3698a729-a664-4b80-9626-c83f0f7eedd0', typeMap: { typeName } };
        super(JSON.stringify(typeMapId));
        privateBag.set(this, found);
    }
    /**
     * @param { String } typeName
     * @param { Object } prototype
     * @param { String } schemaType
    */
    static register(typeName, prototype, schemaType) {
        privateBag.get(Types).push({ typeName, prototype, schemaType });
    }
    /**
     * @param { Object } type string or prototype
    */
    static resolve(type) {
        throw new Error('not implemented.');
    }
    /**
     * @returns { Object }
    */
    get prototype() {
        const { prototype } = privateBag.get(this);
        return prototype;
    }
    /**
     * @param { Object } value
    */
    set prototype(value) {
        const bag = privateBag.get(this);
        bag.prototype = value;
    }
    /**
     * @returns { String }
    */
    get typeName() {
        const { typeName } = privateBag.get(this);
        return typeName;
    }
    /**
     * @returns { String }
    */
    get schemaType() {
        const { schemaType } = privateBag.get(this);
        return schemaType;
    }
}