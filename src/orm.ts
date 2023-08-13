import * as ts from "typescript";
import { factory } from "typescript";
import {
	getClassName,
	getDecorator,
	getDecoratorArguments,
	getDecoratorName,
	getPropertyName,
	transformObjectExpressionToObjectLiteral,
} from "./utils.js";
import { match } from "ts-pattern";

/**
 * Column types used for @PrimaryGeneratedColumn() decorator.
 */
export type PrimaryGeneratedColumnType =
	| "int"
	| "int2"
	| "int4"
	| "int8"
	| "integer"
	| "tinyint"
	| "smallint"
	| "mediumint"
	| "bigint"
	| "dec"
	| "decimal"
	| "smalldecimal"
	| "fixed"
	| "numeric"
	| "number";
/**
 * Column types where spatial properties are used.
 */
export type SpatialColumnType =
	| "geometry"
	| "geography"
	| "st_geometry"
	| "st_point";
/**
 * Column types where precision and scale properties are used.
 */
export type WithPrecisionColumnType =
	| "float"
	| "double"
	| "dec"
	| "decimal"
	| "smalldecimal"
	| "fixed"
	| "numeric"
	| "real"
	| "double precision"
	| "number"
	| "datetime"
	| "datetime2"
	| "datetimeoffset"
	| "time"
	| "time with time zone"
	| "time without time zone"
	| "timestamp"
	| "timestamp without time zone"
	| "timestamp with time zone"
	| "timestamp with local time zone";
/**
 * Column types where column length is used.
 */
export type WithLengthColumnType =
	| "character varying"
	| "varying character"
	| "char varying"
	| "nvarchar"
	| "national varchar"
	| "character"
	| "native character"
	| "varchar"
	| "char"
	| "nchar"
	| "national char"
	| "varchar2"
	| "nvarchar2"
	| "alphanum"
	| "shorttext"
	| "raw"
	| "binary"
	| "varbinary"
	| "string";
export type WithWidthColumnType =
	| "tinyint"
	| "smallint"
	| "mediumint"
	| "int"
	| "bigint";
/**
 * All other regular column types.
 */
export type SimpleColumnType =
	| "simple-array"
	| "simple-json"
	| "simple-enum"
	| "int2"
	| "integer"
	| "int4"
	| "int8"
	| "int64"
	| "unsigned big int"
	| "float"
	| "float4"
	| "float8"
	| "float64"
	| "smallmoney"
	| "money"
	| "boolean"
	| "bool"
	| "tinyblob"
	| "tinytext"
	| "mediumblob"
	| "mediumtext"
	| "blob"
	| "text"
	| "ntext"
	| "citext"
	| "hstore"
	| "longblob"
	| "longtext"
	| "alphanum"
	| "shorttext"
	| "bytes"
	| "bytea"
	| "long"
	| "raw"
	| "long raw"
	| "bfile"
	| "clob"
	| "nclob"
	| "image"
	| "timetz"
	| "timestamptz"
	| "timestamp with local time zone"
	| "smalldatetime"
	| "date"
	| "interval year to month"
	| "interval day to second"
	| "interval"
	| "year"
	| "seconddate"
	| "point"
	| "line"
	| "lseg"
	| "box"
	| "circle"
	| "path"
	| "polygon"
	| "geography"
	| "geometry"
	| "linestring"
	| "multipoint"
	| "multilinestring"
	| "multipolygon"
	| "geometrycollection"
	| "st_geometry"
	| "st_point"
	| "int4range"
	| "int8range"
	| "numrange"
	| "tsrange"
	| "tstzrange"
	| "daterange"
	| "enum"
	| "set"
	| "cidr"
	| "inet"
	| "inet4"
	| "inet6"
	| "macaddr"
	| "bit"
	| "bit varying"
	| "varbit"
	| "tsvector"
	| "tsquery"
	| "uuid"
	| "xml"
	| "json"
	| "jsonb"
	| "varbinary"
	| "hierarchyid"
	| "sql_variant"
	| "rowid"
	| "urowid"
	| "uniqueidentifier"
	| "rowversion"
	| "array"
	| "cube"
	| "ltree";
/**
 * Any column type column can be.
 */

type ColumnPrimitive = "string" | "number" | "boolean";

const ColumnTypeMapper2: Record<
	ColumnPrimitive,
	(
		| WithPrecisionColumnType
		| WithLengthColumnType
		| WithWidthColumnType
		| SpatialColumnType
		| SimpleColumnType
	)[]
> = {
	string: [
		"string",
		"varchar",
		"text",
		"char",
		"character",
		"character varying",
		"varying character",
		"nvarchar",
		"national char",
		"native character",
		"nchar",
		"varchar2",
		"nvarchar2",
		"shorttext",
	],
	number: [
		"int",
		"int2",
		"int4",
		"int8",
		"integer",
		"tinyint",
		"smallint",
		"mediumint",
		"bigint",
		"dec",
		"decimal",
		"smalldecimal",
		"fixed",
		"numeric",
		"number",
		"float",
		"double",
		"dec",
		"real",
		"double precision",
	],
	boolean: ["bool", "boolean"],
};

// const ColumnTypeMapper: Record<
// 	| WithPrecisionColumnType
// 	| WithLengthColumnType
// 	| WithWidthColumnType
// 	| SpatialColumnType
// 	| SimpleColumnType,
// 	ColumnPrimitive
// > = {
// 	string: "string",
// 	varchar: "string",
// 	text: "string",
// 	char: "string",
// 	character: "string",
// 	"character varying": "string",
// 	"varying character": "string",
// 	nvarchar: "string",
// 	"national char": "string",
// 	"native character": "string",
// 	nchar: "string",
// 	varchar2: "string",
// 	nvarchar2: "string",
// 	shorttext: "string",
// 	int: "number",
// 	int2: "number",
// 	int4: "number",
// 	int8: "number",
// 	integer: "number",
// 	tinyint: "number",
// 	smallint: "number",
// 	mediumint: "number",
// 	bigint: "number",
// 	dec: "number",
// 	decimal: "number",
// 	smalldecimal: "number",
// 	fixed: "number",
// 	numeric: "number",
// 	number: "number",
// 	float: "number",
// 	double: "number",
// 	real: "number",
// 	"double precision": "number",
// 	bool: "boolean",
// 	boolean: "boolean",
// };

const NodeKindTypeMapper: Record<number, string> = {
	[ts.SyntaxKind.StringKeyword]: "string",
	[ts.SyntaxKind.NumberKeyword]: "number",
	[ts.SyntaxKind.BooleanKeyword]: "boolean",
	[ts.SyntaxKind.UndefinedKeyword]: "undefined",
	[ts.SyntaxKind.NullKeyword]: "null",
	[ts.SyntaxKind.AnyKeyword]: "any",
	[ts.SyntaxKind.UnknownKeyword]: "unknown",
	[ts.SyntaxKind.NeverKeyword]: "never",
	[ts.SyntaxKind.ObjectKeyword]: "object",
	[ts.SyntaxKind.SymbolKeyword]: "symbol",
};

// if the type is json, jsonb, or simple-json, we need to infer the type from the property
// if the type is array, we need to infer the type from the property

export function isEntityDecorator(decorator: ts.Decorator): boolean {
	return getDecoratorName(decorator) === "Entity";
}

export function isColumnDecorator(decorator: ts.Decorator): boolean {
	return getDecoratorName(decorator) === "Column";
}

export function getEntityNameFromDecorator(
	decorator: ts.Decorator,
	classNode: ts.ClassDeclaration,
): string {
	const args = getDecoratorArguments(decorator);

	if (args.length === 0) {
		return getClassName(classNode);
	}

	const arg = args[0];

	if (ts.isStringLiteral(arg)) {
		return arg.text;
	}

	if (ts.isObjectLiteralExpression(arg)) {
		const properties = transformObjectExpressionToObjectLiteral(arg);
		if (
			"name" in properties &&
			typeof properties.name === "string" &&
			properties.name.length > 0
		) {
			return properties.name;
		} else {
			return getClassName(classNode);
		}
	}

	return getClassName(classNode);
}

export function getColumnNameFromDecorator(
	decorator: ts.Decorator,
	propertyNode: ts.PropertyDeclaration,
): string {
	/**
	 * The `@Column` decorator can take a string literal or an object literal as its first argument.
	 * In case the first argument is a string literal, it is the type of the column.
	 */
	const args = getDecoratorArguments(decorator);

	if (args.length === 0) {
		return getPropertyName(propertyNode);
	}

	if (ts.isObjectLiteralExpression(args[0])) {
		const properties = transformObjectExpressionToObjectLiteral(args[0]);
		if (
			"name" in properties &&
			typeof properties.name === "string" &&
			properties.name.length > 0
		) {
			return properties.name;
		} else {
			return getPropertyName(propertyNode);
		}
	}

	if (ts.isObjectLiteralExpression(args[1])) {
		const properties = transformObjectExpressionToObjectLiteral(args[1]);
		if (
			"name" in properties &&
			typeof properties.name === "string" &&
			properties.name.length > 0
		) {
			return properties.name;
		} else {
			return getPropertyName(propertyNode);
		}
	}

	return getPropertyName(propertyNode);
}

export function getEntityName(node: ts.Node): string | undefined {
	if (!ts.isClassDeclaration(node)) return;

	const decorator = getDecorator(node);

	if (!decorator) return;

	if (!isEntityDecorator(decorator)) return;

	return getEntityNameFromDecorator(decorator, node);
}

export function getColumnName(node: ts.Node): string | undefined {
	if (!ts.isPropertyDeclaration(node)) return;

	const decorator = getDecorator(node);

	if (!decorator) return;

	if (!isColumnDecorator(decorator)) return;

	return getColumnNameFromDecorator(decorator, node);
}

export function getColumnType(node: ts.Node): ts.TypeNode | undefined {
	if (!ts.isPropertyDeclaration(node)) return;

	const decorator = getDecorator(node);

	if (!decorator) return;

	if (!isColumnDecorator(decorator)) return;

	const args = getDecoratorArguments(decorator);

	if (args.length === 0) {
		return node.type;
	}

	if (ts.isStringLiteral(args[0])) {
		return transformTypeOrmType(args[0].text);
	}

	if (ts.isObjectLiteralExpression(args[0])) {
		const properties = transformObjectExpressionToObjectLiteral(args[0]);
		if (
			"type" in properties &&
			typeof properties.type === "string" &&
			properties.type.length > 0
		) {
			return transformTypeOrmType(properties.type);
		} else {
			return node.type;
		}
	}

	return node.type;
}

function transformTypeOrmType(type: string): ts.TypeNode {
	return match(type)
		.when(
			(type) => ColumnTypeMapper2.string.includes(type as any),
			() => {
				return factory.createKeywordTypeNode(
					ts.SyntaxKind.StringKeyword,
				);
			},
		)
		.when(
			(type) => ColumnTypeMapper2.number.includes(type as any),
			() => {
				return factory.createKeywordTypeNode(
					ts.SyntaxKind.NumberKeyword,
				);
			},
		)
		.when(
			(type) => ColumnTypeMapper2.boolean.includes(type as any),
			() => {
				return factory.createKeywordTypeNode(
					ts.SyntaxKind.BooleanKeyword,
				);
			},
		)
		.otherwise(() => {
			return factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);
		});
}
