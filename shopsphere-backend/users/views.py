"""
Auth views.

POST /api/register  -> create account
POST /api/login      -> returns access + refresh JWT tokens (via SimpleJWT)
POST /api/logout     -> blacklists the refresh token (requires token_blacklist app
                        if you enable it; here we do a simple stateless logout —
                        see note in the view below)
GET/PUT /api/profile -> view or update the logged-in user's own profile
"""

from rest_framework import status, generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import User
from .serializers import RegisterSerializer, UserProfileSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                "message": "Account created successfully.",
                "user": UserProfileSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    SimpleJWT expects USERNAME_FIELD to log in, which is already set to
    'email' on our custom User model, so this mostly works out of the box.
    We override only to attach user profile data to the login response,
    so the frontend doesn't need a second request just to get the user's name.
    """

    def validate(self, attrs):
        data = super().validate(attrs)
        data["user"] = UserProfileSerializer(self.user).data
        return data


class LoginView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer
    permission_classes = [permissions.AllowAny]


class LogoutView(APIView):
    """
    JWT access tokens are stateless — the server doesn't track them, so
    "logout" in a pure JWT setup mainly means the frontend deletes its
    stored token. This endpoint exists to match the PRD's API list and
    gives the frontend a clear signal to clear its tokens; for true
    server-side revocation, add 'rest_framework_simplejwt.token_blacklist'
    to INSTALLED_APPS and blacklist the refresh token here instead.
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        return Response({"message": "Logged out. Please discard your tokens on the client."})


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
