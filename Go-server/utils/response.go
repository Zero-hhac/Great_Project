package utils

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// ErrorResponse 统一的错误响应格式
type ErrorResponse struct {
	Error string `json:"error"`
}

// SuccessResponse 统一的成功响应格式
type SuccessResponse struct {
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

// RespondError 返回错误响应
func RespondError(c *gin.Context, statusCode int, message string) {
	c.JSON(statusCode, ErrorResponse{Error: message})
}

// RespondSuccess 返回成功响应
func RespondSuccess(c *gin.Context, statusCode int, message string, data interface{}) {
	response := SuccessResponse{Message: message}
	if data != nil {
		response.Data = data
	}
	c.JSON(statusCode, response)
}

// RespondBadRequest 返回400错误
func RespondBadRequest(c *gin.Context, message string) {
	RespondError(c, http.StatusBadRequest, message)
}

// RespondUnauthorized 返回401错误
func RespondUnauthorized(c *gin.Context, message string) {
	RespondError(c, http.StatusUnauthorized, message)
}

// RespondConflict 返回409错误
func RespondConflict(c *gin.Context, message string) {
	RespondError(c, http.StatusConflict, message)
}

// RespondInternalError 返回500错误
func RespondInternalError(c *gin.Context, message string) {
	RespondError(c, http.StatusInternalServerError, message)
}
