package router

import (
	"modelhub/server/internal/config"
	"modelhub/server/internal/handler"
	"modelhub/server/internal/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func Setup(
	cfg *config.Config,
	authH *handler.AuthHandler,
	chatH *handler.ChatHandler,
	adminH *handler.AdminHandler,
	genH *handler.GenerationHandler,
) *gin.Engine {
	gin.SetMode(cfg.Server.Mode)
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     cfg.Server.CORSOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	api := r.Group("/api")

	// Public auth routes
	auth := api.Group("/auth")
	{
		auth.POST("/send-code", authH.SendCode)
		auth.POST("/register", authH.Register)
		auth.POST("/login", authH.Login)
		auth.POST("/refresh", authH.Refresh)
	}

	// Protected routes
	protected := api.Group("")
	protected.Use(middleware.AuthMiddleware(cfg))
	{
		protected.GET("/user/profile", authH.Profile)
		protected.GET("/models", chatH.ListModels)

		conv := protected.Group("/conversations")
		{
			conv.POST("", chatH.CreateConversation)
			conv.GET("", chatH.ListConversations)
			conv.GET("/:id", chatH.GetMessages)
			conv.PATCH("/:id", chatH.UpdateConversation)
			conv.DELETE("/:id", chatH.DeleteConversation)
			conv.POST("/:id/messages", chatH.SendMessage)
		}

		protected.POST("/images/generate", genH.GenerateImage)
	}

	// Admin routes
	admin := api.Group("/admin")
	admin.Use(middleware.AuthMiddleware(cfg))
	admin.Use(middleware.AdminMiddleware())
	{
		admin.GET("/settings", adminH.GetSettings)
		admin.PUT("/settings", adminH.UpdateSettings)

		providers := admin.Group("/providers")
		{
			providers.GET("", adminH.ListProviders)
			providers.POST("", adminH.CreateProvider)
			providers.PUT("/:id", adminH.UpdateProvider)
			providers.DELETE("/:id", adminH.DeleteProvider)
			// Provider-model associations
			providers.GET("/:id/models", adminH.GetProviderModels)
			providers.PUT("/:id/models", adminH.SetProviderModels)
		}

		models := admin.Group("/models")
		{
			models.GET("", adminH.ListModels)
			models.POST("", adminH.CreateModel)
			models.PUT("/:id", adminH.UpdateModel)
			models.DELETE("/:id", adminH.DeleteModel)
		}
	}

	return r
}
