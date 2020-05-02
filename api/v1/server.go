package main

import (
	"encoding/json"
	"net/http"
)

// Server serves all other requests apart from SSE
type Server struct {
	SSEServer *SSEServer
}

func (s *Server) ServeHTTP(rw http.ResponseWriter, req *http.Request) {
	rw.Header().Set("Access-Control-Allow-Origin", "*")
	rw.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	rw.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

	if req.Method == "OPTIONS" {
		return
	}

	decoder := json.NewDecoder(req.Body)
	var msg Message
	err := decoder.Decode(&msg)
	if err != nil {
		http.Error(rw, "Invalid message", http.StatusBadRequest)
	}

	if msg.Namespace == "" {
		http.Error(rw, "No namespace provided", http.StatusBadRequest)
	}
	if msg.From == "" {
		http.Error(rw, "No from provided", http.StatusBadRequest)
		return
	}
	if msg.Type == "" {
		http.Error(rw, "No type provided", http.StatusBadRequest)
		return
	}

	s.SSEServer.Broadcast(&msg)
	rw.WriteHeader(http.StatusOK)
}

// NewServer creates a new server
func NewServer(sse *SSEServer) (server *Server) {
	server = &Server{
		SSEServer: sse,
	}

	return server
}
