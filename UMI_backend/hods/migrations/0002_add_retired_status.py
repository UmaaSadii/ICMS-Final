# Generated migration to add retired status

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('hods', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='hodregistrationrequest',
            name='status',
            field=models.CharField(
                choices=[
                    ('pending', 'Pending'), 
                    ('approved', 'Approved'), 
                    ('rejected', 'Rejected'),
                    ('retired', 'Retired')
                ], 
                default='pending', 
                max_length=10
            ),
        ),
    ]