package swim.client;

import swim.api.Downlink;
import swim.api.agent.Agent;
import swim.api.agent.AgentDef;
import swim.api.agent.AgentFactory;
import swim.api.auth.Credentials;
import swim.api.auth.Identity;
import swim.api.policy.Policy;
import swim.api.policy.PolicyDirective;
import swim.concurrent.MainStage;
import swim.concurrent.Schedule;
import swim.concurrent.Stage;
import swim.io.http.HttpEndpoint;
import swim.remote.RemoteHostClient;
import swim.runtime.AbstractSwimRef;
import swim.runtime.EdgeAddress;
import swim.runtime.EdgeBinding;
import swim.runtime.EdgeContext;
import swim.runtime.HostAddress;
import swim.runtime.HostBinding;
import swim.runtime.LaneAddress;
import swim.runtime.LaneBinding;
import swim.runtime.LaneDef;
import swim.runtime.LinkBinding;
import swim.runtime.MeshAddress;
import swim.runtime.MeshBinding;
import swim.runtime.Metric;
import swim.runtime.NodeAddress;
import swim.runtime.NodeBinding;
import swim.runtime.PartAddress;
import swim.runtime.PartBinding;
import swim.runtime.Push;
import swim.runtime.router.EdgeTable;
import swim.runtime.router.MeshTable;
import swim.runtime.router.PartTable;
import swim.store.StoreBinding;
import swim.uri.Uri;

public class SwimClientRef extends AbstractSwimRef implements EdgeContext {

  private final Stage stage;
  private final HttpEndpoint endpoint;
  private final EdgeBinding edge;

  public SwimClientRef(Stage stage, HttpEndpoint endpoint) {
    this.stage = stage;
    this.endpoint = endpoint;
    this.edge = new EdgeTable();
    this.edge.setEdgeContext(this);
  }

  public void start() {
    if (this.stage instanceof MainStage) {
      ((MainStage) this.stage).start();
    }
    this.endpoint.start();
    this.edge.start();
  }

  public void stop() {
    this.endpoint.stop();
    if (this.stage instanceof MainStage) {
      ((MainStage) this.stage).stop();
    }
  }

  @Override
  public EdgeAddress cellAddress() {
    return new EdgeAddress(edgeName());
  }

  @Override
  public String edgeName() {
    return "";
  }

  @Override
  public Uri meshUri() {
    return Uri.empty();
  }

  @Override
  public Policy policy() {
    return null; // TODO
  }

  @Override
  public void openMetaDownlink(LinkBinding downlink, NodeBinding metaDownlink) {
    // nop
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
    // no-op
  }

  @Override
  public void reportDown(Metric metric) {
    // no-op
  }

  @Override
  public void close() {
    // TODO
  }

  @Override
  public void trace(Object message) {
    // TODO
  }

  @Override
  public void debug(Object message) {
    // TODO
  }

  @Override
  public void info(Object message) {
    // TODO
  }

  @Override
  public void warn(Object message) {
    // TODO
  }

  @Override
  public void error(Object message) {
    // TODO
  }

  @Override
  public void fail(Object message) {
    // TODO

  }

  @Override
  public EdgeBinding edgeWrapper() {
    return this.edge.edgeWrapper();
  }

  @Override
  @SuppressWarnings("unchecked")
  public <T> T unwrapEdge(Class<T> edgeClass) {
    if (edgeClass.isAssignableFrom(getClass())) {
      return (T) this;
    } else {
      return null;
    }
  }

  @Override
  @SuppressWarnings("unchecked")
  public <T> T bottomEdge(Class<T> edgeClass) {
    if (edgeClass.isAssignableFrom(getClass())) {
      return (T) this;
    } else {
      return null;
    }
  }

  @Override
  public Schedule schedule() {
    return this.stage;
  }

  @Override
  public Stage stage() {
    return this.stage;
  }

  @Override
  public StoreBinding store() {
    return null;
  }

  @Override
  public void openMetaEdge(EdgeBinding edge, NodeBinding metaEdge) {

  }

  @Override
  public MeshBinding createMesh(MeshAddress meshAddress) {
    return new MeshTable();
  }

  @Override
  public MeshBinding injectMesh(MeshAddress meshAddres, MeshBinding mesh) {
    return mesh;
  }

  @Override
  public void openMetaMesh(MeshBinding mesh, NodeBinding metaMesh) {

  }

  @Override
  public PartBinding createPart(PartAddress partAddress) {
    return new PartTable();
  }

  @Override
  public PartBinding injectPart(PartAddress partAddress, PartBinding part) {
    return part;
  }

  @Override
  public void openMetaPart(PartBinding part, NodeBinding metaPart) {

  }

  @Override
  public HostBinding createHost(HostAddress hostAddress) {
    return new RemoteHostClient(hostAddress.hostUri(), this.endpoint);
  }

  @Override
  public HostBinding injectHost(HostAddress hostAddress, HostBinding host) {
    return host;
  }

  @Override
  public void openMetaHost(HostBinding host, NodeBinding metaHost) {

  }

  @Override
  public NodeBinding createNode(NodeAddress nodeAddress) {
    return null;
  }

  @Override
  public NodeBinding injectNode(NodeAddress nodeAddress, NodeBinding node) {
    return node;
  }

  @Override
  public void openMetaNode(NodeBinding node, NodeBinding metaNode) {

  }

  @Override
  public LaneBinding createLane(LaneAddress laneAddress) {
    return null;
  }

  @Override
  public LaneBinding injectLane(LaneAddress laneAddress, LaneBinding lane) {
    return lane;
  }

  @Override
  public void openMetaLane(LaneBinding lane, NodeBinding metaLane) {

  }

  @Override
  public void openMetaUplink(LinkBinding uplink, NodeBinding metaUplink) {

  }

  @Override
  public LaneBinding createLane(NodeBinding node, LaneDef laneDef) {
    return null;
  }

  @Override
  public void openLanes(NodeBinding node) {

  }

  @Override
  public AgentFactory<?> createAgentFactory(NodeBinding node, AgentDef agentDef) {
    return null;
  }

  @Override
  public <A extends Agent> AgentFactory<A> createAgentFactory(NodeBinding node, Class<? extends A> agentClass) {
    return null;
  }

  @Override
  public void openAgents(NodeBinding node) {

  }

  @Override
  public PolicyDirective<Identity> authenticate(Credentials credentials) {
    return null;
  }

  @Override
  public void willOpen() {

  }

  @Override
  public void didOpen() {

  }

  @Override
  public void willLoad() {

  }

  @Override
  public void didLoad() {

  }

  @Override
  public void willStart() {

  }

  @Override
  public void didStart() {

  }

  @Override
  public void willStop() {

  }

  @Override
  public void didStop() {

  }

  @Override
  public void willUnload() {

  }

  @Override
  public void didUnload() {

  }

  @Override
  public void willClose() {

  }

}
