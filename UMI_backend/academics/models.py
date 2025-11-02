from django.db import models
from datetime import date

# ---------- Department ----------
class Department(models.Model):
    department_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=10, unique=True)
    description = models.TextField(blank=True)
    num_semesters = models.PositiveIntegerField(default=8)

    def __str__(self):
        return f"{self.name} ({self.code})"

# ---------- Semester ----------
class Semester(models.Model):
    semester_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    semester_code = models.CharField(max_length=10, unique=True)
    program = models.CharField(max_length=100)
    capacity = models.PositiveIntegerField(default=30)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name="semesters")

    def __str__(self):
        return f"{self.name} ({self.semester_code}) - {self.department.name}"

    @property
    def is_base_semester(self):
        """Check if this semester is a base semester (odd numbered)"""
        try:
            semester_num = int(self.name.split()[-1])
            return semester_num % 2 == 1
        except (ValueError, IndexError):
            return False

    @property
    def base_semester(self):
        """Get the base semester for this semester"""
        if self.is_base_semester:
            return self
        try:
            semester_num = int(self.name.split()[-1])
            base_num = semester_num - 1
            base_name = f"Semester {base_num}"
            return Semester.objects.filter(
                department=self.department,
                name=base_name
            ).first()
        except (ValueError, IndexError, Semester.DoesNotExist):
            return None

# ---------- Course ----------
class Course(models.Model):
    course_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10, unique=True)
    description = models.TextField(blank=True)
    credits = models.PositiveIntegerField(default=3)
    semester = models.ForeignKey(Semester, on_delete=models.CASCADE, related_name="courses", null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.code})"

# ---------- Timetable ----------
class Timetable(models.Model):
    DAY_CHOICES = [
        ('monday', 'Monday'),
        ('tuesday', 'Tuesday'),
        ('wednesday', 'Wednesday'),
        ('thursday', 'Thursday'),
        ('friday', 'Friday'),
        ('saturday', 'Saturday'),
        ('sunday', 'Sunday'),
    ]
    
    timetable_id = models.AutoField(primary_key=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="timetables")
    instructor = models.ForeignKey("instructors.Instructor", on_delete=models.CASCADE, related_name="timetables")
    day = models.CharField(max_length=10, choices=DAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    room = models.CharField(max_length=50, blank=True)
    
    class Meta:
        unique_together = ['course', 'day', 'start_time']
        ordering = ['day', 'start_time']
    
    def __str__(self):
        return f"{self.course.name} - {self.day} {self.start_time}-{self.end_time}"

# ---------- Attendance ----------
class Attendance(models.Model):
    PRESENT = "Present"
    ABSENT = "Absent"
    LATE = "Late"
    STATUS_CHOICES = [(PRESENT, "Present"), (ABSENT, "Absent"), (LATE, "Late")]

    attendance_id = models.AutoField(primary_key=True)
    student = models.ForeignKey("students.Student", on_delete=models.CASCADE, related_name="attendances")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="attendances", null=True, blank=True)
    instructor = models.ForeignKey("instructors.Instructor", on_delete=models.CASCADE, related_name="marked_attendances", null=True, blank=True)
    timetable = models.ForeignKey(Timetable, on_delete=models.CASCADE, related_name="attendances", null=True, blank=True)
    date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    marked_by = models.ForeignKey("instructors.Instructor", on_delete=models.SET_NULL, null=True, blank=True, related_name="attendance_records")
    is_submitted = models.BooleanField(default=False)
    can_edit = models.BooleanField(default=True)
    admin_approved_edit = models.BooleanField(default=False)

    class Meta:
        unique_together = ("student", "timetable", "date")
        ordering = ["-date"]

    def __str__(self):
        return f"{self.student.name} - {self.date} ({self.status})"

# ---------- Attendance Edit Permission ----------
class AttendanceEditPermission(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    permission_id = models.AutoField(primary_key=True)
    instructor = models.ForeignKey("instructors.Instructor", on_delete=models.CASCADE, related_name="edit_requests")
    attendance = models.ForeignKey(Attendance, on_delete=models.CASCADE, related_name="edit_permissions")
    reason = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    requested_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey("register.User", on_delete=models.SET_NULL, null=True, blank=True, related_name="reviewed_permissions")
    
    class Meta:
        ordering = ['-requested_at']
    
    def __str__(self):
        return f"Edit request by {self.instructor.name} - {self.status}"


# ---------- Result ----------
class Result(models.Model):
    result_id = models.AutoField(primary_key=True)
    student = models.ForeignKey("students.Student", on_delete=models.CASCADE, related_name="results")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="results", null=True, blank=True)
    exam_type = models.CharField(max_length=50, blank=True, default="Mid Exam")  # e.g. Mid, Final
    exam_date = models.DateField(null=True, blank=True, default=date(2025,9,25))

    # Marks structure: 2 quizzes (5 marks each), 2 assignments (5 marks each), mid-term (25 marks), final (60 marks)
    quiz1_marks = models.FloatField(default=0)        # Max 5
    quiz2_marks = models.FloatField(default=0)        # Max 5
    assignment1_marks = models.FloatField(default=0)  # Max 5
    assignment2_marks = models.FloatField(default=0)  # Max 5
    mid_term_marks = models.FloatField(default=0)     # Max 25
    final_marks = models.FloatField(default=0)        # Max 60

    total_marks = models.FloatField()  # Calculated based on exam_type
    obtained_marks = models.FloatField()  # Calculated as sum of relevant marks
    grade = models.CharField(max_length=2, blank=True, default='F')

    class Meta:
        ordering = ["-exam_date"]

    def __str__(self):
        return f"{self.student.name} - {self.course.name}"

    @property
    def percentage(self):
        return (self.obtained_marks / self.total_marks) * 100 if self.total_marks else 0

    def save(self, *args, **kwargs):
        # Calculate total_marks and obtained_marks based on exam_type
        exam_type_lower = self.exam_type.lower() if self.exam_type else ''

        if 'quiz' in exam_type_lower:
            self.total_marks = 5
            # For quiz, determine which quiz slot to use
            if '1' in exam_type_lower or self.quiz1_marks == 0:
                self.obtained_marks = self.quiz1_marks
            else:
                self.obtained_marks = self.quiz2_marks
        elif 'assignment' in exam_type_lower:
            self.total_marks = 5
            # For assignment, determine which assignment slot to use
            if '1' in exam_type_lower or self.assignment1_marks == 0:
                self.obtained_marks = self.assignment1_marks
            else:
                self.obtained_marks = self.assignment2_marks
        elif 'mid' in exam_type_lower:
            self.total_marks = 25
            self.obtained_marks = self.mid_term_marks
        elif 'final' in exam_type_lower:
            # Final grade is calculated from all assessments
            # Total: 2 quizzes (5 each) + 2 assignments (5 each) + mid (25) + final (60) = 100
            total_assessments = (
                self.quiz1_marks + self.quiz2_marks +  # 10 marks
                self.assignment1_marks + self.assignment2_marks +  # 10 marks
                self.mid_term_marks +  # 25 marks
                self.final_marks  # 60 marks
            )
            self.total_marks = 100
            self.obtained_marks = total_assessments
        else:
            # Default to mid-term if exam_type not recognized
            self.total_marks = 25
            self.obtained_marks = self.mid_term_marks

        # Calculate grade based on percentage
        percentage = (self.obtained_marks / self.total_marks) * 100 if self.total_marks > 0 else 0

        if percentage >= 90:
            self.grade = 'A+'
        elif percentage >= 85:
            self.grade = 'A'
        elif percentage >= 80:
            self.grade = 'A-'
        elif percentage >= 75:
            self.grade = 'B+'
        elif percentage >= 70:
            self.grade = 'B'
        elif percentage >= 65:
            self.grade = 'B-'
        elif percentage >= 60:
            self.grade = 'C+'
        elif percentage >= 55:
            self.grade = 'C'
        elif percentage >= 50:
            self.grade = 'C-'
        elif percentage >= 45:
            self.grade = 'D+'
        elif percentage >= 40:
            self.grade = 'D'
        else:
            self.grade = 'F'

        super().save(*args, **kwargs)



    


# ---------- Scholarship ----------
class Scholarship(models.Model):
    scholarship_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    eligibility = models.TextField(blank=True)
    students = models.ManyToManyField("students.Student", related_name="scholarships", blank=True)

    def __str__(self):
        return self.name

# ---------- Student Academic History ----------
class StudentAcademicHistory(models.Model):
    history_id = models.AutoField(primary_key=True)
    student = models.ForeignKey("students.Student", on_delete=models.CASCADE, related_name="academic_history")
    semester = models.ForeignKey(Semester, on_delete=models.CASCADE)
    gpa = models.FloatField()  # Semester GPA
    cgpa = models.FloatField()  # Cumulative GPA at this point
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        unique_together = ['student', 'semester']

    def __str__(self):
        return f"{self.student.name} - {self.semester.name} - GPA: {self.gpa}, CGPA: {self.cgpa}"
