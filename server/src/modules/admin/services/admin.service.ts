import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../../users/models/user.model';
import { AlumniProfile } from '../../alumni/models/alumni-profile.model';
import { Event } from '../../events/models/event.model';
import { JobOffer } from '../../jobs/models/job-offer.model';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    @InjectModel(AlumniProfile)
    private alumniModel: typeof AlumniProfile,
    @InjectModel(Event)
    private eventModel: typeof Event,
    @InjectModel(JobOffer)
    private jobModel: typeof JobOffer,
  ) {}

  async getStats() {
    const [promotionsCount, totalAlumni, activeAlumni, staffCount, adminCount, eventsCount, jobsCount] =
      await Promise.all([
        this.alumniModel.count({
          distinct: true,
          col: 'promo_year',
        }),
        this.userModel.count({ where: { role: 'ALUMNI' } }),
        this.userModel.count({ where: { role: 'ALUMNI', is_active: true } }),
        this.userModel.count({ where: { role: 'STAFF' } }),
        this.userModel.count({ where: { role: 'ADMIN' } }),
        this.eventModel.count(),
        this.jobModel.count(),
      ]);

    return {
      promotionsCount,
      alumni: {
        total: totalAlumni,
        active: activeAlumni,
        inactive: totalAlumni - activeAlumni,
      },
      staffCount,
      adminCount,
      eventsCount,
      jobsCount,
    };
  }
}
