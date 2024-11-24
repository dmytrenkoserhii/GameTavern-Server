import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveUserAccountFields1732470090645 implements MigrationInterface {
  name = 'RemoveUserAccountFields1732470090645';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "biography"`);
    await queryRunner.query(`ALTER TABLE "accounts" DROP COLUMN "phone"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isAccountFilled"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "isAccountFilled" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(`ALTER TABLE "accounts" ADD "phone" character varying`);
    await queryRunner.query(`ALTER TABLE "accounts" ADD "biography" character varying`);
  }
}
