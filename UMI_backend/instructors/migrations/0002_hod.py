# Generated migration for HOD model

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('register', '0001_initial'),
        ('academics', '0001_initial'),
        ('instructors', '0001_initial'),
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
                ('department', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='academics.department')),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='hod_profile', to='register.user')),
            ],
            options={
                'verbose_name': 'Head of Department',
                'verbose_name_plural': 'Heads of Department',
                'ordering': ['-created_at'],
            },
        ),
    ]