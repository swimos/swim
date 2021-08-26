// Copyright 2015-2021 Swim Inc.
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
import swim.store.StoreBinding;
import swim.store.StoreDef;
import swim.structure.Item;
import swim.system.CellAddress;
import swim.system.EdgeAddress;
import swim.system.EdgeBinding;
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

  Log createLog(CellAddress cellAddress);

  Log injectLog(Log log);

  PolicyDef definePolicy(Item policyConfig);

  Policy createPolicy(PolicyDef policyDef);

  Policy createPolicy(CellAddress cellAddress);

  Policy injectPolicy(Policy policy);

  ScheduleDef defineSchedule(Item scheduleConfig);

  Schedule createSchedule(ScheduleDef scheduleDef, Stage stage);

  Schedule injectSchedule(Schedule schedule);

  StageDef defineStage(Item stageConfig);

  Stage createStage(StageDef stageDef);

  Stage createStage(CellAddress cellAddress);

  Stage injectStage(Stage stage);

  StoreDef defineStore(Item storeConfig);

  StoreBinding createStore(StoreDef storeDef, ClassLoader classLoader);

  StoreBinding createStore(CellAddress cellAddress);

  StoreBinding injectStore(StoreBinding store);

  AuthenticatorDef defineAuthenticator(Item authenticatorConfig);

  Authenticator createAuthenticator(AuthenticatorDef authenticatorDef, ClassLoader classLoader);

  Authenticator injectAuthenticator(Authenticator authenticator);

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

  AgentFactory<?> createAgentFactory(NodeBinding node, AgentDef agentDef);

  <A extends Agent> AgentFactory<A> createAgentFactory(Class<? extends A> agentClass);

  <A extends Agent> AgentFactory<A> createAgentFactory(NodeBinding node, Class<? extends A> agentClass);

  <A extends Agent> AgentRoute<A> createAgentRoute(EdgeBinding edge, Class<? extends A> agentClass);

  void openAgents(NodeBinding node);

  void openLanes(NodeBinding node);

  EdgeBinding createEdge(EdgeAddress edgeAddress);

  EdgeBinding injectEdge(EdgeAddress edgeAddress, EdgeBinding edge);

  void openMetaEdge(EdgeBinding edge, NodeBinding metaEdge);

  MeshDef defineMesh(Item meshConfig);

  MeshDef getMeshDef(MeshAddress meshAddress);

  MeshBinding createMesh(EdgeBinding edge, MeshDef meshDef);

  MeshBinding createMesh(MeshAddress meshAddress);

  MeshBinding injectMesh(MeshAddress meshAddress, MeshBinding mesh);

  void openMetaMesh(MeshBinding mesh, NodeBinding metaMesh);

  PartDef definePart(Item partConfig);

  PartDef getPartDef(PartAddress partAddress);

  PartBinding createPart(MeshBinding mesh, PartDef partDef);

  PartBinding createPart(PartAddress partAddress);

  PartBinding injectPart(PartAddress partAddress, PartBinding part);

  void openMetaPart(PartBinding part, NodeBinding metaPart);

  HostDef defineHost(Item hostConfig);

  HostDef getHostDef(HostAddress hostAddress);

  HostBinding createHost(PartBinding part, HostDef hostDef);

  HostBinding createHost(HostAddress hostAddress);

  HostBinding injectHost(HostAddress hostAddress, HostBinding host);

  void openMetaHost(HostBinding host, NodeBinding metaHost);

  NodeDef defineNode(Item nodeConfig);

  NodeDef getNodeDef(NodeAddress nodeAddress);

  NodeBinding createNode(HostBinding host, NodeDef nodeDef);

  NodeBinding createNode(NodeAddress nodeAddress);

  NodeBinding injectNode(NodeAddress nodeAddress, NodeBinding node);

  void openMetaNode(NodeBinding node, NodeBinding metaNode);

  LaneDef defineLane(Item laneConfig);

  LaneDef getLaneDef(LaneAddress laneAddress);

  LaneBinding createLane(NodeBinding node, LaneDef laneDef);

  LaneBinding createLane(LaneAddress laneAddress);

  LaneBinding injectLane(LaneAddress laneAddress, LaneBinding lane);

  void openMetaLane(LaneBinding lane, NodeBinding metaLane);

  void openMetaUplink(LinkBinding uplink, NodeBinding metaUplink);

  void openMetaDownlink(LinkBinding downlink, NodeBinding metaDownlink);

  void reportDown(Metric metric);

}
