import { describe, expect, it } from "vitest";
import { factory } from "typescript";
import { transformArrayLiteralExpressionToArrayLiteral, transformObjectExpressionToObjectLiteral } from "./utils.js";

describe("utils", () => {
	describe("transformObjectExpressionToObjectLiteral", () => {
		it("should transform a string record", () => {
			const property = factory.createPropertyAssignment("name", factory.createStringLiteral("John Doe"));
			const node = factory.createObjectLiteralExpression([
				property
			]);

			const expected = {
				name: "John Doe"
			};

			const result = transformObjectExpressionToObjectLiteral(node);

			expect(result).toEqual(expected);
		});

		it("should transform a number record", () => {
			const property = factory.createPropertyAssignment("age", factory.createNumericLiteral("42"));
			const node = factory.createObjectLiteralExpression([
				property
			]);

			const expected = {
				age: 42
			};

			const result = transformObjectExpressionToObjectLiteral(node);

			expect(result).toEqual(expected);
		});

		it("should transform a boolean record", () => {
			const trueProperty = factory.createPropertyAssignment("isTrue", factory.createTrue());
			const falseProperty = factory.createPropertyAssignment("isFalse", factory.createFalse());

			const node = factory.createObjectLiteralExpression([
				trueProperty,
				falseProperty
			]);

			const expected = {
				isTrue: true,
				isFalse: false
			};

			const result = transformObjectExpressionToObjectLiteral(node);

			expect(result).toEqual(expected);
		});

		it("should transform a null record", () => {
			const property = factory.createPropertyAssignment("isNull", factory.createNull());
			const node = factory.createObjectLiteralExpression([
				property
			]);

			const expected = {
				isNull: null
			};

			const result = transformObjectExpressionToObjectLiteral(node);

			expect(result).toEqual(expected);
		});

		it("should transform a nested record", () => {
			const property = factory.createPropertyAssignment("nested", factory.createObjectLiteralExpression([
				factory.createPropertyAssignment("name", factory.createStringLiteral("John Doe"))
			]));
			const node = factory.createObjectLiteralExpression([
				property
			]);

			const expected = {
				nested: {
					name: "John Doe"
				}
			};

			const result = transformObjectExpressionToObjectLiteral(node);

			expect(result).toEqual(expected);
		});

		it("should transform a record with an array", () => {
			const property = factory.createPropertyAssignment("array", factory.createArrayLiteralExpression([
				factory.createStringLiteral("John Doe"),
				factory.createNumericLiteral("42"),
				factory.createTrue(),
				factory.createFalse(),
				factory.createNull()
			]));
			const node = factory.createObjectLiteralExpression([
				property
			]);

			const expected = {
				array: [
					"John Doe",
					42,
					true,
					false,
					null
				]
			};

			const result = transformObjectExpressionToObjectLiteral(node);

			expect(result).toEqual(expected);
		});
	});

	describe("transformArrayLiteralExpressionToArrayLiteral", () => {
		it("should transform a string array", () => {
			const node = factory.createArrayLiteralExpression([
				factory.createStringLiteral("John Doe")
			]);

			const expected = [
				"John Doe"
			];

			const result = transformArrayLiteralExpressionToArrayLiteral(node);

			expect(result).toEqual(expected);
		});

		it("should transform a number array", () => {
			const node = factory.createArrayLiteralExpression([
				factory.createNumericLiteral("42")
			]);

			const expected = [
				42
			];

			const result = transformArrayLiteralExpressionToArrayLiteral(node);

			expect(result).toEqual(expected);
		})

		it("should transform a boolean array", () => {
			const node = factory.createArrayLiteralExpression([
				factory.createTrue(),
				factory.createFalse()
			]);



			const expected = [
				true,
				false
			];

			const result = transformArrayLiteralExpressionToArrayLiteral(node);

			expect(result).toEqual(expected);
		})

		it("should transform a null array", () => {
			const node = factory.createArrayLiteralExpression([
				factory.createNull(),
			]);

			const expected = [
				null,
			];

			const result = transformArrayLiteralExpressionToArrayLiteral(node);

			expect(result).toEqual(expected);
		})

		it("should transform a nested array", () => {
			const node = factory.createArrayLiteralExpression([
				factory.createArrayLiteralExpression([
					factory.createStringLiteral("John Doe")
				])
			]);

			const expected = [
				[
					"John Doe"
				]
			];

			const result = transformArrayLiteralExpressionToArrayLiteral(node);

			expect(result).toEqual(expected);
		});

		it("should transform a record array", () => {
			const node = factory.createArrayLiteralExpression([
				factory.createObjectLiteralExpression([
					factory.createPropertyAssignment("name", factory.createStringLiteral("John Doe"))
				])
			]);

			const expected = [
				{
					name: "John Doe"
				}
			];

			const result = transformArrayLiteralExpressionToArrayLiteral(node);

			expect(result).toEqual(expected);
		})
	});
});
