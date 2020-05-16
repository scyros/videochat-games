package main

import (
	"flag"
	"log"
	"net/http"
)

var (
	port = flag.String("port", "3005", "port to listen")
)

func main() {
	mux := http.NewServeMux()
	sse := NewSSEServer()
	server := NewServer(sse)

	mux.Handle("/api/v1/events", sse)
	mux.Handle("/api/v1/", server)

	log.Printf("Listening on :" + *port + "...")
	err := http.ListenAndServe(":"+*port, mux)
	if err != nil {
		log.Panicln(err)
	}
}
