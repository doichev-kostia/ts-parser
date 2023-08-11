import { describe, expect, it } from "vitest";
import { before } from "node:test";
import path from "node:path";
import fs from "node:fs";
import { randomUUID } from "crypto";
import * as ts from "typescript";
import { getDecorator, getDecoratorName, traverse } from "./utils.js";
import { getEntityName, isEntityDecorator } from "./orm.js";
import { entityNames } from "./tests/content.js";

const files = path.resolve('src/tests/files');

const randomFile = () => `${randomUUID()}.ts`;

const getAST = (source: string) => ts.createSourceFile(randomFile(), source, ts.ScriptTarget.ESNext);

describe("orm", () => {
	describe("getEntityName", () => {
		it("should not find a name", () => {
			const sourceCode = getAST(entityNames.examples.noName);
			let name: string | undefined;

			traverse(sourceCode, (node) => {
				const n = getEntityName(node);
				if (n) name = n;
			})

			expect(name).toBeUndefined();
		})

		it("should get the class name", () => {
			const sourceCode = getAST(entityNames.examples.className);
			let name: string | undefined;

			traverse(sourceCode, (node) => {
				const n = getEntityName(node);
				if (n) name = n;
			})

			expect(name).toBe(entityNames.correctName);
		})

		it("should get the name from the decorator string literal", () => {
			const sourceCode = getAST(entityNames.examples.decoratorString);
			let name: string | undefined;

			traverse(sourceCode, (node) => {
				const n = getEntityName(node);
				if (n) name = n;
			})

			expect(name).toBe(entityNames.correctName);
		})

		it("should get the name from the decorator options", () => {
			const sourceCode = getAST(entityNames.examples.decoratorOptions);
			let name: string | undefined;

			traverse(sourceCode, (node) => {
				const n = getEntityName(node);
				if (n) name = n;
			});

			expect(name).toBe(entityNames.correctName);
		})

	})
})
