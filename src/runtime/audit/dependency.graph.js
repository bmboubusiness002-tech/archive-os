const dependencyGraph = {
  screens: {
    "pos.screen": {
      type: "screen",
      domain: "pos",
      dependsOn: ["pos.flow", "cart.engine", "payment.flow"],
      status: "live"
    },
    "repair.board.screen": {
      type: "screen",
      domain: "repair",
      dependsOn: ["repair.repo", "repair.service"],
      status: "partial"
    },
    "finance.dashboard.screen": {
      type: "screen",
      domain: "finance",
      dependsOn: ["ledger.service", "reports.service"],
      status: "live"
    }
  },

  services: {
    "sale.service": {
      type: "service",
      dependsOn: ["sale.repo"],
      status: "live"
    },

    "repair.service": {
      type: "service",
      dependsOn: ["repair.repo"],
      status: "partial"
    },

    "reports.service": {
      type: "service",
      dependsOn: ["ledger.repo"],
      status: "live"
    }
  },

  repos: {
    "sale.repo": {
      type: "repo",
      status: "live"
    },

    "repair.repo": {
      type: "repo",
      status: "partial"
    },

    "ledger.repo": {
      type: "repo",
      status: "live"
    }
  }
};

function buildRelationshipEdges() {
  const edges = [];

  const groups = [
    dependencyGraph.screens,
    dependencyGraph.services,
    dependencyGraph.repos
  ];

  for (const group of groups) {
    for (const [name, node] of Object.entries(group)) {
      const deps = node.dependsOn || [];

      for (const dep of deps) {
        edges.push({
          from: name,
          to: dep,
          type: node.type,
          status: node.status
        });
      }
    }
  }

  return edges;
}

function classifyNodes() {
  const result = {
    live: [],
    partial: [],
    broken: [],
    dormant: []
  };

  const groups = [
    dependencyGraph.screens,
    dependencyGraph.services,
    dependencyGraph.repos
  ];

  for (const group of groups) {
    for (const [name, node] of Object.entries(group)) {
      if (!result[node.status]) {
        result[node.status] = [];
      }

      result[node.status].push({
        name,
        type: node.type
      });
    }
  }

  return result;
}

function extractWorkflowChains() {
  return {
    pos: [
      "pos.screen",
      "pos.flow",
      "sale.service",
      "sale.repo"
    ],

    repair: [
      "repair.board.screen",
      "repair.service",
      "repair.repo"
    ],

    finance: [
      "finance.dashboard.screen",
      "reports.service",
      "ledger.repo"
    ]
  };
}

export function buildDependencyGraph() {
  const graph = {
    generatedAt: new Date().toISOString(),
    nodes: dependencyGraph,
    edges: buildRelationshipEdges(),
    classifications: classifyNodes(),
    workflows: extractWorkflowChains()
  };

  window.__ERP_DEPENDENCY_GRAPH__ = graph;

  console.group("ERP Dependency Graph");
  console.table(graph.edges);
  console.table(graph.classifications.live);
  console.table(graph.classifications.partial);
  console.groupEnd();

  return graph;
}
