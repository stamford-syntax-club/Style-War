package graphql

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/graphql-go/graphql"
	"github.com/graphql-go/handler"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type SqlLogger struct {
	logger.Interface
}

// Function for print the log of sql statement generated by gorm
func (l SqlLogger) Trace(ctx context.Context, begin time.Time, fc func() (sql string, rowsAffected int64), err error) {
	sql, _ := fc()
	fmt.Printf("%v\n==========================================\n", sql)
}

func init() {
	dsn := "host=localhost user=syntax password=stamford dbname=stylewars-dev port=5432 sslmode=disable TimeZone=Asia/Bangkok"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: &SqlLogger{}, // for log SQL Statements
		DryRun: false,        // "true" for test sql statement (not effect to database)
	})
	if err != nil {
		panic("failed to connect database: " + err.Error())
	}

	db.AutoMigrate(Challenge{})
	db.AutoMigrate(Code{})
}

func CreateHandler() http.Handler {
	schema, err := graphql.NewSchema(graphql.SchemaConfig{
		Query: queryType,
	})
	if err != nil {
		log.Fatalf("An error has occured while pasrsing GrahpQL schema: %s", err)
	}

	h := handler.New(&handler.Config{
		Schema:     &schema,
		Pretty:     true,
		Playground: true,
	})

	return h
}
