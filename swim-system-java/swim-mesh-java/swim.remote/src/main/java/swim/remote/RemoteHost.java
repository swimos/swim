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

package swim.remote;

import java.net.InetSocketAddress;
import java.security.Principal;
import java.security.cert.Certificate;
import java.util.Collection;
import java.util.Iterator;
import java.util.concurrent.atomic.AtomicIntegerFieldUpdater;
import java.util.concurrent.atomic.AtomicReferenceFieldUpdater;
import swim.api.Downlink;
import swim.api.auth.Identity;
import swim.api.policy.Policy;
import swim.api.policy.PolicyDirective;
import swim.collections.FingerTrieSeq;
import swim.collections.HashTrieMap;
import swim.collections.HashTrieSet;
import swim.concurrent.PullContext;
import swim.concurrent.PullRequest;
import swim.concurrent.Schedule;
import swim.concurrent.Stage;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.io.IpSocket;
import swim.io.warp.WarpSocket;
import swim.io.warp.WarpSocketContext;
import swim.runtime.AbstractTierBinding;
import swim.runtime.HostAddress;
import swim.runtime.HostBinding;
import swim.runtime.HostContext;
import swim.runtime.LaneBinding;
import swim.runtime.LinkBinding;
import swim.runtime.Metric;
import swim.runtime.NodeBinding;
import swim.runtime.PartBinding;
import swim.runtime.PushRequest;
import swim.runtime.TierContext;
import swim.runtime.UplinkError;
import swim.runtime.WarpBinding;
import swim.runtime.agent.AgentNode;
import swim.store.StoreBinding;
import swim.structure.Value;
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

public class RemoteHost extends AbstractTierBinding implements HostBinding, WarpSocket {
  protected HostContext hostContext;
  protected WarpSocketContext warpSocketContext;
  final Uri requestUri;
  final Uri baseUri;
  Uri remoteUri;

  volatile int flags;
  volatile Identity remoteIdentity;
  volatile HashTrieMap<Uri, HashTrieMap<Uri, RemoteWarpDownlink>> downlinks;
  volatile HashTrieMap<Uri, HashTrieMap<Uri, HashTrieSet<RemoteWarpUplink>>> uplinks;
  final HashGenCacheMap<Uri, Uri> resolveCache;

  public RemoteHost(Uri requestUri, Uri baseUri) {
    this.requestUri = requestUri;
    this.baseUri = baseUri;
    this.downlinks = HashTrieMap.empty();
    this.uplinks = HashTrieMap.empty();
    this.resolveCache = new HashGenCacheMap<Uri, Uri>(URI_RESOLUTION_CACHE_SIZE);
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
    if (hostClass.isAssignableFrom(getClass())) {
      return (T) this;
    } else {
      return this.hostContext.unwrapHost(hostClass);
    }
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
    return (this.flags & PRIMARY) != 0;
  }

  @Override
  public void setPrimary(boolean isPrimary) {
    int oldFlags;
    int newFlags;
    do {
      oldFlags = this.flags;
      newFlags = oldFlags | PRIMARY;
    } while (oldFlags != newFlags && !FLAGS.compareAndSet(this, oldFlags, newFlags));
  }

  @Override
  public boolean isReplica() {
    return (this.flags & REPLICA) != 0;
  }

  @Override
  public void setReplica(boolean isReplica) {
    int oldFlags;
    int newFlags;
    do {
      oldFlags = this.flags;
      newFlags = oldFlags | REPLICA;
    } while (oldFlags != newFlags && !FLAGS.compareAndSet(this, oldFlags, newFlags));
  }

  @Override
  public boolean isMaster() {
    return (this.flags & MASTER) != 0;
  }

  @Override
  public boolean isSlave() {
    return (this.flags & SLAVE) != 0;
  }

  @Override
  public void didBecomeMaster() {
    int oldFlags;
    int newFlags;
    do {
      oldFlags = this.flags;
      newFlags = oldFlags & ~SLAVE | MASTER;
    } while (oldFlags != newFlags && !FLAGS.compareAndSet(this, oldFlags, newFlags));
  }

  @Override
  public void didBecomeSlave() {
    int oldFlags;
    int newFlags;
    do {
      oldFlags = this.flags;
      newFlags = oldFlags & ~MASTER | SLAVE;
    } while (oldFlags != newFlags && !FLAGS.compareAndSet(this, oldFlags, newFlags));
  }

  RemoteWarpDownlink createWarpDownlink(Uri remoteNodeUri, Uri nodeUri, Uri laneUri, float prio, float rate, Value body) {
    return new RemoteWarpDownlink(this, remoteNodeUri, nodeUri, laneUri, prio, rate, body);
  }

  RemoteWarpUplink createWarpUplink(WarpBinding link, Uri remoteNodeUri) {
    return new RemoteWarpUplink(this, link, remoteNodeUri);
  }

  PushRequest createPushRequest(Envelope envelope, float prio) {
    return new RemoteHostPushDown(this, envelope, prio);
  }

  PullRequest<Envelope> createPullEnvelope(Envelope envelope, float prio, PushRequest delegate) {
    return new RemoteHostPushUp(this, envelope, prio, delegate);
  }

  protected Uri resolve(Uri relativeUri) {
    Uri absoluteUri = this.resolveCache.get(relativeUri);
    if (absoluteUri == null) {
      absoluteUri = this.baseUri.resolve(relativeUri);
      if (!relativeUri.authority().isDefined()) {
        absoluteUri = Uri.from(relativeUri.scheme(), UriAuthority.undefined(),
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
      openWarpUplink((WarpBinding) link);
    } else {
      UplinkError.rejectUnsupported(link);
    }
  }

  protected void openWarpUplink(WarpBinding link) {
    final Uri laneUri = link.laneUri();
    final Uri remoteNodeUri = resolve(link.nodeUri());
    final RemoteWarpUplink uplink = createWarpUplink(link, remoteNodeUri);
    link.setLinkContext(uplink);

    HashTrieMap<Uri, HashTrieMap<Uri, HashTrieSet<RemoteWarpUplink>>> oldUplinks;
    HashTrieMap<Uri, HashTrieMap<Uri, HashTrieSet<RemoteWarpUplink>>> newUplinks;
    do {
      oldUplinks = this.uplinks;
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
      newUplinks = oldUplinks.updated(remoteNodeUri, nodeUplinks);
    } while (!UPLINKS.compareAndSet(this, oldUplinks, newUplinks));

    if (isConnected()) {
      uplink.didConnect();
    }
  }

  void closeUplink(RemoteWarpUplink uplink) {
    final Uri laneUri = uplink.laneUri();
    final Uri remoteNodeUri = uplink.remoteNodeUri;
    HashTrieMap<Uri, HashTrieMap<Uri, HashTrieSet<RemoteWarpUplink>>> oldUplinks;
    HashTrieMap<Uri, HashTrieMap<Uri, HashTrieSet<RemoteWarpUplink>>> newUplinks;
    do {
      oldUplinks = this.uplinks;
      HashTrieMap<Uri, HashTrieSet<RemoteWarpUplink>> nodeUplinks = oldUplinks.get(remoteNodeUri);
      if (nodeUplinks != null) {
        HashTrieSet<RemoteWarpUplink> laneUplinks = nodeUplinks.get(laneUri);
        if (laneUplinks != null) {
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
        } else {
          newUplinks = oldUplinks;
          break;
        }
      } else {
        newUplinks = oldUplinks;
        break;
      }
    } while (oldUplinks != newUplinks && !UPLINKS.compareAndSet(this, oldUplinks, newUplinks));

    if (oldUplinks != newUplinks) {
      uplink.didCloseUp();
    }
  }

  @Override
  public void pushUp(PushRequest pushRequest) {
    final Envelope envelope = pushRequest.envelope();
    final float prio = pushRequest.prio();
    final Uri remoteNodeUri = resolve(envelope.nodeUri());
    final Envelope remoteEnvelope = envelope.nodeUri(remoteNodeUri);
    final PullRequest<Envelope> pullEnvelope = createPullEnvelope(remoteEnvelope, prio, pushRequest);
    this.warpSocketContext.feed(pullEnvelope);
  }

  @Override
  public void willConnect() {
    // nop
  }

  @Override
  public void didConnect() {
    final InetSocketAddress remoteAddress = this.warpSocketContext.remoteAddress();
    final UriAuthority remoteAuthority = UriAuthority.from(UriHost.inetAddress(remoteAddress.getAddress()),
        UriPort.from(remoteAddress.getPort()));
    this.remoteUri = Uri.from(UriScheme.from("warp"), remoteAuthority, UriPath.slash());
    REMOTE_IDENTITY.set(this, new Unauthenticated(this.requestUri, this.remoteUri, Value.absent()));
    connectUplinks();
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
    start();
  }

  @Override
  public void doRead() {
    // nop
  }

  @Override
  public void didRead(Envelope envelope) {
    if (envelope instanceof EventMessage) {
      onEventMessage((EventMessage) envelope);
    } else if (envelope instanceof CommandMessage) {
      onCommandMessage((CommandMessage) envelope);
    } else if (envelope instanceof LinkRequest) {
      onLinkRequest((LinkRequest) envelope);
    } else if (envelope instanceof LinkedResponse) {
      onLinkedResponse((LinkedResponse) envelope);
    } else if (envelope instanceof SyncRequest) {
      onSyncRequest((SyncRequest) envelope);
    } else if (envelope instanceof SyncedResponse) {
      onSyncedResponse((SyncedResponse) envelope);
    } else if (envelope instanceof UnlinkRequest) {
      onUnlinkRequest((UnlinkRequest) envelope);
    } else if (envelope instanceof UnlinkedResponse) {
      onUnlinkedResponse((UnlinkedResponse) envelope);
    } else if (envelope instanceof AuthRequest) {
      onAuthRequest((AuthRequest) envelope);
    } else if (envelope instanceof AuthedResponse) {
      onAuthedResponse((AuthedResponse) envelope);
    } else if (envelope instanceof DeauthRequest) {
      onDeauthRequest((DeauthRequest) envelope);
    } else if (envelope instanceof DeauthedResponse) {
      onDeauthedResponse((DeauthedResponse) envelope);
    } else {
      onUnknownEnvelope(envelope);
    }
  }

  @Override
  public void didRead(WsControl<?, ?> frame) {
    final WarpSocketContext warpSocketContext = this.warpSocketContext;
    if (frame instanceof WsClose<?, ?>) {
      if (warpSocketContext != null) {
        warpSocketContext.write(WsClose.from(1000));
      } else {
        close();
      }
    } else if (frame instanceof WsPing<?, ?>) {
      if (warpSocketContext != null) {
        warpSocketContext.write(WsPong.from(frame.payload()));
      }
    }
  }

  protected void onEventMessage(EventMessage message) {
    final Uri nodeUri = resolve(message.nodeUri());
    final Uri laneUri = message.laneUri();

    final HashTrieMap<Uri, HashTrieSet<RemoteWarpUplink>> nodeUplinks = this.uplinks.get(nodeUri);
    if (nodeUplinks != null) {
      final HashTrieSet<RemoteWarpUplink> laneUplinks = nodeUplinks.get(laneUri);
      if (laneUplinks != null) {
        final EventMessage resolvedMessage = message.nodeUri(nodeUri);
        final Iterator<RemoteWarpUplink> uplinksIterator = laneUplinks.iterator();
        while (uplinksIterator.hasNext()) {
          uplinksIterator.next().queueDown(resolvedMessage);
        }
      }
    }
  }

  protected void onCommandMessage(CommandMessage message) {
    final Policy policy = policy();
    if (policy != null) {
      final PolicyDirective<CommandMessage> directive = policy.canDownlink(message, this.remoteIdentity);
      if (directive.isAllowed()) {
        final CommandMessage newMessage = directive.get();
        if (newMessage != null) {
          message = newMessage;
        }
      } else if (directive.isDenied()) {
        return;
      } else {
        forbid();
        return;
      }
    }

    final Uri nodeUri = resolve(message.nodeUri());
    final Uri laneUri = message.laneUri();
    final CommandMessage resolvedMessage = message.nodeUri(nodeUri);

    final HashTrieMap<Uri, RemoteWarpDownlink> nodeDownlinks = this.downlinks.get(nodeUri);
    if (nodeDownlinks != null) {
      final RemoteWarpDownlink laneDownlink = nodeDownlinks.get(laneUri);
      if (laneDownlink != null) {
        laneDownlink.queueUp(resolvedMessage);
        return;
      }
    }

    final PushRequest pushRequest = createPushRequest(resolvedMessage, 0.0f);
    this.hostContext.pushDown(pushRequest);
  }

  protected void routeDownlink(LinkAddressed envelope) {
    final Uri remoteNodeUri = envelope.nodeUri();
    final Uri nodeUri = resolve(remoteNodeUri);
    final Uri laneUri = envelope.laneUri();
    final float prio = envelope.prio();
    final float rate = envelope.rate();
    final Value body = envelope.body();
    HashTrieMap<Uri, HashTrieMap<Uri, RemoteWarpDownlink>> oldDownlinks;
    HashTrieMap<Uri, HashTrieMap<Uri, RemoteWarpDownlink>> newDownlinks;
    RemoteWarpDownlink downlink = null;

    do {
      oldDownlinks = this.downlinks;
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
        newDownlinks = oldDownlinks;
        break;
      } else {
        if (downlink == null) {
          downlink = createWarpDownlink(remoteNodeUri, nodeUri, laneUri, prio, rate, body);
          this.hostContext.openDownlink(downlink);
        }
        // TODO: don't register error links
        nodeDownlinks = nodeDownlinks.updated(laneUri, downlink);
        newDownlinks = oldDownlinks.updated(nodeUri, nodeDownlinks);
      }
    } while (oldDownlinks != newDownlinks && !DOWNLINKS.compareAndSet(this, oldDownlinks, newDownlinks));

    if (oldDownlinks != newDownlinks) {
      downlink.openDown();
    }
    final LinkAddressed resolvedEnvelope = envelope.nodeUri(nodeUri);
    downlink.queueUp(resolvedEnvelope);
  }

  protected void routeUplink(LaneAddressed envelope) {
    final Uri nodeUri = resolve(envelope.nodeUri());
    final Uri laneUri = envelope.laneUri();
    final HashTrieMap<Uri, HashTrieSet<RemoteWarpUplink>> nodeUplinks = this.uplinks.get(nodeUri);
    if (nodeUplinks != null) {
      final HashTrieSet<RemoteWarpUplink> laneUplinks = nodeUplinks.get(laneUri);
      if (laneUplinks != null) {
        final LaneAddressed resolvedEnvelope = envelope.nodeUri(nodeUri);
        final Iterator<RemoteWarpUplink> uplinksIterator = laneUplinks.iterator();
        while (uplinksIterator.hasNext()) {
          uplinksIterator.next().queueDown(resolvedEnvelope);
        }
      }
    }
  }

  protected void onLinkRequest(LinkRequest request) {
    final Policy policy = policy();
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
        forbid();
        return;
      }
    }
    routeDownlink(request);
  }

  protected void onLinkedResponse(LinkedResponse response) {
    routeUplink(response);
  }

  protected void onSyncRequest(SyncRequest request) {
    final Policy policy = policy();
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
        forbid();
        return;
      }
    }
    routeDownlink(request);
  }

  protected void onSyncedResponse(SyncedResponse response) {
    routeUplink(response);
  }

  protected void onUnlinkRequest(UnlinkRequest request) {
    final Uri nodeUri = resolve(request.nodeUri());
    final Uri laneUri = request.laneUri();
    HashTrieMap<Uri, HashTrieMap<Uri, RemoteWarpDownlink>> oldDownlinks;
    HashTrieMap<Uri, HashTrieMap<Uri, RemoteWarpDownlink>> newDownlinks;
    RemoteWarpDownlink downlink;

    do {
      oldDownlinks = this.downlinks;
      HashTrieMap<Uri, RemoteWarpDownlink> nodeDownlinks = oldDownlinks.get(nodeUri);
      if (nodeDownlinks != null) {
        downlink = nodeDownlinks.get(laneUri);
        if (downlink != null) {
          nodeDownlinks = nodeDownlinks.removed(laneUri);
          if (nodeDownlinks.isEmpty()) {
            newDownlinks = oldDownlinks.removed(nodeUri);
          } else {
            newDownlinks = oldDownlinks.updated(nodeUri, nodeDownlinks);
          }
        } else {
          newDownlinks = oldDownlinks;
          break;
        }
      } else {
        newDownlinks = oldDownlinks;
        downlink = null;
        break;
      }
    } while (oldDownlinks != newDownlinks && !DOWNLINKS.compareAndSet(this, oldDownlinks, newDownlinks));

    if (downlink != null) {
      final UnlinkRequest resolvedRequest = request.nodeUri(nodeUri);
      downlink.queueUp(resolvedRequest);
    }
  }

  protected void onUnlinkedResponse(UnlinkedResponse response) {
    final Uri nodeUri = resolve(response.nodeUri());
    final Uri laneUri = response.laneUri();
    HashTrieMap<Uri, HashTrieMap<Uri, HashTrieSet<RemoteWarpUplink>>> oldUplinks;
    HashTrieMap<Uri, HashTrieMap<Uri, HashTrieSet<RemoteWarpUplink>>> newUplinks;
    HashTrieSet<RemoteWarpUplink> laneUplinks;

    do {
      oldUplinks = this.uplinks;
      HashTrieMap<Uri, HashTrieSet<RemoteWarpUplink>> nodeUplinks = oldUplinks.get(nodeUri);
      if (nodeUplinks != null) {
        laneUplinks = nodeUplinks.get(laneUri);
        if (laneUplinks != null) {
          nodeUplinks = nodeUplinks.removed(laneUri);
          if (nodeUplinks.isEmpty()) {
            newUplinks = oldUplinks.removed(nodeUri);
          } else {
            newUplinks = oldUplinks.updated(nodeUri, nodeUplinks);
          }
        } else {
          newUplinks = oldUplinks;
          break;
        }
      } else {
        newUplinks = oldUplinks;
        laneUplinks = null;
        break;
      }
    } while (oldUplinks != newUplinks && !UPLINKS.compareAndSet(this, oldUplinks, newUplinks));

    if (laneUplinks != null) {
      final UnlinkedResponse resolvedResponse = response.nodeUri(nodeUri);
      final Iterator<RemoteWarpUplink> uplinksIterator = laneUplinks.iterator();
      while (uplinksIterator.hasNext()) {
        uplinksIterator.next().queueDown(resolvedResponse);
      }
    }
  }

  protected void onAuthRequest(AuthRequest request) {
    final RemoteCredentials credentials = new RemoteCredentials(this.requestUri, this.remoteUri, request.body());
    final PolicyDirective<Identity> directive = this.hostContext.authenticate(credentials);
    if (directive != null && directive.isAllowed()) {
      REMOTE_IDENTITY.set(this, directive.get());
      final AuthedResponse response = new AuthedResponse();
      this.warpSocketContext.feed(response, 1.0f);
    } else {
      final DeauthedResponse response = new DeauthedResponse();
      this.warpSocketContext.feed(response, 1.0f);
    }
    if (directive != null && directive.isForbidden()) {
      final WarpSocketContext warpSocketContext = this.warpSocketContext;
      if (warpSocketContext != null) {
        warpSocketContext.write(WsClose.from(1008, "Unauthorized"));
      } else {
        close();
      }
    }
  }

  protected void onAuthedResponse(AuthedResponse response) {
    // TODO
  }

  protected void onDeauthRequest(DeauthRequest request) {
    REMOTE_IDENTITY.set(this, null);
    final DeauthedResponse response = new DeauthedResponse();
    this.warpSocketContext.feed(response, 1.0f);
  }

  protected void onDeauthedResponse(DeauthedResponse response) {
    // TODO
  }

  protected void onUnknownEnvelope(Envelope envelope) {
    // nop
  }

  protected void forbid() {
    final WarpSocketContext warpSocketContext = this.warpSocketContext;
    if (warpSocketContext != null) {
      warpSocketContext.write(WsClose.from(1008, "Forbidden"));
    } else {
      close();
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
    disconnectUplinks();
    this.hostContext.didDisconnect();
    reconnect();
  }

  @Override
  protected void willClose() {
    super.willClose();
    try {
      closeDownlinks();
    } finally {
      try {
        closeUplinks();
      } finally {
        try {
          final HostContext hostContext = this.hostContext;
          if (hostContext != null) {
            hostContext.close();
          }
        } finally {
          final WarpSocketContext warpSocketContext = this.warpSocketContext;
          if (warpSocketContext != null) {
            warpSocketContext.close();
          }
        }
      }
    }
  }

  @Override
  public void didFail(Throwable error) {
    error.printStackTrace();
    this.warpSocketContext.write(WsClose.from(1002, error.getMessage()));
    this.hostContext.close();
  }

  @Override
  public void openMetaHost(HostBinding host, NodeBinding metaHost) {
    openMetaLanes(host, (AgentNode) metaHost);
    this.hostContext.openMetaHost(host, metaHost);
  }

  protected void openMetaLanes(HostBinding host, AgentNode metaHost) {
    // TODO
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
  public void pushDown(PushRequest pushRequest) {
    this.hostContext.pushDown(pushRequest);
  }

  @Override
  public void reportDown(Metric metric) {
    this.hostContext.reportDown(metric);
  }

  protected void reconnect() {
    close();
  }

  protected void closeDownlinks() {
    HashTrieMap<Uri, HashTrieMap<Uri, RemoteWarpDownlink>> oldDownlinks;
    final HashTrieMap<Uri, HashTrieMap<Uri, RemoteWarpDownlink>> newDownlinks = HashTrieMap.empty();
    do {
      oldDownlinks = this.downlinks;
    } while (oldDownlinks != newDownlinks && !DOWNLINKS.compareAndSet(this, oldDownlinks, newDownlinks));

    final Iterator<HashTrieMap<Uri, RemoteWarpDownlink>> nodeDownlinksIterator = oldDownlinks.valueIterator();
    while (nodeDownlinksIterator.hasNext()) {
      final HashTrieMap<Uri, RemoteWarpDownlink> nodeDownlinks = nodeDownlinksIterator.next();
      final Iterator<RemoteWarpDownlink> laneDownlinks = nodeDownlinks.valueIterator();
      while (laneDownlinks.hasNext()) {
        final RemoteWarpDownlink downlink = laneDownlinks.next();
        downlink.closeDown();
      }
    }
  }

  protected void closeUplinks() {
    HashTrieMap<Uri, HashTrieMap<Uri, HashTrieSet<RemoteWarpUplink>>> oldUplinks;
    final HashTrieMap<Uri, HashTrieMap<Uri, HashTrieSet<RemoteWarpUplink>>> newUplinks = HashTrieMap.empty();
    do {
      oldUplinks = this.uplinks;
    } while (oldUplinks != newUplinks && !UPLINKS.compareAndSet(this, oldUplinks, newUplinks));

    final Iterator<HashTrieMap<Uri, HashTrieSet<RemoteWarpUplink>>> nodeUplinksIterator = this.uplinks.valueIterator();
    while (nodeUplinksIterator.hasNext()) {
      final HashTrieMap<Uri, HashTrieSet<RemoteWarpUplink>> nodeUplinks = nodeUplinksIterator.next();
      final Iterator<HashTrieSet<RemoteWarpUplink>> laneUplinksIterator = nodeUplinks.valueIterator();
      while (laneUplinksIterator.hasNext()) {
        final HashTrieSet<RemoteWarpUplink> laneUplinks = laneUplinksIterator.next();
        final Iterator<RemoteWarpUplink> uplinksIterator = laneUplinks.iterator();
        while (uplinksIterator.hasNext()) {
          final RemoteWarpUplink uplink = uplinksIterator.next();
          uplink.closeUp();
        }
      }
    }
  }

  protected void connectUplinks() {
    final Iterator<HashTrieMap<Uri, HashTrieSet<RemoteWarpUplink>>> nodeUplinksIterator = this.uplinks.valueIterator();
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
    if (isConnected()) {
      final Iterator<HashTrieMap<Uri, HashTrieSet<RemoteWarpUplink>>> nodeUplinksIterator = this.uplinks.valueIterator();
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

  static final int PRIMARY = 1 << 0;
  static final int REPLICA = 1 << 1;
  static final int MASTER = 1 << 2;
  static final int SLAVE = 1 << 3;

  static final int URI_RESOLUTION_CACHE_SIZE;

  static final AtomicIntegerFieldUpdater<RemoteHost> FLAGS =
      AtomicIntegerFieldUpdater.newUpdater(RemoteHost.class, "flags");

  static final AtomicReferenceFieldUpdater<RemoteHost, Identity> REMOTE_IDENTITY =
      AtomicReferenceFieldUpdater.newUpdater(RemoteHost.class, Identity.class, "remoteIdentity");

  @SuppressWarnings("unchecked")
  static final AtomicReferenceFieldUpdater<RemoteHost, HashTrieMap<Uri, HashTrieMap<Uri, RemoteWarpDownlink>>> DOWNLINKS =
      AtomicReferenceFieldUpdater.newUpdater(RemoteHost.class, (Class<HashTrieMap<Uri, HashTrieMap<Uri, RemoteWarpDownlink>>>) (Class<?>) HashTrieMap.class, "downlinks");

  @SuppressWarnings("unchecked")
  static final AtomicReferenceFieldUpdater<RemoteHost, HashTrieMap<Uri, HashTrieMap<Uri, HashTrieSet<RemoteWarpUplink>>>> UPLINKS =
      AtomicReferenceFieldUpdater.newUpdater(RemoteHost.class, (Class<HashTrieMap<Uri, HashTrieMap<Uri, HashTrieSet<RemoteWarpUplink>>>>) (Class<?>) HashTrieMap.class, "uplinks");

  static {
    int uriResolutionCacheSize;
    try {
      uriResolutionCacheSize = Integer.parseInt(System.getProperty("swim.remote.uri.resolution.cache.size"));
    } catch (NumberFormatException e) {
      uriResolutionCacheSize = 8;
    }
    URI_RESOLUTION_CACHE_SIZE = uriResolutionCacheSize;
  }
}

final class RemoteHostPushDown implements PushRequest {
  final RemoteHost host;
  final Envelope envelope;
  final float prio;

  RemoteHostPushDown(RemoteHost host, Envelope envelope, float prio) {
    this.host = host;
    this.envelope = envelope;
    this.prio = prio;
  }

  @Override
  public Uri meshUri() {
    return Uri.empty();
  }

  @Override
  public Uri hostUri() {
    return Uri.empty();
  }

  @Override
  public Uri nodeUri() {
    return this.envelope.nodeUri();
  }

  @Override
  public Identity identity() {
    return this.host.remoteIdentity();
  }

  @Override
  public Envelope envelope() {
    return this.envelope;
  }

  @Override
  public float prio() {
    return this.prio;
  }

  @Override
  public void didDeliver() {
    // nop
  }

  @Override
  public void didDecline() {
    // nop
  }
}

final class RemoteHostPushUp implements PullRequest<Envelope> {
  final RemoteHost host;
  final Envelope envelope;
  final float prio;
  final PushRequest delegate;

  RemoteHostPushUp(RemoteHost host, Envelope envelope, float prio, PushRequest delegate) {
    this.host = host;
    this.envelope = envelope;
    this.prio = prio;
    this.delegate = delegate;
  }

  @Override
  public float prio() {
    return this.prio;
  }

  @Override
  public void pull(PullContext<? super Envelope> context) {
    context.push(this.envelope);
    this.delegate.didDeliver();
  }
}
