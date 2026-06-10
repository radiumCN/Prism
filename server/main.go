package main

import (
	"log"
	"modelhub/server/internal/config"
	"modelhub/server/internal/database"
	"modelhub/server/internal/handler"
	"modelhub/server/internal/repository"
	"modelhub/server/internal/router"
	"modelhub/server/internal/service"
	"modelhub/server/seed"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	db, err := database.NewDB(cfg)
	if err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}

	if err := database.AutoMigrate(db); err != nil {
		log.Fatalf("failed to run migrations: %v", err)
	}

	if err := database.RunCustomMigrations(db); err != nil {
		log.Fatalf("failed to run custom migrations: %v", err)
	}

	if err := seed.Run(db); err != nil {
		log.Fatalf("failed to run seed: %v", err)
	}

	rdb, redisErr := database.NewRedis(cfg)
	if redisErr != nil {
		log.Printf("warning: redis not available: %v", redisErr)
		rdb = nil
	}

	// Repositories
	userRepo := repository.NewUserRepository(db)
	providerRepo := repository.NewProviderRepository(db)
	modelRepo := repository.NewModelRepository(db)
	providerModelRepo := repository.NewProviderModelRepository(db)
	convRepo := repository.NewConversationRepository(db)
	msgRepo := repository.NewMessageRepository(db)
	settingRepo := repository.NewSettingRepository(db)
	skillRepo := repository.NewSkillRepository(db)
	mcpRepo := repository.NewMCPServerRepository(db)

	// Services
	authSvc := service.NewAuthService(userRepo, rdb, cfg)
	chatSvc := service.NewChatService(convRepo, msgRepo, modelRepo, providerRepo, providerModelRepo, skillRepo, mcpRepo, cfg)
	adminSvc := service.NewAdminService(providerRepo, modelRepo, providerModelRepo, settingRepo, skillRepo, mcpRepo, cfg)

	// Handlers
	authH := handler.NewAuthHandler(authSvc)
	chatH := handler.NewChatHandler(chatSvc)
	adminH := handler.NewAdminHandler(adminSvc)
	genH := handler.NewGenerationHandler(modelRepo, providerRepo, providerModelRepo, db, cfg)

	r := router.Setup(cfg, authH, chatH, adminH, genH)

	addr := ":" + cfg.Server.Port
	log.Printf("ModelHub server starting on %s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("server error: %v", err)
	}
}
