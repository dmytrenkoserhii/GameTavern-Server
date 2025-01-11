import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGamesTable1736294411764 implements MigrationInterface {
  name = 'CreateGamesTable1736294411764';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "games" ("id" SERIAL NOT NULL, "gameApiId" integer NOT NULL, "name" character varying NOT NULL, "coverUrl" character varying, "orderNumber" integer NOT NULL, "listId" integer NOT NULL, CONSTRAINT "PK_c9b16b62917b5595af982d66337" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "games" ADD CONSTRAINT "FK_f55265bb2a4b94bdfa0516a767b" FOREIGN KEY ("listId") REFERENCES "lists"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "games" DROP CONSTRAINT "FK_f55265bb2a4b94bdfa0516a767b"`);
    await queryRunner.query(`DROP TABLE "games"`);
  }
}
