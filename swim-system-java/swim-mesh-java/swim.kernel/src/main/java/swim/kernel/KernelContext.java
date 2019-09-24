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
import swim.io.IpInterface;
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
import swim.web.WebRequest;
import swim.web.WebResponse;

public interface KernelContext extends Kernel, IpInterface, Log {
  KernelBinding kernelWrapper();

  KernelBinding kernelBinding();

  void setKernelBinding(KernelBinding kernelBinding);

  FingerTrieSeq<Kernel> modules();

  Stage stage();

  Station station();

  LogDef defineLog(Item logConfig);

  Log createLog(LogDef logDef);

  Log injectLog(Log log);

  PolicyDef definePolicy(Item policyConfig);

  Policy createPolicy(PolicyDef policyDef);

  Policy injectPolicy(Policy policy);

  ScheduleDef defineSchedule(Item scheduleConfig);

  Schedule createSchedule(ScheduleDef scheduleDef, Stage stage);

  Schedule injectSchedule(Schedule schedule);

  StageDef defineStage(Item stageConfig);

  Stage createStage(StageDef stageDef);

  Stage injectStage(Stage stage);

  StoreDef defineStore(Item storeConfig);

  StoreBinding createStore(StoreDef storeDef, ClassLoader classLoader);

  StoreBinding injectStore(StoreBinding store);

  Log openStoreLog(String storeName);

  Stage openStoreStage(String storeName);

  AuthenticatorDef defineAuthenticator(Item authenticatorConfig);

  Authenticator createAuthenticator(AuthenticatorDef authenticatorDef, ClassLoader classLoader);

  Authenticator injectAuthenticator(Authenticator authenticator);

  Log openAuthenticatorLog(String authenticatorName);

  Stage openAuthenticatorStage(String authenticatorName);

  @Override
  IpSettings ipSettings();

  @Override
  IpServiceRef bindTcp(InetSocketAddress localAddress, IpService service, IpSettings ipSettings);

  @Override
  IpServiceRef bindTls(InetSocketAddress localAddress, IpService service, IpSettings ipSettings);

  @Override
  IpSocketRef connectTcp(InetSocketAddress remoteAddress, IpSocket socket, IpSettings ipSettings);

  @Override
  IpSocketRef connectTls(InetSocketAddress remoteAddress, IpSocket socket, IpSettings ipSettings);

  @Override
  Service getService(String serviceName);

  @Override
  ServiceDef defineService(Item serviceConfig);

  @Override
  ServiceFactory<?> createServiceFactory(ServiceDef serviceDef, ClassLoader classLoader);

  @Override
  <S extends Service> S openService(String serviceName, ServiceFactory<S> serviceFactory);

  Service injectService(Service service);

  Log openServiceLog(String serviceName);

  Policy openServicePolicy(String serviceName);

  Stage openServiceStage(String serviceName);

  WebResponse routeRequest(WebRequest request);

  @Override
  Space getSpace(String spaceName);

  @Override
  SpaceDef defineSpace(Item spaceConfig);

  @Override
  Space openSpace(SpaceDef spaceDef);

  @Override
  PlaneDef definePlane(Item planeConfig);

  @Override
  PlaneFactory<?> createPlaneFactory(PlaneDef planeDef, ClassLoader classLoader);

  @Override
  <P extends Plane> PlaneFactory<P> createPlaneFactory(Class<? extends P> planeClass);

  Plane injectPlane(Plane plane);

  @Override
  AgentDef defineAgent(Item agentConfig);

  @Override
  AgentFactory<?> createAgentFactory(AgentDef agentDef, ClassLoader classLoader);

  AgentFactory<?> createAgentFactory(String edgeName, Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri, AgentDef agentDef);

  <A extends Agent> AgentFactory<A> createAgentFactory(Class<? extends A> agentClass);

  <A extends Agent> AgentFactory<A> createAgentFactory(String edgeName, Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri,
                                                       Class<? extends A> agentClass);

  <A extends Agent> AgentRoute<A> createAgentRoute(String edgeName, Class<? extends A> agentClass);

  void openAgents(String edgeName, Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri, NodeBinding node);

  EdgeBinding createEdge(String edgeName);

  EdgeBinding injectEdge(String edgeName, EdgeBinding edge);

  Log openEdgeLog(String edgeName);

  Policy openEdgePolicy(String edgeName);

  Stage openEdgeStage(String edgeName);

  StoreBinding openEdgeStore(String edgeName);

  MeshDef defineMesh(Item meshConfig);

  MeshDef getMeshDef(String edgeName, Uri meshUri);

  MeshBinding createMesh(String edgeName, MeshDef meshDef);

  MeshBinding createMesh(String edgeName, Uri meshUri);

  MeshBinding injectMesh(String edgeName, Uri meshUri, MeshBinding mesh);

  Log openMeshLog(String edgeName, Uri meshUri);

  Policy openMeshPolicy(String edgeName, Uri meshUri);

  Stage openMeshStage(String edgeName, Uri meshUri);

  StoreBinding openMeshStore(String edgeName, Uri meshUri);

  PartDef definePart(Item partConfig);

  PartDef getPartDef(String edgeName, Uri meshUri, Value partKey);

  PartBinding createPart(String edgeName, Uri meshUri, PartDef partDef);

  PartBinding createPart(String edgeName, Uri meshUri, Value partKey);

  PartBinding injectPart(String edgeName, Uri meshUri, Value partKey, PartBinding part);

  Log openPartLog(String edgeName, Uri meshUri, Value partKey);

  Policy openPartPolicy(String edgeName, Uri meshUri, Value partKey);

  Stage openPartStage(String edgeName, Uri meshUri, Value partKey);

  StoreBinding openPartStore(String edgeName, Uri meshUri, Value partKey);

  HostDef defineHost(Item hostConfig);

  HostDef getHostDef(String edgeName, Uri meshUri, Value partKey, Uri hostUri);

  HostBinding createHost(String edgeName, Uri meshUri, Value partKey, HostDef hostDef);

  HostBinding createHost(String edgeName, Uri meshUri, Value partKey, Uri hostUri);

  HostBinding injectHost(String edgeName, Uri meshUri, Value partKey, Uri hostUri, HostBinding host);

  Log openHostLog(String edgeName, Uri meshUri, Value partKey, Uri hostUri);

  Policy openHostPolicy(String edgeName, Uri meshUri, Value partKey, Uri hostUri);

  Stage openHostStage(String edgeName, Uri meshUri, Value partKey, Uri hostUri);

  StoreBinding openHostStore(String edgeName, Uri meshUri, Value partKey, Uri hostUri);

  NodeDef defineNode(Item nodeConfig);

  NodeDef getNodeDef(String edgeName, Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri);

  NodeBinding createNode(String edgeName, Uri meshUri, Value partKey, Uri hostUri, NodeDef nodeDef);

  NodeBinding createNode(String edgeName, Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri);

  NodeBinding injectNode(String edgeName, Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri, NodeBinding node);

  Log openNodeLog(String edgeName, Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri);

  Policy openNodePolicy(String edgeName, Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri);

  Stage openNodeStage(String edgeName, Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri);

  StoreBinding openNodeStore(String edgeName, Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri);

  LaneDef defineLane(Item laneConfig);

  LaneDef getLaneDef(String edgeName, Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri, Uri laneUri);

  LaneBinding createLane(String edgeName, Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri, LaneDef laneDef);

  LaneBinding createLane(String edgeName, Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri, Uri laneUri);

  LaneBinding injectLane(String edgeName, Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri, Uri laneUri, LaneBinding lane);

  void openLanes(String edgeName, Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri, NodeBinding node);

  Log openLaneLog(String edgeName, Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri, Uri laneUri);

  Policy openLanePolicy(String edgeName, Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri, Uri laneUri);

  Stage openLaneStage(String edgeName, Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri, Uri laneUri);

  StoreBinding openLaneStore(String edgeName, Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri, Uri laneUri);
}
