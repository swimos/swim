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

package swim.remote;

import java.net.InetSocketAddress;
import java.security.Principal;
import java.security.cert.Certificate;
import java.util.Collection;
import java.util.Iterator;
import java.util.concurrent.atomic.AtomicIntegerFieldUpdater;
import java.util.concurrent.atomic.AtomicLongFieldUpdater;
import java.util.concurrent.atomic.AtomicReferenceFieldUpdater;
import swim.api.Downlink;
import swim.api.auth.Identity;
import swim.api.lane.DemandLane;
import swim.api.lane.function.OnCue;
import swim.api.policy.Policy;
import swim.api.policy.PolicyDirective;
import swim.api.warp.WarpUplink;
import swim.collections.FingerTrieSeq;
import swim.collections.HashTrieMap;
import swim.collections.HashTrieSet;
import swim.concurrent.Cont;
import swim.concurrent.PullContext;
import swim.concurrent.PullRequest;
import swim.concurrent.Schedule;
import swim.concurrent.Stage;
import swim.concurrent.Stay;
import swim.concurrent.StayContext;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.io.FlowModifier;
import swim.io.IpSocket;
import swim.io.warp.WarpSocket;
import swim.io.warp.WarpSocketContext;
import swim.store.StoreBinding;
import swim.structure.Value;
import swim.system.AbstractTierBinding;
import swim.system.HostAddress;
import swim.system.HostBinding;
import swim.system.HostContext;
import swim.system.HostException;
import swim.system.LaneBinding;
import swim.system.LinkBinding;
import swim.system.Metric;
import swim.system.NodeBinding;
import swim.system.PartBinding;
import swim.system.Push;
import swim.system.TierContext;
import swim.system.UplinkError;
import swim.system.WarpBinding;
import swim.system.WarpContext;
import swim.system.agent.AgentNode;
import swim.system.profile.HostProfile;
import swim.system.reflect.AgentPulse;
import swim.system.reflect.HostPulse;
import swim.system.reflect.WarpDownlinkPulse;
import swim.system.reflect.WarpUplinkPulse;
import swim.uri.Uri;
import swim.uri.UriAuthority;
import swim.uri.UriHost;
import swim.uri.UriMapper;
import swim.uri.UriPath;
import swim.uri.UriPort;
import swim.uri.UriScheme;
import swim.util.HashGenCacheMap;
import swim.warp.AuthRequest;
import swim.warp.AuthedResponse;
import swim.warp.CommandMessage;
import swim.warp.DeauthRequest;
import swim.warp.DeauthedResponse;
import swim.warp.Envelope;
import swim.warp.EventMessage;
import swim.warp.LaneAddressed;
import swim.warp.LinkAddressed;
import swim.warp.LinkRequest;
import swim.warp.LinkedResponse;
import swim.warp.SyncRequest;
import swim.warp.SyncedResponse;
import swim.warp.UnlinkRequest;
import swim.warp.UnlinkedResponse;
import swim.ws.WsClose;
import swim.ws.WsControl;
import swim.ws.WsPing;
import swim.ws.WsPong;

public class RemoteHost extends AbstractTierBinding implements HostBinding, WarpSocket, StayContext {

  protected HostContext hostContext;
  protected WarpSocketContext warpSocketContext;
  final Uri requestUri;
  final Uri baseUri;
  Uri remoteUri;

  volatile int flags;
  volatile Identity remoteIdentity;
  volatile HashTrieMap<Uri, HashTrieMap<Uri, RemoteWarpDownlink>> downlinks;
  volatile HashTrieMap<Uri, HashTrieMap<Uri, HashTrieSet<RemoteWarpUplink>>> uplinks;
  volatile int receiveBacklog;
  RemoteHostMessageCont messageCont;
  final HashGenCacheMap<Uri, Uri> resolveCache;

  volatile int downlinkOpenDelta;
  volatile long downlinkOpenCount;
  volatile int downlinkCloseDelta;
  volatile long downlinkCloseCount;
  volatile int downlinkEventDelta;
  volatile long downlinkEventCount;
  volatile int downlinkCommandDelta;
  volatile long downlinkCommandCount;
  volatile int uplinkOpenDelta;
  volatile long uplinkOpenCount;
  volatile int uplinkCloseDelta;
  volatile long uplinkCloseCount;
  volatile int uplinkEventDelta;
  volatile long uplinkEventCount;
  volatile int uplinkCommandDelta;
  volatile long uplinkCommandCount;
  volatile long lastReportTime;

  HostPulse pulse;
  AgentNode metaNode;
  DemandLane<HostPulse> metaPulse;

  public RemoteHost(Uri requestUri, Uri baseUri) {
    this.hostContext = null;
    this.warpSocketContext = null;
    this.requestUri = requestUri;
    this.baseUri = baseUri;
    this.remoteUri = null;

    this.flags = 0;
    this.remoteIdentity = null;
    this.downlinks = HashTrieMap.empty();
    this.uplinks = HashTrieMap.empty();
    this.receiveBacklog = 0;
    this.messageCont = null;
    this.resolveCache = new HashGenCacheMap<Uri, Uri>(RemoteHost.URI_RESOLUTION_CACHE_SIZE);

    this.downlinkOpenDelta = 0;
    this.downlinkOpenCount = 0L;
    this.downlinkCloseDelta = 0;
    this.downlinkCloseCount = 0L;
    this.downlinkEventDelta = 0;
    this.downlinkEventCount = 0L;
    this.downlinkCommandDelta = 0;
    this.downlinkCommandCount = 0L;
    this.uplinkOpenDelta = 0;
    this.uplinkOpenCount = 0L;
    this.uplinkCloseDelta = 0;
    this.uplinkCloseCount = 0L;
    this.uplinkEventDelta = 0;
    this.uplinkEventCount = 0L;
    this.uplinkCommandDelta = 0;
    this.uplinkCommandCount = 0L;
    this.lastReportTime = 0L;

    this.pulse = null;
    this.metaNode = null;
    this.metaPulse = null;
  }

  public RemoteHost(Uri baseUri) {
    this(Uri.empty(), baseUri);
  }

  @Override
  public final TierContext tierContext() {
    return this.hostContext;
  }

  @Override
  public final PartBinding part() {
    return this.hostContext.part();
  }

  @Override
  public final HostBinding hostWrapper() {
    return this;
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T unwrapHost(Class<T> hostClass) {
    if (hostClass.isAssignableFrom(this.getClass())) {
      return (T) this;
    } else {
      return this.hostContext.unwrapHost(hostClass);
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T bottomHost(Class<T> hostClass) {
    T host = this.hostContext.bottomHost(hostClass);
    if (host == null && hostClass.isAssignableFrom(this.getClass())) {
      host = (T) this;
    }
    return host;
  }

  @Override
  public final HostContext hostContext() {
    return this.hostContext;
  }

  @Override
  public void setHostContext(HostContext hostContext) {
    this.hostContext = hostContext;
  }

  @Override
  public WarpSocketContext warpSocketContext() {
    return this.warpSocketContext;
  }

  public void setWarpSocketContext(WarpSocketContext warpSocketContext) {
    this.warpSocketContext = warpSocketContext;
  }

  @Override
  public long idleTimeout() {
    return -1; // default timeout
  }

  @Override
  public HostAddress cellAddress() {
    return this.hostContext.cellAddress();
  }

  @Override
  public String edgeName() {
    return this.hostContext.edgeName();
  }

  @Override
  public Uri meshUri() {
    return this.hostContext.meshUri();
  }

  @Override
  public Value partKey() {
    return this.hostContext.partKey();
  }

  @Override
  public Uri hostUri() {
    return this.hostContext.hostUri();
  }

  @Override
  public Policy policy() {
    return this.hostContext.policy();
  }

  @Override
  public Schedule schedule() {
    return this.hostContext.schedule();
  }

  @Override
  public Stage stage() {
    return this.hostContext.stage();
  }

  @Override
  public StoreBinding store() {
    return this.hostContext.store();
  }

  @Override
  public boolean isConnected() {
    final WarpSocketContext warpSocketContext = this.warpSocketContext;
    return warpSocketContext != null && warpSocketContext.isConnected();
  }

  @Override
  public boolean isRemote() {
    return true;
  }

  @Override
  public boolean isSecure() {
    final WarpSocketContext warpSocketContext = this.warpSocketContext;
    return warpSocketContext != null && warpSocketContext.isSecure();
  }

  public String securityProtocol() {
    final WarpSocketContext warpSocketContext = this.warpSocketContext;
    if (warpSocketContext != null) {
      return warpSocketContext.securityProtocol();
    } else {
      return null;
    }
  }

  public String cipherSuite() {
    final WarpSocketContext warpSocketContext = this.warpSocketContext;
    if (warpSocketContext != null) {
      return warpSocketContext.cipherSuite();
    } else {
      return null;
    }
  }

  public InetSocketAddress localAddress() {
    final WarpSocketContext warpSocketContext = this.warpSocketContext;
    if (warpSocketContext != null) {
      return warpSocketContext.localAddress();
    } else {
      return null;
    }
  }

  public Identity localIdentity() {
    return null; // TODO
  }

  public Principal localPrincipal() {
    final WarpSocketContext warpSocketContext = this.warpSocketContext;
    if (warpSocketContext != null) {
      return warpSocketContext.localPrincipal();
    } else {
      return null;
    }
  }

  public Collection<Certificate> localCertificates() {
    final WarpSocketContext warpSocketContext = this.warpSocketContext;
    if (warpSocketContext != null) {
      return warpSocketContext.localCertificates();
    } else {
      return FingerTrieSeq.empty();
    }
  }

  public InetSocketAddress remoteAddress() {
    final WarpSocketContext warpSocketContext = this.warpSocketContext;
    if (warpSocketContext != null) {
      return warpSocketContext.remoteAddress();
    } else {
      return null;
    }
  }

  public Identity remoteIdentity() {
    return this.remoteIdentity;
  }

  public Principal remotePrincipal() {
    final WarpSocketContext warpSocketContext = this.warpSocketContext;
    if (warpSocketContext != null) {
      return warpSocketContext.remotePrincipal();
    } else {
      return null;
    }
  }

  public Collection<Certificate> remoteCertificates() {
    final WarpSocketContext warpSocketContext = this.warpSocketContext;
    if (warpSocketContext != null) {
      return warpSocketContext.remoteCertificates();
    } else {
      return FingerTrieSeq.empty();
    }
  }

  @Override
  public boolean isPrimary() {
    return (RemoteHost.FLAGS.get(this) & RemoteHost.PRIMARY) != 0;
  }

  @Override
  public void setPrimary(boolean isPrimary) {
    do {
      final int oldFlags = RemoteHost.FLAGS.get(this);
      final int newFlags = oldFlags | RemoteHost.PRIMARY;
      if (RemoteHost.FLAGS.compareAndSet(this, oldFlags, newFlags)) {
        break;
      }
    } while (true);
  }

  @Override
  public boolean isReplica() {
    return (RemoteHost.FLAGS.get(this) & RemoteHost.REPLICA) != 0;
  }

  @Override
  public void setReplica(boolean isReplica) {
    do {
      final int oldFlags = RemoteHost.FLAGS.get(this);
      final int newFlags = oldFlags | RemoteHost.REPLICA;
      if (RemoteHost.FLAGS.compareAndSet(this, oldFlags, newFlags)) {
        break;
      }
    } while (true);
  }

  @Override
  public boolean isMaster() {
    return (RemoteHost.FLAGS.get(this) & RemoteHost.MASTER) != 0;
  }

  @Override
  public boolean isSlave() {
    return (RemoteHost.FLAGS.get(this) & RemoteHost.SLAVE) != 0;
  }

  @Override
  public void didBecomeMaster() {
    do {
      final int oldFlags = RemoteHost.FLAGS.get(this);
      final int newFlags = oldFlags & ~RemoteHost.SLAVE | RemoteHost.MASTER;
      if (RemoteHost.FLAGS.compareAndSet(this, oldFlags, newFlags)) {
        break;
      }
    } while (true);
  }

  @Override
  public void didBecomeSlave() {
    do {
      final int oldFlags = RemoteHost.FLAGS.get(this);
      final int newFlags = oldFlags & ~RemoteHost.MASTER | RemoteHost.SLAVE;
      if (RemoteHost.FLAGS.compareAndSet(this, oldFlags, newFlags)) {
        break;
      }
    } while (true);
  }

  RemoteWarpDownlink createWarpDownlink(Uri remoteNodeUri, Uri nodeUri, Uri laneUri, float prio, float rate, Value body) {
    return new RemoteWarpDownlink(this, remoteNodeUri, nodeUri, laneUri, prio, rate, body);
  }

  RemoteWarpUplink createWarpUplink(WarpBinding link, Uri remoteNodeUri) {
    return new RemoteWarpUplink(this, link, remoteNodeUri);
  }

  <E extends Envelope> PullRequest<E> createPull(float prio, E envelope, Cont<E> cont) {
    return new RemoteHostPull<E>(this, prio, envelope, cont);
  }

  protected Uri resolve(Uri relativeUri) {
    Uri absoluteUri = this.resolveCache.get(relativeUri);
    if (absoluteUri == null) {
      absoluteUri = this.baseUri.resolve(relativeUri);
      if (!relativeUri.authority().isDefined()) {
        absoluteUri = Uri.create(relativeUri.scheme(), UriAuthority.undefined(),
                                 absoluteUri.path(), absoluteUri.query(), absoluteUri.fragment());
      }
      absoluteUri = this.resolveCache.put(relativeUri, absoluteUri);
    }
    return absoluteUri;
  }

  @Override
  public UriMapper<NodeBinding> nodes() {
    return UriMapper.empty();
  }

  @Override
  public NodeBinding getNode(Uri nodeUri) {
    return null;
  }

  @Override
  public NodeBinding openNode(Uri nodeUri) {
    return null;
  }

  @Override
  public NodeBinding openNode(Uri nodeUri, NodeBinding node) {
    return null;
  }

  @Override
  public void openUplink(LinkBinding link) {
    if (link instanceof WarpBinding) {
      this.openWarpUplink((WarpBinding) link);
    } else {
      UplinkError.rejectUnsupported(link);
    }
  }

  protected void openWarpUplink(WarpBinding link) {
    final Uri laneUri = link.laneUri();
    final Uri remoteNodeUri = this.resolve(link.nodeUri());
    final RemoteWarpUplink uplink = this.createWarpUplink(link, remoteNodeUri);
    link.setLinkContext(uplink);
    do {
      final HashTrieMap<Uri, HashTrieMap<Uri, HashTrieSet<RemoteWarpUplink>>> oldUplinks = RemoteHost.UPLINKS.get(this);
      HashTrieMap<Uri, HashTrieSet<RemoteWarpUplink>> nodeUplinks = oldUplinks.get(remoteNodeUri);
      if (nodeUplinks == null) {
        nodeUplinks = HashTrieMap.empty();
      }
      HashTrieSet<RemoteWarpUplink> laneUplinks = nodeUplinks.get(laneUri);
      if (laneUplinks == null) {
        laneUplinks = HashTrieSet.empty();
      }
      laneUplinks = laneUplinks.added(uplink);
      nodeUplinks = nodeUplinks.updated(laneUri, laneUplinks);
      final HashTrieMap<Uri, HashTrieMap<Uri, HashTrieSet<RemoteWarpUplink>>> newUplinks = oldUplinks.updated(remoteNodeUri, nodeUplinks);
      if (RemoteHost.UPLINKS.compareAndSet(this, oldUplinks, newUplinks)) {
        if (oldUplinks != newUplinks) {
          this.didOpenUplink(uplink);
        }
        if (this.isConnected()) {
          uplink.didConnect();
        }
        break;
      }
    } while (true);
  }

  void closeUplink(RemoteWarpUplink uplink) {
    final Uri laneUri = uplink.laneUri();
    final Uri remoteNodeUri = uplink.remoteNodeUri;
    do {
      final HashTrieMap<Uri, HashTrieMap<Uri, HashTrieSet<RemoteWarpUplink>>> oldUplinks = RemoteHost.UPLINKS.get(this);
      HashTrieMap<Uri, HashTrieSet<RemoteWarpUplink>> nodeUplinks = oldUplinks.get(remoteNodeUri);
      if (nodeUplinks != null) {
        HashTrieSet<RemoteWarpUplink> laneUplinks = nodeUplinks.get(laneUri);
        if (laneUplinks != null) {
          final HashTrieMap<Uri, HashTrieMap<Uri, HashTrieSet<RemoteWarpUplink>>> newUplinks;
          laneUplinks = laneUplinks.removed(uplink);
          if (laneUplinks.isEmpty()) {
            nodeUplinks = nodeUplinks.removed(laneUri);
            if (nodeUplinks.isEmpty()) {
              newUplinks = oldUplinks.removed(remoteNodeUri);
            } else {
              newUplinks = oldUplinks.updated(remoteNodeUri, nodeUplinks);
            }
          } else {
            nodeUplinks = nodeUplinks.updated(laneUri, laneUplinks);
            newUplinks = oldUplinks.updated(remoteNodeUri, nodeUplinks);
          }
          if (RemoteHost.UPLINKS.compareAndSet(this, oldUplinks, newUplinks)) {
            if (oldUplinks != newUplinks) {
              uplink.didCloseUp();
              this.didCloseUplink(uplink);
            }
            break;
          }
        } else {
          break;
        }
      } else {
        break;
      }
    } while (true);
  }

  @SuppressWarnings("unchecked")
  @Override
  public void pushUp(Push<?> push) {
    final Object message = push.message();
    if (message instanceof Envelope) {
      final Envelope envelope = (Envelope) message;
      final Uri remoteNodeUri = this.resolve(envelope.nodeUri());
      final Envelope remoteEnvelope = envelope.nodeUri(remoteNodeUri);
      final PullRequest<Envelope> pull = this.createPull(push.prio(), remoteEnvelope, (Cont<Envelope>) push.cont());
      this.warpSocketContext.feed(pull);
    } else {
      push.trap(new HostException("unsupported message: " + message));
    }
  }

  @Override
  public void willConnect() {
    // hook
  }

  @Override
  public void didConnect() {
    this.messageCont = new RemoteHostMessageCont(this);
    final InetSocketAddress remoteAddress = this.warpSocketContext.remoteAddress();
    final UriAuthority remoteAuthority = UriAuthority.create(UriHost.inetAddress(remoteAddress.getAddress()),
                                                             UriPort.create(remoteAddress.getPort()));
    this.remoteUri = Uri.create(UriScheme.create("warp"), remoteAuthority, UriPath.slash());
    RemoteHost.REMOTE_IDENTITY.set(this, new Unauthenticated(this.requestUri, this.remoteUri, Value.absent()));
    this.connectUplinks();
    this.hostContext.didConnect();
  }

  @Override
  public void willSecure() {
    // TODO
  }

  @Override
  public void didSecure() {
    // TODO
  }

  @Override
  public void willBecome(IpSocket socket) {
    // TODO
  }

  @Override
  public void didBecome(IpSocket socket) {
    // TODO
  }

  @Override
  public void didUpgrade(HttpRequest<?> request, HttpResponse<?> response) {
    this.start();
  }

  @Override
  public void doRead() {
    // nop
  }

  @Override
  public void didRead(Envelope envelope) {
    if (envelope instanceof EventMessage) {
      this.onEventMessage((EventMessage) envelope);
    } else if (envelope instanceof CommandMessage) {
      this.onCommandMessage((CommandMessage) envelope);
    } else if (envelope instanceof LinkRequest) {
      this.onLinkRequest((LinkRequest) envelope);
    } else if (envelope instanceof LinkedResponse) {
      this.onLinkedResponse((LinkedResponse) envelope);
    } else if (envelope instanceof SyncRequest) {
      this.onSyncRequest((SyncRequest) envelope);
    } else if (envelope instanceof SyncedResponse) {
      this.onSyncedResponse((SyncedResponse) envelope);
    } else if (envelope instanceof UnlinkRequest) {
      this.onUnlinkRequest((UnlinkRequest) envelope);
    } else if (envelope instanceof UnlinkedResponse) {
      this.onUnlinkedResponse((UnlinkedResponse) envelope);
    } else if (envelope instanceof AuthRequest) {
      this.onAuthRequest((AuthRequest) envelope);
    } else if (envelope instanceof AuthedResponse) {
      this.onAuthedResponse((AuthedResponse) envelope);
    } else if (envelope instanceof DeauthRequest) {
      this.onDeauthRequest((DeauthRequest) envelope);
    } else if (envelope instanceof DeauthedResponse) {
      this.onDeauthedResponse((DeauthedResponse) envelope);
    } else {
      this.onUnknownEnvelope(envelope);
    }
  }

  @Override
  public void didRead(WsControl<?, ?> frame) {
    final WarpSocketContext warpSocketContext = this.warpSocketContext;
    if (frame instanceof WsClose<?, ?>) {
      if (warpSocketContext != null) {
        warpSocketContext.write(WsClose.create(1000));
      } else {
        this.didReadClose((WsClose<?, ?>) frame);
      }
    } else if (frame instanceof WsPing<?, ?>) {
      if (warpSocketContext != null) {
        warpSocketContext.write(WsPong.create(frame.payload()));
      }
    }
  }

  protected void didReadClose(WsClose<?, ?> frame) {
    this.close();
  }

  protected void onEventMessage(EventMessage message) {
    final Uri nodeUri = this.resolve(message.nodeUri());
    final Uri laneUri = message.laneUri();

    final HashTrieMap<Uri, HashTrieSet<RemoteWarpUplink>> nodeUplinks = RemoteHost.UPLINKS.get(this).get(nodeUri);
    if (nodeUplinks != null) {
      final HashTrieSet<RemoteWarpUplink> laneUplinks = nodeUplinks.get(laneUri);
      if (laneUplinks != null) {
        final EventMessage resolvedMessage = message.nodeUri(nodeUri);
        final Iterator<RemoteWarpUplink> uplinksIterator = laneUplinks.iterator();
        while (uplinksIterator.hasNext()) {
          this.willPushMessage(resolvedMessage);
          final RemoteWarpUplink uplink = uplinksIterator.next();
          uplink.queueDown(new Push<Envelope>(Uri.empty(), Uri.empty(), uplink.nodeUri(), uplink.laneUri(),
                                              uplink.prio(), this.remoteIdentity(), resolvedMessage, this.messageCont));
        }
      }
    }

    RemoteHost.UPLINK_EVENT_DELTA.incrementAndGet(this);
    this.didUpdateMetrics();
  }

  protected void onCommandMessage(CommandMessage message) {
    final Policy policy = this.policy();
    final PolicyDirective<CommandMessage> directive;
    if (policy != null) {
      directive = policy.canDownlink(message, this.remoteIdentity);
    } else {
      directive = PolicyDirective.allow();
    }

    if (directive.isAllowed()) {
      final CommandMessage newMessage = directive.get();
      if (newMessage != null) {
        message = newMessage;
      }

      final Uri nodeUri = this.resolve(message.nodeUri());
      final Uri laneUri = message.laneUri();
      final CommandMessage resolvedMessage = message.nodeUri(nodeUri);
      final HashTrieMap<Uri, RemoteWarpDownlink> nodeDownlinks = RemoteHost.DOWNLINKS.get(this).get(nodeUri);
      final RemoteWarpDownlink laneDownlink = nodeDownlinks != null ? nodeDownlinks.get(laneUri) : null;
      if (laneDownlink != null) {
        laneDownlink.queueUp(resolvedMessage);
      } else {
        this.willPushMessage(resolvedMessage);
        this.hostContext.pushDown(new Push<Envelope>(Uri.empty(), Uri.empty(), nodeUri, laneUri,
                                                     0.0f, null, resolvedMessage, this.messageCont));
      }
    } else if (directive.isForbidden()) {
      this.forbid();
    }

    RemoteHost.DOWNLINK_COMMAND_DELTA.incrementAndGet(this);
    this.didUpdateMetrics();
  }

  protected void willPushMessage(Envelope envelope) {
    //do {
    //  final int oldReceiveBacklog = this.receiveBacklog;
    //  final int newReceiveBacklog = oldReceiveBacklog + 1;
    //  if (RemoteHost.RECEIVE_BACKLOG.compareAndSet(this, oldReceiveBacklog, newReceiveBacklog)) {
    //    if (newReceiveBacklog == RemoteHost.MAX_RECEIVE_BACKLOG) {
    //      this.warpSocketContext.flowControl(FlowModifier.DISABLE_READ);
    //      if (newReceiveBacklog != this.receiveBacklog) {
    //        this.reconcileReceiveBacklog();
    //      }
    //    }
    //    break;
    //  }
    //} while (true);
  }

  protected void didPushMessage(Envelope envelope) {
    //do {
    //  final int oldReceiveBacklog = this.receiveBacklog;
    //  final int newReceiveBacklog = oldReceiveBacklog - 1;
    //  if (RemoteHost.RECEIVE_BACKLOG.compareAndSet(this, oldReceiveBacklog, newReceiveBacklog)) {
    //    if (oldReceiveBacklog == RemoteHost.MAX_RECEIVE_BACKLOG) {
    //      this.warpSocketContext.flowControl(FlowModifier.ENABLE_READ);
    //      if (newReceiveBacklog != this.receiveBacklog) {
    //        this.reconcileReceiveBacklog();
    //      }
    //    }
    //    break;
    //  }
    //} while (true);
  }

  protected void reconcileReceiveBacklog() {
    do {
      final int receiveBacklog = this.receiveBacklog;
      if (receiveBacklog < RemoteHost.MAX_RECEIVE_BACKLOG) {
        this.warpSocketContext.flowControl(FlowModifier.ENABLE_READ);
      } else {
        this.warpSocketContext.flowControl(FlowModifier.DISABLE_READ);
      }
      if (receiveBacklog == this.receiveBacklog) {
        break;
      }
    } while (true);
  }

  protected void routeDownlink(LinkAddressed envelope) {
    final Uri remoteNodeUri = envelope.nodeUri();
    final Uri nodeUri = this.resolve(remoteNodeUri);
    final Uri laneUri = envelope.laneUri();
    final float prio = envelope.prio();
    final float rate = envelope.rate();
    final Value body = envelope.body();
    RemoteWarpDownlink downlink = null;

    do {
      final HashTrieMap<Uri, HashTrieMap<Uri, RemoteWarpDownlink>> oldDownlinks = RemoteHost.DOWNLINKS.get(this);
      HashTrieMap<Uri, RemoteWarpDownlink> nodeDownlinks = oldDownlinks.get(nodeUri);
      if (nodeDownlinks == null) {
        nodeDownlinks = HashTrieMap.empty();
      }
      final RemoteWarpDownlink laneDownlink = nodeDownlinks.get(laneUri);
      if (laneDownlink != null) {
        if (downlink != null) {
          // Lost creation race.
          downlink.closeDown();
        }
        downlink = laneDownlink;
        break;
      } else {
        if (downlink == null) {
          downlink = this.createWarpDownlink(remoteNodeUri, nodeUri, laneUri, prio, rate, body);
          this.hostContext.openDownlink(downlink);
        }
        // TODO: don't register error links
        nodeDownlinks = nodeDownlinks.updated(laneUri, downlink);
        final HashTrieMap<Uri, HashTrieMap<Uri, RemoteWarpDownlink>> newDownlinks = oldDownlinks.updated(nodeUri, nodeDownlinks);
        if (RemoteHost.DOWNLINKS.compareAndSet(this, oldDownlinks, newDownlinks)) {
          downlink.openDown();
          this.didOpenDownlink(downlink);
          break;
        }
      }
    } while (true);

    final LinkAddressed resolvedEnvelope = envelope.nodeUri(nodeUri);
    downlink.queueUp(resolvedEnvelope);
  }

  protected void didOpenDownlink(WarpBinding downlink) {
    RemoteHost.DOWNLINK_OPEN_DELTA.incrementAndGet(this);
    this.flushMetrics();
  }

  protected void didCloseDownlink(WarpBinding downlink) {
    RemoteHost.DOWNLINK_CLOSE_DELTA.incrementAndGet(this);
    this.flushMetrics();
  }

  protected void routeUplink(LaneAddressed envelope) {
    final Uri nodeUri = this.resolve(envelope.nodeUri());
    final Uri laneUri = envelope.laneUri();
    final HashTrieMap<Uri, HashTrieSet<RemoteWarpUplink>> nodeUplinks = RemoteHost.UPLINKS.get(this).get(nodeUri);
    if (nodeUplinks != null) {
      final HashTrieSet<RemoteWarpUplink> laneUplinks = nodeUplinks.get(laneUri);
      if (laneUplinks != null) {
        final LaneAddressed resolvedEnvelope = envelope.nodeUri(nodeUri);
        final Iterator<RemoteWarpUplink> uplinksIterator = laneUplinks.iterator();
        while (uplinksIterator.hasNext()) {
          final RemoteWarpUplink uplink = uplinksIterator.next();
          uplink.queueDown(new Push<Envelope>(Uri.empty(), Uri.empty(), uplink.nodeUri(), uplink.laneUri(),
                                              uplink.prio(), this.remoteIdentity(), resolvedEnvelope, null));
        }
      }
    }
  }

  protected void didOpenUplink(WarpContext uplink) {
    RemoteHost.UPLINK_OPEN_DELTA.incrementAndGet(this);
    this.flushMetrics();
  }

  protected void didCloseUplink(WarpContext uplink) {
    RemoteHost.UPLINK_CLOSE_DELTA.incrementAndGet(this);
    this.flushMetrics();
  }

  protected void onLinkRequest(LinkRequest request) {
    final Policy policy = this.policy();
    if (policy != null) {
      final PolicyDirective<LinkRequest> directive = policy.canLink(request, this.remoteIdentity);
      if (directive.isAllowed()) {
        final LinkRequest newRequest = directive.get();
        if (newRequest != null) {
          request = newRequest;
        }
      } else if (directive.isDenied()) {
        final UnlinkedResponse response = new UnlinkedResponse(request.nodeUri(), request.laneUri());
        this.warpSocketContext.feed(response, 1.0f);
        return;
      } else {
        this.forbid();
        return;
      }
    }
    this.routeDownlink(request);
  }

  protected void onLinkedResponse(LinkedResponse response) {
    this.routeUplink(response);
  }

  protected void onSyncRequest(SyncRequest request) {
    final Policy policy = this.policy();
    if (policy != null) {
      final PolicyDirective<SyncRequest> directive = policy.canSync(request, this.remoteIdentity);
      if (directive.isAllowed()) {
        final SyncRequest newRequest = directive.get();
        if (newRequest != null) {
          request = newRequest;
        }
      } else if (directive.isDenied()) {
        final UnlinkedResponse response = new UnlinkedResponse(request.nodeUri(), request.laneUri());
        this.warpSocketContext.feed(response, 1.0f);
        return;
      } else {
        this.forbid();
        return;
      }
    }
    this.routeDownlink(request);
  }

  protected void onSyncedResponse(SyncedResponse response) {
    this.routeUplink(response);
  }

  protected void onUnlinkRequest(UnlinkRequest request) {
    final Uri nodeUri = this.resolve(request.nodeUri());
    final Uri laneUri = request.laneUri();
    do {
      final HashTrieMap<Uri, HashTrieMap<Uri, RemoteWarpDownlink>> oldDownlinks = RemoteHost.DOWNLINKS.get(this);
      HashTrieMap<Uri, RemoteWarpDownlink> nodeDownlinks = oldDownlinks.get(nodeUri);
      if (nodeDownlinks != null) {
        final RemoteWarpDownlink downlink = nodeDownlinks.get(laneUri);
        if (downlink != null) {
          nodeDownlinks = nodeDownlinks.removed(laneUri);
          final HashTrieMap<Uri, HashTrieMap<Uri, RemoteWarpDownlink>> newDownlinks;
          if (nodeDownlinks.isEmpty()) {
            newDownlinks = oldDownlinks.removed(nodeUri);
          } else {
            newDownlinks = oldDownlinks.updated(nodeUri, nodeDownlinks);
          }
          if (RemoteHost.DOWNLINKS.compareAndSet(this, oldDownlinks, newDownlinks)) {
            final UnlinkRequest resolvedRequest = request.nodeUri(nodeUri);
            downlink.queueUp(resolvedRequest);
            this.didCloseDownlink(downlink);
            break;
          }
        } else {
          break;
        }
      } else {
        break;
      }
    } while (true);
  }

  protected void onUnlinkedResponse(UnlinkedResponse response) {
    final Uri nodeUri = this.resolve(response.nodeUri());
    final Uri laneUri = response.laneUri();
    do {
      final HashTrieMap<Uri, HashTrieMap<Uri, HashTrieSet<RemoteWarpUplink>>> oldUplinks = RemoteHost.UPLINKS.get(this);
      HashTrieMap<Uri, HashTrieSet<RemoteWarpUplink>> nodeUplinks = oldUplinks.get(nodeUri);
      if (nodeUplinks != null) {
        final HashTrieSet<RemoteWarpUplink> laneUplinks = nodeUplinks.get(laneUri);
        if (laneUplinks != null) {
          nodeUplinks = nodeUplinks.removed(laneUri);
          final HashTrieMap<Uri, HashTrieMap<Uri, HashTrieSet<RemoteWarpUplink>>> newUplinks;
          if (nodeUplinks.isEmpty()) {
            newUplinks = oldUplinks.removed(nodeUri);
          } else {
            newUplinks = oldUplinks.updated(nodeUri, nodeUplinks);
          }
          if (RemoteHost.UPLINKS.compareAndSet(this, oldUplinks, newUplinks)) {
            final UnlinkedResponse resolvedResponse = response.nodeUri(nodeUri);
            final Iterator<RemoteWarpUplink> uplinksIterator = laneUplinks.iterator();
            while (uplinksIterator.hasNext()) {
              final RemoteWarpUplink uplink = uplinksIterator.next();
              uplink.queueDown(new Push<Envelope>(Uri.empty(), Uri.empty(), uplink.nodeUri(), uplink.laneUri(),
                                                  uplink.prio(), this.remoteIdentity(), resolvedResponse, null));
              this.didCloseUplink(uplink);
            }
            break;
          }
        } else {
          break;
        }
      } else {
        break;
      }
    } while (true);
  }

  protected void onAuthRequest(AuthRequest request) {
    final RemoteCredentials credentials = new RemoteCredentials(this.requestUri, this.remoteUri, request.body());
    final PolicyDirective<Identity> directive = this.hostContext.authenticate(credentials);
    if (directive != null && directive.isAllowed()) {
      RemoteHost.REMOTE_IDENTITY.set(this, directive.get());
      final AuthedResponse response = new AuthedResponse();
      this.warpSocketContext.feed(response, 1.0f);
    } else {
      final DeauthedResponse response = new DeauthedResponse();
      this.warpSocketContext.feed(response, 1.0f);
    }
    if (directive != null && directive.isForbidden()) {
      final WarpSocketContext warpSocketContext = this.warpSocketContext;
      if (warpSocketContext != null) {
        warpSocketContext.write(WsClose.create(1008, "Unauthorized"));
      } else {
        this.close();
      }
    }
  }

  protected void onAuthedResponse(AuthedResponse response) {
    // TODO
  }

  protected void onDeauthRequest(DeauthRequest request) {
    RemoteHost.REMOTE_IDENTITY.set(this, null);
    final DeauthedResponse response = new DeauthedResponse();
    this.warpSocketContext.feed(response, 1.0f);
  }

  protected void onDeauthedResponse(DeauthedResponse response) {
    // TODO
  }

  protected void onUnknownEnvelope(Envelope envelope) {
    // hook
  }

  protected void forbid() {
    final WarpSocketContext warpSocketContext = this.warpSocketContext;
    if (warpSocketContext != null) {
      warpSocketContext.write(WsClose.create(1008, "Forbidden"));
    } else {
      this.close();
    }
  }

  @Override
  public void doWrite() {
    // nop
  }

  @Override
  public void didWrite(Envelope envelope) {
    // nop
  }

  @Override
  public void didWrite(WsControl<?, ?> frame) {
    // nop
  }

  @Override
  public void didTimeout() {
    // TODO
  }

  @Override
  public void didDisconnect() {
    final RemoteHostMessageCont messageCont = this.messageCont;
    if (messageCont != null) {
      messageCont.host = null;
      this.messageCont = null;
    }
    RemoteHost.RECEIVE_BACKLOG.set(this, 0);

    Throwable failure = null;
    try {
      this.disconnectUplinks();
    } catch (Throwable cause) {
      if (!Cont.isNonFatal(cause)) {
        throw cause;
      }
      failure = cause;
    }
    try {
      this.hostContext.didDisconnect();
    } catch (Throwable cause) {
      if (!Cont.isNonFatal(cause)) {
        throw cause;
      }
      failure = cause;
    }
    this.reconnect();
    if (failure instanceof RuntimeException) {
      throw (RuntimeException) failure;
    } else if (failure instanceof Error) {
      throw (Error) failure;
    }
  }

  @Override
  protected void willClose() {
    super.willClose();
    Throwable failure = null;
    try {
      this.closeDownlinks();
    } catch (Throwable cause) {
      if (!Cont.isNonFatal(cause)) {
        throw cause;
      }
      failure = cause;
    }
    try {
      this.closeUplinks();
    } catch (Throwable cause) {
      if (!Cont.isNonFatal(cause)) {
        throw cause;
      }
      failure = cause;
    }
    try {
      final HostContext hostContext = this.hostContext;
      if (hostContext != null) {
        hostContext.close();
      }
    } catch (Throwable cause) {
      if (!Cont.isNonFatal(cause)) {
        throw cause;
      }
      failure = cause;
    }
    try {
      final WarpSocketContext warpSocketContext = this.warpSocketContext;
      if (warpSocketContext != null) {
        warpSocketContext.close();
      }
    } catch (Throwable cause) {
      if (!Cont.isNonFatal(cause)) {
        throw cause;
      }
      failure = cause;
    }
    if (failure instanceof RuntimeException) {
      throw (RuntimeException) failure;
    } else if (failure instanceof Error) {
      throw (Error) failure;
    }
  }

  @Override
  public void didClose() {
    super.didClose();
    final AgentNode metaNode = this.metaNode;
    if (metaNode != null) {
      metaNode.close();
      this.metaNode = null;
    }
    this.flushMetrics();
  }

  @Override
  public void didFail(Throwable error) {
    Throwable failure = null;
    try {
      final WarpSocketContext warpSocketContext = this.warpSocketContext;
      if (warpSocketContext != null) {
        this.warpSocketContext = null;
        warpSocketContext.close();
      }
    } catch (Throwable cause) {
      if (!Cont.isNonFatal(cause)) {
        throw cause;
      }
      failure = cause;
    }
    this.hostContext.close();
    if (failure instanceof RuntimeException) {
      throw (RuntimeException) failure;
    } else if (failure instanceof Error) {
      throw (Error) failure;
    }
  }

  @Override
  public void openMetaHost(HostBinding host, NodeBinding metaHost) {
    if (metaHost instanceof AgentNode) {
      this.metaNode = (AgentNode) metaHost;
      this.openMetaLanes(host, (AgentNode) metaHost);
    }
    this.hostContext.openMetaHost(host, metaHost);
  }

  protected void openMetaLanes(HostBinding host, AgentNode metaHost) {
    this.openReflectLanes(host, metaHost);
  }

  protected void openReflectLanes(HostBinding host, AgentNode metaHost) {
    this.metaPulse = this.metaNode.demandLane()
                                  .valueForm(HostPulse.form())
                                  .observe(new RemoteHostPulseController(this));
    this.metaNode.openLane(HostPulse.PULSE_URI, this.metaPulse);
  }

  @Override
  public void openMetaNode(NodeBinding node, NodeBinding metaNode) {
    this.hostContext.openMetaNode(node, metaNode);
  }

  @Override
  public void openMetaLane(LaneBinding lane, NodeBinding metaLane) {
    this.hostContext.openMetaLane(lane, metaLane);
  }

  @Override
  public void openMetaUplink(LinkBinding uplink, NodeBinding metaUplink) {
    this.hostContext.openMetaUplink(uplink, metaUplink);
  }

  @Override
  public void openMetaDownlink(LinkBinding downlink, NodeBinding metaDownlink) {
    this.hostContext.openMetaDownlink(downlink, metaDownlink);
  }

  @Override
  public LinkBinding bindDownlink(Downlink downlink) {
    return this.hostContext.bindDownlink(downlink);
  }

  @Override
  public void openDownlink(LinkBinding link) {
    this.hostContext.openDownlink(link);
  }

  @Override
  public void closeDownlink(LinkBinding link) {
    this.hostContext.closeDownlink(link);
  }

  @Override
  public void pushDown(Push<?> push) {
    this.hostContext.pushDown(push);
  }

  @Override
  public void reportDown(Metric metric) {
    this.hostContext.reportDown(metric);
  }

  protected void reconnect() {
    this.close();
  }

  protected void closeDownlinks() {
    do {
      final HashTrieMap<Uri, HashTrieMap<Uri, RemoteWarpDownlink>> oldDownlinks = RemoteHost.DOWNLINKS.get(this);
      final HashTrieMap<Uri, HashTrieMap<Uri, RemoteWarpDownlink>> newDownlinks = HashTrieMap.empty();
      if (RemoteHost.DOWNLINKS.compareAndSet(this, oldDownlinks, newDownlinks)) {
        final Iterator<HashTrieMap<Uri, RemoteWarpDownlink>> nodeDownlinksIterator = oldDownlinks.valueIterator();
        while (nodeDownlinksIterator.hasNext()) {
          final HashTrieMap<Uri, RemoteWarpDownlink> nodeDownlinks = nodeDownlinksIterator.next();
          final Iterator<RemoteWarpDownlink> laneDownlinks = nodeDownlinks.valueIterator();
          while (laneDownlinks.hasNext()) {
            final RemoteWarpDownlink downlink = laneDownlinks.next();
            downlink.closeDown();
            this.didCloseDownlink(downlink);
          }
        }
        break;
      }
    } while (true);
  }

  protected void closeUplinks() {
    do {
      final HashTrieMap<Uri, HashTrieMap<Uri, HashTrieSet<RemoteWarpUplink>>> oldUplinks = RemoteHost.UPLINKS.get(this);
      final HashTrieMap<Uri, HashTrieMap<Uri, HashTrieSet<RemoteWarpUplink>>> newUplinks = HashTrieMap.empty();
      if (RemoteHost.UPLINKS.compareAndSet(this, oldUplinks, newUplinks)) {
        final Iterator<HashTrieMap<Uri, HashTrieSet<RemoteWarpUplink>>> nodeUplinksIterator = oldUplinks.valueIterator();
        while (nodeUplinksIterator.hasNext()) {
          final HashTrieMap<Uri, HashTrieSet<RemoteWarpUplink>> nodeUplinks = nodeUplinksIterator.next();
          final Iterator<HashTrieSet<RemoteWarpUplink>> laneUplinksIterator = nodeUplinks.valueIterator();
          while (laneUplinksIterator.hasNext()) {
            final HashTrieSet<RemoteWarpUplink> laneUplinks = laneUplinksIterator.next();
            final Iterator<RemoteWarpUplink> uplinksIterator = laneUplinks.iterator();
            while (uplinksIterator.hasNext()) {
              final RemoteWarpUplink uplink = uplinksIterator.next();
              uplink.closeUp();
              this.didCloseUplink(uplink);
            }
          }
        }
        break;
      }
    } while (true);
  }

  protected void connectUplinks() {
    final Iterator<HashTrieMap<Uri, HashTrieSet<RemoteWarpUplink>>> nodeUplinksIterator = RemoteHost.UPLINKS.get(this).valueIterator();
    while (nodeUplinksIterator.hasNext()) {
      final HashTrieMap<Uri, HashTrieSet<RemoteWarpUplink>> nodeUplinks = nodeUplinksIterator.next();
      final Iterator<HashTrieSet<RemoteWarpUplink>> laneUplinksIterator = nodeUplinks.valueIterator();
      while (laneUplinksIterator.hasNext()) {
        final HashTrieSet<RemoteWarpUplink> laneUplinks = laneUplinksIterator.next();
        final Iterator<RemoteWarpUplink> uplinksIterator = laneUplinks.iterator();
        while (uplinksIterator.hasNext()) {
          final RemoteWarpUplink uplink = uplinksIterator.next();
          uplink.didConnect();
        }
      }
    }
  }

  protected void disconnectUplinks() {
    final Iterator<HashTrieMap<Uri, HashTrieSet<RemoteWarpUplink>>> nodeUplinksIterator = RemoteHost.UPLINKS.get(this).valueIterator();
    while (nodeUplinksIterator.hasNext()) {
      final HashTrieMap<Uri, HashTrieSet<RemoteWarpUplink>> nodeUplinks = nodeUplinksIterator.next();
      final Iterator<HashTrieSet<RemoteWarpUplink>> laneUplinksIterator = nodeUplinks.valueIterator();
      while (laneUplinksIterator.hasNext()) {
        final HashTrieSet<RemoteWarpUplink> laneUplinks = laneUplinksIterator.next();
        final Iterator<RemoteWarpUplink> uplinksIterator = laneUplinks.iterator();
        while (uplinksIterator.hasNext()) {
          final RemoteWarpUplink uplink = uplinksIterator.next();
          uplink.didDisconnect();
        }
      }
    }
  }

  @Override
  public void trace(Object message) {
    this.hostContext.trace(message);
  }

  @Override
  public void debug(Object message) {
    this.hostContext.debug(message);
  }

  @Override
  public void info(Object message) {
    this.hostContext.info(message);
  }

  @Override
  public void warn(Object message) {
    this.hostContext.warn(message);
  }

  @Override
  public void error(Object message) {
    this.hostContext.error(message);
  }

  @Override
  public void fail(Object message) {
    this.hostContext.fail(message);
  }

  protected void didUpdateMetrics() {
    do {
      final long newReportTime = System.currentTimeMillis();
      final long oldReportTime = RemoteHost.LAST_REPORT_TIME.get(this);
      final long dt = newReportTime - oldReportTime;
      if (dt >= Metric.REPORT_INTERVAL) {
        if (RemoteHost.LAST_REPORT_TIME.compareAndSet(this, oldReportTime, newReportTime)) {
          try {
            this.reportMetrics(dt);
          } catch (Throwable error) {
            if (Cont.isNonFatal(error)) {
              this.didFail(error);
            } else {
              throw error;
            }
          }
          break;
        }
      } else {
        break;
      }
    } while (true);
  }

  protected void flushMetrics() {
    final long newReportTime = System.currentTimeMillis();
    final long oldReportTime = RemoteHost.LAST_REPORT_TIME.getAndSet(this, newReportTime);
    final long dt = newReportTime - oldReportTime;
    try {
      this.reportMetrics(dt);
    } catch (Throwable error) {
      if (Cont.isNonFatal(error)) {
        this.didFail(error);
      } else {
        throw error;
      }
    }
  }

  protected void reportMetrics(long dt) {
    final HostProfile profile = this.collectProfile(dt);
    this.hostContext.reportDown(profile);
  }

  protected HostProfile collectProfile(long dt) {
    final int nodeOpenDelta = 0;
    final long nodeOpenCount = 0L;
    final int nodeCloseDelta = 0;
    final long nodeCloseCount = 0L;

    final int agentOpenDelta = 0;
    final long agentOpenCount = 0L;
    final int agentCloseDelta = 0;
    final long agentCloseCount = 0L;
    final long agentExecDelta = 0L;
    final long agentExecRate = 0L;
    final long agentExecTime = 0L;

    final int timerEventDelta = 0;
    final int timerEventRate = 0;
    final long timerEventCount = 0L;

    final int downlinkOpenDelta = RemoteHost.DOWNLINK_OPEN_DELTA.getAndSet(this, 0);
    final long downlinkOpenCount = RemoteHost.DOWNLINK_OPEN_COUNT.addAndGet(this, (long) downlinkOpenDelta);
    final int downlinkCloseDelta = RemoteHost.DOWNLINK_CLOSE_DELTA.getAndSet(this, 0);
    final long downlinkCloseCount = RemoteHost.DOWNLINK_CLOSE_COUNT.addAndGet(this, (long) downlinkCloseDelta);
    final int downlinkEventDelta = RemoteHost.DOWNLINK_EVENT_DELTA.getAndSet(this, 0);
    final int downlinkEventRate = (int) Math.ceil((1000.0 * (double) downlinkEventDelta) / (double) dt);
    final long downlinkEventCount = RemoteHost.DOWNLINK_EVENT_COUNT.addAndGet(this, (long) downlinkEventDelta);
    final int downlinkCommandDelta = RemoteHost.DOWNLINK_COMMAND_DELTA.getAndSet(this, 0);
    final int downlinkCommandRate = (int) Math.ceil((1000.0 * (double) downlinkCommandDelta) / (double) dt);
    final long downlinkCommandCount = RemoteHost.DOWNLINK_COMMAND_COUNT.addAndGet(this, (long) downlinkCommandDelta);

    final int uplinkOpenDelta = RemoteHost.UPLINK_OPEN_DELTA.getAndSet(this, 0);
    final long uplinkOpenCount = RemoteHost.UPLINK_OPEN_COUNT.addAndGet(this, (long) uplinkOpenDelta);
    final int uplinkCloseDelta = RemoteHost.UPLINK_CLOSE_DELTA.getAndSet(this, 0);
    final long uplinkCloseCount = RemoteHost.UPLINK_CLOSE_COUNT.addAndGet(this, (long) uplinkCloseDelta);
    final int uplinkEventDelta = RemoteHost.UPLINK_EVENT_DELTA.getAndSet(this, 0);
    final int uplinkEventRate = (int) Math.ceil((1000.0 * (double) uplinkEventDelta) / (double) dt);
    final long uplinkEventCount = RemoteHost.UPLINK_EVENT_COUNT.addAndGet(this, (long) uplinkEventDelta);
    final int uplinkCommandDelta = RemoteHost.UPLINK_COMMAND_DELTA.getAndSet(this, 0);
    final int uplinkCommandRate = (int) Math.ceil((1000.0 * (double) uplinkCommandDelta) / (double) dt);
    final long uplinkCommandCount = RemoteHost.UPLINK_COMMAND_COUNT.addAndGet(this, (long) uplinkCommandDelta);

    final long nodeCount = nodeOpenCount - nodeCloseCount;
    final long agentCount = agentOpenCount - agentCloseCount;
    final AgentPulse agentPulse = new AgentPulse(agentCount, agentExecRate, agentExecTime, timerEventRate, timerEventCount);
    final long downlinkCount = downlinkOpenCount - downlinkCloseCount;
    final WarpDownlinkPulse downlinkPulse = new WarpDownlinkPulse(downlinkCount, downlinkEventRate, downlinkEventCount,
                                                                  downlinkCommandRate, downlinkCommandCount);
    final long uplinkCount = uplinkOpenCount - uplinkCloseCount;
    final WarpUplinkPulse uplinkPulse = new WarpUplinkPulse(uplinkCount, uplinkEventRate, uplinkEventCount,
                                                            uplinkCommandRate, uplinkCommandCount);
    this.pulse = new HostPulse(nodeCount, agentPulse, downlinkPulse, uplinkPulse);
    final DemandLane<HostPulse> metaPulse = this.metaPulse;
    if (metaPulse != null) {
      metaPulse.cue();
    }

    return new HostProfile(this.cellAddress(),
                           nodeOpenDelta, nodeOpenCount, nodeCloseDelta, nodeCloseCount,
                           agentOpenDelta, agentOpenCount, agentCloseDelta, agentCloseCount,
                           agentExecDelta, agentExecRate, agentExecTime,
                           timerEventDelta, timerEventRate, timerEventCount,
                           downlinkOpenDelta, downlinkOpenCount, downlinkCloseDelta, downlinkCloseCount,
                           downlinkEventDelta, downlinkEventRate, downlinkEventCount,
                           downlinkCommandDelta, downlinkCommandRate, downlinkCommandCount,
                           uplinkOpenDelta, uplinkOpenCount, uplinkCloseDelta, uplinkCloseCount,
                           uplinkEventDelta, uplinkEventRate, uplinkEventCount,
                           uplinkCommandDelta, uplinkCommandRate, uplinkCommandCount);
  }

  static final int PRIMARY = 1 << 0;
  static final int REPLICA = 1 << 1;
  static final int MASTER = 1 << 2;
  static final int SLAVE = 1 << 3;

  static final int MAX_SEND_BACKLOG;
  static final int MAX_RECEIVE_BACKLOG;
  static final int URI_RESOLUTION_CACHE_SIZE;

  static final AtomicIntegerFieldUpdater<RemoteHost> FLAGS =
      AtomicIntegerFieldUpdater.newUpdater(RemoteHost.class, "flags");

  static final AtomicReferenceFieldUpdater<RemoteHost, Identity> REMOTE_IDENTITY =
      AtomicReferenceFieldUpdater.newUpdater(RemoteHost.class, Identity.class, "remoteIdentity");

  static final AtomicIntegerFieldUpdater<RemoteHost> RECEIVE_BACKLOG =
      AtomicIntegerFieldUpdater.newUpdater(RemoteHost.class, "receiveBacklog");

  @SuppressWarnings("unchecked")
  static final AtomicReferenceFieldUpdater<RemoteHost, HashTrieMap<Uri, HashTrieMap<Uri, RemoteWarpDownlink>>> DOWNLINKS =
      AtomicReferenceFieldUpdater.newUpdater(RemoteHost.class, (Class<HashTrieMap<Uri, HashTrieMap<Uri, RemoteWarpDownlink>>>) (Class<?>) HashTrieMap.class, "downlinks");

  @SuppressWarnings("unchecked")
  static final AtomicReferenceFieldUpdater<RemoteHost, HashTrieMap<Uri, HashTrieMap<Uri, HashTrieSet<RemoteWarpUplink>>>> UPLINKS =
      AtomicReferenceFieldUpdater.newUpdater(RemoteHost.class, (Class<HashTrieMap<Uri, HashTrieMap<Uri, HashTrieSet<RemoteWarpUplink>>>>) (Class<?>) HashTrieMap.class, "uplinks");

  static final AtomicIntegerFieldUpdater<RemoteHost> DOWNLINK_OPEN_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(RemoteHost.class, "downlinkOpenDelta");
  static final AtomicLongFieldUpdater<RemoteHost> DOWNLINK_OPEN_COUNT =
      AtomicLongFieldUpdater.newUpdater(RemoteHost.class, "downlinkOpenCount");
  static final AtomicIntegerFieldUpdater<RemoteHost> DOWNLINK_CLOSE_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(RemoteHost.class, "downlinkCloseDelta");
  static final AtomicLongFieldUpdater<RemoteHost> DOWNLINK_CLOSE_COUNT =
      AtomicLongFieldUpdater.newUpdater(RemoteHost.class, "downlinkCloseCount");
  static final AtomicIntegerFieldUpdater<RemoteHost> DOWNLINK_EVENT_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(RemoteHost.class, "downlinkEventDelta");
  static final AtomicLongFieldUpdater<RemoteHost> DOWNLINK_EVENT_COUNT =
      AtomicLongFieldUpdater.newUpdater(RemoteHost.class, "downlinkEventCount");
  static final AtomicIntegerFieldUpdater<RemoteHost> DOWNLINK_COMMAND_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(RemoteHost.class, "downlinkCommandDelta");
  static final AtomicLongFieldUpdater<RemoteHost> DOWNLINK_COMMAND_COUNT =
      AtomicLongFieldUpdater.newUpdater(RemoteHost.class, "downlinkCommandCount");
  static final AtomicIntegerFieldUpdater<RemoteHost> UPLINK_OPEN_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(RemoteHost.class, "uplinkOpenDelta");
  static final AtomicLongFieldUpdater<RemoteHost> UPLINK_OPEN_COUNT =
      AtomicLongFieldUpdater.newUpdater(RemoteHost.class, "uplinkOpenCount");
  static final AtomicIntegerFieldUpdater<RemoteHost> UPLINK_CLOSE_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(RemoteHost.class, "uplinkCloseDelta");
  static final AtomicLongFieldUpdater<RemoteHost> UPLINK_CLOSE_COUNT =
      AtomicLongFieldUpdater.newUpdater(RemoteHost.class, "uplinkCloseCount");
  static final AtomicIntegerFieldUpdater<RemoteHost> UPLINK_EVENT_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(RemoteHost.class, "uplinkEventDelta");
  static final AtomicLongFieldUpdater<RemoteHost> UPLINK_EVENT_COUNT =
      AtomicLongFieldUpdater.newUpdater(RemoteHost.class, "uplinkEventCount");
  static final AtomicIntegerFieldUpdater<RemoteHost> UPLINK_COMMAND_DELTA =
      AtomicIntegerFieldUpdater.newUpdater(RemoteHost.class, "uplinkCommandDelta");
  static final AtomicLongFieldUpdater<RemoteHost> UPLINK_COMMAND_COUNT =
      AtomicLongFieldUpdater.newUpdater(RemoteHost.class, "uplinkCommandCount");
  static final AtomicLongFieldUpdater<RemoteHost> LAST_REPORT_TIME =
      AtomicLongFieldUpdater.newUpdater(RemoteHost.class, "lastReportTime");

  static {
    int maxSendBacklog;
    try {
      maxSendBacklog = Integer.parseInt(System.getProperty("swim.remote.max.send.backlog"));
    } catch (NumberFormatException e) {
      maxSendBacklog = Math.max(512, 128 * Runtime.getRuntime().availableProcessors());
    }
    MAX_SEND_BACKLOG = maxSendBacklog;

    int maxReceiveBacklog;
    try {
      maxReceiveBacklog = Integer.parseInt(System.getProperty("swim.remote.max.receive.backlog"));
    } catch (NumberFormatException e) {
      maxReceiveBacklog = Math.max(512, 128 * Runtime.getRuntime().availableProcessors());
    }
    MAX_RECEIVE_BACKLOG = maxReceiveBacklog;

    int uriResolutionCacheSize;
    try {
      uriResolutionCacheSize = Integer.parseInt(System.getProperty("swim.remote.uri.resolution.cache.size"));
    } catch (NumberFormatException e) {
      uriResolutionCacheSize = 8;
    }
    URI_RESOLUTION_CACHE_SIZE = uriResolutionCacheSize;
  }

}

final class RemoteHostMessageCont implements Cont<Envelope> {

  volatile RemoteHost host;

  RemoteHostMessageCont(RemoteHost host) {
    this.host = host;
  }

  @Override
  public void bind(Envelope envelope) {
    final RemoteHost host = this.host;
    if (host != null) {
      host.didPushMessage(envelope);
    }
  }

  @Override
  public void trap(Throwable error) {
    final RemoteHost host = this.host;
    if (host != null) {
      host.didPushMessage(null);
    }
  }

}

final class RemoteHostPull<E extends Envelope> implements PullRequest<E> {

  final RemoteHost host;
  final float prio;
  final E envelope;
  final Cont<E> cont;

  RemoteHostPull(RemoteHost host, float prio, E envelope, Cont<E> cont) {
    this.host = host;
    this.prio = prio;
    this.envelope = envelope;
    this.cont = cont;
  }

  @Override
  public float prio() {
    return this.prio;
  }

  @Override
  public void pull(PullContext<? super E> context) {
    Throwable failure = null;
    final E envelope = this.envelope;
    try {
      context.push(this.envelope);
      if (envelope instanceof EventMessage) {
        RemoteHost.DOWNLINK_EVENT_DELTA.incrementAndGet(this.host);
        this.host.didUpdateMetrics();
      } else if (envelope instanceof CommandMessage) {
        RemoteHost.UPLINK_COMMAND_DELTA.incrementAndGet(this.host);
        this.host.didUpdateMetrics();
      }
    } catch (Throwable cause) {
      if (!Cont.isNonFatal(cause)) {
        throw cause;
      }
      failure = cause;
    }
    if (this.cont != null) {
      if (failure == null) {
        this.cont.bind(envelope);
      } else {
        this.cont.trap(failure);
      }
    }
    if (failure instanceof RuntimeException) {
      throw (RuntimeException) failure;
    } else if (failure instanceof Error) {
      throw (Error) failure;
    }
  }

  @Override
  public void drop(Throwable reason) {
    if (this.cont != null) {
      this.cont.trap(reason);
    }
  }

  @Override
  public boolean stay(StayContext context, int backlog) {
    if (this.cont instanceof Stay) {
      return ((Stay) this.cont).stay(this.host, backlog);
    } else {
      return backlog < RemoteHost.MAX_SEND_BACKLOG;
    }
  }

}

final class RemoteHostPulseController implements OnCue<HostPulse> {

  final RemoteHost host;

  RemoteHostPulseController(RemoteHost host) {
    this.host = host;
  }

  @Override
  public HostPulse onCue(WarpUplink uplink) {
    return this.host.pulse;
  }

}
