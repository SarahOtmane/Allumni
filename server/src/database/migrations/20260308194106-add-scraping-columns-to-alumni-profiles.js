'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('alumni_profiles', 'scraping_status', {
      type: Sequelize.ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'),
      defaultValue: 'PENDING',
      allowNull: false,
    });
    await queryInterface.addColumn('alumni_profiles', 'scraping_error', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('alumni_profiles', 'scraping_status');
    await queryInterface.removeColumn('alumni_profiles', 'scraping_error');
  },
};
