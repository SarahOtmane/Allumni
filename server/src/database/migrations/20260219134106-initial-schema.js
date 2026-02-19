'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Users Table
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.CHAR(36),
        primaryKey: true,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password_hash: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      role: {
        type: Sequelize.ENUM('ADMIN', 'STAFF', 'ALUMNI'),
        allowNull: false,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      activation_token: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      token_expires_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    // 2. Alumni Profiles Table
    await queryInterface.createTable('alumni_profiles', {
      id: {
        type: Sequelize.CHAR(36),
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.CHAR(36),
        allowNull: false,
        unique: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      first_name: { type: Sequelize.STRING, allowNull: false },
      last_name: { type: Sequelize.STRING, allowNull: false },
      promo_year: { type: Sequelize.INTEGER },
      diploma: { type: Sequelize.STRING },
      linkedin_url: { type: Sequelize.STRING },
      current_position: { type: Sequelize.STRING },
      company: { type: Sequelize.STRING },
      status: {
        type: Sequelize.ENUM('OPEN_TO_WORK', 'HIRED', 'STUDENT', 'UNKNOWN'),
        defaultValue: 'UNKNOWN',
      },
      data_enriched: { type: Sequelize.BOOLEAN, defaultValue: false },
      created_at: { allowNull: false, type: Sequelize.DATE },
      updated_at: { allowNull: false, type: Sequelize.DATE },
    });

    // 3. Job Offers Table
    await queryInterface.createTable('job_offers', {
      id: { type: Sequelize.CHAR(36), primaryKey: true, allowNull: false },
      author_id: {
        type: Sequelize.CHAR(36),
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      title: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: false },
      company: { type: Sequelize.STRING, allowNull: false },
      location: { type: Sequelize.STRING, allowNull: false },
      type: {
        type: Sequelize.ENUM('FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'FREELANCE'),
        allowNull: false,
      },
      salary_range: { type: Sequelize.STRING },
      status: {
        type: Sequelize.ENUM('ACTIVE', 'CLOSED'),
        defaultValue: 'ACTIVE',
      },
      created_at: { allowNull: false, type: Sequelize.DATE },
      updated_at: { allowNull: false, type: Sequelize.DATE },
    });

    // 4. Events Table
    await queryInterface.createTable('events', {
      id: { type: Sequelize.CHAR(36), primaryKey: true, allowNull: false },
      author_id: {
        type: Sequelize.CHAR(36),
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      title: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: false },
      date: { type: Sequelize.DATE, allowNull: false },
      location: { type: Sequelize.STRING, allowNull: false },
      max_participants: { type: Sequelize.INTEGER },
      created_at: { allowNull: false, type: Sequelize.DATE },
      updated_at: { allowNull: false, type: Sequelize.DATE },
    });

    // 5. Event Registrations Table
    await queryInterface.createTable('event_registrations', {
      id: { type: Sequelize.CHAR(36), primaryKey: true, allowNull: false },
      event_id: {
        type: Sequelize.CHAR(36),
        allowNull: false,
        references: { model: 'events', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      user_id: {
        type: Sequelize.CHAR(36),
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      created_at: { allowNull: false, type: Sequelize.DATE },
      updated_at: { allowNull: false, type: Sequelize.DATE },
    });

    // 6. Conversations Table
    await queryInterface.createTable('conversations', {
      id: { type: Sequelize.CHAR(36), primaryKey: true, allowNull: false },
      created_at: { allowNull: false, type: Sequelize.DATE },
      updated_at: { allowNull: false, type: Sequelize.DATE },
    });

    // 7. Conversation Participants Table
    await queryInterface.createTable('conversation_participants', {
      id: { type: Sequelize.CHAR(36), primaryKey: true, allowNull: false },
      conversation_id: {
        type: Sequelize.CHAR(36),
        allowNull: false,
        references: { model: 'conversations', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      user_id: {
        type: Sequelize.CHAR(36),
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      created_at: { allowNull: false, type: Sequelize.DATE },
      updated_at: { allowNull: false, type: Sequelize.DATE },
    });

    // 8. Messages Table
    await queryInterface.createTable('messages', {
      id: { type: Sequelize.CHAR(36), primaryKey: true, allowNull: false },
      conversation_id: {
        type: Sequelize.CHAR(36),
        allowNull: false,
        references: { model: 'conversations', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      sender_id: {
        type: Sequelize.CHAR(36),
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      content: { type: Sequelize.TEXT, allowNull: false },
      is_read: { type: Sequelize.BOOLEAN, defaultValue: false },
      created_at: { allowNull: false, type: Sequelize.DATE },
      updated_at: { allowNull: false, type: Sequelize.DATE },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('messages');
    await queryInterface.dropTable('conversation_participants');
    await queryInterface.dropTable('conversations');
    await queryInterface.dropTable('event_registrations');
    await queryInterface.dropTable('events');
    await queryInterface.dropTable('job_offers');
    await queryInterface.dropTable('alumni_profiles');
    await queryInterface.dropTable('users');
  },
};
