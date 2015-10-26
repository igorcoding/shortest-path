package server
import (
	"github.com/igorcoding/go-genpath/genpath"
	"math"
	"strconv"
)

type ApiConfig struct {
	StartNode int            `json:"start_node"`
	EndNode int              `json:"end_node"`
	PopulationSize int       `json:"population_size"`

	SelectionCount int       `json:"selection_count"`
	CrossoverProb float64    `json:"crossover_prob"`
	CrossoverSplits int      `json:"crossover_splits"`
	CrossoversCount int      `json:"crossovers_count"`
	RemoveDuplicates bool    `json:"remove_duplicates"`

	MutationProb float64     `json:"mutation_prob"`
}

type ApiInitRequest struct {
	Config ApiConfig   `json:"config"`
	Graph []string     `json:"graph"`
}

func (self *ApiInitRequest) ToGenPathConf() (*genpath.GenPathConf, error) {
	graphSize := int(math.Sqrt(float64(len(self.Graph))))
	graph := make([][]float64, graphSize)

	inf := math.Inf(0)
	for i := range(graph) {
		graph[i] = make([]float64, graphSize)
		for j := range(graph[i]) {
			v := self.Graph[i * graphSize + j]
			if v == "inf" {
				graph[i][j] = inf
			} else if v == "" {
				graph[i][j] = 0.0
			} else {
				value, err := strconv.ParseFloat(v, 64)
				if err != nil {
					return nil, err
				}
				graph[i][j] = value
			}
		}
	}

	conf := &genpath.GenPathConf{
		StartNode: self.Config.StartNode - 1,
		EndNode: self.Config.EndNode - 1,
		PopulationSize: self.Config.PopulationSize,

		SelectionCount: self.Config.SelectionCount,
		CrossoverProb: self.Config.CrossoverProb,
		CrossoverSegmentSplitsCount: self.Config.CrossoverSplits,
		CrossoversCount: self.Config.CrossoversCount,
		RemoveDuplicates: self.Config.RemoveDuplicates,

		MutationProb: self.Config.MutationProb,

		Graph: graph,
	}
	return conf, nil
}





type ApiResponse struct {
	Status string    `json:"status"`
	ErrorStr string  `json:"errstr,omitempty"`
	Data interface{} `json:"data"`
}