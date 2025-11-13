from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction, IntegrityError
from .models import Department, Semester, Course
from .serializers import DepartmentSerializer, SemesterSerializer, CourseSerializer
from .permissions import AllowAnyReadOnly
import logging

logger = logging.getLogger(__name__)


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [AllowAnyReadOnly]

<<<<<<< HEAD
    def create(self, request, *args, **kwargs):
        """Override create to handle errors properly"""
        try:
            with transaction.atomic():
                serializer = self.get_serializer(data=request.data)
                serializer.is_valid(raise_exception=True)
                
                department = serializer.save()
                
                # Auto-generate semesters based on num_semesters
                for i in range(1, department.num_semesters + 1):
                    semester_code = f"{department.code}-SEM{i}"
                    # Check if semester already exists to avoid duplicates
                    if not Semester.objects.filter(semester_code=semester_code).exists():
                        Semester.objects.create(
                            name=f"Semester {i}",
                            semester_code=semester_code,
                            program=department.name,
                            capacity=30,
                            department=department
                        )
                
                headers = self.get_success_headers(serializer.data)
                return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
                
        except IntegrityError as e:
            logger.error(f"Database integrity error creating department: {str(e)}")
            return Response(
                {'error': 'Department with this name or code already exists.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error creating department: {str(e)}")
            return Response(
                {'error': f'Failed to create department: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
=======
    def perform_create(self, serializer):
        department = serializer.save()
        # Auto-generate semesters based on num_semesters
        for i in range(1, department.num_semesters + 1):
            semester_code = f"{department.code}-SEM{i}"
            # Check if semester already exists to avoid duplicates
            if not Semester.objects.filter(semester_code=semester_code).exists():
                Semester.objects.create(
                    name=f"Semester {i}",
                    semester_code=semester_code,
                    program=department.name,
                    capacity=30,
                    department=department
                )
>>>>>>> 3d3a4f2babdb60e79974b0213dc7f76ad7cfd119

    @action(detail=True, methods=['get'])
    def semesters(self, request, pk=None):
        department = self.get_object()
        semesters = Semester.objects.filter(department=department)
        serializer = SemesterSerializer(semesters, many=True)
        return Response(serializer.data)


class SemesterViewSet(viewsets.ModelViewSet):
    queryset = Semester.objects.all()
    serializer_class = SemesterSerializer
    permission_classes = [AllowAnyReadOnly]
    
    def get_queryset(self):
        queryset = Semester.objects.all()
        department = self.request.query_params.get('department', None)
        if department is not None:
            queryset = queryset.filter(department=department)
        return queryset


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [AllowAnyReadOnly]
