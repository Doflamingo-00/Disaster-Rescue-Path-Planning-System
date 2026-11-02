/**
 * DISASTER RESCUE PATH PLANNING SYSTEM
 * Module: Relational Database & Entity Relationship Manager (M1 - M10)
 *
 * Implements the 7 core relational tables specified in Section 4 & Section 23:
 * 1. users
 * 2. incidents
 * 3. locations
 * 4. edges
 * 5. rescue_requests
 * 6. route_results
 * 7. route_steps
 */

class DisasterRescueDB {
  constructor() {
    this.users = [
      { user_id: 'U1', name: 'Commander Sharma', role: 'Rescue Commander', status: 'ACTIVE' },
      { user_id: 'U2', name: 'Dispatcher Verma', role: 'Emergency Dispatcher', status: 'ACTIVE' },
      { user_id: 'U3', name: 'Prof. Academic Examiner', role: 'DAA Academic Examiner', status: 'ACTIVE' }
    ];

    this.incidents = [
      { incident_id: 'INC-01', disaster_type: 'Flash Flood', location_id: 'C', severity: 'CRITICAL', description: 'Underpass flooded; trapped civilians', status: 'ACTIVE', created_at: '2026-10-08 22:30' },
      { incident_id: 'INC-02', disaster_type: 'Earthquake', location_id: 'B', severity: 'HIGH', description: 'Overpass fracture and debris hazard', status: 'ACTIVE', created_at: '2026-10-08 22:45' },
      { incident_id: 'INC-03', disaster_type: 'Landslide', location_id: 'A', severity: 'HIGH', description: 'Mudflow blocking mountain access road', status: 'ACTIVE', created_at: '2026-10-08 23:00' }
    ];

    this.locations = []; // Populated from graph
    this.edges = [];     // Populated from graph

    this.rescue_requests = [
      { request_id: 'REQ-101', incident_id: 'INC-01', source_location: 'A', destination_location: 'D', priority: 'EMERGENCY', created_at: '2026-10-08 23:10' },
      { request_id: 'REQ-102', incident_id: 'INC-02', source_location: 'A', destination_location: 'B', priority: 'HIGH', created_at: '2026-10-08 23:15' }
    ];

    this.route_results = [];
    this.route_steps = [];
  }

  syncWithGraph(graph) {
    this.locations = graph.getAllLocations().map(l => ({
      location_id: l.id,
      name: l.name,
      type: l.type,
      latitude: l.y,
      longitude: l.x,
      status: l.status
    }));

    this.edges = graph.edges.map(e => ({
      edge_id: e.id,
      from_location: e.from,
      to_location: e.to,
      distance: e.distance,
      travel_time: e.time,
      risk: e.risk,
      capacity: e.capacity,
      status: e.status
    }));
  }

  logRouteResult(requestId, incidentId, result) {
    const resultId = `RES-${Date.now().toString().slice(-4)}`;
    const routeRecord = {
      result_id: resultId,
      request_id: requestId || 'REQ-LIVE',
      algorithm: result.algorithm,
      total_cost: result.totalCost,
      total_distance: result.totalDistance,
      total_time: result.totalTime,
      risk_score: result.avgRisk,
      status: result.feasible ? 'FEASIBLE' : 'NO_ROUTE',
      created_at: new Date().toLocaleTimeString()
    };
    this.route_results.unshift(routeRecord);

    // Save individual steps
    if (result.path && result.path.length > 0) {
      result.path.forEach((locId, idx) => {
        this.route_steps.push({
          step_id: `STP-${resultId}-${idx + 1}`,
          result_id: resultId,
          sequence_no: idx + 1,
          location_id: locId
        });
      });
    }

    return routeRecord;
  }

  getTableData(tableName) {
    switch (tableName) {
      case 'users': return this.users;
      case 'incidents': return this.incidents;
      case 'locations': return this.locations;
      case 'edges': return this.edges;
      case 'rescue_requests': return this.rescue_requests;
      case 'route_results': return this.route_results;
      case 'route_steps': return this.route_steps;
      default: return [];
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DisasterRescueDB };
} else {
  window.DisasterRescueDB = DisasterRescueDB;
}
