import * as ts from "typescript";
import {
	getClassName,
	getDecorator,
	getDecoratorArguments,
	getDecoratorName,
	transformObjectExpressionToObjectLiteral
} from "./utils.js";

export function isEntityDecorator(decorator: ts.Decorator): boolean {
	return getDecoratorName(decorator) === "Entity";
}

export function getEntityNameFromDecorator(decorator: ts.Decorator, classNode: ts.ClassDeclaration): string {
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
		if ("name" in properties && typeof properties.name === "string" && properties.name.length > 0) {
			return properties.name;
		} else {
			return getClassName(classNode);
		}
	}

	return getClassName(classNode);
}

export function getEntityName(node: ts.Node) {
	if (!ts.isClassDeclaration(node)) return;

	const decorator = getDecorator(node);

	if (!decorator) return;

	if (!isEntityDecorator(decorator)) return;

	return getEntityNameFromDecorator(decorator, node);
}

