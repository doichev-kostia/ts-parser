import { factory, SyntaxKind } from "typescript";

export const entityNames = (() => {
	const noName = `
export class Test {

}
`;

	const className = `
@Entity()
export class Test {

}
`;

	const decoratorString = `
@Entity('Test')
export class Name {

}
`;

	const decoratorOptions = `
@Entity({ name: "Test" })
export class Name {

}
`;

	return {
		correctName: "Test",
		examples: {
			noName,
			className,
			decoratorString,
			decoratorOptions,
		},
	};
})();

export const columnNames = (() => {
	const withoutColumn = `
@Entity()
export class Test {
	public prop: string;
}
`;

	const withColumn = `
@Entity()
export class Test {
	@Column()
	public prop: string;
}
`;

	const withMultipleColumns = `
@Entity()
export class Test {
	@Column()
	public prop: string;
	
	@Column({ name: "prop2" })
	public prop5: string;
	
	@Column("varchar", { name: "prop3" })
	public prop6: string;
}
`;

	return {
		withoutColumn: {
			code: withoutColumn,
			columns: [],
		},
		withColumn: {
			code: withColumn,
			columns: ["prop"],
		},
		withMultipleColumns: {
			code: withMultipleColumns,
			columns: ["prop", "prop2", "prop3"],
		},
	};
})();

export const columnTypes = (() => {
	const withoutColumn = `
@Entity()
export class Test {
	public prop: string;
}
`;

	const inferFromPrimitiveType = `
@Entity()
export class Test {
	@Column()
	public prop: string;
}
`;

	const inferFromTypeUnion = `
@Entity()
export class Test {
	@Column()
	public prop: string | null;
`;

	const inferFromOptionalType = `
@Entity()
export class Test {
	@Column()
	public prop?: string;
`;

	const options = `
@Entity()
export class Test {
	@Column("varchar", { length: 255 })
	public prop: string;
	
	@Column({ type: "int" })
	public prop2: number;
	
	@Column("varchar", { length: 255, nullable: true })
	public prop3: string | null;
	
	@Column("varchar", { length: 255, nullable: true })
	public prop4: string;
`;

	return {
		withoutColumn: {
			code: withoutColumn,
			types: [],
		},
		inferFromPrimitiveType: {
			code: inferFromPrimitiveType,
			types: [factory.createKeywordTypeNode(SyntaxKind.StringKeyword)],
		},
		inferFromTypeUnion: {
			code: inferFromTypeUnion,
			types: [
				factory.createUnionTypeNode([
					factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
					factory.createLiteralTypeNode(factory.createNull()),
				]),
			],
		},
		inferFromOptionalType: {
			code: inferFromOptionalType,
			types: [factory.createKeywordTypeNode(SyntaxKind.StringKeyword)],
		},
		options: {
			code: options,
			types: [
				factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
				factory.createKeywordTypeNode(SyntaxKind.NumberKeyword),
				factory.createUnionTypeNode([
					factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
					factory.createLiteralTypeNode(factory.createNull()),
				]),
				factory.createUnionTypeNode([
					factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
					factory.createLiteralTypeNode(factory.createNull()),
				]),
			],
		},
	};
})();

export const nonRelationalEntities = (() => {
	const noEntity = `
export class Test {
	@Column()
	public prop: string;
}
`;

	const entityWithoutColumns = `
@Entity()
export class Test {
	public prop: string;
}
`;

	const entityWithColumns = `
@Entity('my_entity')
export class Test {
	@Column()
	public prop: string;
	
	public prop2: number;
	
	@Column("boolean")
	public prop3: boolean;
	
	@Column({ type: "varchar", length: 255 })
	public prop4: string;
	
	@Column({ type: "varchar", length: 255, nullable: true })
	public prop5: string | null;
	
	@Column({ type: "varchar", length: 255, array: true })
	public prop6: string[];	
}
`;

	return {
		noEntity: {
			code: noEntity,
			interface: null,
		},
		entityWithoutColumns: {
			code: entityWithoutColumns,
			interface: null,
		},
		entityWithColumns: {
			code: entityWithColumns,
			interface: factory.createInterfaceDeclaration(
				undefined,
				factory.createIdentifier("MyEntityTable"),
				undefined,
				undefined,
				[
					factory.createPropertySignature(
						undefined,
						factory.createIdentifier("prop"),
						undefined,
						factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
					),
					factory.createPropertySignature(
						undefined,
						factory.createIdentifier("prop3"),
						undefined,
						factory.createKeywordTypeNode(
							SyntaxKind.BooleanKeyword,
						),
					),
					factory.createPropertySignature(
						undefined,
						factory.createIdentifier("prop4"),
						undefined,
						factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
					),
					factory.createPropertySignature(
						undefined,
						factory.createIdentifier("prop5"),
						undefined,
						factory.createUnionTypeNode([
							factory.createKeywordTypeNode(
								SyntaxKind.StringKeyword,
							),
							factory.createLiteralTypeNode(factory.createNull()),
						]),
					),
					factory.createPropertySignature(
						undefined,
						factory.createIdentifier("prop6"),
						undefined,
						factory.createArrayTypeNode(
							factory.createKeywordTypeNode(
								SyntaxKind.StringKeyword,
							),
						),
					),
				],
			),
		},
	};
})();
