import { Column, Entity } from "typeorm";
@Entity('TEST', { orderBy: { prop: 'ASC' }})
export class Test {
	@Column('varchar', { nullable: false })
	public prop: string;
	public num: number;

	public f() {
		return 9;
	}
}