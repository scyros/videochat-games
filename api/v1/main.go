package main

import (
	"log"
	"net/http"
)

func main() {
	mux := http.NewServeMux()
	sse := NewSSEServer()
	server := NewServer(sse)

	mux.Handle("/api/v1/events", sse)
	mux.Handle("/api/v1/", server)

	log.Printf("Listening on :3005...")
	err := http.ListenAndServe(":3005", mux)
	if err != nil {
		log.Panicln(err)
	}
}
