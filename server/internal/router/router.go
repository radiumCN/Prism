package router

import (
	"modelhub/server/internal/config"
	"modelhub/server/internal/handler"
	"modelhub/server/internal/middleware"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func ensureDir(path string) error {
	return os.MkdirAll(path, 0755)
}

func Setup(
	cfg *config.Config,
	authH *handler.AuthHandler,
	chatH *handler.ChatHandler,
	adminH *handler.AdminHandler,
	genH *handler.GenerationHandler,
) *gin.Engine {
	// Ensure uploads directory exists.
	_ = ensureDir("./uploads")
	gin.SetMode(cfg.Server.Mode)
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     cfg.Server.CORSOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Serve uploaded files.
	r.Static("/uploads", "./uploads")

	api := r.Group("/api")

	// Public auth routes
	auth := api.Group("/auth")
	{
		auth.POST("/send-code", authH.SendCode)
		auth.POST("/register", authH.Register)
		auth.POST("/login", authH.Login)
		auth.POST("/refresh", authH.Refresh)
	}

	// Protected routes — any authenticated user
	protected := api.Group("")
	protected.Use(middleware.AuthMiddleware(cfg))
	{
		protected.GET("/user/profile", authH.Profile)
		protected.PUT("/user/profile", authH.UpdateProfile)
		protected.GET("/user/oss-config", authH.GetOSSConfig)
		protected.PUT("/user/oss-config", authH.UpsertOSSConfig)

		// Provider management (per-user)
		providers := protected.Group("/providers")
		{
			providers.GET("", adminH.ListProviders)
			providers.POST("", adminH.CreateProvider)
			providers.PUT("/:id", adminH.UpdateProvider)
			providers.DELETE("/:id", adminH.DeleteProvider)
			providers.GET("/:id/models", adminH.GetProviderModels)
			providers.PUT("/:id/models", adminH.SetProviderModels)
		}

		// Model management + chat listing (per-user)
		models := protected.Group("/models")
		{
			models.GET("", chatH.ListModels)
			models.GET("/manage", adminH.ListModels)
			models.POST("", adminH.CreateModel)
			models.PUT("/:id", adminH.UpdateModel)
			models.DELETE("/:id", adminH.DeleteModel)
		}

		// Skill management + chat listing (per-user)
		skills := protected.Group("/skills")
		{
			skills.GET("", chatH.ListSkills)
			skills.GET("/manage", adminH.ListSkills)
			skills.POST("", adminH.CreateSkill)
			skills.POST("/import", adminH.ImportSkills)
			skills.PUT("/:id", adminH.UpdateSkill)
			skills.DELETE("/:id", adminH.DeleteSkill)
		}

		// MCP server management + chat listing (per-user)
		mcps := protected.Group("/mcp-servers")
		{
			mcps.GET("", chatH.ListMCPServers)
			mcps.GET("/manage", adminH.ListMCPServers)
			mcps.POST("", adminH.CreateMCPServer)
			mcps.PUT("/:id", adminH.UpdateMCPServer)
			mcps.DELETE("/:id", adminH.DeleteMCPServer)
		}

		// Conversations (per-user)
		conv := protected.Group("/conversations")
		{
			conv.POST("", chatH.CreateConversation)
			conv.GET("", chatH.ListConversations)
			conv.GET("/:id", chatH.GetMessages)
			conv.GET("/:id/info", chatH.GetConversationInfo)
			conv.PATCH("/:id", chatH.UpdateConversation)
			conv.DELETE("/:id", chatH.DeleteConversation)
			conv.POST("/:id/messages", chatH.SendMessage)
		}

		protected.POST("/images/generate", genH.GenerateImage)
		protected.GET("/images/history", genH.ListImageHistory)
		protected.POST("/videos/generate", genH.GenerateVideo)
		protected.GET("/videos/history", genH.ListVideoHistory)

		// File upload (images for feedback etc.)
		protected.POST("/upload", handler.UploadImage)

		// Feedback (any authenticated user can submit / view own)
		protected.POST("/feedback", adminH.SubmitFeedback)
		protected.GET("/feedback/mine", adminH.ListMyFeedback)
	}

	// Admin-only routes
	admin := api.Group("/admin")
	admin.Use(middleware.AuthMiddleware(cfg))
	admin.Use(middleware.AdminMiddleware())
	{
		admin.GET("/settings", adminH.GetSettings)
		admin.PUT("/settings", adminH.UpdateSettings)

		// User management
		admin.GET("/users", adminH.ListUsers)
		admin.PUT("/users/:id", adminH.UpdateUser)

		// Feedback management
		admin.GET("/feedback", adminH.ListFeedback)
		admin.PUT("/feedback/:id", adminH.UpdateFeedback)
	}

	return r
}
