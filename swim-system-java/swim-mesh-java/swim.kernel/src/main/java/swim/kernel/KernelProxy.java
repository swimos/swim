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
import swim.runtime.EdgeBinding;
import swim.runtime.HostBinding;
import swim.runtime.HostDef;
import swim.runtime.LaneBinding;
import swim.runtime.LaneDef;
import swim.runtime.LogDef;
import swim.runtime.MeshBinding;
import swim.runtime.MeshDef;
import swim.runtime.NodeBinding;
import swim.runtime.NodeDef;
import swim.runtime.PartBinding;
import swim.runtime.PartDef;
import swim.runtime.PolicyDef;
import swim.store.StoreBinding;
import swim.store.StoreDef;
import swim.structure.Item;
import swim.structure.Value;
import swim.uri.Uri;
import swim.util.Log;

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
  public StoreBinding injectStore(StoreBinding store) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.injectStore(store) : store;
  }

  @Override
  public Log openStoreLog(String storeName) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.openStoreLog(storeName) : null;
  }

  @Override
  public Stage openStoreStage(String storeName) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.openStoreStage(storeName) : null;
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
  public Log openAuthenticatorLog(String authenticatorName) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.openAuthenticatorLog(authenticatorName) : null;
  }

  @Override
  public Stage openAuthenticatorStage(String authenticatorName) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.openAuthenticatorStage(authenticatorName) : null;
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
  public Log openServiceLog(String serviceName) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.openServiceLog(serviceName) : null;
  }

  @Override
  public Policy openServicePolicy(String policyName) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.openServicePolicy(policyName) : null;
  }

  @Override
  public Stage openServiceStage(String serviceName) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.openServiceStage(serviceName) : null;
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
  public AgentFactory<?> createAgentFactory(String edgeName, Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri, AgentDef agentDef) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.createAgentFactory(edgeName, meshUri, partKey, hostUri, nodeUri, agentDef) : null;
  }

  @Override
  public <A extends Agent> AgentFactory<A> createAgentFactory(Class<? extends A> agentClass) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.createAgentFactory(agentClass) : null;
  }

  @Override
  public <A extends Agent> AgentFactory<A> createAgentFactory(String edgeName, Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri,
                                                              Class<? extends A> agentClass) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.createAgentFactory(edgeName, meshUri, partKey, hostUri, nodeUri, agentClass) : null;
  }

  @Override
  public <A extends Agent> AgentRoute<A> createAgentRoute(String edgeName, Class<? extends A> agentClass) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.createAgentRoute(edgeName, agentClass) : null;
  }

  @Override
  public void openAgents(String edgeName, Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri, NodeBinding node) {
    final KernelContext kernelContext = this.kernelContext;
    if (kernelContext != null) {
      kernelContext.openAgents(edgeName, meshUri, partKey, hostUri, nodeUri, node);
    }
  }

  @Override
  public EdgeBinding createEdge(String edgeName) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.createEdge(edgeName) : null;
  }

  @Override
  public EdgeBinding injectEdge(String edgeName, EdgeBinding edge) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.injectEdge(edgeName, edge) : edge;
  }

  @Override
  public Log openEdgeLog(String edgeName) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.openEdgeLog(edgeName) : null;
  }

  @Override
  public Policy openEdgePolicy(String edgeName) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.openEdgePolicy(edgeName) : null;
  }

  @Override
  public Stage openEdgeStage(String edgeName) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.openEdgeStage(edgeName) : null;
  }

  @Override
  public StoreBinding openEdgeStore(String edgeName) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.openEdgeStore(edgeName) : null;
  }

  @Override
  public MeshDef defineMesh(Item meshConfig) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.defineMesh(meshConfig) : null;
  }

  @Override
  public MeshDef getMeshDef(String edgeName, Uri meshUri) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.getMeshDef(edgeName, meshUri) : null;
  }

  @Override
  public MeshBinding createMesh(String edgeName, MeshDef meshDef) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.createMesh(edgeName, meshDef) : null;
  }

  @Override
  public MeshBinding createMesh(String edgeName, Uri meshUri) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.createMesh(edgeName, meshUri) : null;
  }

  @Override
  public MeshBinding injectMesh(String edgeName, Uri meshUri, MeshBinding mesh) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.injectMesh(edgeName, meshUri, mesh) : mesh;
  }

  @Override
  public Log openMeshLog(String edgeName, Uri meshUri) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.openMeshLog(edgeName, meshUri) : null;
  }

  @Override
  public Policy openMeshPolicy(String edgeName, Uri meshUri) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.openMeshPolicy(edgeName, meshUri) : null;
  }

  @Override
  public Stage openMeshStage(String edgeName, Uri meshUri) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.openMeshStage(edgeName, meshUri) : null;
  }

  @Override
  public StoreBinding openMeshStore(String edgeName, Uri meshUri) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.openMeshStore(edgeName, meshUri) : null;
  }

  @Override
  public PartDef definePart(Item partConfig) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.definePart(partConfig) : null;
  }

  @Override
  public PartDef getPartDef(String edgeName, Uri meshUri, Value partKey) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.getPartDef(edgeName, meshUri, partKey) : null;
  }

  @Override
  public PartBinding createPart(String edgeName, Uri meshUri, PartDef partDef) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.createPart(edgeName, meshUri, partDef) : null;
  }

  @Override
  public PartBinding createPart(String edgeName, Uri meshUri, Value partKey) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.createPart(edgeName, meshUri, partKey) : null;
  }

  @Override
  public PartBinding injectPart(String edgeName, Uri meshUri, Value partKey, PartBinding part) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.injectPart(edgeName, meshUri, partKey, part) : part;
  }

  @Override
  public Log openPartLog(String edgeName, Uri meshUri, Value partKey) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.openPartLog(edgeName, meshUri, partKey) : null;
  }

  @Override
  public Policy openPartPolicy(String edgeName, Uri meshUri, Value partKey) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.openPartPolicy(edgeName, meshUri, partKey) : null;
  }

  @Override
  public Stage openPartStage(String edgeName, Uri meshUri, Value partKey) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.openPartStage(edgeName, meshUri, partKey) : null;
  }

  @Override
  public StoreBinding openPartStore(String edgeName, Uri meshUri, Value partKey) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.openPartStore(edgeName, meshUri, partKey) : null;
  }

  @Override
  public HostDef defineHost(Item hostConfig) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.defineHost(hostConfig) : null;
  }

  @Override
  public HostDef getHostDef(String edgeName, Uri meshUri, Value partKey, Uri hostUri) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.getHostDef(edgeName, meshUri, partKey, hostUri) : null;
  }

  @Override
  public HostBinding createHost(String edgeName, Uri meshUri, Value partKey, HostDef hostDef) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.createHost(edgeName, meshUri, partKey, hostDef) : null;
  }

  @Override
  public HostBinding createHost(String edgeName, Uri meshUri, Value partKey, Uri hostUri) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.createHost(edgeName, meshUri, partKey, hostUri) : null;
  }

  @Override
  public HostBinding injectHost(String edgeName, Uri meshUri, Value partKey, Uri hostUri, HostBinding host) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.injectHost(edgeName, meshUri, partKey, hostUri, host) : host;
  }

  @Override
  public Log openHostLog(String edgeName, Uri meshUri, Value partKey, Uri hostUri) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.openHostLog(edgeName, meshUri, partKey, hostUri) : null;
  }

  @Override
  public Policy openHostPolicy(String edgeName, Uri meshUri, Value partKey, Uri hostUri) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.openHostPolicy(edgeName, meshUri, partKey, hostUri) : null;
  }

  @Override
  public Stage openHostStage(String edgeName, Uri meshUri, Value partKey, Uri hostUri) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.openHostStage(edgeName, meshUri, partKey, hostUri) : null;
  }

  @Override
  public StoreBinding openHostStore(String edgeName, Uri meshUri, Value partKey, Uri hostUri) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.openHostStore(edgeName, meshUri, partKey, hostUri) : null;
  }

  @Override
  public NodeDef defineNode(Item nodeConfig) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.defineNode(nodeConfig) : null;
  }

  @Override
  public NodeDef getNodeDef(String edgeName, Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.getNodeDef(edgeName, meshUri, partKey, hostUri, nodeUri) : null;
  }

  @Override
  public NodeBinding createNode(String edgeName, Uri meshUri, Value partKey, Uri hostUri, NodeDef nodeDef) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.createNode(edgeName, meshUri, partKey, hostUri, nodeDef) : null;
  }

  @Override
  public NodeBinding createNode(String edgeName, Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.createNode(edgeName, meshUri, partKey, hostUri, nodeUri) : null;
  }

  @Override
  public NodeBinding injectNode(String edgeName, Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri, NodeBinding node) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.injectNode(edgeName, meshUri, partKey, hostUri, nodeUri, node) : node;
  }

  @Override
  public Log openNodeLog(String edgeName, Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.openNodeLog(edgeName, meshUri, partKey, hostUri, nodeUri) : null;
  }

  @Override
  public Policy openNodePolicy(String edgeName, Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.openNodePolicy(edgeName, meshUri, partKey, hostUri, nodeUri) : null;
  }

  @Override
  public Stage openNodeStage(String edgeName, Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.openNodeStage(edgeName, meshUri, partKey, hostUri, nodeUri) : null;
  }

  @Override
  public StoreBinding openNodeStore(String edgeName, Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.openNodeStore(edgeName, meshUri, partKey, hostUri, nodeUri) : null;
  }

  @Override
  public LaneDef defineLane(Item laneConfig) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.defineLane(laneConfig) : null;
  }

  @Override
  public LaneDef getLaneDef(String edgeName, Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri, Uri laneUri) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.getLaneDef(edgeName, meshUri, partKey, hostUri, nodeUri, laneUri) : null;
  }

  @Override
  public LaneBinding createLane(String edgeName, Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri, LaneDef laneDef) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.createLane(edgeName, meshUri, partKey, hostUri, nodeUri, laneDef) : null;
  }

  @Override
  public LaneBinding createLane(String edgeName, Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri, Uri laneUri) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.createLane(edgeName, meshUri, partKey, hostUri, nodeUri, laneUri) : null;
  }

  @Override
  public LaneBinding injectLane(String edgeName, Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri, Uri laneUri, LaneBinding lane) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.injectLane(edgeName, meshUri, partKey, hostUri, nodeUri, laneUri, lane) : lane;
  }

  @Override
  public void openLanes(String edgeName, Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri, NodeBinding node) {
    final KernelContext kernelContext = this.kernelContext;
    if (kernelContext != null) {
      kernelContext.openLanes(edgeName, meshUri, partKey, hostUri, nodeUri, node);
    }
  }

  @Override
  public Log openLaneLog(String edgeName, Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri, Uri laneUri) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.openLaneLog(edgeName, meshUri, partKey, hostUri, nodeUri, laneUri) : null;
  }

  @Override
  public Policy openLanePolicy(String edgeName, Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri, Uri laneUri) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.openLanePolicy(edgeName, meshUri, partKey, hostUri, nodeUri, laneUri) : null;
  }

  @Override
  public Stage openLaneStage(String edgeName, Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri, Uri laneUri) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.openLaneStage(edgeName, meshUri, partKey, hostUri, nodeUri, laneUri) : null;
  }

  @Override
  public StoreBinding openLaneStore(String edgeName, Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri, Uri laneUri) {
    final KernelContext kernelContext = this.kernelContext;
    return kernelContext != null ? kernelContext.openLaneStore(edgeName, meshUri, partKey, hostUri, nodeUri, laneUri) : null;
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
