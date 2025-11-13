from rest_framework import serializers
from .models import User, HODRegistrationRequest,PrincipalRegistrationRequest

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    
    # HOD specific fields
    employee_id = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    department_id = serializers.IntegerField(required=False)
    designation = serializers.CharField(required=False, allow_blank=True)
    experience_years = serializers.IntegerField(required=False)
    specialization = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'confirm_password',
            'role', 'name', 'first_name', 'last_name',
            'employee_id', 'phone', 'department_id', 'designation', 
            'experience_years', 'specialization'
        ]

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match.")

        # Check if username already exists
        if User.objects.filter(username=data['username']).exists():
            raise serializers.ValidationError({"username": "A user with this username already exists."})

        # HOD specific validation
        if data.get('role') == 'hod':
            required_fields = {
                'employee_id': data.get('employee_id'),
                'phone': data.get('phone'),
                'department_id': data.get('department_id'),
                'specialization': data.get('specialization')
            }
            missing_fields = [field for field, value in required_fields.items() 
                            if not value or (field == 'department_id' and value == 0)]
            if missing_fields:
                raise serializers.ValidationError({
                    "hod_fields": f"Required fields for HOD registration: {', '.join(missing_fields)}"
                })

        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        
        # Extract HOD specific fields
        employee_id = validated_data.pop('employee_id', None)
        phone = validated_data.pop('phone', None)
        department_id = validated_data.pop('department_id', None)
        designation = validated_data.pop('designation', None)
        experience_years = validated_data.pop('experience_years', 0)
        specialization = validated_data.pop('specialization', None)
        
        # combine first_name + last_name → name
        first_name = validated_data.pop('first_name', '')
        last_name = validated_data.pop('last_name', '')
        full_name = f"{first_name} {last_name}".strip()
        
        # If role is HOD, create registration request instead
        if validated_data.get('role') == 'hod':
            from academics.models import Department
            
            try:
                department = Department.objects.get(department_id=department_id)
            except Department.DoesNotExist:
                raise serializers.ValidationError({"department_id": "Invalid department."})
            
            hod_request = HODRegistrationRequest.objects.create(
                name=full_name or validated_data.get('name', ''),
                email=validated_data.get('email'),
                employee_id=employee_id,
                phone=phone,
                department=department,
                designation=designation or 'HOD',
                experience_years=experience_years or 0,
                specialization=specialization,
                password=validated_data['password']
            )
            
            # Return a mock user object with request info
            user = User()
            user.id = hod_request.id
            user.username = validated_data['username']
            user.email = validated_data.get('email')
            user.role = 'hod'
            user.name = full_name
            user._is_hod_request = True
            return user

        # Regular user creation
        user = User(
            username=validated_data['username'],
            email=validated_data.get('email'),
            role=validated_data.get('role'),
            name=full_name or validated_data.get('name', ''),
            first_name=first_name,
            last_name=last_name,
        )
        user.set_password(validated_data['password'])
        user.save()
        return user


class HODRegistrationRequestSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = HODRegistrationRequest
        fields = ['id', 'name', 'email', 'employee_id', 'phone', 'department',
                 'department_name', 'designation', 'experience_years', 'specialization',
                 'status', 'requested_at', 'reviewed_at', 'rejection_reason', 'hod_request_status']
        read_only_fields = ['id', 'status', 'requested_at', 'reviewed_at', 'hod_request_status']


class HODSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    
    class Meta:
        model = None  # Will be set dynamically
        fields = ['id', 'name', 'email', 'phone', 'department', 'department_name',
                 'designation', 'specialization', 'experience_years', 'hire_date',
                 'image', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Import here to avoid circular imports
        from hods.models import HOD
        self.Meta.model = HOD

     
class PrincipalRegistrationRequestSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = PrincipalRegistrationRequest
        fields = [
            'id', 'name', 'email', 'employee_id', 'phone',
            'department', 'department_name', 'designation',
            'experience_years', 'specialization',
            'status', 'requested_at', 'reviewed_at',
            'rejection_reason', 'principal_request_status'
        ]
        read_only_fields = ['id', 'status', 'requested_at', 'reviewed_at', 'principal_request_status']
