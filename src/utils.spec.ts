import { describe, expect, it } from "vitest";
import { factory, SyntaxKind } from "typescript";
import {
	compareTypeNodes,
	transformArrayLiteralExpressionToArrayLiteral,
	transformObjectExpressionToObjectLiteral,
} from "./utils.js";

describe("utils", () => {
	describe("transformObjectExpressionToObjectLiteral", () => {
		it("should transform a string record", () => {
			const property = factory.createPropertyAssignment(
				"name",
				factory.createStringLiteral("John Doe"),
			);
			const node = factory.createObjectLiteralExpression([property]);

			const expected = {
				name: "John Doe",
			};

			const result = transformObjectExpressionToObjectLiteral(node);

			expect(result).toEqual(expected);
		});

		it("should transform a number record", () => {
			const property = factory.createPropertyAssignment(
				"age",
				factory.createNumericLiteral("42"),
			);
			const node = factory.createObjectLiteralExpression([property]);

			const expected = {
				age: 42,
			};

			const result = transformObjectExpressionToObjectLiteral(node);

			expect(result).toEqual(expected);
		});

		it("should transform a boolean record", () => {
			const trueProperty = factory.createPropertyAssignment(
				"isTrue",
				factory.createTrue(),
			);
			const falseProperty = factory.createPropertyAssignment(
				"isFalse",
				factory.createFalse(),
			);

			const node = factory.createObjectLiteralExpression([
				trueProperty,
				falseProperty,
			]);

			const expected = {
				isTrue: true,
				isFalse: false,
			};

			const result = transformObjectExpressionToObjectLiteral(node);

			expect(result).toEqual(expected);
		});

		it("should transform a null record", () => {
			const property = factory.createPropertyAssignment(
				"isNull",
				factory.createNull(),
			);
			const node = factory.createObjectLiteralExpression([property]);

			const expected = {
				isNull: null,
			};

			const result = transformObjectExpressionToObjectLiteral(node);

			expect(result).toEqual(expected);
		});

		it("should transform a nested record", () => {
			const property = factory.createPropertyAssignment(
				"nested",
				factory.createObjectLiteralExpression([
					factory.createPropertyAssignment(
						"name",
						factory.createStringLiteral("John Doe"),
					),
				]),
			);
			const node = factory.createObjectLiteralExpression([property]);

			const expected = {
				nested: {
					name: "John Doe",
				},
			};

			const result = transformObjectExpressionToObjectLiteral(node);

			expect(result).toEqual(expected);
		});

		it("should transform a record with an array", () => {
			const property = factory.createPropertyAssignment(
				"array",
				factory.createArrayLiteralExpression([
					factory.createStringLiteral("John Doe"),
					factory.createNumericLiteral("42"),
					factory.createTrue(),
					factory.createFalse(),
					factory.createNull(),
				]),
			);
			const node = factory.createObjectLiteralExpression([property]);

			const expected = {
				array: ["John Doe", 42, true, false, null],
			};

			const result = transformObjectExpressionToObjectLiteral(node);

			expect(result).toEqual(expected);
		});
	});

	describe("transformArrayLiteralExpressionToArrayLiteral", () => {
		it("should transform a string array", () => {
			const node = factory.createArrayLiteralExpression([
				factory.createStringLiteral("John Doe"),
			]);

			const expected = ["John Doe"];

			const result = transformArrayLiteralExpressionToArrayLiteral(node);

			expect(result).toEqual(expected);
		});

		it("should transform a number array", () => {
			const node = factory.createArrayLiteralExpression([
				factory.createNumericLiteral("42"),
			]);

			const expected = [42];

			const result = transformArrayLiteralExpressionToArrayLiteral(node);

			expect(result).toEqual(expected);
		});

		it("should transform a boolean array", () => {
			const node = factory.createArrayLiteralExpression([
				factory.createTrue(),
				factory.createFalse(),
			]);

			const expected = [true, false];

			const result = transformArrayLiteralExpressionToArrayLiteral(node);

			expect(result).toEqual(expected);
		});

		it("should transform a null array", () => {
			const node = factory.createArrayLiteralExpression([
				factory.createNull(),
			]);

			const expected = [null];

			const result = transformArrayLiteralExpressionToArrayLiteral(node);

			expect(result).toEqual(expected);
		});

		it("should transform a nested array", () => {
			const node = factory.createArrayLiteralExpression([
				factory.createArrayLiteralExpression([
					factory.createStringLiteral("John Doe"),
				]),
			]);

			const expected = [["John Doe"]];

			const result = transformArrayLiteralExpressionToArrayLiteral(node);

			expect(result).toEqual(expected);
		});

		it("should transform a record array", () => {
			const node = factory.createArrayLiteralExpression([
				factory.createObjectLiteralExpression([
					factory.createPropertyAssignment(
						"name",
						factory.createStringLiteral("John Doe"),
					),
				]),
			]);

			const expected = [
				{
					name: "John Doe",
				},
			];

			const result = transformArrayLiteralExpressionToArrayLiteral(node);

			expect(result).toEqual(expected);
		});
	});

	describe("compareTypeNodes", () => {
		it("should compare two different primitive type nodes", () => {
			const node1 = factory.createKeywordTypeNode(
				SyntaxKind.StringKeyword,
			);
			const node2 = factory.createLiteralTypeNode(factory.createNull());

			const result = compareTypeNodes(node1, node2);
			expect(result).toBe(false);
		});

		it("should compare two equal primitive type nodes", () => {
			const node1 = factory.createKeywordTypeNode(
				SyntaxKind.StringKeyword,
			);
			const node2 = factory.createKeywordTypeNode(
				SyntaxKind.StringKeyword,
			);

			const result = compareTypeNodes(node1, node2);
			expect(result).toBe(true);
		});

		it("should compare two different array type nodes", () => {
			const node1 = factory.createArrayTypeNode(
				factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
			);
			const node2 = factory.createArrayTypeNode(
				factory.createKeywordTypeNode(SyntaxKind.NumberKeyword),
			);

			const result = compareTypeNodes(node1, node2);
			expect(result).toBe(false);
		});

		it("should compare two equal array type nodes", () => {
			const node1 = factory.createArrayTypeNode(
				factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
			);
			const node2 = factory.createArrayTypeNode(
				factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
			);

			const result = compareTypeNodes(node1, node2);
			expect(result).toBe(true);
		});

		it("should compare two different union type nodes", () => {
			const node1 = factory.createUnionTypeNode([
				factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
				factory.createLiteralTypeNode(factory.createNull()),
			]);
			const node2 = factory.createUnionTypeNode([
				factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
				factory.createKeywordTypeNode(SyntaxKind.BooleanKeyword),
			]);

			const result = compareTypeNodes(node1, node2);
			expect(result).toBe(false);
		});

		it("should compare two equal union type nodes", () => {
			const node1 = factory.createUnionTypeNode([
				factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
				factory.createKeywordTypeNode(SyntaxKind.NumberKeyword),
			]);
			const node2 = factory.createUnionTypeNode([
				factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
				factory.createKeywordTypeNode(SyntaxKind.NumberKeyword),
			]);

			const result = compareTypeNodes(node1, node2);
			expect(result).toBe(true);
		});

		it("should compare two different intersection type nodes", () => {
			const node1 = factory.createIntersectionTypeNode([
				factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
				factory.createKeywordTypeNode(SyntaxKind.NumberKeyword),
			]);
			const node2 = factory.createIntersectionTypeNode([
				factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
				factory.createKeywordTypeNode(SyntaxKind.BooleanKeyword),
			]);

			const result = compareTypeNodes(node1, node2);
			expect(result).toBe(false);
		});

		it("should compare two equal intersection type nodes", () => {
			const node1 = factory.createIntersectionTypeNode([
				factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
				factory.createKeywordTypeNode(SyntaxKind.NumberKeyword),
			]);
			const node2 = factory.createIntersectionTypeNode([
				factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
				factory.createKeywordTypeNode(SyntaxKind.NumberKeyword),
			]);

			const result = compareTypeNodes(node1, node2);
			expect(result).toBe(true);
		});
	});
});
