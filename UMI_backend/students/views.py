from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.contrib.auth import get_user_model

User = get_user_model()

from .models import Student
from .serializers import StudentSerializer
from .permissions import IsStaffOrAdmin
from academics.serializers import CourseSerializer
from academics.models import Result, Scholarship
from .services.analysis import generate_performance_notes


class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [IsStaffOrAdmin]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['department', 'semester']
    lookup_field = 'student_id'
    lookup_value_regex = '[^/]+'
    search_fields = ['name', 'email', 'student_id', 'first_name', 'last_name']
    ordering_fields = ['name', 'student_id', 'enrollment_date']
    ordering = ['name']

    # ✅ Filter override
    def get_queryset(self):
        queryset = super().get_queryset()
        department = self.request.query_params.get('department')
        semester = self.request.query_params.get('semester')

        print(f"StudentViewSet filtering - department: {department}, semester: {semester}")

        if department:
            queryset = queryset.filter(department_id=department)
        if semester:
            queryset = queryset.filter(semester_id=semester)

        return queryset

    # ✅ Create student + linked user
    def create(self, request, *args, **kwargs):
        try:
            print(f"StudentViewSet create - Request data: {request.data}")

            first_name = request.data.get("first_name")
            last_name = request.data.get("last_name")
            email = request.data.get("email")
            registration_number = request.data.get("registration_number")
            password = request.data.get("password")

            # Check if user already exists
            if User.objects.filter(username=registration_number).exists():
                return Response({"error": "User with this registration number already exists"}, status=status.HTTP_400_BAD_REQUEST)

            # Check if student already exists
            if Student.objects.filter(student_id=registration_number).exists():
                return Response({"error": "Student with this registration number already exists"}, status=status.HTTP_400_BAD_REQUEST)

            # Create linked User
            user = User.objects.create_user(
                username=registration_number,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
            )

            student_data = request.data.copy()
            student_data["user"] = user.id

            serializer = self.get_serializer(data=student_data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)

            return Response(
                {
                    "message": "Student and user account created successfully",
                    "student": serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )
        except Exception as e:
            print(f"Error in student create: {e}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    # ✅ Update student info
    def update(self, request, *args, **kwargs):
        print(f"StudentViewSet update - Request data: {request.data}")
        print(f"Request content type: {request.content_type}")
        try:
            return super().update(request, *args, **kwargs)
        except Exception as e:
            print(f"StudentViewSet update - Validation error: {e}")
            raise

    # ✅ Upload student image
    @action(
        detail=True,
        methods=['post'],
        url_path='upload-image',
        parser_classes=[MultiPartParser, FormParser]
    )
    def upload_image(self, request, student_id=None):
        try:
            student = self.get_object()

            if 'image' not in request.FILES:
                return Response({"error": "No image file provided"}, status=status.HTTP_400_BAD_REQUEST)

            image_file = request.FILES['image']

            allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
            if image_file.content_type not in allowed_types:
                return Response({"error": "Invalid file type"}, status=status.HTTP_400_BAD_REQUEST)

            if image_file.size > 5 * 1024 * 1024:
                return Response({"error": "File too large (max 5MB)"}, status=status.HTTP_400_BAD_REQUEST)

            student.image = image_file
            student.save(update_fields=['image'])

            serializer = self.get_serializer(student)
            return Response(
                {"message": "Image uploaded successfully", "student": serializer.data},
                status=status.HTTP_200_OK,
            )
        except Student.DoesNotExist:
            return Response({"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": f"Upload failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # ✅ Delete student
    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except Exception as e:
            return Response({"error": f"Cannot delete student: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

    # ✅ Generate notes
    @action(detail=True, methods=['post'], url_path='generate-notes')
    def generate_notes(self, request, student_id=None):
        student = self.get_object()
        notes = generate_performance_notes(student)

        save_flag = str(request.query_params.get("save", "true")).lower() != "false"
        if save_flag:
            student.performance_notes = notes
            student.save(update_fields=["performance_notes"])

        return Response(
            {"student_id": student.student_id, "saved": save_flag, "performance_notes": notes},
            status=status.HTTP_200_OK,
        )

    # ✅ Get all student courses
    @action(detail=True, methods=['get'], url_path='courses')
    def get_student_courses(self, request, student_id=None):
        try:
            student = self.get_object()
            courses = student.courses.all()
            serializer = CourseSerializer(courses, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Student.DoesNotExist:
            return Response({"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": f"Failed to fetch courses: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ✅ Student Profile (for logged-in student)
class StudentProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        print("User:", request.user)
        print("Is authenticated:", request.user.is_authenticated)
        try:
            student = Student.objects.get(user=request.user)
            serializer = StudentSerializer(student)
            return Response(serializer.data)
        except Student.DoesNotExist:
            return Response({"error": "Student profile not found"}, status=404)


# ✅ Dashboard View
@api_view(['GET'])
def StudentDashboardView(request, student_id):
    try:
        student = Student.objects.get(student_id=student_id)
        results = Result.objects.filter(student=student).order_by('-exam_date')[:5]
        notes = generate_performance_notes(student)

        student_data = {
            "id": student.student_id,
            "name": student.name,
            "email": student.email,
            "department": student.department.name if student.department else None,
            "semester": student.semester.name if student.semester else None,
            "gpa": student.gpa,
            "attendance": student.attendance_percentage,
        }

        results_data = [
            {
                "subject": r.course.name if r.course else "N/A",
                "grade": r.grade,
                "marks": f"{r.obtained_marks}/{r.total_marks}",
                "percentage": r.percentage,
            }
            for r in results
        ]

        scholarships = list(
            Scholarship.objects.filter(students=student).values_list("name", flat=True)
        )

        data = {
            "student": student_data,
            "recent_results": results_data,
            "scholarships": scholarships,
            "performance_notes": notes,
        }

        return Response(data, status=status.HTTP_200_OK)

    except Student.DoesNotExist:
        return Response({"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)