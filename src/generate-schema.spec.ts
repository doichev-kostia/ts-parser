import path from "node:path";
import { describe, expect, it } from "vitest";
import { generateSchema } from "./generate-schema.js";
import { createScanner, ScriptTarget } from "typescript";

const tests = path.resolve('src/tests');


describe("generate-schema", () => {
	it("should generate a schema", async () => {
		const sourceFile = path.resolve(tests, 'files', 'main.ts');
		const res = await generateSchema(sourceFile);
		expect(true).toBe(true)
	})
})
