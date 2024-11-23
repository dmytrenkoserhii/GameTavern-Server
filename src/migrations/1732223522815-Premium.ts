import { MigrationInterface, QueryRunner } from 'typeorm';

export class Premium1732223522815 implements MigrationInterface {
  name = 'Premium1732223522815';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "isPremium" boolean NOT NULL DEFAULT false`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isPremium"`);
  }
}
