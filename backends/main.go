package main

import (
	"log"
	"net/http"
	"os"
)

type intercept404 struct {
	http.ResponseWriter
	statusCode int
}

func (w *intercept404) Write(b []byte) (int, error) {
	if w.statusCode == http.StatusNotFound {
		return len(b), nil
	}
	if w.statusCode != 0 {
		w.WriteHeader(w.statusCode)
	}
	return w.ResponseWriter.Write(b)
}

func (w *intercept404) WriteHeader(statusCode int) {
	if statusCode >= 300 && statusCode < 400 {
		w.ResponseWriter.WriteHeader(statusCode)
		return
	}
	w.statusCode = statusCode
}

// Server serves all the request
type Server struct {
	sseServer    *SSEServer
	apiServer    *APIServer
	staticServer http.Handler
}

func (s *Server) ServeHTTP(rw http.ResponseWriter, req *http.Request) {
	if req.URL.Path == "/api/v1/" {
		s.apiServer.ServeHTTP(rw, req)
	} else if req.URL.Path == "/api/v1/events" {
		s.sseServer.ServeHTTP(rw, req)
	} else {
		interceptor := &intercept404{ResponseWriter: rw}
		s.staticServer.ServeHTTP(interceptor, req)
		if interceptor.statusCode == http.StatusNotFound {
			req.URL.Path = "/"
			rw.Header().Set("Content-Type", "text/html")
			s.staticServer.ServeHTTP(rw, req)
		}
	}
}

func main() {
	sse := NewSSEServer()
	mux := &Server{
		sseServer:    sse,
		apiServer:    NewAPIServer(sse),
		staticServer: http.FileServer(http.Dir("./public")),
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
		log.Printf("Defaulting to port %s", port)
	}

	log.Printf("Listening on :" + port + "...")
	err := http.ListenAndServe(":"+port, mux)
	if err != nil {
		log.Panicln(err)
	}
}
