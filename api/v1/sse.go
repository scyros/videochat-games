package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

// Client represents an connection with a browser
type Client struct {
	ID        string
	Message   chan *Message
	Namespace string
}

// Message represents a message to be sent to a client
type Message struct {
	From      string       `json:"from"`
	Namespace string       `json:"ns"`
	Payload   *interface{} `json:"payload"`
	To        string       `json:"to"`
	Type      string       `json:"type"`
}

// SSEServer is the responsible for messages delivery
type SSEServer struct {
	JoiningClients chan *Client
	LeavingClients chan *Client
	Namespaces     map[string]map[string]*Client
	Notifier       chan *Message
}

// Listen begins the sse work
func (sse *SSEServer) Listen() {
	for {
		select {
		case client := <-sse.JoiningClients:
			id := client.ID
			ns := client.Namespace
			_, ok := sse.Namespaces[ns]
			if !ok {
				sse.Namespaces[ns] = make(map[string]*Client)
			}
			sse.Namespaces[ns][id] = client
			log.Printf("New client! id: %s in ns: %s", client.ID, client.Namespace)

		case client := <-sse.LeavingClients:
			ns, ok := sse.Namespaces[client.Namespace]
			if ok {
				delete(ns, client.ID)
				close(client.Message)
				log.Printf("Client gone! id: %s in ns: %s", client.ID, client.Namespace)
			}
			if len(ns) == 0 {
				delete(sse.Namespaces, client.Namespace)
			}

		case message := <-sse.Notifier:
			ns, ok := sse.Namespaces[message.Namespace]
			if ok {
				client, ok := ns[message.To]
				if ok {
					client.Message <- message
				} else {
					for _, client := range ns {
						if client.ID != message.From {
							client.Message <- message
						}
					}
				}
			}
		}
	}
}

func (sse *SSEServer) ServeHTTP(rw http.ResponseWriter, req *http.Request) {
	flusher, ok := rw.(http.Flusher)
	if !ok {
		http.Error(rw, "Streaming unsupported!", http.StatusInternalServerError)
		return
	}

	ns := req.URL.Query().Get("ns")
	if ns == "" {
		http.Error(rw, "No ns params provided", http.StatusBadRequest)
		return
	}
	id := req.URL.Query().Get("id")
	if ns == "" {
		http.Error(rw, "No id params provided", http.StatusBadRequest)
		return
	}

	rw.Header().Set("Content-Type", "text/event-stream")
	rw.Header().Set("Cache-Control", "no-cache")
	rw.Header().Set("Connection", "keep-alive")
	rw.Header().Set("Access-Control-Allow-Origin", "*")

	client := &Client{
		ID:        id,
		Message:   make(chan *Message),
		Namespace: ns,
	}

	// Notify the new client
	sse.JoiningClients <- client
	msg := &Message{
		From:      client.ID,
		Namespace: client.Namespace,
		Type:      "join",
	}
	sse.Broadcast(msg)

	notify := rw.(http.CloseNotifier).CloseNotify()
	go func() {
		<-notify
		// Client closed its connection
		sse.LeavingClients <- client
		msg := &Message{
			From:      client.ID,
			Namespace: client.Namespace,
			Type:      "leave",
		}
		sse.Broadcast(msg)
	}()

	for {
		msg, open := <-client.Message
		if !open {
			break
		}

		JSONMsg, err := json.Marshal(msg)
		if err == nil {
			fmt.Fprintf(rw, "data: %s\n\n", JSONMsg)
		}
		flusher.Flush()
	}
}

// Broadcast a message to clients
func (sse *SSEServer) Broadcast(msg *Message) {
	sse.Notifier <- msg
}

// NewSSEServer creates a new server side events server and begins its work
func NewSSEServer() (sse *SSEServer) {
	sse = &SSEServer{
		JoiningClients: make(chan *Client),
		LeavingClients: make(chan *Client),
		Namespaces:     make(map[string]map[string]*Client),
		Notifier:       make(chan *Message),
	}

	go sse.Listen()
	return
}
