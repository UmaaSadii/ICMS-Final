# Generated manually for HOD image and hire date fields

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('hods', '0002_add_retired_status'),
    ]

    operations = [
        migrations.AddField(
            model_name='hodregistrationrequest',
            name='image',
            field=models.ImageField(blank=True, null=True, upload_to='hod_request_images/'),
        ),
        migrations.AddField(
            model_name='hodregistrationrequest',
            name='hire_date',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='hodregistrationrequest',
            name='retired_date',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='hodregistrationrequest',
            name='updated_at',
            field=models.DateTimeField(auto_now=True, blank=True, null=True),
        ),
    ]