import { describe, expect, it } from "vitest";
import path from "node:path";
import { randomUUID } from "crypto";
import * as ts from "typescript";
import { compareTypeNodes, traverse } from "./utils.js";
import { getColumnName, getColumnType, getEntityName } from "./orm.js";
import { columnNames, columnTypes, entityNames } from "./tests/content.js";

const files = path.resolve("src/tests/files");

const randomFile = () => `${randomUUID()}.ts`;

const getAST = (source: string) =>
	ts.createSourceFile(randomFile(), source, ts.ScriptTarget.ESNext);

function compareColumnTypes(nodes: ts.TypeNode[], expected: ts.TypeNode[]) {
	if (nodes.length !== expected.length) return false;
	for (let i = 0; i < nodes.length; i += 1) {
		if (!compareTypeNodes(nodes[i], expected[i])) return false;
	}

	return true;
}

describe("orm", () => {
	describe("getEntityName", () => {
		it("should not find a name", () => {
			const sourceCode = getAST(entityNames.examples.noName);
			let name: string | undefined;

			traverse(sourceCode, (node) => {
				const n = getEntityName(node);
				if (n) name = n;
			});

			expect(name).toBeUndefined();
		});

		it("should get the class name", () => {
			const sourceCode = getAST(entityNames.examples.className);
			let name: string | undefined;

			traverse(sourceCode, (node) => {
				const n = getEntityName(node);
				if (n) name = n;
			});

			expect(name).toBe(entityNames.correctName);
		});

		it("should get the name from the decorator string literal", () => {
			const sourceCode = getAST(entityNames.examples.decoratorString);
			let name: string | undefined;

			traverse(sourceCode, (node) => {
				const n = getEntityName(node);
				if (n) name = n;
			});

			expect(name).toBe(entityNames.correctName);
		});

		it("should get the name from the decorator options", () => {
			const sourceCode = getAST(entityNames.examples.decoratorOptions);
			let name: string | undefined;

			traverse(sourceCode, (node) => {
				const n = getEntityName(node);
				if (n) name = n;
			});

			expect(name).toBe(entityNames.correctName);
		});
	});

	describe("getColumnNames", () => {
		it("should not find any columns", () => {
			const sourceCode = getAST(columnNames.withoutColumn.code);
			const result: string[] = [];

			traverse(sourceCode, (node) => {
				const name = getColumnName(node);
				if (name) result.push(name);
			});

			expect(result).toEqual(columnNames.withoutColumn.columns);
		});

		it("should find a column", () => {
			const sourceCode = getAST(columnNames.withColumn.code);
			const result: string[] = [];

			traverse(sourceCode, (node) => {
				const name = getColumnName(node);
				if (name) result.push(name);
			});

			expect(result).toEqual(columnNames.withColumn.columns);
		});

		it("should find multiple columns", () => {
			const sourceCode = getAST(columnNames.withMultipleColumns.code);
			const result: string[] = [];

			traverse(sourceCode, (node) => {
				const name = getColumnName(node);
				if (name) result.push(name);
			});

			expect(result).toEqual(columnNames.withMultipleColumns.columns);
		});
	});

	describe("getColumTypes", () => {
		it("should not find any columns", () => {
			const sourceCode = getAST(columnTypes.withoutColumn.code);
			const result: ts.TypeNode[] = [];

			traverse(sourceCode, (node) => {
				const type = getColumnType(node);
				if (type) result.push(type);
			});

			expect(result).toEqual(columnTypes.withoutColumn.types);
		});

		it("should infer primitive column type", () => {
			const sourceCode = getAST(columnTypes.inferFromPrimitiveType.code);
			const result: ts.TypeNode[] = [];

			traverse(sourceCode, (node) => {
				const type = getColumnType(node);
				if (type) result.push(type);
			});

			expect(
				compareColumnTypes(
					result,
					columnTypes.inferFromPrimitiveType.types,
				),
			).toBe(true);
		});

		it("should infer union column type", () => {
			const sourceCode = getAST(columnTypes.inferFromTypeUnion.code);
			const result: ts.TypeNode[] = [];

			traverse(sourceCode, (node) => {
				const type = getColumnType(node);
				if (type) result.push(type);
			});

			expect(
				compareColumnTypes(
					result,
					columnTypes.inferFromTypeUnion.types,
				),
			).toBe(true);
		});

		it("should infer optional column type", () => {
			const sourceCode = getAST(columnTypes.inferFromOptionalType.code);
			const result: ts.TypeNode[] = [];

			traverse(sourceCode, (node) => {
				const type = getColumnType(node);
				if (type) result.push(type);
			});

			expect(
				compareColumnTypes(
					result,
					columnTypes.inferFromOptionalType.types,
				),
			).toBe(true);
		});

		it("should get types from the decorator options", () => {
			const sourceCode = getAST(columnTypes.options.code);
			const result: ts.TypeNode[] = [];

			traverse(sourceCode, (node) => {
				const type = getColumnType(node);
				if (type) result.push(type);
			});

			expect(compareColumnTypes(result, columnTypes.options.types)).toBe(
				true,
			);
		});
	});
});
