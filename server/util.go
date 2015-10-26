package server
import (
	"html/template"
	"path"
	"net/http"
	"encoding/json"
	"github.com/gorilla/sessions"
	"strings"
)

func (self *server) requireMethods(w http.ResponseWriter, r *http.Request, methods []string) bool {
	for i := range(methods) {
		if strings.EqualFold(r.Method, methods[i]) {
			return true
		}
	}
	http.Error(w, "", http.StatusMethodNotAllowed)
	return false
}

func (self *server) makeData() map[string]interface{} {
	return make(map[string]interface{})
}

func (self *server) getTemplate(templateName string) *template.Template {
	t, err := template.ParseFiles(path.Join(self.conf.TemplatesDir, "index.html"))
	if (err != nil) {
		panic(err.Error())
	}
	return t
}

func (self *server) decodeJson(w http.ResponseWriter, r *http.Request, req interface{}) (interface{}, error) {
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&req)
	if (err != nil) {
		self.errorResponse(w, http.StatusBadRequest, "request could not been decoded: " + err.Error());
	}
	return req, err
}

func (self *server) okResponse(w http.ResponseWriter) (int, error) {
	w.WriteHeader(http.StatusOK)
	return w.Write([]byte(""))
}


func (self *server) errorResponse(w http.ResponseWriter, code int, message string) (int, error) {
	w.WriteHeader(code)
	return w.Write([]byte(message))
}

func (self *server) getCookie(w http.ResponseWriter, r *http.Request, key string) (*sessions.Session, error)  {
	session, err := self.cookieStore.Get(r, key)
	if err != nil {
		http.Error(w, err.Error(), 500)
	}
	return session, err
}

func (self *server) getSession(w http.ResponseWriter, r *http.Request) (*sessions.Session, error)  {
	return self.getCookie(w, r, "sessionId")
}

func (self *server) apiOkResponse(w http.ResponseWriter, resp *ApiResponse) error {
	resp.Status = "ok"
	js, err := json.Marshal(resp)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return err
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(200)
	_, err = w.Write(js)
	return err
}

func (self *server) apiErrorResponse(w http.ResponseWriter, resp *ApiResponse, code int) error {
	resp.Status = "error"
	js, err := json.Marshal(resp)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return err
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	_, err = w.Write(js)
	return err
}