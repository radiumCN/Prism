package dto

type SendCodeRequest struct {
	Email string `json:"email" binding:"required,email"`
}

type RegisterRequest struct {
	Username string `json:"username" binding:"required,min=3,max=50"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
	Code     string `json:"code" binding:"required,len=6"`
}

type LoginRequest struct {
	// Account 支持邮箱或用户名
	Account  string `json:"account" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type RefreshRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

type AuthResponse struct {
	AccessToken  string   `json:"access_token"`
	RefreshToken string   `json:"refresh_token"`
	User         UserInfo `json:"user"`
}

type UserInfo struct {
	ID       uint   `json:"id"`
	Username string `json:"username"`
	Email    string `json:"email"`
	Role     string `json:"role"`
}

type UpdateProfileRequest struct {
	Username    string `json:"username" binding:"omitempty,min=3,max=50"`
	OldPassword string `json:"old_password" binding:"omitempty,min=8"`
	NewPassword string `json:"new_password" binding:"omitempty,min=8"`
}
