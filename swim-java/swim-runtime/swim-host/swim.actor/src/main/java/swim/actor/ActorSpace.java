// Copyright 2015-2023 Nstream, inc.
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

package swim.actor;

import java.util.Collection;
import java.util.concurrent.atomic.AtomicReferenceFieldUpdater;
import swim.api.Downlink;
import swim.api.SwimContext;
import swim.api.agent.Agent;
import swim.api.agent.AgentDef;
import swim.api.agent.AgentFactory;
import swim.api.agent.AgentRoute;
import swim.api.agent.AgentRouteContext;
import swim.api.auth.Authenticator;
import swim.api.auth.Credentials;
import swim.api.auth.Identity;
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
import swim.concurrent.StageDef;
import swim.kernel.KernelContext;
import swim.store.StoreBinding;
import swim.store.StoreDef;
import swim.structure.Value;
import swim.system.AbstractTierBinding;
import swim.system.CellAddress;
import swim.system.EdgeAddress;
import swim.system.EdgeBinding;
import swim.system.EdgeContext;
import swim.system.HostAddress;
import swim.system.HostBinding;
import swim.system.HostDef;
import swim.system.LaneAddress;
import swim.system.LaneBinding;
import swim.system.LaneDef;
import swim.system.LinkBinding;
import swim.system.LogDef;
import swim.system.MeshAddress;
import swim.system.MeshBinding;
import swim.system.MeshDef;
import swim.system.Metric;
import swim.system.NodeAddress;
import swim.system.NodeBinding;
import swim.system.NodeDef;
import swim.system.PartAddress;
import swim.system.PartBinding;
import swim.system.PartDef;
import swim.system.PolicyDef;
import swim.system.Push;
import swim.system.TierContext;
import swim.system.agent.AgentModel;
import swim.uri.Uri;
import swim.uri.UriMapper;
import swim.uri.UriPattern;
import swim.util.Log;

public class ActorSpace extends AbstractTierBinding implements EdgeContext, PlaneContext, Space {

  final EdgeAddress edgeAddress;
  final ActorSpaceDef spaceDef;
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

  public ActorSpace(EdgeAddress edgeAddress, ActorSpaceDef spaceDef, KernelContext kernel) {
    this.edgeAddress = edgeAddress;
    this.spaceDef = spaceDef;
    this.kernel = kernel;
    EdgeBinding edge = this.createEdge();
    edge.setEdgeContext(this);
    edge = edge.edgeWrapper();
    this.edge = edge;

    this.log = null;
    this.policy = null;
    this.stage = null;
    this.store = null;

    this.planes = HashTrieMap.empty();
    this.agentRoutes = HashTrieMap.empty();
    this.agentFactories = UriMapper.empty();
    this.authenticators = HashTrieMap.empty();
  }

  public final ActorSpaceDef spaceDef() {
    return this.spaceDef;
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
    if (edgeClass.isAssignableFrom(this.getClass())) {
      return (T) this;
    } else {
      return null;
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T bottomEdge(Class<T> edgeClass) {
    if (edgeClass.isAssignableFrom(this.getClass())) {
      return (T) this;
    } else {
      return null;
    }
  }

  @Override
  public final EdgeAddress cellAddress() {
    return this.edgeAddress;
  }

  @Override
  public final String edgeName() {
    return this.edgeAddress.edgeName();
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
    return ActorSpace.AUTHENTICATORS.get(this).get(authenticatorName);
  }

  @Override
  public void addAuthenticator(String authenticatorName, Authenticator authenticator) {
    final ActorAuthenticator authenticatorContext = new ActorAuthenticator(authenticatorName, authenticator, this.kernel);
    do {
      final HashTrieMap<String, Authenticator> oldAuthenticators = ActorSpace.AUTHENTICATORS.get(this);
      final HashTrieMap<String, Authenticator> newAuthenticators = oldAuthenticators.updated(authenticatorName, authenticator);
      if (ActorSpace.AUTHENTICATORS.compareAndSet(this, oldAuthenticators, newAuthenticators)) {
        break;
      }
    } while (true);
  }

  @Override
  public Collection<? extends Plane> planes() {
    return ActorSpace.PLANES.get(this).values();
  }

  @Override
  public Plane getPlane(String planeName) {
    return ActorSpace.PLANES.get(this).get(planeName);
  }

  @SuppressWarnings("unchecked")
  @Override
  public <P extends Plane> P getPlane(Class<? extends P> planeClass) {
    for (Plane plane : ActorSpace.PLANES.get(this).values()) {
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
      final HashTrieMap<String, Plane> oldPlanes = ActorSpace.PLANES.get(this);
      final Plane oldPlane = oldPlanes.get(planeName);
      if (oldPlane == null) {
        if (plane == null) {
          plane = this.createPlane(planeFactory);
          plane = (P) this.kernel.injectPlane(plane);
        }
        final HashTrieMap<String, Plane> newPlanes = oldPlanes.updated(planeName, plane);
        if (ActorSpace.PLANES.compareAndSet(this, oldPlanes, newPlanes)) {
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
    Plane plane = this.getPlane(planeName);
    if (plane == null) {
      final PlaneFactory<P> planeFactory = this.kernel.createPlaneFactory(planeClass);
      if (planeFactory != null) {
        plane = this.openPlane(planeName, planeFactory);
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
    return (AgentRoute<A>) ActorSpace.AGENT_ROUTES.get(this).get(routeName);
  }

  @Override
  public <A extends Agent> AgentRoute<A> createAgentRoute(Class<? extends A> agentClass) {
    return this.kernel.createAgentRoute(this.edge, agentClass);
  }

  @Override
  public void addAgentRoute(String routeName, UriPattern pattern, AgentRoute<?> agentRoute) {
    final AgentRouteContext agentRouteContext = new ActorAgentRoute(routeName, pattern);
    agentRoute.setAgentRouteContext(agentRouteContext);

    do {
      final HashTrieMap<String, AgentRoute<?>> oldAgentRoutes = ActorSpace.AGENT_ROUTES.get(this);
      final HashTrieMap<String, AgentRoute<?>> newAgentRoutes = oldAgentRoutes.updated(routeName, agentRoute);
      if (ActorSpace.AGENT_ROUTES.compareAndSet(this, oldAgentRoutes, newAgentRoutes)) {
        break;
      }
    } while (true);

    do {
      final UriMapper<AgentFactory<?>> oldAgentFactories = ActorSpace.AGENT_FACTORIES.get(this);
      final UriMapper<AgentFactory<?>> newAgentFactories = oldAgentFactories.updated(pattern, agentRoute);
      if (ActorSpace.AGENT_FACTORIES.compareAndSet(this, oldAgentFactories, newAgentFactories)) {
        break;
      }
    } while (true);
  }

  @Override
  public void addAgentRoute(String routeName, String pattern, AgentRoute<?> agentRoute) {
    this.addAgentRoute(routeName, UriPattern.parse(pattern), agentRoute);
  }

  @Override
  public void removeAgentRoute(String routeName) {
    do {
      final HashTrieMap<String, AgentRoute<?>> oldAgentRoutes = ActorSpace.AGENT_ROUTES.get(this);
      final HashTrieMap<String, AgentRoute<?>> newAgentRoutes = oldAgentRoutes.removed(routeName);
      if (ActorSpace.AGENT_ROUTES.compareAndSet(this, oldAgentRoutes, newAgentRoutes)) {
        final AgentRoute<?> agentRoute = oldAgentRoutes.get(routeName);
        if (agentRoute != null) {
          do {
            final UriMapper<AgentFactory<?>> oldAgentFactories = ActorSpace.AGENT_FACTORIES.get(this);
            final UriMapper<AgentFactory<?>> newAgentFactories = oldAgentFactories.removed(agentRoute.pattern());
            if (ActorSpace.AGENT_FACTORIES.compareAndSet(this, oldAgentFactories, newAgentFactories)) {
              break;
            }
          } while (true);
        }
        break;
      }
    } while (true);
  }

  @Override
  public AgentFactory<?> getAgentFactory(Uri nodeUri) {
    return ActorSpace.AGENT_FACTORIES.get(this).get(nodeUri);
  }

  @Override
  public AgentFactory<?> createAgentFactory(NodeBinding node, AgentDef agentDef) {
    return this.kernel.createAgentFactory(node, agentDef);
  }

  @Override
  public <A extends Agent> AgentFactory<A> createAgentFactory(NodeBinding node, Class<? extends A> agentClass) {
    return this.kernel.createAgentFactory(node, agentClass);
  }

  @Override
  public void openAgents(NodeBinding node) {
    this.kernel.openAgents(node);
    if (!node.meshUri().isDefined()) {
      final Uri nodeUri = node.nodeUri();
      final NodeDef nodeDef = this.spaceDef.getNodeDef(nodeUri);
      if (nodeDef != null && node instanceof AgentModel) {
        final AgentModel agentModel = (AgentModel) node;
        for (AgentDef agentDef : nodeDef.agentDefs()) {
          final AgentFactory<?> agentFactory = this.createAgentFactory(node, agentDef);
          if (agentDef != null) {
            final Value id = agentDef.id();
            final Value props = agentModel.props().concat(agentDef.props());
            agentModel.addAgentView(agentModel.createAgent(agentFactory, id, props));
          }
        }
      }
      final AgentFactory<?> agentFactory = ActorSpace.AGENT_FACTORIES.get(this).get(nodeUri);
      if (agentFactory != null && node instanceof AgentModel) {
        final AgentModel agentModel = (AgentModel) node;
        final Value id = agentFactory.id(nodeUri);
        final Value props = agentModel.props().concat(agentFactory.props(nodeUri));
        agentModel.addAgentView(agentModel.createAgent(agentFactory, id, props));
      }
    }
  }

  public Log createLog(LogDef logDef) {
    return this.kernel.createLog(logDef);
  }

  public Log createLog(CellAddress cellAddress) {
    return this.kernel.createLog(cellAddress);
  }

  public Log injectLog(Log log) {
    return this.kernel.injectLog(log);
  }

  protected Log openLog() {
    Log log;
    if (this.spaceDef.logDef != null) {
      log = this.createLog(this.spaceDef.logDef);
    } else {
      log = this.createLog(this.cellAddress());
    }
    if (log != null) {
      log = this.injectLog(log);
    }
    return log;
  }

  protected void closeLog() {
    this.log = null;
  }

  public Policy createPolicy(PolicyDef policyDef) {
    return this.kernel.createPolicy(policyDef);
  }

  public Policy createPolicy(CellAddress cellAddress) {
    return this.kernel.createPolicy(cellAddress);
  }

  public Policy injectPolicy(Policy policy) {
    return this.kernel.injectPolicy(policy);
  }

  protected PlanePolicy openPolicy() {
    Policy policy;
    if (this.spaceDef.policyDef != null) {
      policy = this.createPolicy(this.spaceDef.policyDef);
    } else {
      policy = this.createPolicy(this.cellAddress());
    }
    if (policy != null) {
      policy = this.injectPolicy(policy);
    }
    return (PlanePolicy) policy;
  }

  protected void closePolicy() {
    this.policy = null;
  }

  public Stage createStage(StageDef stageDef) {
    return this.kernel.createStage(stageDef);
  }

  public Stage createStage(CellAddress cellAddress) {
    return this.kernel.createStage(cellAddress);
  }

  public Stage injectStage(Stage stage) {
    return this.kernel.injectStage(stage);
  }

  protected Stage openStage() {
    Stage stage;
    if (this.spaceDef.stageDef != null) {
      stage = this.createStage(this.spaceDef.stageDef);
    } else {
      stage = this.createStage(this.cellAddress());
    }
    if (stage != null) {
      stage = this.injectStage(stage);
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

  public StoreBinding createStore(CellAddress cellAddress) {
    return this.kernel.createStore(cellAddress);
  }

  public StoreBinding injectStore(StoreBinding store) {
    return this.kernel.injectStore(store);
  }

  protected StoreBinding openStore() {
    StoreBinding store = null;
    if (this.spaceDef.storeDef != null) {
      store = this.createStore(this.spaceDef.storeDef);
    } else {
      store = this.createStore(this.cellAddress());
    }
    if (store != null) {
      store = this.injectStore(store);
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
    final EdgeAddress edgeAddress = this.cellAddress();
    EdgeBinding edge = this.kernel.createEdge(edgeAddress);
    if (edge != null) {
      edge = this.injectEdge(edgeAddress, edge);
    }
    return edge;
  }

  protected void seedEdge(EdgeBinding edge) {
    for (MeshDef meshDef : this.spaceDef.meshDefs()) {
      this.seedMesh(edge, meshDef);
    }
    if (edge.network() == null) {
      final MeshBinding network = edge.openMesh(Uri.empty());
      edge.setNetwork(network);

      final PartBinding gateway = network.openGateway();

      final HostBinding localHost = gateway.openHost(Uri.empty());
      gateway.setMaster(localHost);
    }
    final MeshBinding mesh = edge.network();
    if (mesh != null) {
      for (PartDef partDef : this.spaceDef.partDefs()) {
        this.seedPart(mesh, partDef);
      }
      for (NodeDef nodeDef : this.spaceDef.nodeDefs()) {
        final Uri nodeUri = nodeDef.nodeUri();
        if (nodeUri != null) {
          final PartBinding part = mesh.openPart(nodeUri);
          if (part != null) {
            final HostBinding host = part.master();
            if (host != null) {
              this.seedNode(host, nodeDef);
            }
          }
        }
      }
    }
  }

  protected MeshBinding seedMesh(EdgeBinding edge, MeshDef meshDef) {
    final Uri meshUri = meshDef.meshUri();
    MeshBinding mesh = this.kernel.createMesh(edge, meshDef);
    if (mesh != null) {
      mesh = edge.openMesh(meshUri, mesh);
      if (mesh != null) {
        if (!meshUri.isDefined()) {
          edge.setNetwork(mesh);
        }
        for (PartDef partDef : meshDef.partDefs()) {
          this.seedPart(mesh, partDef);
        }
        for (NodeDef nodeDef : meshDef.nodeDefs()) {
          final Uri nodeUri = nodeDef.nodeUri();
          if (nodeUri != null) {
            final PartBinding part = mesh.openPart(nodeUri);
            if (part != null) {
              final HostBinding host = part.master();
              if (host != null) {
                this.seedNode(host, nodeDef);
              }
            }
          }
        }
      }
    }
    return mesh;
  }

  protected PartBinding seedPart(MeshBinding mesh, PartDef partDef) {
    final Value partKey = partDef.partKey();
    PartBinding part = this.kernel.createPart(mesh, partDef);
    if (part != null) {
      part = mesh.addPart(partKey, part);
      if (part != null) {
        if (partDef.isGateway()) {
          mesh.setGateway(part);
        }
        for (HostDef hostDef : partDef.hostDefs()) {
          this.seedHost(part, hostDef);
        }
        for (NodeDef nodeDef : partDef.nodeDefs()) {
          final Uri nodeUri = nodeDef.nodeUri();
          if (nodeUri != null) {
            final HostBinding host = part.master();
            if (host != null) {
              this.seedNode(host, nodeDef);
            }
          }
        }
      }
    }
    return part;
  }

  protected HostBinding seedHost(PartBinding part, HostDef hostDef) {
    final Uri hostUri = hostDef.hostUri();
    HostBinding host = null;
    if (hostUri != null) {
      host = this.kernel.createHost(part, hostDef);
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
            this.seedNode(host, nodeDef);
          }
        }
      }
    }
    return host;
  }

  protected NodeBinding seedNode(HostBinding host, NodeDef nodeDef) {
    final Uri nodeUri = nodeDef.nodeUri();
    NodeBinding node = null;
    if (nodeUri != null) {
      node = this.kernel.createNode(host, nodeDef);
      if (node == null) {
        final Value props = nodeDef.props(nodeUri);
        node = new AgentModel(props);
      }
      if (node != null) {
        node = host.openNode(nodeUri, node);
        if (node != null) {
          for (LaneDef laneDef : nodeDef.laneDefs()) {
            this.seedLane(node, laneDef);
          }
        }
      }
    }
    return node;
  }

  protected LaneBinding seedLane(NodeBinding node, LaneDef laneDef) {
    final Uri laneUri = laneDef.laneUri();
    LaneBinding lane = null;
    if (laneUri != null) {
      lane = this.kernel.createLane(node, laneDef);
      if (lane != null) {
        lane = node.openLane(laneUri, lane);
      }
    }
    return lane;
  }

  protected EdgeBinding injectEdge(EdgeAddress edgeAddress, EdgeBinding edge) {
    return this.kernel.injectEdge(edgeAddress, edge);
  }

  @Override
  public void openMetaEdge(EdgeBinding edge, NodeBinding metaEdge) {
    this.kernel.openMetaEdge(edge, metaEdge);
  }

  public MeshDef getMeshDef(MeshAddress meshAddress) {
    MeshDef meshDef = this.spaceDef.getMeshDef(meshAddress.meshUri());
    if (meshDef == null) {
      meshDef = this.kernel.getMeshDef(meshAddress);
    }
    return meshDef;
  }

  @Override
  public MeshBinding createMesh(MeshAddress meshAddress) {
    return this.kernel.createMesh(meshAddress);
  }

  @Override
  public MeshBinding injectMesh(MeshAddress meshAddress, MeshBinding mesh) {
    final MeshDef meshDef = this.getMeshDef(meshAddress);
    return new ActorMesh(this.kernel.injectMesh(meshAddress, mesh), meshDef);
  }

  @Override
  public void openMetaMesh(MeshBinding mesh, NodeBinding metaMesh) {
    this.kernel.openMetaMesh(mesh, metaMesh);
  }

  public PartDef getPartDef(PartAddress partAddress) {
    PartDef partDef = this.spaceDef.getPartDef(partAddress.partKey());
    if (partDef == null) {
      partDef = this.kernel.getPartDef(partAddress);
    }
    return partDef;
  }

  @Override
  public PartBinding createPart(PartAddress partAddress) {
    return this.kernel.createPart(partAddress);
  }

  @Override
  public PartBinding injectPart(PartAddress partAddress, PartBinding part) {
    return this.kernel.injectPart(partAddress, part);
  }

  @Override
  public void openMetaPart(PartBinding part, NodeBinding metaPart) {
    this.kernel.openMetaPart(part, metaPart);
  }

  public HostDef getHostDef(HostAddress hostAddress) {
    HostDef hostDef = this.spaceDef.getHostDef(hostAddress.hostUri());
    if (hostDef == null) {
      hostDef = this.kernel.getHostDef(hostAddress);
    }
    return hostDef;
  }

  @Override
  public HostBinding createHost(HostAddress hostAddress) {
    return this.kernel.createHost(hostAddress);
  }

  @Override
  public HostBinding injectHost(HostAddress hostAddress, HostBinding host) {
    return this.kernel.injectHost(hostAddress, host);
  }

  @Override
  public void openMetaHost(HostBinding host, NodeBinding metaHost) {
    this.kernel.openMetaHost(host, metaHost);
  }

  public NodeDef getNodeDef(NodeAddress nodeAddress) {
    NodeDef nodeDef = this.spaceDef.getNodeDef(nodeAddress.nodeUri());
    if (nodeDef == null) {
      nodeDef = this.kernel.getNodeDef(nodeAddress);
    }
    return nodeDef;
  }

  @Override
  public NodeBinding createNode(NodeAddress nodeAddress) {
    final Uri meshUri = nodeAddress.meshUri();
    final Uri nodeUri = nodeAddress.nodeUri();
    NodeBinding node = null;
    if (!meshUri.isDefined()) {
      final AgentFactory<?> agentFactory = ActorSpace.AGENT_FACTORIES.get(this).get(nodeUri);
      if (agentFactory != null) {
        final Value props = agentFactory.props(nodeUri);
        node = new AgentModel(props);
      }
    }
    if (node == null) {
      node = this.kernel.createNode(nodeAddress);
    }
    if (node == null && !meshUri.isDefined()) {
      final NodeDef nodeDef = this.spaceDef.getNodeDef(nodeUri);
      if (nodeDef != null) {
        final Value props = nodeDef.props(nodeUri);
        node = new AgentModel(props);
      }
    }
    return node;
  }

  @Override
  public NodeBinding injectNode(NodeAddress nodeAddress, NodeBinding node) {
    return this.kernel.injectNode(nodeAddress, node);
  }

  @Override
  public void openMetaNode(NodeBinding node, NodeBinding metaNode) {
    this.kernel.openMetaNode(node, metaNode);
  }

  public LaneDef getLaneDef(LaneAddress laneAddress) {
    LaneDef laneDef = this.spaceDef.getLaneDef(laneAddress.laneUri());
    if (laneDef == null) {
      laneDef = this.kernel.getLaneDef(laneAddress);
    }
    return laneDef;
  }

  @Override
  public LaneBinding createLane(LaneAddress laneAddress) {
    return this.kernel.createLane(laneAddress);
  }

  @Override
  public LaneBinding injectLane(LaneAddress laneAddress, LaneBinding lane) {
    return this.kernel.injectLane(laneAddress, lane);
  }

  @Override
  public void openMetaLane(LaneBinding lane, NodeBinding metaLane) {
    this.kernel.openMetaLane(lane, metaLane);
  }

  @Override
  public void openMetaUplink(LinkBinding uplink, NodeBinding metaUplink) {
    this.kernel.openMetaUplink(uplink, metaUplink);
  }

  @Override
  public void openMetaDownlink(LinkBinding downlink, NodeBinding metaDownlink) {
    this.kernel.openMetaDownlink(downlink, metaDownlink);
  }

  @Override
  public LaneBinding createLane(NodeBinding node, LaneDef laneDef) {
    return this.kernel.createLane(node, laneDef);
  }

  @Override
  public void openLanes(NodeBinding node) {
    this.kernel.openLanes(node);
  }

  @Override
  public PolicyDirective<Identity> authenticate(Credentials credentials) {
    PolicyDirective<Identity> directive = null;
    final HashTrieMap<String, Authenticator> authenticators = ActorSpace.AUTHENTICATORS.get(this);
    if (!authenticators.isEmpty()) {
      for (Authenticator authenticator : authenticators.values()) {
        directive = authenticator.authenticate(credentials);
        if (directive != null) {
          break;
        }
      }
    } else {
      final Identity identity = new ActorIdentity(credentials.requestUri(), credentials.fromUri(), Value.absent());
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
  public void pushDown(Push<?> push) {
    this.edge.pushDown(push);
  }

  @Override
  public void reportDown(Metric metric) {
    this.kernel.reportDown(metric);
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
  public void fail(Object message) {
    final Log log = this.log;
    if (log != null) {
      log.fail(message);
    } else {
      this.kernel.fail(message);
    }
  }

  @Override
  public void open() {
    this.seedEdge(this.edge);
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
      this.log = this.openLog();
    }
    if (this.policy == null) {
      this.policy = this.openPolicy();
    }
    if (this.stage == null) {
      this.stage = this.openStage();
    }
    if (this.store == null) {
      this.store = this.openStore();
    }
    this.open();
  }

  @Override
  public void didOpen() {
    // hook
  }

  @Override
  public void willLoad() {
    this.load();
  }

  @Override
  public void didLoad() {
    // hook
  }

  @Override
  public void willStart() {
    for (Plane plane : ActorSpace.PLANES.get(this).values()) {
      plane.willStart();
    }
    this.start();
  }

  @Override
  public void didStart() {
    for (Plane plane : ActorSpace.PLANES.get(this).values()) {
      plane.didStart();
    }
  }

  @Override
  public void willStop() {
    for (Plane plane : ActorSpace.PLANES.get(this).values()) {
      plane.willStop();
    }
    this.stop();
  }

  @Override
  public void didStop() {
    for (Plane plane : ActorSpace.PLANES.get(this).values()) {
      plane.didStop();
    }
  }

  @Override
  public void willUnload() {
    this.unload();
  }

  @Override
  public void didUnload() {
    // hook
  }

  @Override
  public void willClose() {
    for (Plane plane : ActorSpace.PLANES.get(this).values()) {
      plane.willClose();
    }
    this.close();
  }

  @Override
  public void didClose() {
    for (Plane plane : ActorSpace.PLANES.get(this).values()) {
      plane.didClose();
    }
    this.closeStore();
    this.closeStage();
    this.closePolicy();
    this.closeLog();
  }

  @Override
  public void didFail(Throwable error) {
    for (Plane plane : ActorSpace.PLANES.get(this).values()) {
      plane.didFail(error);
    }
  }

  @SuppressWarnings("unchecked")
  static final AtomicReferenceFieldUpdater<ActorSpace, HashTrieMap<String, Plane>> PLANES =
      AtomicReferenceFieldUpdater.newUpdater(ActorSpace.class, (Class<HashTrieMap<String, Plane>>) (Class<?>) HashTrieMap.class, "planes");
  @SuppressWarnings("unchecked")
  static final AtomicReferenceFieldUpdater<ActorSpace, HashTrieMap<String, AgentRoute<?>>> AGENT_ROUTES =
      AtomicReferenceFieldUpdater.newUpdater(ActorSpace.class, (Class<HashTrieMap<String, AgentRoute<?>>>) (Class<?>) HashTrieMap.class, "agentRoutes");
  @SuppressWarnings("unchecked")
  static final AtomicReferenceFieldUpdater<ActorSpace, UriMapper<AgentFactory<?>>> AGENT_FACTORIES =
      AtomicReferenceFieldUpdater.newUpdater(ActorSpace.class, (Class<UriMapper<AgentFactory<?>>>) (Class<?>) UriMapper.class, "agentFactories");
  @SuppressWarnings("unchecked")
  static final AtomicReferenceFieldUpdater<ActorSpace, HashTrieMap<String, Authenticator>> AUTHENTICATORS =
      AtomicReferenceFieldUpdater.newUpdater(ActorSpace.class, (Class<HashTrieMap<String, Authenticator>>) (Class<?>) HashTrieMap.class, "authenticators");

}
