// Copyright 2015-2019 SWIM.AI inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package swim.fabric;

import java.util.concurrent.atomic.AtomicReferenceFieldUpdater;
import swim.agent.AgentModel;
import swim.api.SwimContext;
import swim.api.agent.Agent;
import swim.api.agent.AgentFactory;
import swim.api.agent.AgentRoute;
import swim.api.agent.AgentRouteContext;
import swim.api.auth.Authenticator;
import swim.api.auth.AuthenticatorContext;
import swim.api.auth.Credentials;
import swim.api.auth.Identity;
import swim.api.downlink.Downlink;
import swim.api.plane.Plane;
import swim.api.plane.PlaneContext;
import swim.api.plane.PlaneFactory;
import swim.api.policy.PlanePolicy;
import swim.api.policy.Policy;
import swim.api.policy.PolicyDirective;
import swim.api.space.Space;
import swim.collections.HashTrieMap;
import swim.concurrent.MainStage;
import swim.concurrent.Schedule;
import swim.concurrent.Stage;
import swim.kernel.HostDef;
import swim.kernel.KernelContext;
import swim.kernel.LaneDef;
import swim.kernel.LogDef;
import swim.kernel.MeshDef;
import swim.kernel.NodeDef;
import swim.kernel.PartDef;
import swim.kernel.PolicyDef;
import swim.kernel.StageDef;
import swim.kernel.StoreDef;
import swim.runtime.AbstractTierBinding;
import swim.runtime.EdgeBinding;
import swim.runtime.EdgeContext;
import swim.runtime.HostBinding;
import swim.runtime.HttpBinding;
import swim.runtime.LaneBinding;
import swim.runtime.LinkBinding;
import swim.runtime.MeshBinding;
import swim.runtime.NodeBinding;
import swim.runtime.PartBinding;
import swim.runtime.PushRequest;
import swim.runtime.TierContext;
import swim.store.StoreBinding;
import swim.structure.Value;
import swim.uri.Uri;
import swim.uri.UriMapper;
import swim.uri.UriPattern;
import swim.util.Log;

public class Fabric extends AbstractTierBinding implements EdgeContext, PlaneContext, Space {
  final String spaceName;
  final FabricDef fabricDef;
  final KernelContext kernel;
  final EdgeBinding edge;

  Log log;
  PlanePolicy policy;
  Stage stage;
  StoreBinding store;

  volatile HashTrieMap<String, Plane> planes;
  volatile HashTrieMap<String, AgentRoute<?>> agentRoutes;
  volatile UriMapper<AgentFactory<?>> agentFactories;
  volatile HashTrieMap<String, Authenticator> authenticators;

  public Fabric(String spaceName, FabricDef fabricDef, KernelContext kernel) {
    this.spaceName = spaceName;
    this.fabricDef = fabricDef;
    this.kernel = kernel;

    EdgeBinding edge = createEdge();
    edge = injectEdge(edge);
    edge.setEdgeContext(this);
    edge = edge.edgeWrapper();
    this.edge = edge;

    this.planes = HashTrieMap.empty();
    this.agentRoutes = HashTrieMap.empty();
    this.agentFactories = UriMapper.empty();
    this.authenticators = HashTrieMap.empty();

    openEdge(this.edge);
  }

  public final String spaceName() {
    return this.spaceName;
  }

  public final FabricDef fabricDef() {
    return this.fabricDef;
  }

  @Override
  public final TierContext tierContext() {
    return null;
  }

  @Override
  public final EdgeBinding edgeWrapper() {
    return this.edge.edgeWrapper();
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T unwrapEdge(Class<T> edgeClass) {
    if (edgeClass.isAssignableFrom(getClass())) {
      return (T) this;
    } else {
      return null;
    }
  }

  @Override
  public final Uri meshUri() {
    return Uri.empty();
  }

  @Override
  public final PlanePolicy policy() {
    return this.policy;
  }

  @Override
  public void setPolicy(PlanePolicy policy) {
    this.policy = policy;
  }

  @Override
  public Schedule schedule() {
    return this.stage;
  }

  @Override
  public final Stage stage() {
    return this.stage;
  }

  @Override
  public final StoreBinding store() {
    return this.store;
  }

  public final KernelContext kernel() {
    return this.kernel;
  }

  public final EdgeBinding edge() {
    return this.edge;
  }

  @Override
  public Authenticator getAuthenticator(String authenticatorName) {
    return this.authenticators.get(authenticatorName);
  }

  @Override
  public void addAuthenticator(String authenticatorName, Authenticator authenticator) {
    final AuthenticatorContext authenticatorContext = new FabricAuthenticator(authenticatorName, this.kernel);
    authenticator.setAuthenticatorContext(authenticatorContext);

    HashTrieMap<String, Authenticator> oldAuthenticators;
    HashTrieMap<String, Authenticator> newAuthenticators;
    do {
      oldAuthenticators = this.authenticators;
      newAuthenticators = oldAuthenticators.updated(authenticatorName, authenticator);
    } while (!AUTHENTICATORS.compareAndSet(this, oldAuthenticators, newAuthenticators));
  }

  @Override
  public Plane getPlane(String planeName) {
    return this.planes.get(planeName);
  }

  @SuppressWarnings("unchecked")
  @Override
  public <P extends Plane> P getPlane(Class<? extends P> planeClass) {
    for (Plane plane : this.planes.values()) {
      if (planeClass.isAssignableFrom(plane.getClass())) {
        return (P) plane;
      }
    }
    return null;
  }

  @SuppressWarnings("unchecked")
  @Override
  public <P extends Plane> P openPlane(String planeName, PlaneFactory<P> planeFactory) {
    P plane = null;
    do {
      final HashTrieMap<String, Plane> oldPlanes = this.planes;
      final Plane oldPlane = oldPlanes.get(planeName);
      if (oldPlane == null) {
        if (plane == null) {
          plane = createPlane(planeFactory);
          plane = (P) this.kernel.injectPlane(plane);
        }
        final HashTrieMap<String, Plane> newPlanes = oldPlanes.updated(planeName, plane);
        if (PLANES.compareAndSet(this, oldPlanes, newPlanes)) {
          break;
        }
      } else {
        plane = (P) oldPlane;
        break;
      }
    } while (true);
    return plane;
  }

  @SuppressWarnings("unchecked")
  @Override
  public <P extends Plane> P openPlane(String planeName, Class<? extends P> planeClass) {
    Plane plane = getPlane(planeName);
    if (plane == null) {
      final PlaneFactory<P> planeFactory = this.kernel.createPlaneFactory(planeClass);
      if (planeFactory != null) {
        plane = openPlane(planeName, planeFactory);
      }
    }
    return (P) plane;
  }

  protected <P extends Plane> P createPlane(PlaneFactory<P> planeFactory) {
    try {
      SwimContext.setPlaneContext(this);
      return planeFactory.createPlane(this);
    } finally {
      SwimContext.clear();
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public <A extends Agent> AgentRoute<A> getAgentRoute(String routeName) {
    return (AgentRoute<A>) this.agentRoutes.get(routeName);
  }

  @Override
  public <A extends Agent> AgentRoute<A> createAgentRoute(Class<? extends A> agentClass) {
    return this.kernel.createAgentRoute(this.spaceName, agentClass);
  }

  @Override
  public void addAgentRoute(String routeName, UriPattern pattern, AgentRoute<?> agentRoute) {
    final AgentRouteContext agentRouteContext = new FabricAgentRoute(routeName, pattern);
    agentRoute.setAgentRouteContext(agentRouteContext);

    HashTrieMap<String, AgentRoute<?>> oldAgentRoutes;
    HashTrieMap<String, AgentRoute<?>> newAgentRoutes;
    do {
      oldAgentRoutes = this.agentRoutes;
      newAgentRoutes = oldAgentRoutes.updated(routeName, agentRoute);
    } while (oldAgentRoutes != newAgentRoutes && !AGENT_ROUTES.compareAndSet(this, oldAgentRoutes, newAgentRoutes));

    UriMapper<AgentFactory<?>> oldAgentFactories;
    UriMapper<AgentFactory<?>> newAgentFactories;
    do {
      oldAgentFactories = this.agentFactories;
      newAgentFactories = oldAgentFactories.updated(pattern, agentRoute);
    } while (oldAgentFactories != newAgentFactories && !AGENT_FACTORIES.compareAndSet(this, oldAgentFactories, newAgentFactories));
  }

  @Override
  public void addAgentRoute(String routeName, String pattern, AgentRoute<?> agentRoute) {
    addAgentRoute(routeName, UriPattern.parse(pattern), agentRoute);
  }

  @Override
  public void removeAgentRoute(String routeName) {
    HashTrieMap<String, AgentRoute<?>> oldAgentRoutes;
    HashTrieMap<String, AgentRoute<?>> newAgentRoutes;
    do {
      oldAgentRoutes = this.agentRoutes;
      newAgentRoutes = oldAgentRoutes.removed(routeName);
    } while (oldAgentRoutes != newAgentRoutes && !AGENT_ROUTES.compareAndSet(this, oldAgentRoutes, newAgentRoutes));

    final AgentRoute<?> agentRoute = oldAgentRoutes.get(routeName);
    if (agentRoute != null) {
      UriMapper<AgentFactory<?>> oldAgentFactories;
      UriMapper<AgentFactory<?>> newAgentFactories;
      do {
        oldAgentFactories = this.agentFactories;
        newAgentFactories = oldAgentFactories.removed(agentRoute.pattern());
      } while (oldAgentFactories != newAgentFactories && !AGENT_FACTORIES.compareAndSet(this, oldAgentFactories, newAgentFactories));
    }
  }

  @Override
  public AgentFactory<?> getAgentFactory(Uri nodeUri) {
    return this.agentFactories.get(nodeUri);
  }

  @Override
  public <A extends Agent> AgentFactory<A> createAgentFactory(Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri,
                                                              Class<? extends A> agentClass) {
    return this.kernel.createAgentFactory(this.spaceName, meshUri, partKey, hostUri, nodeUri, agentClass);
  }

  @Override
  public void openAgents(Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri, NodeBinding node) {
    this.kernel.openAgents(this.spaceName, meshUri, partKey, hostUri, nodeUri, node);
    if (!meshUri.isDefined()) {
      final AgentFactory<?> agentFactory = this.agentFactories.get(nodeUri);
      if (agentFactory != null && node instanceof AgentModel) {
        final AgentModel agentModel = (AgentModel) node;
        agentModel.addAgentView(agentModel.createAgent(agentFactory, agentModel.props()));
      }
    }
  }

  public Log createLog(LogDef logDef) {
    return this.kernel.createLog(logDef);
  }

  public Log injectLog(Log log) {
    return this.kernel.injectLog(log);
  }

  protected Log openLog() {
    Log log;
    if (this.fabricDef.logDef != null) {
      log = createLog(this.fabricDef.logDef);
    } else {
      log = openEdgeLog();
    }
    if (log != null) {
      log = injectLog(log);
    }
    return log;
  }

  protected void closeLog() {
    this.log = null;
  }

  public Policy createPolicy(PolicyDef policyDef) {
    return this.kernel.createPolicy(policyDef);
  }

  public Policy injectPolicy(Policy policy) {
    return this.kernel.injectPolicy(policy);
  }

  protected PlanePolicy openPolicy() {
    Policy policy;
    if (this.fabricDef.policyDef != null) {
      policy = createPolicy(this.fabricDef.policyDef);
    } else {
      policy = openEdgePolicy();
    }
    if (policy != null) {
      policy = injectPolicy(policy);
    }
    return (PlanePolicy) policy;
  }

  protected void closePolicy() {
    this.policy = null;
  }

  public Stage createStage(StageDef stageDef) {
    return this.kernel.createStage(stageDef);
  }

  public Stage injectStage(Stage stage) {
    return this.kernel.injectStage(stage);
  }

  protected Stage openStage() {
    Stage stage;
    if (this.fabricDef.stageDef != null) {
      stage = createStage(this.fabricDef.stageDef);
    } else {
      stage = openEdgeStage();
    }
    if (stage != null) {
      stage = injectStage(stage);
    }
    return stage;
  }

  protected void closeStage() {
    final Stage stage = this.stage;
    if (stage instanceof MainStage) {
      ((MainStage) stage).stop();
    }
    this.stage = null;
  }

  public StoreBinding createStore(StoreDef storeDef) {
    return this.kernel.createStore(storeDef, null);
  }

  public StoreBinding injectStore(StoreBinding store) {
    return this.kernel.injectStore(store);
  }

  protected StoreBinding openStore() {
    StoreBinding store = null;
    if (this.fabricDef.storeDef != null) {
      store = createStore(this.fabricDef.storeDef);
    } else {
      store = openEdgeStore();
    }
    if (store != null) {
      store = injectStore(store);
    }
    return store;
  }

  protected void closeStore() {
    final StoreBinding store = this.store;
    if (store != null) {
      store.close();
    }
    this.store = null;
  }

  protected EdgeBinding createEdge() {
    EdgeBinding edge = this.kernel.createEdge(this.spaceName);
    if (edge != null) {
      edge = this.kernel.injectEdge(this.spaceName, edge);
    }
    return edge;
  }

  protected void openEdge(EdgeBinding edge) {
    for (MeshDef meshDef : this.fabricDef.meshDefs()) {
      createMesh(edge, meshDef);
    }
    if (edge.network() == null) {
      final MeshBinding network = edge.openMesh(Uri.empty());
      edge.setNetwork(network);

      final PartBinding gateway = network.openGateway();

      final HostBinding localHost = gateway.openHost(Uri.empty());
      gateway.setMaster(localHost);
    }
  }

  protected MeshBinding createMesh(EdgeBinding edge, MeshDef meshDef) {
    final Uri meshUri = meshDef.meshUri();
    MeshBinding mesh = this.kernel.createMesh(this.spaceName, meshDef);
    if (mesh != null) {
      mesh = edge.openMesh(meshUri, mesh);
      if (mesh != null) {
        if (!meshUri.isDefined()) {
          edge.setNetwork(mesh);
        }
        for (PartDef partDef : meshDef.partDefs()) {
          createPart(edge, mesh, partDef);
        }
      }
    }
    return mesh;
  }

  protected PartBinding createPart(EdgeBinding edge, MeshBinding mesh, PartDef partDef) {
    final Uri meshUri = mesh.meshUri();
    final Value partKey = partDef.partKey();
    PartBinding part = this.kernel.createPart(this.spaceName, meshUri, partDef);
    if (part != null) {
      part = mesh.addPart(partKey, part);
      if (part != null) {
        if (partDef.isGateway()) {
          mesh.setGateway(part);
        }
        for (HostDef hostDef : partDef.hostDefs()) {
          createHost(edge, mesh, part, hostDef);
        }
      }
    }
    return part;
  }

  protected HostBinding createHost(EdgeBinding edge, MeshBinding mesh, PartBinding part, HostDef hostDef) {
    final Uri meshUri = mesh.meshUri();
    final Value partKey = part.partKey();
    final Uri hostUri = hostDef.hostUri();
    if (hostUri != null) {
      HostBinding host = this.kernel.createHost(this.spaceName, meshUri, partKey, hostDef);
      if (host != null) {
        host = part.openHost(hostUri, host);
        if (host != null) {
          host.setReplica(hostDef.isReplica());
          if (hostDef.isPrimary()) {
            host.setPrimary(true);
            part.setMaster(host);
            host.didBecomeMaster();
          } else if (hostDef.isReplica()) {
            host.didBecomeSlave();
          }
          for (NodeDef nodeDef : hostDef.nodeDefs()) {
            createNode(edge, mesh, part, host, nodeDef);
          }
        }
      }
      return host;
    }
    return null;
  }

  protected NodeBinding createNode(EdgeBinding edge, MeshBinding mesh, PartBinding part,
                                   HostBinding host, NodeDef nodeDef) {
    final Uri meshUri = mesh.meshUri();
    final Value partKey = part.partKey();
    final Uri hostUri = host.hostUri();
    final Uri nodeUri = nodeDef.nodeUri();
    if (nodeUri != null) {
      NodeBinding node = this.kernel.createNode(this.spaceName, meshUri, partKey, hostUri, nodeDef);
      if (node != null) {
        node = host.openNode(nodeUri, node);
        if (node != null) {
          for (LaneDef laneDef : nodeDef.laneDefs()) {
            createLane(edge, mesh, part, host, node, laneDef);
          }
        }
      }
      return node;
    }
    return null;
  }

  protected LaneBinding createLane(EdgeBinding edge, MeshBinding mesh, PartBinding part,
                                   HostBinding host, NodeBinding node, LaneDef lane) {
    return null; // TODO
  }

  protected EdgeBinding injectEdge(EdgeBinding edge) {
    return this.kernel.injectEdge(this.spaceName, edge);
  }

  protected Log openEdgeLog() {
    return this.kernel.openEdgeLog(this.spaceName);
  }

  protected Policy openEdgePolicy() {
    return this.kernel.openEdgePolicy(this.spaceName);
  }

  protected Stage openEdgeStage() {
    return this.kernel.openEdgeStage(this.spaceName);
  }

  protected StoreBinding openEdgeStore() {
    return this.kernel.openEdgeStore(this.spaceName);
  }

  public MeshDef getMeshDef(Uri meshUri) {
    MeshDef meshDef = this.fabricDef.getMeshDef(meshUri);
    if (meshDef == null) {
      meshDef = this.kernel.getMeshDef(this.spaceName, meshUri);
    }
    return meshDef;
  }

  @Override
  public MeshBinding createMesh(Uri meshUri) {
    return this.kernel.createMesh(this.spaceName, meshUri);
  }

  @Override
  public MeshBinding injectMesh(Uri meshUri, MeshBinding mesh) {
    final MeshDef meshDef = getMeshDef(meshUri);
    return new FabricMesh(this.kernel.injectMesh(this.spaceName, meshUri, mesh), meshDef);
  }

  public Log openMeshLog(Uri meshUri) {
    return this.kernel.openMeshLog(this.spaceName, meshUri);
  }

  public Policy openMeshPolicy(Uri meshUri) {
    return this.kernel.openMeshPolicy(this.spaceName, meshUri);
  }

  public Stage openMeshStage(Uri meshUri) {
    return this.kernel.openMeshStage(this.spaceName, meshUri);
  }

  public StoreBinding openMeshStore(Uri meshUri) {
    return this.kernel.openMeshStore(this.spaceName, meshUri);
  }

  public PartDef getPartDef(Uri meshUri, Value partKey) {
    PartDef partDef = this.fabricDef.getPartDef(partKey);
    if (partDef == null) {
      partDef = this.kernel.getPartDef(this.spaceName, meshUri, partKey);
    }
    return partDef;
  }

  @Override
  public PartBinding createPart(Uri meshUri, Value partKey) {
    return this.kernel.createPart(this.spaceName, meshUri, partKey);
  }

  @Override
  public PartBinding injectPart(Uri meshUri, Value partKey, PartBinding part) {
    return this.kernel.injectPart(this.spaceName, meshUri, partKey, part);
  }

  public Log openPartLog(Uri meshUri, Value partKey) {
    return this.kernel.openPartLog(this.spaceName, meshUri, partKey);
  }

  public Policy openPartPolicy(Uri meshUri, Value partKey) {
    return this.kernel.openPartPolicy(this.spaceName, meshUri, partKey);
  }

  public Stage openPartStage(Uri meshUri, Value partKey) {
    return this.kernel.openPartStage(this.spaceName, meshUri, partKey);
  }

  public StoreBinding openPartStore(Uri meshUri, Value partKey) {
    return this.kernel.openPartStore(this.spaceName, meshUri, partKey);
  }

  public HostDef getHostDef(Uri meshUri, Value partKey, Uri hostUri) {
    HostDef hostDef = this.fabricDef.getHostDef(hostUri);
    if (hostDef == null) {
      hostDef = this.kernel.getHostDef(this.spaceName, meshUri, partKey, hostUri);
    }
    return hostDef;
  }

  @Override
  public HostBinding createHost(Uri meshUri, Value partKey, Uri hostUri) {
    return this.kernel.createHost(this.spaceName, meshUri, partKey, hostUri);
  }

  @Override
  public HostBinding injectHost(Uri meshUri, Value partKey, Uri hostUri, HostBinding host) {
    return this.kernel.injectHost(this.spaceName, meshUri, partKey, hostUri, host);
  }

  public Log openHostLog(Uri meshUri, Value partKey, Uri hostUri) {
    return this.kernel.openHostLog(this.spaceName, meshUri, partKey, hostUri);
  }

  public Policy openHostPolicy(Uri meshUri, Value partKey, Uri hostUri) {
    return this.kernel.openHostPolicy(this.spaceName, meshUri, partKey, hostUri);
  }

  public Stage openHostStage(Uri meshUri, Value partKey, Uri hostUri) {
    return this.kernel.openHostStage(this.spaceName, meshUri, partKey, hostUri);
  }

  public StoreBinding openHostStore(Uri meshUri, Value partKey, Uri hostUri) {
    return this.kernel.openHostStore(this.spaceName, meshUri, partKey, hostUri);
  }

  public NodeDef getNodeDef(Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri) {
    NodeDef nodeDef = this.fabricDef.getNodeDef(nodeUri);
    if (nodeDef == null) {
      nodeDef = this.kernel.getNodeDef(this.spaceName, meshUri, partKey, hostUri, nodeUri);
    }
    return nodeDef;
  }

  @Override
  public NodeBinding createNode(Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri) {
    if (!meshUri.isDefined()) {
      final AgentFactory<?> agentFactory = this.agentFactories.get(nodeUri);
      if (agentFactory != null) {
        final Value props = agentFactory.createProps(nodeUri);
        return new AgentModel(props);
      }
    }
    return this.kernel.createNode(this.spaceName, meshUri, partKey, hostUri, nodeUri);
  }

  @Override
  public NodeBinding injectNode(Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri, NodeBinding node) {
    return this.kernel.injectNode(this.spaceName, meshUri, partKey, hostUri, nodeUri, node);
  }

  public Log openNodeLog(Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri) {
    return this.kernel.openNodeLog(this.spaceName, meshUri, partKey, hostUri, nodeUri);
  }

  public Policy openNodePolicy(Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri) {
    return this.kernel.openNodePolicy(this.spaceName, meshUri, partKey, hostUri, nodeUri);
  }

  public Stage openNodeStage(Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri) {
    return this.kernel.openNodeStage(this.spaceName, meshUri, partKey, hostUri, nodeUri);
  }

  public StoreBinding openNodeStore(Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri) {
    return this.kernel.openNodeStore(this.spaceName, meshUri, partKey, hostUri, nodeUri);
  }

  public LaneDef getLaneDef(Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri, Uri laneUri) {
    LaneDef laneDef = this.fabricDef.getLaneDef(laneUri);
    if (laneDef == null) {
      laneDef = this.kernel.getLaneDef(this.spaceName, meshUri, partKey, hostUri, nodeUri, laneUri);
    }
    return laneDef;
  }

  @Override
  public LaneBinding injectLane(Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri, Uri laneUri, LaneBinding lane) {
    return this.kernel.injectLane(this.spaceName, meshUri, partKey, hostUri, nodeUri, laneUri, lane);
  }

  public Log openLaneLog(Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri, Uri laneUri) {
    return this.kernel.openLaneLog(this.spaceName, meshUri, partKey, hostUri, nodeUri, laneUri);
  }

  public Policy openLanePolicy(Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri, Uri laneUri) {
    return this.kernel.openLanePolicy(this.spaceName, meshUri, partKey, hostUri, nodeUri, laneUri);
  }

  public Stage openLaneStage(Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri, Uri laneUri) {
    return this.kernel.openLaneStage(this.spaceName, meshUri, partKey, hostUri, nodeUri, laneUri);
  }

  public StoreBinding openLaneStore(Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri, Uri laneUri) {
    return this.kernel.openLaneStore(this.spaceName, meshUri, partKey, hostUri, nodeUri, laneUri);
  }

  @Override
  public PolicyDirective<Identity> authenticate(Credentials credentials) {
    PolicyDirective<Identity> directive = null;
    final HashTrieMap<String, Authenticator> authenticators = this.authenticators;
    if (!authenticators.isEmpty()) {
      for (Authenticator authenticator : authenticators.values()) {
        directive = authenticator.authenticate(credentials);
        if (directive != null) {
          break;
        }
      }
    } else {
      final Identity identity = new FabricIdentity(credentials.requestUri(), credentials.fromUri(), Value.absent());
      directive = PolicyDirective.<Identity>allow(identity);
    }
    return directive;
  }

  @Override
  public LinkBinding bindDownlink(Downlink downlink) {
    return this.edge.bindDownlink(downlink);
  }

  @Override
  public void openDownlink(LinkBinding link) {
    this.edge.openDownlink(link);
  }

  @Override
  public void closeDownlink(LinkBinding link) {
    // nop
  }

  @Override
  public void httpDownlink(HttpBinding http) {
    this.edge.httpDownlink(http);
  }

  @Override
  public void pushDown(PushRequest pushRequest) {
    this.edge.pushDown(pushRequest);
  }

  @Override
  public void trace(Object message) {
    final Log log = this.log;
    if (log != null) {
      log.trace(message);
    } else {
      this.kernel.trace(message);
    }
  }

  @Override
  public void debug(Object message) {
    final Log log = this.log;
    if (log != null) {
      log.debug(message);
    } else {
      this.kernel.debug(message);
    }
  }

  @Override
  public void info(Object message) {
    final Log log = this.log;
    if (log != null) {
      log.info(message);
    } else {
      this.kernel.info(message);
    }
  }

  @Override
  public void warn(Object message) {
    final Log log = this.log;
    if (log != null) {
      log.warn(message);
    } else {
      this.kernel.warn(message);
    }
  }

  @Override
  public void error(Object message) {
    final Log log = this.log;
    if (log != null) {
      log.error(message);
    } else {
      this.kernel.error(message);
    }
  }

  @Override
  public void open() {
    this.edge.open();
  }

  @Override
  public void load() {
    this.edge.load();
  }

  @Override
  public void start() {
    this.edge.start();
  }

  @Override
  public void stop() {
    this.edge.stop();
  }

  @Override
  public void unload() {
    this.edge.unload();
  }

  @Override
  public void close() {
    this.edge.close();
  }

  @Override
  public void willOpen() {
    if (this.log == null) {
      this.log = openLog();
    }
    if (this.policy == null) {
      this.policy = openPolicy();
    }
    if (this.stage == null) {
      this.stage = openStage();
    }
    if (this.store == null) {
      this.store = openStore();
    }
    this.open();
  }

  @Override
  public void didOpen() {
    // nop
  }

  @Override
  public void willLoad() {
    this.load();
  }

  @Override
  public void didLoad() {
    // nop
  }

  @Override
  public void willStart() {
    for (Plane plane : this.planes.values()) {
      plane.willStart();
    }
    this.start();
  }

  @Override
  public void didStart() {
    for (Plane plane : this.planes.values()) {
      plane.didStart();
    }
  }

  @Override
  public void willStop() {
    for (Plane plane : this.planes.values()) {
      plane.willStop();
    }
    this.stop();
  }

  @Override
  public void didStop() {
    for (Plane plane : this.planes.values()) {
      plane.didStop();
    }
  }

  @Override
  public void willUnload() {
    this.unload();
  }

  @Override
  public void didUnload() {
    // nop
  }

  @Override
  public void willClose() {
    for (Plane plane : this.planes.values()) {
      plane.willClose();
    }
    this.close();
  }

  @Override
  public void didClose() {
    for (Plane plane : this.planes.values()) {
      plane.didClose();
    }
    closeStore();
    closeStage();
    closePolicy();
    closeLog();
  }

  @Override
  public void didFail(Throwable error) {
    for (Plane plane : this.planes.values()) {
      plane.didFail(error);
    }
  }

  @SuppressWarnings("unchecked")
  static final AtomicReferenceFieldUpdater<Fabric, HashTrieMap<String, Plane>> PLANES =
      AtomicReferenceFieldUpdater.newUpdater(Fabric.class, (Class<HashTrieMap<String, Plane>>) (Class<?>) HashTrieMap.class, "planes");

  @SuppressWarnings("unchecked")
  static final AtomicReferenceFieldUpdater<Fabric, HashTrieMap<String, AgentRoute<?>>> AGENT_ROUTES =
      AtomicReferenceFieldUpdater.newUpdater(Fabric.class, (Class<HashTrieMap<String, AgentRoute<?>>>) (Class<?>) HashTrieMap.class, "agentRoutes");

  @SuppressWarnings("unchecked")
  static final AtomicReferenceFieldUpdater<Fabric, UriMapper<AgentFactory<?>>> AGENT_FACTORIES =
      AtomicReferenceFieldUpdater.newUpdater(Fabric.class, (Class<UriMapper<AgentFactory<?>>>) (Class<?>) UriMapper.class, "agentFactories");

  @SuppressWarnings("unchecked")
  static final AtomicReferenceFieldUpdater<Fabric, HashTrieMap<String, Authenticator>> AUTHENTICATORS =
      AtomicReferenceFieldUpdater.newUpdater(Fabric.class, (Class<HashTrieMap<String, Authenticator>>) (Class<?>) HashTrieMap.class, "authenticators");
}
