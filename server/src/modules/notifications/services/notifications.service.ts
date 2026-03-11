import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Notification, NotificationType } from '../models/notification.model';
import { User } from '../../users/models/user.model';
import { NotificationsGateway } from '../gateways/notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification)
    private notificationModel: typeof Notification,
    @InjectModel(User)
    private userModel: typeof User,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async findAll(userId: string) {
    return this.notificationModel.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit: 20,
    });
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.notificationModel.findOne({
      where: { id, user_id: userId },
    });
    if (notification) {
      await notification.update({ is_read: true });
    }
    return notification;
  }

  async markAllAsRead(userId: string) {
    return this.notificationModel.update({ is_read: true }, { where: { user_id: userId, is_read: false } });
  }

  async create(userId: string, type: NotificationType, title: string, content: string, referenceId?: string) {
    const notification = await this.notificationModel.create({
      user_id: userId,
      type,
      title,
      content,
      reference_id: referenceId,
    });

    this.notificationsGateway.sendToUser(userId, 'newNotification', notification);
    return notification;
  }

  async notifyAllAlumni(type: NotificationType, title: string, content: string, referenceId?: string) {
    const alumni = await this.userModel.findAll({ where: { role: 'ALUMNI' } });

    const notifications = alumni.map((user) => ({
      user_id: user.id,
      type,
      title,
      content,
      reference_id: referenceId,
    }));

    const createdNotifications = await this.notificationModel.bulkCreate(notifications);

    // Notify via WS
    alumni.forEach((user) => {
      this.notificationsGateway.sendToUser(user.id, 'newNotification', {
        type,
        title,
        content,
        reference_id: referenceId,
      });
    });

    return createdNotifications;
  }
}
