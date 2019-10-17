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

package swim.kernel;

import java.net.InetSocketAddress;
import java.util.concurrent.atomic.AtomicIntegerFieldUpdater;
import swim.api.agent.Agent;
import swim.api.agent.AgentDef;
import swim.api.agent.AgentFactory;
import swim.api.agent.AgentRoute;
import swim.api.auth.Authenticator;
import swim.api.auth.AuthenticatorDef;
import swim.api.plane.Plane;
import swim.api.plane.PlaneDef;
import swim.api.plane.PlaneFactory;
import swim.api.policy.Policy;
import swim.api.service.Service;
import swim.api.service.ServiceDef;
import swim.api.service.ServiceFactory;
import swim.api.space.Space;
import swim.api.space.SpaceDef;
import swim.collections.FingerTrieSeq;
import swim.concurrent.Schedule;
import swim.concurrent.ScheduleDef;
import swim.concurrent.Stage;
import swim.concurrent.StageDef;
import swim.io.IpService;
import swim.io.IpServiceRef;
import swim.io.IpSettings;
import swim.io.IpSocket;
import swim.io.IpSocketRef;
import swim.io.Station;
import swim.runtime.CellAddress;
import swim.runtime.EdgeAddress;
import swim.runtime.EdgeBinding;
import swim.runtime.HostAddress;
import swim.runtime.HostBinding;
import swim.runtime.HostDef;
import swim.runtime.LaneAddress;
import swim.runtime.LaneBinding;
import swim.runtime.LaneDef;
import swim.runtime.LinkBinding;
import swim.runtime.LogDef;
import swim.runtime.MeshAddress;
import swim.runtime.MeshBinding;
import swim.runtime.MeshDef;
import swim.runtime.Metric;
import swim.runtime.NodeAddress;
import swim.runtime.NodeBinding;
import swim.runtime.NodeDef;
import swim.runtime.PartAddress;
import swim.runtime.PartBinding;
import swim.runtime.PartDef;
import swim.runtime.PolicyDef;
import swim.store.StoreBinding;
import swim.store.StoreDef;
import swim.structure.Item;
import swim.util.Log;
import swim.web.WebRequest;
import swim.web.WebResponse;

public abstract class KernelProxy implements KernelBinding, KernelContext {
  protected KernelBinding kernelBinding;
  protected KernelContext kernelContext;
  protected volatile int status;

  @Override
  public final KernelBinding kernelWrapper() {
    final KernelBinding kernelBinding = this.kernelBinding;
    return kernelBinding != null ? kernelBinding.kernelWrapper() : this;
  }

  @Override
  public final KernelBinding kernelBinding() {
    return this.kernelBinding;
  }

  @Override
  public void setKernelBinding(KernelBinding kernelBinding) {
    this.kernelBinding = kernelBinding;
  }

  @Override
  public final KernelContext kernelContext() {
    return this.kernelContext;
  }

  @Override
  public void setKernelContext(KernelContext kernelContext) {
    this.kernelContext = kernelContext;
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T unwrapKernel(Class<T> kernelClass) {
    if (kernelClass.isAssignableFrom(getClass())) {
      return (T) this;
    } else {
      final KernelContext kernelContext = this.kernelContext;
      return kernelContext != null ? kernelContext.unwrapKernel(kernelClass) : null;
    }
  }

  @Override
  public abstract double kernelPriority();

  @Override
  public Kernel injectKernel(Kernel kernel) {
    if (kernelPriority() < kernel.kernelPriority()) {
      setKernelBinding((KernelBinding) kernel);
      ((KernelBinding) kernel).setKernelContext(this);
      return kernel;
    } else {
      final KernelContext kernelContext = this.kernelContext;
      if (kernelContext == null) {
        ((KernelContext) kernel).setKernelBinding(this);
        setKernelContext((KernelContext) kernel);
      } else {
        kernel = kernelContext.injectKernel(kernel);
        ((KernelContext) kernel).setKernelBinding(this);
        setKernelContext((KernelContext) kernel);
      }
      return this;
    }
  }

  @Override
  public FingerTrieSeq<Kernel> modules() {
    final KernelContext kernelContext = this.kernelContext;
    FingerTrieSeq<Kernel> modules = kernelContext != null ? kernelContext.modules() : FingerTrieSeq.empty();
    modules = modules.prepended(this);
    return modules;
  }

  @Override
  public final boolean isStarted() {
    return (this.status & STARTED) != 0;
  }

  @Override
  public Stage stage() {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.stage() : null;
  }

  @Override
  public Station station() {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.station() : null;
  }

  @Override
  public LogDef defineLog(Item logConfig) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.defineLog(logConfig) : null;
  }

  @Override
  public Log createLog(LogDef logDef) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.createLog(logDef) : null;
  }

  @Override
  public Log createLog(CellAddress cellAddress) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.createLog(cellAddress) : null;
  }

  @Override
  public Log injectLog(Log log) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.injectLog(log) : log;
  }

  @Override
  public PolicyDef definePolicy(Item policyConfig) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.definePolicy(policyConfig) : null;
  }

  @Override
  public Policy createPolicy(PolicyDef policyDef) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.createPolicy(policyDef) : null;
  }

  @Override
  public Policy createPolicy(CellAddress cellAddress) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.createPolicy(cellAddress) : null;
  }

  @Override
  public Policy injectPolicy(Policy policy) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.injectPolicy(policy) : policy;
  }

  @Override
  public ScheduleDef defineSchedule(Item scheduleConfig) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.defineSchedule(scheduleConfig) : null;
  }

  @Override
  public Schedule createSchedule(ScheduleDef scheduleDef, Stage stage) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.createSchedule(scheduleDef, stage) : null;
  }

  @Override
  public Schedule injectSchedule(Schedule schedule) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.injectSchedule(schedule) : schedule;
  }

  @Override
  public StageDef defineStage(Item stageConfig) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.defineStage(stageConfig) : null;
  }

  @Override
  public Stage createStage(StageDef stageDef) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.createStage(stageDef) : null;
  }

  @Override
  public Stage createStage(CellAddress cellAddress) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.createStage(cellAddress) : null;
  }

  @Override
  public Stage injectStage(Stage stage) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.injectStage(stage) : stage;
  }

  @Override
  public StoreDef defineStore(Item storeConfig) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.defineStore(storeConfig) : null;
  }

  @Override
  public StoreBinding createStore(StoreDef storeDef, ClassLoader classLoader) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.createStore(storeDef, classLoader) : null;
  }

  @Override
  public StoreBinding createStore(CellAddress cellAddress) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.createStore(cellAddress) : null;
  }

  @Override
  public StoreBinding injectStore(StoreBinding store) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.injectStore(store) : store;
  }

  @Override
  public AuthenticatorDef defineAuthenticator(Item authenticatorConfig) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.defineAuthenticator(authenticatorConfig) : null;
  }

  @Override
  public Authenticator createAuthenticator(AuthenticatorDef authenticatorDef, ClassLoader classLoader) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.createAuthenticator(authenticatorDef, classLoader) : null;
  }

  @Override
  public Authenticator injectAuthenticator(Authenticator authenticator) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.injectAuthenticator(authenticator) : authenticator;
  }

  @Override
  public IpSettings ipSettings() {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.ipSettings() : null;
  }

  @Override
  public IpServiceRef bindTcp(InetSocketAddress localAddress, IpService service, IpSettings ipSettings) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.bindTcp(localAddress, service, ipSettings) : null;
  }

  @Override
  public IpServiceRef bindTls(InetSocketAddress localAddress, IpService service, IpSettings ipSettings) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.bindTls(localAddress, service, ipSettings) : null;
  }

  @Override
  public IpSocketRef connectTcp(InetSocketAddress remoteAddress, IpSocket socket, IpSettings ipSettings) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.connectTcp(remoteAddress, socket, ipSettings) : null;
  }

  @Override
  public IpSocketRef connectTls(InetSocketAddress remoteAddress, IpSocket socket, IpSettings ipSettings) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.connectTls(remoteAddress, socket, ipSettings) : null;
  }

  @Override
  public Service getService(String serviceName) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.getService(serviceName) : null;
  }

  @Override
  public ServiceDef defineService(Item serviceConfig) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.defineService(serviceConfig) : null;
  }

  @Override
  public ServiceFactory<?> createServiceFactory(ServiceDef serviceDef, ClassLoader classLoader) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.createServiceFactory(serviceDef, classLoader) : null;
  }

  @Override
  public Service injectService(Service service) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.injectService(service) : service;
  }

  @Override
  public <S extends Service> S openService(String serviceName, ServiceFactory<S> serviceFactory) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.openService(serviceName, serviceFactory) : null;
  }

  @Override
  public WebResponse routeRequest(WebRequest request) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.routeRequest(request) : request.reject();
  }

  @Override
  public Space getSpace(String spaceName) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.getSpace(spaceName) : null;
  }

  @Override
  public SpaceDef defineSpace(Item spaceConfig) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.defineSpace(spaceConfig) : null;
  }

  @Override
  public Space openSpace(SpaceDef spaceDef) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.openSpace(spaceDef) : null;
  }

  @Override
  public PlaneDef definePlane(Item planeConfig) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.definePlane(planeConfig) : null;
  }

  @Override
  public PlaneFactory<?> createPlaneFactory(PlaneDef planeDef, ClassLoader classLoader) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.createPlaneFactory(planeDef, classLoader) : null;
  }

  @Override
  public <P extends Plane> PlaneFactory<P> createPlaneFactory(Class<? extends P> planeClass) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.createPlaneFactory(planeClass) : null;
  }

  @Override
  public Plane injectPlane(Plane plane) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.injectPlane(plane) : plane;
  }

  @Override
  public AgentDef defineAgent(Item agentConfig) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.defineAgent(agentConfig) : null;
  }

  @Override
  public AgentFactory<?> createAgentFactory(AgentDef agentDef, ClassLoader classLoader) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.createAgentFactory(agentDef, classLoader) : null;
  }

  @Override
  public AgentFactory<?> createAgentFactory(NodeBinding node, AgentDef agentDef) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.createAgentFactory(node, agentDef) : null;
  }

  @Override
  public <A extends Agent> AgentFactory<A> createAgentFactory(Class<? extends A> agentClass) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.createAgentFactory(agentClass) : null;
  }

  @Override
  public <A extends Agent> AgentFactory<A> createAgentFactory(NodeBinding node, Class<? extends A> agentClass) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.createAgentFactory(node, agentClass) : null;
  }

  @Override
  public <A extends Agent> AgentRoute<A> createAgentRoute(EdgeBinding edge, Class<? extends A> agentClass) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.createAgentRoute(edge, agentClass) : null;
  }

  @Override
  public void openAgents(NodeBinding node) {
    final KernelContext kernelContext = this.kernelContext;
    if (kernelContext != null) {
      kernelContext.openAgents(node);
    }
  }

  @Override
  public void openLanes(NodeBinding node) {
    final KernelContext kernelContext = this.kernelContext;
    if (kernelContext != null) {
      kernelContext.openLanes(node);
    }
  }

  @Override
  public EdgeBinding createEdge(EdgeAddress edgeAddress) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.createEdge(edgeAddress) : null;
  }

  @Override
  public EdgeBinding injectEdge(EdgeAddress edgeAddress, EdgeBinding edge) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.injectEdge(edgeAddress, edge) : edge;
  }

  @Override
  public void openMetaEdge(EdgeBinding edge, NodeBinding metaEdge) {
    final KernelContext kernelContext = this.kernelContext;
    if (kernelContext != null) {
      kernelContext.openMetaEdge(edge, metaEdge);
    }
  }

  @Override
  public MeshDef defineMesh(Item meshConfig) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.defineMesh(meshConfig) : null;
  }

  @Override
  public MeshDef getMeshDef(MeshAddress meshAddress) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.getMeshDef(meshAddress) : null;
  }

  @Override
  public MeshBinding createMesh(EdgeBinding edge, MeshDef meshDef) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.createMesh(edge, meshDef) : null;
  }

  @Override
  public MeshBinding createMesh(MeshAddress meshAddress) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.createMesh(meshAddress) : null;
  }

  @Override
  public MeshBinding injectMesh(MeshAddress meshAddress, MeshBinding mesh) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.injectMesh(meshAddress, mesh) : mesh;
  }

  @Override
  public void openMetaMesh(MeshBinding mesh, NodeBinding metaMesh) {
    final KernelContext kernelContext = this.kernelContext;
    if (kernelContext != null) {
      kernelContext.openMetaMesh(mesh, metaMesh);
    }
  }

  @Override
  public PartDef definePart(Item partConfig) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.definePart(partConfig) : null;
  }

  @Override
  public PartDef getPartDef(PartAddress partAddress) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.getPartDef(partAddress) : null;
  }

  @Override
  public PartBinding createPart(MeshBinding mesh, PartDef partDef) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.createPart(mesh, partDef) : null;
  }

  @Override
  public PartBinding createPart(PartAddress partAddress) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.createPart(partAddress) : null;
  }

  @Override
  public PartBinding injectPart(PartAddress partAddress, PartBinding part) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.injectPart(partAddress, part) : part;
  }

  @Override
  public void openMetaPart(PartBinding part, NodeBinding metaPart) {
    final KernelContext kernelContext = this.kernelContext;
    if (kernelContext != null) {
      kernelContext.openMetaPart(part, metaPart);
    }
  }

  @Override
  public HostDef defineHost(Item hostConfig) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.defineHost(hostConfig) : null;
  }

  @Override
  public HostDef getHostDef(HostAddress hostAddress) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.getHostDef(hostAddress) : null;
  }

  @Override
  public HostBinding createHost(PartBinding part, HostDef hostDef) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.createHost(part, hostDef) : null;
  }

  @Override
  public HostBinding createHost(HostAddress hostAddress) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.createHost(hostAddress) : null;
  }

  @Override
  public HostBinding injectHost(HostAddress hostAddress, HostBinding host) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.injectHost(hostAddress, host) : host;
  }

  @Override
  public void openMetaHost(HostBinding host, NodeBinding metaHost) {
    final KernelContext kernelContext = this.kernelContext;
    if (kernelContext != null) {
      kernelContext.openMetaHost(host, metaHost);
    }
  }

  @Override
  public NodeDef defineNode(Item nodeConfig) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.defineNode(nodeConfig) : null;
  }

  @Override
  public NodeDef getNodeDef(NodeAddress nodeAddress) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.getNodeDef(nodeAddress) : null;
  }

  @Override
  public NodeBinding createNode(HostBinding host, NodeDef nodeDef) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.createNode(host, nodeDef) : null;
  }

  @Override
  public NodeBinding createNode(NodeAddress nodeAddress) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.createNode(nodeAddress) : null;
  }

  @Override
  public NodeBinding injectNode(NodeAddress nodeAddress, NodeBinding node) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.injectNode(nodeAddress, node) : node;
  }

  @Override
  public void openMetaNode(NodeBinding node, NodeBinding metaNode) {
    final KernelContext kernelContext = this.kernelContext;
    if (kernelContext != null) {
      kernelContext.openMetaNode(node, metaNode);
    }
  }

  @Override
  public LaneDef defineLane(Item laneConfig) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.defineLane(laneConfig) : null;
  }

  @Override
  public LaneDef getLaneDef(LaneAddress laneAddress) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.getLaneDef(laneAddress) : null;
  }

  @Override
  public LaneBinding createLane(NodeBinding node, LaneDef laneDef) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.createLane(node, laneDef) : null;
  }

  @Override
  public LaneBinding createLane(LaneAddress laneAddress) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.createLane(laneAddress) : null;
  }

  @Override
  public LaneBinding injectLane(LaneAddress laneAddress, LaneBinding lane) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.injectLane(laneAddress, lane) : lane;
  }

  @Override
  public void openMetaLane(LaneBinding lane, NodeBinding metaLane) {
    final KernelContext kernelContext = this.kernelContext;
    if (kernelContext != null) {
      kernelContext.openMetaLane(lane, metaLane);
    }
  }

  @Override
  public void openMetaUplink(LinkBinding uplink, NodeBinding metaUplink) {
    final KernelContext kernelContext = this.kernelContext;
    if (kernelContext != null) {
      kernelContext.openMetaUplink(uplink, metaUplink);
    }
  }

  @Override
  public void openMetaDownlink(LinkBinding downlink, NodeBinding metaDownlink) {
    final KernelContext kernelContext = this.kernelContext;
    if (kernelContext != null) {
      kernelContext.openMetaDownlink(downlink, metaDownlink);
    }
  }

  @Override
  public void reportDown(Metric metric) {
    final KernelContext kernelContext = this.kernelContext;
    if (kernelContext != null) {
      kernelContext.reportDown(metric);
    }
  }

  @Override
  public void trace(Object message) {
    final KernelContext kernelContext = this.kernelContext;
    if (kernelContext != null) {
      kernelContext.trace(message);
    }
  }

  @Override
  public void debug(Object message) {
    final KernelContext kernelContext = this.kernelContext;
    if (kernelContext != null) {
      kernelContext.debug(message);
    }
  }

  @Override
  public void info(Object message) {
    final KernelContext kernelContext = this.kernelContext;
    if (kernelContext != null) {
      kernelContext.info(message);
    }
  }

  @Override
  public void warn(Object message) {
    final KernelContext kernelContext = this.kernelContext;
    if (kernelContext != null) {
      kernelContext.warn(message);
    }
  }

  @Override
  public void error(Object message) {
    final KernelContext kernelContext = this.kernelContext;
    if (kernelContext != null) {
      kernelContext.error(message);
    }
  }

  @Override
  public void fail(Object message) {
    final KernelContext kernelContext = this.kernelContext;
    if (kernelContext != null) {
      kernelContext.fail(message);
    }
  }

  @Override
  public void start() {
    int oldStatus;
    int newStatus;
    do {
      oldStatus = this.status;
      newStatus = oldStatus | STARTED;
    } while (oldStatus != newStatus && !STATUS.compareAndSet(this, oldStatus, newStatus));
    if ((oldStatus & STARTED) == 0) {
      willStart();
    }
    final KernelContext kernelContext = this.kernelContext;
    if (kernelContext != null) {
      kernelContext.start();
    }
    if ((oldStatus & STARTED) == 0) {
      didStart();
    }
  }

  @Override
  public void stop() {
    int oldStatus;
    int newStatus;
    do {
      oldStatus = this.status;
      newStatus = oldStatus & ~STARTED;
    } while (oldStatus != newStatus && !STATUS.compareAndSet(this, oldStatus, newStatus));
    if ((oldStatus & STARTED) != 0) {
      willStop();
    }
    final KernelContext kernelContext = this.kernelContext;
    if (kernelContext != null) {
      kernelContext.stop();
    }
    if ((oldStatus & STARTED) != 0) {
      didStop();
    }
  }

  @Override
  public void run() {
    start();
    final KernelContext kernelContext = this.kernelContext;
    if (kernelContext != null) {
      kernelContext.run();
    }
  }

  protected void willStart() {
    // hook
  }

  protected void didStart() {
    // hook
  }

  protected void willStop() {
    // hook
  }

  protected void didStop() {
    // hook
  }

  protected static final int STARTED = 0x01;

  protected static final AtomicIntegerFieldUpdater<KernelProxy> STATUS =
      AtomicIntegerFieldUpdater.newUpdater(KernelProxy.class, "status");
}
