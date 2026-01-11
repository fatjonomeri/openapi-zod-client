import { isSchemaObject, type ReferenceObject, type SchemaObject } from "openapi3-ts";
import { match } from "ts-pattern";

import type { CodeMetaData, ConversionTypeContext } from "./CodeMeta";
import { CodeMeta } from "./CodeMeta";
import { isReferenceObject } from "./isReferenceObject";
import type { TemplateContext } from "./template-context";
import { escapeControlCharacters, isPrimitiveType, wrapWithQuotesIfNeeded } from "./utils";
import { inferRequiredSchema } from "./inferRequiredOnly";

// Extended SchemaObject type to include x-validation-messages
type ExtendedSchemaObject = SchemaObject & {
    "x-validation-messages"?: Record<string, string>;
};

// Helper to get custom validation message
const getValidationMessage = (schema: ExtendedSchemaObject, key: string): string | undefined => {
    return schema["x-validation-messages"]?.[key];
};

// Helper to format message for Zod (escape quotes and handle special chars)
const formatMessageForZod = (message: string): string => {
    return message.replace(/"/g, '\\"');
};

type ConversionArgs = {
    schema: SchemaObject | ReferenceObject;
    ctx?: ConversionTypeContext | undefined;
    meta?: CodeMetaData | undefined;
    options?: TemplateContext["options"] | undefined;
};

/**
 * @see https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.3.md#schemaObject
 * @see https://github.com/colinhacks/zod
 */
// eslint-disable-next-line sonarjs/cognitive-complexity
export function getZodSchema({ schema: $schema, ctx, meta: inheritedMeta, options }: ConversionArgs): CodeMeta {
    if (!$schema) {
        throw new Error("Schema is required");
    }

    const schema = options?.schemaRefiner?.($schema, inheritedMeta) ?? $schema;
    const code = new CodeMeta(schema, ctx, inheritedMeta);
    const meta = {
        ...inheritedMeta,
        parent: code.inherit(inheritedMeta?.parent),
        referencedBy: [...code.meta.referencedBy],
    };

    const refsPath = code.meta.referencedBy
        .slice(0, -1)
        .map((prev) => (ctx ? ctx.resolver.resolveRef(prev.ref!).normalized : prev.ref!));

    if (isReferenceObject(schema)) {
        if (!ctx) throw new Error("Context is required");

        const schemaName = ctx.resolver.resolveRef(schema.$ref)?.normalized;

        // circular(=recursive) reference
        if (refsPath.length > 1 && refsPath.includes(schemaName)) {
            return code.assign(ctx.zodSchemaByName[code.ref!]!);
        }

        let result = ctx.zodSchemaByName[schema.$ref];
        if (!result) {
            const actualSchema = ctx.resolver.getSchemaByRef(schema.$ref);
            if (!actualSchema) {
                throw new Error(`Schema ${schema.$ref} not found`);
            }

            result = getZodSchema({ schema: actualSchema, ctx, meta, options }).toString();
        }

        if (ctx.zodSchemaByName[schemaName]) {
            return code;
        }

        ctx.zodSchemaByName[schemaName] = result;

        return code;
    }

    if (Array.isArray(schema.type)) {
        if (schema.type.length === 1) {
            return getZodSchema({ schema: { ...schema, type: schema.type[0]! }, ctx, meta, options });
        }

        return code.assign(
            `z.union([${schema.type
                .map((prop) => getZodSchema({ schema: { ...schema, type: prop }, ctx, meta, options }))
                .join(", ")}])`
        );
    }

    if (schema.type === "null") {
        return code.assign("z.null()");
    }

    if (schema.oneOf) {
        if (schema.oneOf.length === 1) {
            const type = getZodSchema({ schema: schema.oneOf[0]!, ctx, meta, options });
            return code.assign(type.toString());
        }

        /* when there are multiple allOf we are unable to use a discriminatedUnion as this library adds an
         *   'z.and' to the schema that it creates which breaks type inference */
        const hasMultipleAllOf = schema.oneOf?.some((obj) => isSchemaObject(obj) && (obj?.allOf || []).length > 1);
        if (schema.discriminator && !hasMultipleAllOf) {
            const propertyName = schema.discriminator.propertyName;

            return code.assign(`
                z.discriminatedUnion("${propertyName}", [${schema.oneOf
                .map((prop) => getZodSchema({ schema: prop, ctx, meta, options }))
                .join(", ")}])
            `);
        }

        return code.assign(
            `z.union([${schema.oneOf.map((prop) => getZodSchema({ schema: prop, ctx, meta, options })).join(", ")}])`
        );
    }

    // anyOf = oneOf but with 1 or more = `T extends oneOf ? T | T[] : never`
    if (schema.anyOf) {
        if (schema.anyOf.length === 1) {
            const type = getZodSchema({ schema: schema.anyOf[0]!, ctx, meta, options });
            return code.assign(type.toString());
        }

        const types = schema.anyOf
            .map((prop) => getZodSchema({ schema: prop, ctx, meta, options }))
            .map((type) => {
                let isObject = true;

                if ("type" in type.schema) {
                    if (Array.isArray(type.schema.type)) {
                        isObject = false;
                    } else {
                        const schemaType = type.schema.type.toLowerCase() as NonNullable<typeof schema.type>;
                        isObject = !isPrimitiveType(schemaType);
                    }
                }

                return type.toString();
            })
            .join(", ");

        return code.assign(`z.union([${types}])`);
    }

    if (schema.allOf) {
        if (schema.allOf.length === 1) {
            const type = getZodSchema({ schema: schema.allOf[0]!, ctx, meta, options });
            return code.assign(type.toString());
        }
        const { patchRequiredSchemaInLoop, noRequiredOnlyAllof, composedRequiredSchema } = inferRequiredSchema(schema);

        const types = noRequiredOnlyAllof.map((prop) => {
            const zodSchema = getZodSchema({ schema: prop, ctx, meta, options });
            ctx?.resolver && patchRequiredSchemaInLoop(prop, ctx.resolver);
            return zodSchema;
        });

        if (composedRequiredSchema.required.length) {
            types.push(
                getZodSchema({
                    schema: composedRequiredSchema,
                    ctx,
                    meta,
                    options,
                })
            );
        }
        const first = types.at(0)!;
        const rest = types
            .slice(1)
            .map((type) => `and(${type.toString()})`)
            .join(".");

        return code.assign(`${first.toString()}.${rest}`);
    }

    const schemaType = schema.type ? (schema.type.toLowerCase() as NonNullable<typeof schema.type>) : undefined;
    if (schemaType && isPrimitiveType(schemaType)) {
        if (schema.enum) {
            if (schemaType === "string") {
                if (schema.enum.length === 1) {
                    const value = schema.enum[0];
                    const valueString = value === null ? "null" : `"${value}"`;
                    return code.assign(`z.literal(${valueString})`);
                }

                // eslint-disable-next-line sonarjs/no-nested-template-literals
                return code.assign(
                    `z.enum([${schema.enum.map((value) => (value === null ? "null" : `"${value}"`)).join(", ")}])`
                );
            }

            if (schema.enum.some((e) => typeof e === "string")) {
                return code.assign("z.never()");
            }

            if (schema.enum.length === 1) {
                const value = schema.enum[0];
                return code.assign(`z.literal(${value === null ? "null" : value})`);
            }

            return code.assign(
                // eslint-disable-next-line sonarjs/no-nested-template-literals
                `z.union([${schema.enum.map((value) => `z.literal(${value === null ? "null" : value})`).join(", ")}])`
            );
        }

        const extSchema = schema as ExtendedSchemaObject;
        const requiredMessage = meta?.isRequired ? getValidationMessage(extSchema, "required") : undefined;
        
        const baseType = match(schemaType)
            .with("integer", () => requiredMessage ? `z.number({ required_error: "${formatMessageForZod(requiredMessage)}" })` : "z.number()")
            .with("string", () =>
                match(schema.format)
                    .with("binary", () => "z.instanceof(File)")
                    .otherwise(() => requiredMessage ? `z.string({ required_error: "${formatMessageForZod(requiredMessage)}" })` : "z.string()")
            )
            .with("boolean", () => requiredMessage ? `z.boolean({ required_error: "${formatMessageForZod(requiredMessage)}" })` : "z.boolean()")
            .otherwise((type) => requiredMessage ? `z.${type}({ required_error: "${formatMessageForZod(requiredMessage)}" })` : `z.${type}()`);

        const chain = getZodChain({ schema, meta, options });
        return code.assign(`${baseType}${chain}`);
    }

    const readonly = options?.allReadonly ? ".readonly()" : "";

    if (schemaType === "array") {
        if (schema.items) {
            return code.assign(
                `z.array(${
                    getZodSchema({ schema: schema.items, ctx, meta: { ...meta, isRequired: true }, options }).toString()
                })${readonly}`
            );
        }

        return code.assign(`z.array(z.any())${readonly}`);
    }

    if (schemaType === "object" || schema.properties || schema.additionalProperties) {
        // additional properties default to true if additionalPropertiesDefaultValue not provided
        const additionalPropsDefaultValue =
            options?.additionalPropertiesDefaultValue !== undefined ? options?.additionalPropertiesDefaultValue : true;
        const additionalProps =
            schema.additionalProperties === null || schema.additionalProperties === undefined
                ? additionalPropsDefaultValue
                : schema.additionalProperties;
        const additionalPropsSchema = additionalProps === false ? "" : ".passthrough()";

        if (typeof schema.additionalProperties === "object" && Object.keys(schema.additionalProperties).length > 0) {
            return code.assign(
                `z.record(${getZodSchema({
                    schema: schema.additionalProperties,
                    ctx,
                    meta: { ...meta, isRequired: true },
                    options
                }).toString()})`
            );
        }

        const hasRequiredArray = schema.required && schema.required.length > 0;
        const isPartial = options?.withImplicitRequiredProps ? false : !schema.required?.length;
        let properties = "{}";

        if (schema.properties) {
            const propsMap = Object.entries(schema.properties).map(([prop, propSchema]) => {
                const propMetadata = {
                    ...meta,
                    isRequired: isPartial
                        ? true
                        : hasRequiredArray
                        ? schema.required?.includes(prop)
                        : options?.withImplicitRequiredProps,
                    name: prop,
                } as CodeMetaData;

                let propActualSchema = propSchema;

                if (isReferenceObject(propSchema) && ctx?.resolver) {
                    propActualSchema = ctx.resolver.getSchemaByRef(propSchema.$ref);
                    if (!propActualSchema) {
                        throw new Error(`Schema ${propSchema.$ref} not found`);
                    }
                }

                const propCode = getZodSchema({ schema: propSchema, ctx, meta: propMetadata, options });

                return [prop, propCode.toString()];
            });

            properties =
                "{ " +
                propsMap.map(([prop, propSchema]) => `${wrapWithQuotesIfNeeded(prop!)}: ${propSchema}`).join(", ") +
                " }";
        }

        const partial = isPartial ? ".partial()" : "";
        const strict = options?.strictObjects ? ".strict()" : "";
        return code.assign(`z.object(${properties})${partial}${strict}${additionalPropsSchema}${readonly}`);
    }

    if (!schemaType) return code.assign("z.unknown()");

    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw new Error(`Unsupported schema type: ${schemaType}`);
}

type ZodChainArgs = { schema: SchemaObject; meta?: CodeMetaData; options?: TemplateContext["options"] };

export const getZodChain = ({ schema, meta, options }: ZodChainArgs) => {
    const chains: string[] = [];
    const extSchema = schema as ExtendedSchemaObject;

    match(schema.type)
        .with("string", () => chains.push(getZodChainableStringValidations(schema)))
        .with("number", "integer", () => chains.push(getZodChainableNumberValidations(schema)))
        .with("array", () => chains.push(getZodChainableArrayValidations(schema)))
        .otherwise(() => void 0);

    // Build description with backend-specific validation notes
    let description = schema.description || "";
    const backendValidations: string[] = [];
    // Backend-only validations that can't be checked on frontend
    const backendRules = ["exists", "unique", "same", "confirmed", "in"];
    
    if (extSchema["x-validation-messages"]) {
        for (const [rule, message] of Object.entries(extSchema["x-validation-messages"])) {
            if (backendRules.includes(rule)) {
                backendValidations.push(`${message}`);
            }
        }
    }
    
    if (backendValidations.length > 0 && options?.withDescription) {
        const backendNote = "\n\n⚠️ Backend validations: " + backendValidations.join("; ");
        description = description ? description + backendNote : backendNote.trim();
    }

    if (typeof description === "string" && description !== "" && options?.withDescription) {
        if (["\n", "\r", "\r\n"].some((c) => String.prototype.includes.call(description, c))) {
            chains.push(`describe(\`${description}\`)`);
        } else {
            chains.push(`describe("${description}")`);
        }
    }

    const output = chains
        .concat(
            getZodChainablePresence(schema, meta),
            options?.withDefaultValues !== false ? getZodChainableDefault(schema) : []
        )
        .filter(Boolean)
        .join(".");
    return output ? `.${output}` : "";
};

const getZodChainablePresence = (schema: SchemaObject, meta?: CodeMetaData) => {
    if (schema.nullable && !meta?.isRequired) {
        return "nullish()";
    }

    if (schema.nullable) {
        return "nullable()";
    }

    if (!meta?.isRequired) {
        return "optional()";
    }

    return "";
};

// TODO OA prefixItems -> z.tuple
const unwrapQuotesIfNeeded = (value: string | number) => {
    if (typeof value === "string" && value.startsWith('"') && value.endsWith('"')) {
        return value.slice(1, -1);
    }

    return value;
};

const getZodChainableDefault = (schema: SchemaObject) => {
    if (schema.default !== undefined) {
        const value = match(schema.type)
            .with("number", "integer", () => unwrapQuotesIfNeeded(schema.default))
            .otherwise(() => JSON.stringify(schema.default));
        return `default(${value})`;
    }

    return "";
};

const formatPatternIfNeeded = (pattern: string) => {
    if (pattern.startsWith("/") && pattern.endsWith("/")) {
        pattern = pattern.slice(1, -1);
    }

    pattern = escapeControlCharacters(pattern);

    return pattern.includes("\\u") || pattern.includes("\\p") ? `/${pattern}/u` : `/${pattern}/`;
};

const getZodChainableStringValidations = (schema: SchemaObject) => {
    const extSchema = schema as ExtendedSchemaObject;
    const validations: string[] = [];

    if (!schema.enum) {
        if (schema.minLength !== undefined) {
            const message = getValidationMessage(extSchema, "min");
            validations.push(message ? `min(${schema.minLength}, "${formatMessageForZod(message)}")` : `min(${schema.minLength})`);
        }

        if (schema.maxLength !== undefined) {
            const message = getValidationMessage(extSchema, "max");
            validations.push(message ? `max(${schema.maxLength}, "${formatMessageForZod(message)}")` : `max(${schema.maxLength})`);
        }
    }

    if (schema.pattern) {
        const message = getValidationMessage(extSchema, "regex");
        validations.push(
            message 
                ? `regex(${formatPatternIfNeeded(schema.pattern)}, "${formatMessageForZod(message)}")`
                : `regex(${formatPatternIfNeeded(schema.pattern)})`
        );
    }

    if (schema.format) {
        const formatType = schema.format;
        const message = getValidationMessage(extSchema, formatType);
        const chain = match(formatType)
            .with("email", () => message ? `email("${formatMessageForZod(message)}")` : "email()")
            .with("hostname", () => message ? `url("${formatMessageForZod(message)}")` : "url()")
            .with("uri", () => message ? `url("${formatMessageForZod(message)}")` : "url()")
            .with("uuid", () => message ? `uuid("${formatMessageForZod(message)}")` : "uuid()")
            .with("date-time", () => message ? `datetime({ offset: true, message: "${formatMessageForZod(message)}" })` : "datetime({ offset: true })")
            .otherwise(() => "");

        if (chain) {
            validations.push(chain);
        }
    }

    return validations.join(".");
};

const getZodChainableNumberValidations = (schema: SchemaObject) => {
    const extSchema = schema as ExtendedSchemaObject;
    const validations: string[] = [];

    // none of the chains are valid for enums
    if (schema.enum) {
        return "";
    }

    if (schema.type === "integer") {
        const message = getValidationMessage(extSchema, "int");
        validations.push(message ? `int("${formatMessageForZod(message)}")` : "int()");
    }

    if (schema.minimum !== undefined) {
        const message = getValidationMessage(extSchema, "min") || getValidationMessage(extSchema, "gte");
        if (schema.exclusiveMinimum === true) {
            const gtMessage = getValidationMessage(extSchema, "gt");
            validations.push(gtMessage ? `gt(${schema.minimum}, "${formatMessageForZod(gtMessage)}")` : `gt(${schema.minimum})`);
        } else {
            validations.push(message ? `gte(${schema.minimum}, "${formatMessageForZod(message)}")` : `gte(${schema.minimum})`);
        }
    } else if (typeof schema.exclusiveMinimum === "number") {
        const message = getValidationMessage(extSchema, "gt");
        validations.push(message ? `gt(${schema.exclusiveMinimum}, "${formatMessageForZod(message)}")` : `gt(${schema.exclusiveMinimum})`);
    }

    if (schema.maximum !== undefined) {
        const message = getValidationMessage(extSchema, "max") || getValidationMessage(extSchema, "lte");
        if (schema.exclusiveMaximum === true) {
            const ltMessage = getValidationMessage(extSchema, "lt");
            validations.push(ltMessage ? `lt(${schema.maximum}, "${formatMessageForZod(ltMessage)}")` : `lt(${schema.maximum})`);
        } else {
            validations.push(message ? `lte(${schema.maximum}, "${formatMessageForZod(message)}")` : `lte(${schema.maximum})`);
        }
    } else if (typeof schema.exclusiveMaximum === "number") {
        const message = getValidationMessage(extSchema, "lt");
        validations.push(message ? `lt(${schema.exclusiveMaximum}, "${formatMessageForZod(message)}")` : `lt(${schema.exclusiveMaximum})`);
    }

    if (schema.multipleOf) {
        const message = getValidationMessage(extSchema, "multipleOf");
        validations.push(message ? `multipleOf(${schema.multipleOf}, "${formatMessageForZod(message)}")` : `multipleOf(${schema.multipleOf})`);
    }

    return validations.join(".");
};

const getZodChainableArrayValidations = (schema: SchemaObject) => {
    const extSchema = schema as ExtendedSchemaObject;
    const validations: string[] = [];

    if (schema.minItems) {
        const message = getValidationMessage(extSchema, "min");
        validations.push(message ? `min(${schema.minItems}, "${formatMessageForZod(message)}")` : `min(${schema.minItems})`);
    }

    if (schema.maxItems) {
        const message = getValidationMessage(extSchema, "max");
        validations.push(message ? `max(${schema.maxItems}, "${formatMessageForZod(message)}")` : `max(${schema.maxItems})`);
    }

    return validations.join(".");
};
