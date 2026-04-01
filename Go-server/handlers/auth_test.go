package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"starry-server/models"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func setupTestRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.Default()
	return r
}

func TestLoginAPIInvalidJSON(t *testing.T) {
	router := setupTestRouter()
	router.POST("/api/login", LoginAPI)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/api/login", bytes.NewBufferString("invalid json"))
	req.Header.Set("Content-Type", "application/json")

	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestLoginAPIMissingFields(t *testing.T) {
	router := setupTestRouter()
	router.POST("/api/login", LoginAPI)

	payload := map[string]string{
		"username": "test",
	}
	body, _ := json.Marshal(payload)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/api/login", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")

	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

func TestRegisterAPIInvalidJSON(t *testing.T) {
	router := setupTestRouter()
	router.POST("/api/register", RegisterAPI)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/api/register", bytes.NewBufferString("invalid json"))
	req.Header.Set("Content-Type", "application/json")

	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}
