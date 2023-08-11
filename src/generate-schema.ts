import fs from "node:fs";
import * as ts from "typescript";
import { getDecorator, getDecoratorName, traverse } from "./utils.js";
import { getEntityName, isEntityDecorator } from "./orm.js";

// test reasons
global.t = ts;

declare global {
	var t: typeof ts;
}


export async function generateSchema(filepath: string): Promise<unknown> {
	const sourceCode = ts.createSourceFile(filepath, fs.readFileSync(filepath, "utf-8"), ts.ScriptTarget.ESNext);

	traverse(sourceCode, generateEntity);

	return;
}

function generateEntity(node: ts.Node): unknown {
	const name = getEntityName(node)

	return;
}




