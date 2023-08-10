import * as ts from "typescript";
import { match } from "ts-pattern";

// test reasons
// global.t = ts;
//
// declare global {
// 	var t: typeof ts;
// }

export function transformObjectExpressionToObjectLiteral(node: ts.ObjectLiteralExpression): object {
	const object: Record<string, any> = {};

	for (const property of node.properties) {
		if (!ts.isPropertyAssignment(property)) {
			continue;
		}

		const identifier = property.name;

		if (!ts.isIdentifier(identifier) && !ts.isStringLiteral(identifier)) {
			throw new Error("Property name is not an Identifier or StringLiteral");
		}

		const key = identifier.text;

		match(property.initializer)
			.when(ts.isStringLiteral, (node) => {
				object[key] = node.text;
			})
			.when(ts.isNumericLiteral, (node) => {
				object[key] = Number(node.text);
			})
			.with({ kind: ts.SyntaxKind.TrueKeyword}, () => {
				object[key] = true;
			})
			.with({kind: ts.SyntaxKind.FalseKeyword}, () => {
				object[key] = false;
			})
			.with({kind: ts.SyntaxKind.NullKeyword}, () => {
				object[key] = null;
			})
			.when(ts.isObjectLiteralExpression, (node) => {
				object[key] = transformObjectExpressionToObjectLiteral(node);
			})
			.when(ts.isArrayLiteralExpression, (node) => {
				object[key] = transformArrayLiteralExpressionToArrayLiteral(node);
			})
			.otherwise(() => {
				return;
			});
	}

	return object;
}

export function transformArrayLiteralExpressionToArrayLiteral(node: ts.ArrayLiteralExpression): any[] {
	const array: any[] = [];

	for (const element of node.elements) {
		match(element)
			.when(ts.isStringLiteral, (node) => {
				array.push(node.text);
			})
			.when(ts.isNumericLiteral, (node) => {
				array.push(Number(node.text));
			})
			.with({ kind: ts.SyntaxKind.TrueKeyword}, () => {
				array.push(true);
			})
			.with({kind: ts.SyntaxKind.FalseKeyword}, () => {
				array.push(false);
			})
			.with({kind: ts.SyntaxKind.NullKeyword}, () => {
				array.push(null);
			})
			.with({kind: ts.SyntaxKind.UndefinedKeyword}, () => {
				array.push(undefined);
			})
			.when(ts.isObjectLiteralExpression, (node) => {
				array.push(transformObjectExpressionToObjectLiteral(node));
			})
			.when(ts.isArrayLiteralExpression, (node) => {
				array.push(transformArrayLiteralExpressionToArrayLiteral(node));
			})
			.otherwise(() => {
				return;
			});
	}

	return array;
}