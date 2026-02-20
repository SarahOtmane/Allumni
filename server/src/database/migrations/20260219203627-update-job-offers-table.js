'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Add new columns
    await queryInterface.addColumn('job_offers', 'company_description', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('job_offers', 'profile_description', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('job_offers', 'missions', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('job_offers', 'start_date', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('job_offers', 'link', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // 2. Change the 'type' column to the new requested ENUM
    // Note: This is tricky in MySQL with ENUMs. We'll change it to STRING temporarily or just redefine it.
    await queryInterface.changeColumn('job_offers', 'type', {
      type: Sequelize.ENUM('CDI', 'CDD', 'PRESTATAIRE'),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('job_offers', 'company_description');
    await queryInterface.removeColumn('job_offers', 'profile_description');
    await queryInterface.removeColumn('job_offers', 'missions');
    await queryInterface.removeColumn('job_offers', 'start_date');
    await queryInterface.removeColumn('job_offers', 'link');
    
    await queryInterface.changeColumn('job_offers', 'type', {
      type: Sequelize.ENUM('FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'FREELANCE'),
      allowNull: false,
    });
  },
};
