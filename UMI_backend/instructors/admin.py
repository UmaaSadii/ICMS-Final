from django.contrib import admin
from .models import Instructor, HOD

@admin.register(Instructor)
class InstructorAdmin(admin.ModelAdmin):
    list_display = ['employee_id', 'name', 'get_email', 'department', 'designation', 'phone']
    list_filter = ['department', 'designation', 'hire_date']
    search_fields = ['employee_id', 'name', 'phone', 'user__email']
    raw_id_fields = ['user']
    
    def get_email(self, obj):
        return obj.user.email if obj.user else 'No email'
    get_email.short_description = 'Email'
    get_email.admin_order_field = 'user__email'
<<<<<<< HEAD
=======


@admin.register(HOD)
class HODAdmin(admin.ModelAdmin):
    list_display = ['employee_id', 'name', 'email', 'department', 'designation', 'hire_date', 'is_active']
    list_filter = ['department', 'is_active', 'hire_date', 'created_at']
    search_fields = ['employee_id', 'name', 'email', 'phone']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'employee_id', 'name', 'email', 'phone')
        }),
        ('Professional Details', {
            'fields': ('department', 'designation', 'specialization', 'experience_years', 'hire_date')
        }),
        ('Personal Information', {
            'fields': ('date_of_birth', 'gender', 'image')
        }),
        ('Status', {
            'fields': ('is_active', 'created_at', 'updated_at')
        }),
    )
>>>>>>> 3d3a4f2babdb60e79974b0213dc7f76ad7cfd119
