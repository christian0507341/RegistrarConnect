from django.core.management.base import BaseCommand
from appointments.services import AutomaticAppointmentService
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Automatically schedule appointments for ready document requests'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be scheduled without actually scheduling',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        try:
            if dry_run:
                self.stdout.write("DRY RUN: Would check for ready requests...")
                # In a real implementation, you might want to show what would be scheduled
                self.stdout.write(
                    self.style.SUCCESS('Dry run completed - no appointments were scheduled')
                )
            else:
                scheduled_count = AutomaticAppointmentService.check_and_schedule_ready_requests()
                
                if scheduled_count > 0:
                    self.stdout.write(
                        self.style.SUCCESS(f'Successfully scheduled {scheduled_count} appointments')
                    )
                else:
                    self.stdout.write(
                        self.style.WARNING('No ready requests found to schedule')
                    )
                    
        except Exception as e:
            logger.error(f"Error in schedule_appointments command: {str(e)}")
            self.stdout.write(
                self.style.ERROR(f'Error scheduling appointments: {str(e)}')
            )
            raise
