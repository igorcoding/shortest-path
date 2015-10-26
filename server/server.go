package server

import (
	"net/http"
	"gopkg.in/tylerb/graceful.v1"
	"strconv"
	"github.com/op/go-logging"
	"os"
	"time"
	"github.com/gorilla/sessions"
	"github.com/gorilla/context"
	"github.com/igorcoding/go-genpath/genpath"
)

const (
	DEFAULT_PORT = 9000
	DEFAULT_SESSION_SECRET = "something-very-secret"
)

type ServerConf struct {
	Name string
	Title string
	Port uint16
	LogLevel int
	TemplatesDir string
	StaticDir string
	StaticUrl string

	SessionSecret string
}


type server struct {
	conf *ServerConf

	server *graceful.Server
	serverMux *http.ServeMux
	log *logging.Logger

	cookieStore *sessions.CookieStore
	genPaths map[string]*genpath.GenPath
}

func NewServer(conf *ServerConf) *server {
	if conf.Name == "" {
		conf.Name = "server"
	}
	if conf.Port == 0 {
		conf.Port = DEFAULT_PORT
	}
	if conf.SessionSecret == "" {
		conf.SessionSecret = DEFAULT_SESSION_SECRET
	}

	self := &server{conf:conf}

	self.serverMux = http.NewServeMux()
	self.server = &graceful.Server{
		Timeout: 500 * time.Millisecond,

		Server: &http.Server{
			Addr: ":" + self.getPortStr(),
			Handler: self.LogMiddleware(context.ClearHandler(self.serverMux)),
		},
	}
	self.server.SetKeepAlivesEnabled(false) // FIXME
	self.cookieStore = sessions.NewCookieStore([]byte(self.conf.SessionSecret))

	self.setupHandlers()
	fs := http.FileServer(http.Dir(self.conf.StaticDir))
	self.serverMux.Handle(self.conf.StaticUrl, http.StripPrefix("", fs))
	self.setupLogging()


	self.genPaths = make(map[string]*genpath.GenPath)
	return self
}

func (self *server) getPortStr() string {
	return strconv.Itoa(int(self.conf.Port))
}

type loggedResponse struct {
	http.ResponseWriter
	status int
}

func (l *loggedResponse) WriteHeader(status int) {
	if status == 0 {
		status = 200
	}
	l.status = status
	l.ResponseWriter.WriteHeader(status)
}


func (self *server) setupLogging() {
	self.log = logging.MustGetLogger(self.conf.Name)
	format := logging.MustStringFormatter(
		"%{color}%{time:15:04:05.000} %{shortfunc} ▶ %{level:.4s} %{color:reset}%{message}",
	)
	loggingBackend := logging.NewLogBackend(os.Stdout, "", 0)
	backendFormatter := logging.NewBackendFormatter(loggingBackend, format)
	loggingBackendLeveled := logging.AddModuleLevel(backendFormatter)
	loggingBackendLeveled.SetLevel(logging.Level(self.conf.LogLevel), "")
	logging.SetBackend(loggingBackendLeveled)
}


func (self *server) LogMiddleware(handler http.Handler) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		lw := &loggedResponse{ResponseWriter: w}
		handler.ServeHTTP(lw, r)
		self.log.Info("%s %s %d", r.Method, r.URL, lw.status)
	})
}


func (self *server) Start() {
	self.log.Notice("Server started on port " + self.getPortStr())
	err := self.server.ListenAndServe()
	self.log.Notice("Server stopped")
	if (err != nil) {
		self.log.Critical(err.Error())
	}
}

