import * as ts from "typescript";
import {
	BooleanLiteral,
	factory,
	Identifier,
	LiteralTypeNode,
	NullLiteral,
} from "typescript";
import { match } from "ts-pattern";

// test reasons
// global.t = ts;
//
// declare global {
// 	var t: typeof ts;
// }

export function transformObjectExpressionToObjectLiteral(
	node: ts.ObjectLiteralExpression,
): object {
	const object: Record<string, any> = {};

	for (const property of node.properties) {
		if (!ts.isPropertyAssignment(property)) {
			continue;
		}

		const identifier = property.name;

		if (!ts.isIdentifier(identifier) && !ts.isStringLiteral(identifier)) {
			throw new Error(
				"Property name is not an Identifier or StringLiteral",
			);
		}

		const key = identifier.text;

		match(property.initializer)
			.when(ts.isStringLiteral, (node) => {
				object[key] = node.text;
			})
			.when(ts.isNumericLiteral, (node) => {
				object[key] = Number(node.text);
			})
			.with({ kind: ts.SyntaxKind.TrueKeyword }, () => {
				object[key] = true;
			})
			.with({ kind: ts.SyntaxKind.FalseKeyword }, () => {
				object[key] = false;
			})
			.with({ kind: ts.SyntaxKind.NullKeyword }, () => {
				object[key] = null;
			})
			.when(ts.isObjectLiteralExpression, (node) => {
				object[key] = transformObjectExpressionToObjectLiteral(node);
			})
			.when(ts.isArrayLiteralExpression, (node) => {
				object[key] =
					transformArrayLiteralExpressionToArrayLiteral(node);
			})
			.otherwise(() => {
				return;
			});
	}

	return object;
}

export function transformArrayLiteralExpressionToArrayLiteral(
	node: ts.ArrayLiteralExpression,
): any[] {
	const array: any[] = [];

	for (const element of node.elements) {
		match(element)
			.when(ts.isStringLiteral, (node) => {
				array.push(node.text);
			})
			.when(ts.isNumericLiteral, (node) => {
				array.push(Number(node.text));
			})
			.with({ kind: ts.SyntaxKind.TrueKeyword }, () => {
				array.push(true);
			})
			.with({ kind: ts.SyntaxKind.FalseKeyword }, () => {
				array.push(false);
			})
			.with({ kind: ts.SyntaxKind.NullKeyword }, () => {
				array.push(null);
			})
			.with({ kind: ts.SyntaxKind.UndefinedKeyword }, () => {
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

export function getDecorator(
	node: ts.PropertyDeclaration | ts.ClassDeclaration | ts.MethodDeclaration,
): ts.Decorator | undefined {
	const modifiers = node.modifiers ?? [];
	const decorator = modifiers.find((m) => ts.isDecorator(m));

	return decorator as ts.Decorator | undefined;
}

export function getDecoratorName(decorator: ts.Decorator): string | undefined {
	if (ts.isCallExpression(decorator.expression)) {
		if (ts.isIdentifier(decorator.expression.expression)) {
			return decorator.expression.expression.text;
		}
	}

	return undefined;
}

export function getDecoratorArguments(
	decorator: ts.Decorator,
): ts.NodeArray<ts.Expression> {
	if (!ts.isCallExpression(decorator.expression)) {
		return factory.createNodeArray();
	}

	return decorator.expression.arguments;
}

/**
 *
 * @throws {Error} If the class has no name
 */
export function getClassName(classNode: ts.ClassDeclaration): string {
	if (!classNode.name) {
		throw new Error("Class has no name");
	}

	return classNode.name.text;
}

/**
 * @throws {Error} If the property has no name
 */
export function getPropertyName(property: ts.PropertyDeclaration): string {
	if (!property.name) {
		throw new Error("Property has no name");
	}

	return (property.name as ts.Identifier).text;
}

export function traverse(node: ts.Node, cb: (node: ts.Node) => void): void {
	cb(node);

	ts.forEachChild(node, (child) => {
		traverse(child, cb);
	});
}

export function compareTypeNodes(node1: ts.TypeNode, node2: ts.TypeNode) {
	if (node1.kind !== node2.kind) {
		return false;
	}

	const isLiteral =
		ts.isLiteralTypeNode(node1) && ts.isLiteralTypeNode(node2);

	if (isLiteral) {
		const isPrimitive =
			isPrimitiveLiteral(node1.literal) &&
			isPrimitiveLiteral(node2.literal);
		if (isPrimitive) {
			return node1.literal.kind === node2.literal.kind;
		} else {
			return false;
		}
	}

	const isUnion = ts.isUnionTypeNode(node1) && ts.isUnionTypeNode(node2);
	const isIntersection =
		ts.isIntersectionTypeNode(node1) && ts.isIntersectionTypeNode(node2);

	if (isUnion || isIntersection) {
		if (node1.types.length !== node2.types.length) {
			return false;
		}

		for (let i = 0; i < node1.types.length; i++) {
			if (!compareTypeNodes(node1.types[i], node2.types[i])) {
				return false;
			}
		}

		return true;
	}

	const isArrayType = ts.isArrayTypeNode(node1) && ts.isArrayTypeNode(node2);

	if (isArrayType) {
		return compareTypeNodes(node1.elementType, node2.elementType);
	}

	return true;
}

function isNullLiteral(node: ts.Node): node is NullLiteral {
	return node.kind === ts.SyntaxKind.NullKeyword;
}

function isBooleanLiteral(node: ts.Node): node is BooleanLiteral {
	return (
		node.kind === ts.SyntaxKind.TrueKeyword ||
		node.kind === ts.SyntaxKind.FalseKeyword
	);
}

function isPrimitiveLiteral(
	literal: LiteralTypeNode["literal"],
): literal is NullLiteral | BooleanLiteral {
	return isNullLiteral(literal) || isBooleanLiteral(literal);
}

export function compareInterfaces(
	i1: ts.InterfaceDeclaration,
	i2: ts.InterfaceDeclaration,
) {
	if (i1.members.length !== i2.members.length) {
		return false;
	}

	for (let i = 0; i < i1.members.length; i++) {
		const member1 = i1.members[i];
		const member2 = i2.members[i];

		if (
			!ts.isPropertySignature(member1) ||
			!ts.isPropertySignature(member2)
		) {
			return false;
		}

		if (
			(member1.name as Identifier).text !==
			(member2.name as Identifier).text
		) {
			return false;
		}

		const typeNodesDefined = member1.type && member2.type;

		if (
			!typeNodesDefined ||
			!compareTypeNodes(member1.type, member2.type)
		) {
			return false;
		}
	}

	return true;
}

export function snakeCase(str: string) {
	return (
		str
			// ABc -> a_bc
			.replace(/([A-Z])([A-Z])([a-z])/g, "$1_$2$3")
			// aC -> a_c
			.replace(/([a-z0-9])([A-Z])/g, "$1_$2")
			.toLowerCase()
	);
}

export function camelCase(str: string) {
	return str.replace(/^([A-Z])|[\s-_](\w)/g, function (match, p1, p2) {
		if (p2) return p2.toUpperCase();
		return p1.toLowerCase();
	});
}
