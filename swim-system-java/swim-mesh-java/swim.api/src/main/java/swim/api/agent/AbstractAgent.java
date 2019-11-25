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

package swim.api.agent;

import java.net.InetSocketAddress;
import java.security.Principal;
import java.security.cert.Certificate;
import java.util.Collection;
import swim.api.Lane;
import swim.api.Link;
import swim.api.SwimContext;
import swim.api.auth.Identity;
import swim.api.data.ListData;
import swim.api.data.MapData;
import swim.api.data.SpatialData;
import swim.api.data.ValueData;
import swim.api.downlink.EventDownlink;
import swim.api.downlink.ListDownlink;
import swim.api.downlink.MapDownlink;
import swim.api.downlink.ValueDownlink;
import swim.api.http.HttpDownlink;
import swim.api.http.HttpLane;
import swim.api.lane.CommandLane;
import swim.api.lane.DemandLane;
import swim.api.lane.DemandMapLane;
import swim.api.lane.JoinMapLane;
import swim.api.lane.JoinValueLane;
import swim.api.lane.LaneFactory;
import swim.api.lane.ListLane;
import swim.api.lane.MapLane;
import swim.api.lane.SpatialLane;
import swim.api.lane.SupplyLane;
import swim.api.lane.ValueLane;
import swim.api.ref.HostRef;
import swim.api.ref.LaneRef;
import swim.api.ref.NodeRef;
import swim.api.ref.SwimRef;
import swim.api.store.Store;
import swim.api.ws.WsDownlink;
import swim.api.ws.WsLane;
import swim.collections.FingerTrieSeq;
import swim.concurrent.Cont;
import swim.concurrent.Schedule;
import swim.concurrent.Stage;
import swim.concurrent.TimerFunction;
import swim.concurrent.TimerRef;
import swim.math.R2Shape;
import swim.math.Z2Form;
import swim.structure.Value;
import swim.uri.Uri;
import swim.util.Log;
import swim.warp.CommandMessage;

/**
 * Abstract base class for <em>all</em> {@link Agent Agents}.  This class
 * provides skeletal {@code Agent} lifecycle callback implementations,
 * contextual {@code Lane} and {@code Store} creation mechanisms, URI-based
 * addressability, logging, and scheduling, primarily via delegation to its
 * internal, immutable {@link AgentContext}.
 */
public class AbstractAgent implements Agent, SwimRef, LaneFactory, Schedule, Store, Log {
  /**
   * Internal, immutable context that provides contextual {@code Lane} and
   * {@code Store} creation mechanisms, URI-based addressability, logging, and
   * scheduling.
   */
  protected final AgentContext context;

  /**
   * Creates an {@code AbstractAgent} instance managed by {@code context}.
   */
  public AbstractAgent(AgentContext context) {
    this.context = context;
  }

  /**
   * Creates an {@code AbstractAgent} instance managed by {@link
   * SwimContext#getAgentContext()}.
   */
  public AbstractAgent() {
    this(SwimContext.getAgentContext());
  }

  @Override
  public AgentContext agentContext() {
    return this.context;
  }

  @Override
  public void willOpen() {
    // hook
  }

  @Override
  public void didOpen() {
    // hook
  }

  @Override
  public void willLoad() {
    // hook
  }

  @Override
  public void didLoad() {
    // hook
  }

  @Override
  public void willStart() {
    // hook
  }

  @Override
  public void didStart() {
    // hook
  }

  @Override
  public void willStop() {
    // hook
  }

  @Override
  public void didStop() {
    // hook
  }

  @Override
  public void willUnload() {
    // hook
  }

  @Override
  public void didUnload() {
    // hook
  }

  @Override
  public void willClose() {
    // hook
  }

  @Override
  public void didClose() {
    // hook
  }

  @Override
  public void didFail(Throwable error) {
    error.printStackTrace();
  }

  /**
   * This {@code Agent}'s {@code hostUri}.
   */
  public final Uri hostUri() {
    return this.context.hostUri();
  }

  /**
   * This {@code Agent}'s {@code nodeUri}.
   */
  public final Uri nodeUri() {
    return this.context.nodeUri();
  }

  public final Value agentId() {
    return this.context.agentId();
  }

  /**
   * A {@link swim.structure.Record} that maps every dynamic property in
   * {@link #nodeUri()}, as defined by {@link AgentRoute#pattern()}, to its
   * value.  An empty result indicates that {@code nodeUri} contains no
   * dynamic components.
   */
  public final Value props() {
    return this.context.props();
  }

  /**
   * Returns the value of {@code key} in {@link #props()}.
   */
  public final Value getProp(Value key) {
    return this.context.getProp(key);
  }

  /**
   * Returns the value of {@code name} in {@link #props()}.
   */
  public final Value getProp(String name) {
    return this.context.getProp(name);
  }

  /**
   * The {@link Schedule} that this {@code Agent} is bound to.
   */
  public final Schedule schedule() {
    return this.context.schedule();
  }

  /**
   * The single-threaded execution {@link Stage} on which this {@code
   * AgentContext} runs its application logic.
   */
  public final Stage stage() {
    return this.context.stage();
  }

  /**
   * The multi-threaded execution {@link Stage} on which this {@code
   * AgentContext} can run asynchronous operations.
   */
  public final Stage asyncStage() {
    return this.context.asyncStage();
  }

  /**
   * Returns the currently executing lane, or null if not currently executing
   * a lane or link callback.
   */
  public final Lane lane() {
    return this.context.lane();
  }

  /**
   * Returns the currently executing link, or null if not currently executing
   * a link callback.
   */
  public final Link link() {
    return this.context.link();
  }

  public final Lane getLane(Uri laneUri) {
    return this.context.getLane(laneUri);
  }

  public final Lane openLane(Uri laneUri, Lane lane) {
    return this.context.openLane(laneUri, lane);
  }

  public FingerTrieSeq<Agent> agents() {
    return this.context.agents();
  }

  public Agent getAgent(Value id) {
    return this.context.getAgent(id);
  }

  public Agent getAgent(String name) {
    return this.context.getAgent(name);
  }

  public <A extends Agent> A getAgent(Class<A> agentClass) {
    return this.context.getAgent(agentClass);
  }

  public <A extends Agent> A openAgent(Value id, Value props, AgentFactory<A> agentFactory) {
    return this.context.openAgent(id, props, agentFactory);
  }

  public <A extends Agent> A openAgent(Value id, AgentFactory<A> agentFactory) {
    return this.context.openAgent(id, agentFactory);
  }

  public <A extends Agent> A openAgent(String name, AgentFactory<A> agentFactory) {
    return this.context.openAgent(name, agentFactory);
  }

  public <A extends Agent> A openAgent(Value id, Value props, Class<A> agentClass) {
    return this.context.openAgent(id, props, agentClass);
  }

  public <A extends Agent> A openAgent(Value id, Class<A> agentClass) {
    return this.context.openAgent(id, agentClass);
  }

  public <A extends Agent> A openAgent(String name, Class<A> agentClass) {
    return this.context.openAgent(name, agentClass);
  }

  public void closeAgent(Value id) {
    this.context.closeAgent(id);
  }

  public void closeAgent(String name) {
    this.context.closeAgent(name);
  }

  /**
   * Returns true if the currently executing link is secure, or false if the
   * currently executing link is not secure, or if not currently executing a
   * link callback.
   */
  public boolean isSecure() {
    final Link link = link();
    return link != null && link.isSecure();
  }

  /**
   * Returns the security protocol used by the currently executing link, or
   * null if the currently executing link is not secure, or if not currently
   * executing a link callback.
   */
  public String securityProtocol() {
    final Link link = link();
    if (link != null) {
      return link.securityProtocol();
    } else {
      return null;
    }
  }

  /**
   * Returns the cryptographic cipher suite used by the currently executing
   * link, or null if the currently executing link is not secure, or if not
   * currently executing a link callback.
   */
  public String cipherSuite() {
    final Link link = link();
    if (link != null) {
      return link.cipherSuite();
    } else {
      return null;
    }
  }

  /**
   * Returns the local internet address of the currently executing link, or
   * null if not currently executing a link callback.
   */
  public InetSocketAddress localAddress() {
    final Link link = link();
    if (link != null) {
      return link.localAddress();
    } else {
      return null;
    }
  }

  /**
   * Returns the local user identity of the currently executing link, or null
   * if the currently executing link has no local user identity, or if not
   * currently executing a link callback.
   */
  public Identity localIdentity() {
    final Link link = link();
    if (link != null) {
      return link.localIdentity();
    } else {
      return null;
    }
  }

  /**
   * Returns the principal used to identify the local end of the currently
   * executing link, or null if the currently executing link has no local
   * principal, or if not currently executing a link callback.
   */
  public Principal localPrincipal() {
    final Link link = link();
    if (link != null) {
      return link.localPrincipal();
    } else {
      return null;
    }
  }

  /**
   * Returns the certificates used to authenticate the local end of the
   * currently executing link; returns an empty collection if the currently
   * executing link has no local certificates, or if not currently executing a
   * link callback.
   */
  public Collection<Certificate> localCertificates() {
    final Link link = link();
    if (link != null) {
      return link.localCertificates();
    } else {
      return FingerTrieSeq.empty();
    }
  }

  /**
   * Returns the remote internet address of the currently executing link, or
   * null if not currently executing a link callback.
   */
  public InetSocketAddress remoteAddress() {
    final Link link = link();
    if (link != null) {
      return link.remoteAddress();
    } else {
      return null;
    }
  }

  /**
   * Returns the remote user identity of the currently executing link, or null
   * if the currently executing link has no remote user identity, or if not
   * currently executing a link callback.
   */
  public Identity remoteIdentity() {
    final Link link = link();
    if (link != null) {
      return link.remoteIdentity();
    } else {
      return null;
    }
  }

  /**
   * Returns the principal used to identify the remote end of the currently
   * executing link, or null if the currently executing link has no remote
   * principal, or if not currently executing a link callback.
   */
  public Principal remotePrincipal() {
    final Link link = link();
    if (link != null) {
      return link.remotePrincipal();
    } else {
      return null;
    }
  }

  /**
   * Returns the certificates used to authenticate the remote end of the
   * currently executing link; returns an empty collection if the currently
   * executing link has no remote certificates, or if not currently executing a
   * link callback.
   */
  public Collection<Certificate> remoteCertificates() {
    final Link link = link();
    if (link != null) {
      return link.remoteCertificates();
    } else {
      return FingerTrieSeq.empty();
    }
  }

  @Override
  public final <V> CommandLane<V> commandLane() {
    return this.context.commandLane();
  }

  @Override
  public final <V> DemandLane<V> demandLane() {
    return this.context.demandLane();
  }

  @Override
  public final <K, V> DemandMapLane<K, V> demandMapLane() {
    return this.context.demandMapLane();
  }

  @Override
  public final <V> HttpLane<V> httpLane() {
    return this.context.httpLane();
  }

  @Override
  public final <L, K, V> JoinMapLane<L, K, V> joinMapLane() {
    return this.context.joinMapLane();
  }

  @Override
  public final <K, V> JoinValueLane<K, V> joinValueLane() {
    return this.context.joinValueLane();
  }

  @Override
  public final <V> ListLane<V> listLane() {
    return this.context.listLane();
  }

  @Override
  public final <K, V> MapLane<K, V> mapLane() {
    return this.context.mapLane();
  }

  @Override
  public final <K, S, V> SpatialLane<K, S, V> spatialLane(Z2Form<S> shapeForm) {
    return this.context.spatialLane(shapeForm);
  }

  @Override
  public final <K, V> SpatialLane<K, R2Shape, V> geospatialLane() {
    return this.context.geospatialLane();
  }

  @Override
  public final <V> SupplyLane<V> supplyLane() {
    return this.context.supplyLane();
  }

  @Override
  public final <V> ValueLane<V> valueLane() {
    return this.context.valueLane();
  }

  @Override
  public final <I, O> WsLane<I, O> wsLane() {
    return this.context.wsLane();
  }

  @Override
  public final ListData<Value> listData(Value name) {
    return this.context.listData(name);
  }

  @Override
  public final ListData<Value> listData(String name) {
    return this.context.listData(name);
  }

  @Override
  public final MapData<Value, Value> mapData(Value name) {
    return this.context.mapData(name);
  }

  @Override
  public final MapData<Value, Value> mapData(String name) {
    return this.context.mapData(name);
  }

  @Override
  public final <S> SpatialData<Value, S, Value> spatialData(Value name, Z2Form<S> shapeForm) {
    return this.context.spatialData(name, shapeForm);
  }

  @Override
  public final <S> SpatialData<Value, S, Value> spatialData(String name, Z2Form<S> shapeForm) {
    return this.context.spatialData(name, shapeForm);
  }

  @Override
  public final SpatialData<Value, R2Shape, Value> geospatialData(Value name) {
    return this.context.geospatialData(name);
  }

  @Override
  public final SpatialData<Value, R2Shape, Value> geospatialData(String name) {
    return this.context.geospatialData(name);
  }

  @Override
  public final ValueData<Value> valueData(Value name) {
    return this.context.valueData(name);
  }

  @Override
  public final ValueData<Value> valueData(String name) {
    return this.context.valueData(name);
  }

  @Override
  public final EventDownlink<Value> downlink() {
    return this.context.downlink();
  }

  @Override
  public final ListDownlink<Value> downlinkList() {
    return this.context.downlinkList();
  }

  @Override
  public final MapDownlink<Value, Value> downlinkMap() {
    return this.context.downlinkMap();
  }

  @Override
  public final ValueDownlink<Value> downlinkValue() {
    return this.context.downlinkValue();
  }

  @Override
  public final <V> HttpDownlink<V> downlinkHttp() {
    return this.context.downlinkHttp();
  }

  @Override
  public final <I, O> WsDownlink<I, O> downlinkWs() {
    return this.context.downlinkWs();
  }

  @Override
  public final HostRef hostRef(Uri hostUri) {
    return this.context.hostRef(hostUri);
  }

  @Override
  public final HostRef hostRef(String hostUri) {
    return this.context.hostRef(hostUri);
  }

  @Override
  public final NodeRef nodeRef(Uri hostUri, Uri nodeUri) {
    return this.context.nodeRef(hostUri, nodeUri);
  }

  @Override
  public final NodeRef nodeRef(String hostUri, String nodeUri) {
    return this.context.nodeRef(hostUri, nodeUri);
  }

  @Override
  public final NodeRef nodeRef(Uri nodeUri) {
    return this.context.nodeRef(nodeUri);
  }

  @Override
  public final NodeRef nodeRef(String nodeUri) {
    return this.context.nodeRef(nodeUri);
  }

  @Override
  public final LaneRef laneRef(Uri hostUri, Uri nodeUri, Uri laneUri) {
    return this.context.laneRef(hostUri, nodeUri, laneUri);
  }

  @Override
  public final LaneRef laneRef(String hostUri, String nodeUri, String laneUri) {
    return this.context.laneRef(hostUri, nodeUri, laneUri);
  }

  @Override
  public final LaneRef laneRef(Uri nodeUri, Uri laneUri) {
    return this.context.laneRef(nodeUri, laneUri);
  }

  @Override
  public final LaneRef laneRef(String nodeUri, String laneUri) {
    return this.context.laneRef(nodeUri, laneUri);
  }

  @Override
  public final void command(Uri hostUri, Uri nodeUri, Uri laneUri, float prio, Value body, Cont<CommandMessage> cont) {
    this.context.command(hostUri, nodeUri, laneUri, prio, body, cont);
  }

  @Override
  public final void command(String hostUri, String nodeUri, String laneUri, float prio, Value body, Cont<CommandMessage> cont) {
    this.context.command(hostUri, nodeUri, laneUri, prio, body, cont);
  }

  @Override
  public final void command(Uri hostUri, Uri nodeUri, Uri laneUri, Value body, Cont<CommandMessage> cont) {
    this.context.command(hostUri, nodeUri, laneUri, body, cont);
  }

  @Override
  public final void command(String hostUri, String nodeUri, String laneUri, Value body, Cont<CommandMessage> cont) {
    this.context.command(hostUri, nodeUri, laneUri, body, cont);
  }

  @Override
  public final void command(Uri nodeUri, Uri laneUri, float prio, Value body, Cont<CommandMessage> cont) {
    this.context.command(nodeUri, laneUri, prio, body, cont);
  }

  @Override
  public final void command(String nodeUri, String laneUri, float prio, Value body, Cont<CommandMessage> cont) {
    this.context.command(nodeUri, laneUri, prio, body, cont);
  }

  @Override
  public final void command(Uri nodeUri, Uri laneUri, Value body, Cont<CommandMessage> cont) {
    this.context.command(nodeUri, laneUri, body, cont);
  }

  @Override
  public final void command(String nodeUri, String laneUri, Value body, Cont<CommandMessage> cont) {
    this.context.command(nodeUri, laneUri, body, cont);
  }

  @Override
  public final void command(Uri hostUri, Uri nodeUri, Uri laneUri, float prio, Value body) {
    this.context.command(hostUri, nodeUri, laneUri, prio, body);
  }

  @Override
  public final void command(String hostUri, String nodeUri, String laneUri, float prio, Value body) {
    this.context.command(hostUri, nodeUri, laneUri, prio, body);
  }

  @Override
  public final void command(Uri hostUri, Uri nodeUri, Uri laneUri, Value body) {
    this.context.command(hostUri, nodeUri, laneUri, body);
  }

  @Override
  public final void command(String hostUri, String nodeUri, String laneUri, Value body) {
    this.context.command(hostUri, nodeUri, laneUri, body);
  }

  @Override
  public final void command(Uri nodeUri, Uri laneUri, float prio, Value body) {
    this.context.command(nodeUri, laneUri, prio, body);
  }

  @Override
  public final void command(String nodeUri, String laneUri, float prio, Value body) {
    this.context.command(nodeUri, laneUri, prio, body);
  }

  @Override
  public final void command(Uri nodeUri, Uri laneUri, Value body) {
    this.context.command(nodeUri, laneUri, body);
  }

  @Override
  public final void command(String nodeUri, String laneUri, Value body) {
    this.context.command(nodeUri, laneUri, body);
  }

  @Override
  public void trace(Object message) {
    final Link link = link();
    if (link != null) {
      link.trace(message);
    } else {
      this.context.trace(message);
    }
  }

  @Override
  public void debug(Object message) {
    final Link link = link();
    if (link != null) {
      link.debug(message);
    } else {
      this.context.debug(message);
    }
  }

  @Override
  public void info(Object message) {
    final Link link = link();
    if (link != null) {
      link.info(message);
    } else {
      this.context.info(message);
    }
  }

  @Override
  public void warn(Object message) {
    final Link link = link();
    if (link != null) {
      link.warn(message);
    } else {
      this.context.warn(message);
    }
  }

  @Override
  public void error(Object message) {
    final Link link = link();
    if (link != null) {
      link.error(message);
    } else {
      this.context.error(message);
    }
  }

  @Override
  public void fail(Object message) {
    final Link link = link();
    if (link != null) {
      link.fail(message);
    } else {
      this.context.fail(message);
    }
  }

  @Override
  public final TimerRef timer(TimerFunction timer) {
    return schedule().timer(timer);
  }

  @Override
  public final TimerRef setTimer(long millis, TimerFunction timer) {
    return schedule().setTimer(millis, timer);
  }

  @Override
  public void close() {
    this.context.close();
  }
}
