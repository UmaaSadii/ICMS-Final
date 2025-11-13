# Generated migration for hods app

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='HOD',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('employee_id', models.CharField(blank=True, max_length=50, null=True, unique=True)),
                ('name', models.CharField(max_length=100)),
                ('email', models.EmailField(max_length=254)),
                ('phone', models.CharField(max_length=20)),
                ('designation', models.CharField(default='Head of Department', max_length=100)),
                ('hire_date', models.DateField(blank=True, null=True)),
                ('date_of_birth', models.DateField(blank=True, null=True)),
                ('gender', models.CharField(blank=True, choices=[('M', 'Male'), ('F', 'Female'), ('O', 'Other')], max_length=1, null=True)),
                ('specialization', models.CharField(max_length=100)),
                ('experience_years', models.IntegerField(default=0)),
                ('image', models.ImageField(blank=True, null=True, upload_to='hod_images/')),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('department', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='academics.Department')),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='hod_profile', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Head of Department',
                'verbose_name_plural': 'Heads of Department',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='HODRegistrationRequest',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('email', models.EmailField(max_length=254)),
                ('employee_id', models.CharField(max_length=50)),
                ('phone', models.CharField(max_length=20)),
                ('designation', models.CharField(default='HOD', max_length=100)),
                ('experience_years', models.IntegerField(default=0)),
                ('specialization', models.CharField(max_length=100)),
                ('password', models.CharField(max_length=128)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected'), ('retired', 'Retired')], default='pending', max_length=10)),
                ('requested_at', models.DateTimeField(auto_now_add=True)),
                ('reviewed_at', models.DateTimeField(blank=True, null=True)),
                ('rejection_reason', models.TextField(blank=True)),
                ('hod_request_status', models.CharField(choices=[('pending_approval', 'Pending Approval'), ('approved', 'Approved'), ('rejected', 'Rejected'), ('account_created', 'Account Created')], default='pending_approval', max_length=20)),
                ('department', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='academics.Department')),
                ('reviewed_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-requested_at'],
            },
        ),
    ]