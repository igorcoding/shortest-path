package main
import (
	"github.com/igorcoding/shortest-path/server"
)

func main() {
	serverConf := &server.ServerConf{
		Port: 9000,
		Name: "GeneticPathServer",
		Title: "Genetic shortest path solver",
		LogLevel: 5,

		TemplatesDir: "templates",
		StaticDir: ".",
		StaticUrl: "/static/",
	}
	server := server.NewServer(serverConf)
	server.Start()
}
