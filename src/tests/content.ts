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
			decoratorOptions
		}
	};
})();


export const columns = (() => {

	return {
		examples: {

		}
	}
})()
