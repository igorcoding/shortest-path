package server
import (
	"net/http"
	"github.com/igorcoding/go-genpath/genpath"
	"encoding/json"
	"github.com/nu7hatch/gouuid"
	"github.com/kr/pretty"
"math"
)

func (self *server) setupHandlers() {
	self.serverMux.HandleFunc("/", self.indexHandler)
	self.serverMux.HandleFunc("/api/init", self.apiInit)
	self.serverMux.HandleFunc("/api/step", self.apiStep)
}

func (self *server) indexHandler(w http.ResponseWriter, r *http.Request) {
	t := self.getTemplate("index.html")
	w.WriteHeader(http.StatusOK)
	data := self.makeData()
	data["__title__"] = self.conf.Title
	t.Execute(w, data)
}

func (self *server) apiInit(w http.ResponseWriter, r *http.Request) {
	if (!self.requireMethods(w, r, []string{"POST"})) { return }

	session, err := self.getSession(w, r)
	if err != nil { return }

	var req ApiInitRequest
	decoder := json.NewDecoder(r.Body)
	err = decoder.Decode(&req)
	if (err != nil) {
		self.errorResponse(w, http.StatusBadRequest, "request could not been decoded: " + err.Error());
		return
	}

	conf, err := req.ToGenPathConf()
	if err != nil {
		self.errorResponse(w, http.StatusBadRequest, err.Error());
		return
	}

	pretty.Println(conf)

	gPath, err := genpath.NewGenPath(conf)
	if err != nil {
		self.log.Error(err.Error())
		self.errorResponse(w, http.StatusBadRequest, err.Error());
		return
	}


	netUuid, err := uuid.NewV4()
	if err != nil {
		self.log.Error(err.Error())
	}
	genPathId := netUuid.String()
	self.genPaths[genPathId] = gPath
	session.Values["genPathId"] = genPathId
	err = session.Save(r, w)
	if err != nil {
		self.log.Error(err.Error())
	}

	data := self.makeData()
	resp := ApiResponse{
		Status: "ok",
		Data: data,
	}
	self.apiOkResponse(w, &resp)
}

func (self *server) apiStep(w http.ResponseWriter, r *http.Request) {
	if (!self.requireMethods(w, r, []string{"POST"})) { return }

	session, err := self.getSession(w, r)
	if err != nil { return }

	genPathId, ok := session.Values["genPathId"].(string)
	if !ok {
		resp := ApiResponse{
			ErrorStr: "Genetic path has to be created first before using step()",
		}
		self.apiErrorResponse(w, &resp, 403)
		return
	}
	gPath := self.genPaths[genPathId];
	if gPath == nil {
		resp := ApiResponse{
			ErrorStr: "Genetic path has to be created first before using step()",
		}
		self.apiErrorResponse(w, &resp, 403)
		return
	}

	var req ApiInitRequest
	decoder := json.NewDecoder(r.Body)
	err = decoder.Decode(&req)
	if (err != nil) {
		resp := ApiResponse{
			ErrorStr: "Genetic path has to be created first before using step()",
		}
		self.apiErrorResponse(w, &resp, 403)
		return
	}

	conf, err := req.ToGenPathConf()
	if err != nil {
		self.errorResponse(w, http.StatusBadRequest, err.Error());
		return
	}
	if conf != nil && len(conf.Graph) != 0 {
		gPath.Conf.Graph = conf.Graph
	}

	genomes, err := gPath.Step()
	if err != nil {
		resp := ApiResponse{
			ErrorStr: "Error while step(): " + err.Error(),
		}
		self.apiErrorResponse(w, &resp, 400)
		return
	}

	pretty.Println(genomes)

	data := self.makeData()
	genomesArr := make([](map[string]interface{}), len(genomes))
	for i := range(genomesArr) {
		if (genomes[i] == nil) {
			continue
		}
		genomesArr[i] = self.makeData()
		genomeArr := make([]int, len(genomes[i].Genes))
		for j := range(genomes[i].Genes) {
			genomeArr[j] = genomes[i].Genes[j] + 1
		}
		genomesArr[i]["genome"] = genomeArr
		if genomes[i].Fitness == genpath.FitnessT(math.Inf(0)) {
			genomesArr[i]["fitness"] = "inf"
		} else {
			genomesArr[i]["fitness"] = genomes[i].Fitness
		}
	}
	data["genomes"] = genomesArr

	resp := ApiResponse{
		Data: data,
	}
	self.apiOkResponse(w, &resp)
}