import fs from "node:fs";
import * as ts from "typescript";
import { factory } from "typescript";
import { match } from "ts-pattern";
import { transformObjectExpressionToObjectLiteral } from "./utils.js";

export async function generateSchema(scanner: ts.Scanner, filepath: string): Promise<unknown> {
	const sourceCode = ts.createSourceFile(filepath, fs.readFileSync(filepath, "utf-8"), ts.ScriptTarget.ESNext);

	visit(sourceCode, sourceCode);

	return;
}

function visit(node: ts.Node, sourceFile: ts.SourceFile) {
	var t = ts;
	// Check the kind of the node, and take action based on its type
	if (ts.isClassDeclaration(node)) {
		console.log("Found a class:", node.name?.text);
		const decorator = getDecorator(node);

		if (decorator) {
			console.log("Decorator name:", getDecoratorName(decorator));
		}

		if (decorator) {
			if (isEntityDecorator(decorator)) {
				const entityName = getEntityName(decorator, node);
				console.log("Entity name:", entityName);
			}
		}

		// for (const member of node.members) {
		// 	if (ts.isPropertyDeclaration(member) && member.decorators) {
		// 		// Inspect property decorators, etc.
		// 		for (const decorator of member.decorators) {
		// 			console.log("Decorator name:", decorator.expression.getText(sourceFile));
		// 		}
		// 	}
		// }
	}

	// Continue traversing the child nodes
	ts.forEachChild(node, function forEachCallback(node) {
		return visit(node, sourceFile);
	});
}

function getDecorator(node: ts.PropertyDeclaration | ts.ClassDeclaration | ts.MethodDeclaration): ts.Decorator | undefined {
	const modifiers = node.modifiers ?? [];
	const decorator = modifiers.find((m) => ts.isDecorator(m));

	return decorator as ts.Decorator | undefined;
}

function getDecoratorName(decorator: ts.Decorator): string | undefined {
	if (ts.isCallExpression(decorator.expression)) {
		if (ts.isIdentifier(decorator.expression.expression)) {
			return decorator.expression.expression.text;
		}
	}

	return undefined;
}

function isEntityDecorator(decorator: ts.Decorator): boolean {
	return getDecoratorName(decorator) === "Entity";
}

function getEntityName(decorator: ts.Decorator, classNode: ts.ClassDeclaration): string {
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
		if ('name' in properties && typeof properties.name === 'string' && properties.name.length > 0) {
			return properties.name;
		} else {
			return getClassName(classNode);
		}
	}

	return getClassName(classNode);
}

/**
 *
 * @throws {Error} If the class has no name
 */
function getClassName(classNode: ts.ClassDeclaration): string {
	if (!classNode.name) {
		throw new Error("Class has no name");
	}

	return classNode.name.text;
}

function getDecoratorArguments(decorator: ts.Decorator): ts.NodeArray<ts.Expression> {
	if (!ts.isCallExpression(decorator.expression)) {
		return factory.createNodeArray();
	}

	return decorator.expression.arguments;
}


