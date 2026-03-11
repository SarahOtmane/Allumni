'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add missing columns to alumni_profiles
    const tableInfo = await queryInterface.describeTable('alumni_profiles');

    if (!tableInfo.scraping_status) {
      await queryInterface.addColumn('alumni_profiles', 'scraping_status', {
        type: Sequelize.ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'),
        defaultValue: 'PENDING',
        allowNull: false,
      });
    }

    if (!tableInfo.scraping_error) {
      await queryInterface.addColumn('alumni_profiles', 'scraping_error', {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }

    if (!tableInfo.last_scraped_at) {
      await queryInterface.addColumn('alumni_profiles', 'last_scraped_at', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }

    // Add missing columns to alumni_experiences
    const expTableInfo = await queryInterface.describeTable('alumni_experiences');

    if (!expTableInfo.duration) {
      await queryInterface.addColumn('alumni_experiences', 'duration', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    if (!expTableInfo.description) {
      await queryInterface.addColumn('alumni_experiences', 'description', {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    // We don't necessarily want to remove columns that might have been added by other migrations
    // but for completeness of the revert:
    try {
      await queryInterface.removeColumn('alumni_profiles', 'last_scraped_at');
      await queryInterface.removeColumn('alumni_experiences', 'duration');
      await queryInterface.removeColumn('alumni_experiences', 'description');
    } catch (e) {
      // ignore errors during down migration
    }
  },
};
