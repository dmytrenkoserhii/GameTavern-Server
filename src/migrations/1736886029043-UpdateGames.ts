import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateGames1736886029043 implements MigrationInterface {
    name = 'UpdateGames1736886029043'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "games" DROP CONSTRAINT "FK_f55265bb2a4b94bdfa0516a767b"`);
        await queryRunner.query(`ALTER TABLE "games" ALTER COLUMN "listId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "games" ADD CONSTRAINT "UQ_b3cc0e241d681632afe7a72bda1" UNIQUE ("gameApiId", "listId")`);
        await queryRunner.query(`ALTER TABLE "games" ADD CONSTRAINT "FK_f55265bb2a4b94bdfa0516a767b" FOREIGN KEY ("listId") REFERENCES "lists"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "games" DROP CONSTRAINT "FK_f55265bb2a4b94bdfa0516a767b"`);
        await queryRunner.query(`ALTER TABLE "games" DROP CONSTRAINT "UQ_b3cc0e241d681632afe7a72bda1"`);
        await queryRunner.query(`ALTER TABLE "games" ALTER COLUMN "listId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "games" ADD CONSTRAINT "FK_f55265bb2a4b94bdfa0516a767b" FOREIGN KEY ("listId") REFERENCES "lists"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
