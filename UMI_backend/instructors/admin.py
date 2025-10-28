from django.contrib import admin
from .models import Instructor

@admin.register(Instructor)
class InstructorAdmin(admin.ModelAdmin):
    list_display = ['name', 'employee_id', 'department', 'designation', 'hire_date', 'image_display']
    list_filter = ['department', 'designation', 'hire_date', 'gender']
    search_fields = ['name', 'employee_id', 'user__email']
    readonly_fields = ['user', 'image_display']

    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'employee_id', 'name', 'phone', 'department', 'designation', 'hire_date', 'date_of_birth', 'gender', 'blood_group')
        }),
        ('Professional Details', {
            'fields': ('specialization', 'experience_years', 'salary', 'address')
        }),
        ('Profile Image', {
            'fields': ('image', 'image_display')
        }),
        ('AI Fields', {
            'fields': ('ai_profile_notes', 'ai_last_generated'),
            'classes': ('collapse',)
        }),
    )

    def image_display(self, obj):
        if obj.image:
            return f'<img src="{obj.image.url}" width="100" height="100" style="object-fit: cover; border-radius: 50%;" />'
        return "No image"
    image_display.short_description = 'Profile Image'
    image_display.allow_tags = True

    def save_model(self, request, obj, form, change):
        # Ensure the image is properly saved
        if 'image' in form.changed_data and obj.image:
            # Force save to ensure the file is properly stored
            obj.image.save(obj.image.name, obj.image.file, save=False)
        super().save_model(request, obj, form, change)
