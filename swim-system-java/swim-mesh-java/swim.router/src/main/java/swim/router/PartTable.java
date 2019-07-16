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

package swim.router;

import java.util.Iterator;
import java.util.concurrent.atomic.AtomicReferenceFieldUpdater;
import swim.api.downlink.Downlink;
import swim.api.policy.Policy;
import swim.collections.HashTrieMap;
import swim.concurrent.Schedule;
import swim.concurrent.Stage;
import swim.runtime.AbstractTierBinding;
import swim.runtime.HostBinding;
import swim.runtime.HostContext;
import swim.runtime.HttpBinding;
import swim.runtime.LinkBinding;
import swim.runtime.MeshBinding;
import swim.runtime.PartBinding;
import swim.runtime.PartContext;
import swim.runtime.PartPredicate;
import swim.runtime.PushRequest;
import swim.runtime.TierContext;
import swim.runtime.uplink.ErrorUplinkModem;
import swim.runtime.uplink.HttpErrorUplinkModem;
import swim.store.StoreBinding;
import swim.structure.Record;
import swim.structure.Value;
import swim.uri.Uri;

public class PartTable extends AbstractTierBinding implements PartBinding {
  final PartPredicate predicate;

  protected PartContext partContext;

  volatile HashTrieMap<Uri, HostBinding> hosts;

  volatile HashTrieMap<Value, PartTableUplink> uplinks;

  volatile HostBinding master;

  public PartTable(PartPredicate predicate) {
    this.hosts = HashTrieMap.empty();
    this.uplinks = HashTrieMap.empty();
    this.predicate = predicate;
  }

  public PartTable() {
    this(PartPredicate.any());
  }

  @Override
  public final TierContext tierContext() {
    return this.partContext;
  }

  @Override
  public final MeshBinding mesh() {
    return this.partContext.mesh();
  }

  @Override
  public final PartBinding partWrapper() {
    return this;
  }

  @Override
  public final PartContext partContext() {
    return this.partContext;
  }

  @Override
  public void setPartContext(PartContext partContext) {
    this.partContext = partContext;
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T unwrapPart(Class<T> partClass) {
    if (partClass.isAssignableFrom(getClass())) {
      return (T) this;
    } else {
      return this.partContext.unwrapPart(partClass);
    }
  }

  protected HostContext createHostContext(HostBinding host, Uri hostUri) {
    return new PartTableHost(this, host, hostUri);
  }

  @Override
  public final Uri meshUri() {
    return this.partContext.meshUri();
  }

  @Override
  public final Value partKey() {
    return this.partContext.partKey();
  }

  @Override
  public Policy policy() {
    return this.partContext.policy();
  }

  @Override
  public Schedule schedule() {
    return this.partContext.schedule();
  }

  @Override
  public Stage stage() {
    return this.partContext.stage();
  }

  @Override
  public StoreBinding store() {
    return this.partContext.store();
  }

  @Override
  public PartPredicate predicate() {
    return this.predicate;
  }

  @Override
  public HostBinding master() {
    return this.master;
  }

  @Override
  public void setMaster(HostBinding master) {
    this.master = master;
  }

  @Override
  public HashTrieMap<Uri, HostBinding> hosts() {
    return this.hosts;
  }

  @Override
  public HostBinding getHost(Uri hostUri) {
    return this.hosts.get(hostUri);
  }

  @Override
  public HostBinding openHost(Uri hostUri) {
    HashTrieMap<Uri, HostBinding> oldHosts;
    HashTrieMap<Uri, HostBinding> newHosts;
    HostBinding hostBinding = null;
    do {
      oldHosts = this.hosts;
      final HostBinding host = oldHosts.get(hostUri);
      if (host != null) {
        if (hostBinding != null) {
          // Lost creation race.
          hostBinding.close();
        }
        hostBinding = host;
        newHosts = oldHosts;
        break;
      } else if (hostBinding == null) {
        hostBinding = this.partContext.createHost(hostUri);
        if (hostBinding != null) {
          hostBinding = this.partContext.injectHost(hostUri, hostBinding);
          final HostContext hostContext = createHostContext(hostBinding, hostUri);
          hostBinding.setHostContext(hostContext);
          hostBinding = hostBinding.hostWrapper();
          newHosts = oldHosts.updated(hostUri, hostBinding);
        } else {
          newHosts = oldHosts;
          break;
        }
      } else {
        newHosts = oldHosts.updated(hostUri, hostBinding);
      }
    } while (oldHosts != newHosts && !HOSTS.compareAndSet(this, oldHosts, newHosts));
    if (oldHosts != newHosts) {
      activate(hostBinding);
    }
    return hostBinding;
  }

  @Override
  public HostBinding openHost(Uri hostUri, HostBinding host) {
    HashTrieMap<Uri, HostBinding> oldHosts;
    HashTrieMap<Uri, HostBinding> newHosts;
    HostBinding hostBinding = null;
    do {
      oldHosts = this.hosts;
      if (oldHosts.containsKey(hostUri) && host.hostContext() != null) {
        hostBinding = null;
        newHosts = oldHosts;
        break;
      } else {
        if (hostBinding == null) {
          hostBinding = this.partContext.injectHost(hostUri, host);
          final HostContext hostContext = createHostContext(hostBinding, hostUri);
          hostBinding.setHostContext(hostContext);
          hostBinding = hostBinding.hostWrapper();
        }
        newHosts = oldHosts.updated(hostUri, hostBinding);
      }
    } while (oldHosts != newHosts && !HOSTS.compareAndSet(this, oldHosts, newHosts));
    if (hostBinding != null) {
      activate(hostBinding);
    }
    return hostBinding;
  }

  public void closeHost(Uri hostUri) {
    HashTrieMap<Uri, HostBinding> oldHosts;
    HashTrieMap<Uri, HostBinding> newHosts;
    HostBinding hostBinding = null;
    do {
      oldHosts = this.hosts;
      final HostBinding host = oldHosts.get(hostUri);
      if (host != null) {
        hostBinding = host;
        newHosts = oldHosts.removed(hostUri);
      } else {
        hostBinding = null;
        newHosts = oldHosts;
        break;
      }
    } while (oldHosts != newHosts && !HOSTS.compareAndSet(this, oldHosts, newHosts));
    if (hostBinding != null) {
      if (this.master == hostBinding) {
        this.master = null;
      }
      hostBinding.didClose();
    }
  }

  public void hostDidConnect(Uri hostUri) {
    this.partContext.hostDidConnect(hostUri);
  }

  public void hostDidDisconnect(Uri hostUri) {
    this.partContext.hostDidDisconnect(hostUri);
  }

  @Override
  public void reopenUplinks() {
    for (PartTableUplink uplink : this.uplinks.values()) {
      uplink.reopen();
    }
  }

  @Override
  public LinkBinding bindDownlink(Downlink downlink) {
    return this.partContext.bindDownlink(downlink);
  }

  @Override
  public void openDownlink(LinkBinding link) {
    this.partContext.openDownlink(link);
  }

  @Override
  public void closeDownlink(LinkBinding link) {
    // nop
  }

  @Override
  public void openUplink(LinkBinding link) {
    HostBinding hostBinding = null;
    if (!link.hostUri().isDefined()) {
      hostBinding = this.master;
    }
    if (hostBinding == null) {
      hostBinding = openHost(link.hostUri());
    }
    if (hostBinding != null) {
      hostBinding.openUplink(new PartTableUplink(this, link));
    } else {
      final ErrorUplinkModem linkContext = new ErrorUplinkModem(link, Record.of().attr("badHost"));
      link.setLinkContext(linkContext);
      linkContext.cueDown();
    }
  }

  void didOpenUplink(PartTableUplink uplink) {
    HashTrieMap<Value, PartTableUplink> oldUplinks;
    HashTrieMap<Value, PartTableUplink> newUplinks;
    do {
      oldUplinks = this.uplinks;
      newUplinks = oldUplinks.updated(uplink.linkKey(), uplink);
    } while (oldUplinks != newUplinks && !UPLINKS.compareAndSet(this, oldUplinks, newUplinks));
  }

  void didCloseUplink(PartTableUplink uplink) {
    HashTrieMap<Value, PartTableUplink> oldUplinks;
    HashTrieMap<Value, PartTableUplink> newUplinks;
    do {
      oldUplinks = this.uplinks;
      newUplinks = oldUplinks.removed(uplink.linkKey());
    } while (oldUplinks != newUplinks && !UPLINKS.compareAndSet(this, oldUplinks, newUplinks));
  }

  @Override
  public void httpDownlink(HttpBinding http) {
    // TODO
  }

  @Override
  public void httpUplink(HttpBinding http) {
    HostBinding hostBinding = null;
    if (!http.hostUri().isDefined()) {
      hostBinding = this.master;
    }
    if (hostBinding == null) {
      hostBinding = openHost(http.hostUri());
    }
    if (hostBinding != null) {
      hostBinding.httpUplink(http);
    } else {
      final HttpErrorUplinkModem httpContext = new HttpErrorUplinkModem(http);
      http.setHttpContext(httpContext);
    }
  }

  @Override
  public void pushDown(PushRequest pushRequest) {
    this.partContext.pushDown(pushRequest);
  }

  @Override
  public void pushUp(PushRequest pushRequest) {
    HostBinding hostBinding = null;
    if (!pushRequest.hostUri().isDefined()) {
      hostBinding = this.master;
    }
    if (hostBinding == null) {
      hostBinding = openHost(pushRequest.hostUri());
    }
    if (hostBinding != null) {
      hostBinding.pushUp(pushRequest);
    } else {
      pushRequest.didDecline();
    }
  }

  @Override
  public void trace(Object message) {
    this.partContext.trace(message);
  }

  @Override
  public void debug(Object message) {
    this.partContext.debug(message);
  }

  @Override
  public void info(Object message) {
    this.partContext.info(message);
  }

  @Override
  public void warn(Object message) {
    this.partContext.warn(message);
  }

  @Override
  public void error(Object message) {
    this.partContext.error(message);
  }

  @Override
  protected void willOpen() {
    super.willOpen();
    final Iterator<HostBinding> hostsIterator = this.hosts.valueIterator();
    while (hostsIterator.hasNext()) {
      hostsIterator.next().open();
    }
  }

  @Override
  protected void willLoad() {
    super.willLoad();
    final Iterator<HostBinding> hostsIterator = this.hosts.valueIterator();
    while (hostsIterator.hasNext()) {
      hostsIterator.next().load();
    }
  }

  @Override
  protected void willStart() {
    super.willStart();
    final Iterator<HostBinding> hostsIterator = this.hosts.valueIterator();
    while (hostsIterator.hasNext()) {
      hostsIterator.next().start();
    }
  }

  @Override
  protected void willStop() {
    super.willStop();
    final Iterator<HostBinding> hostsIterator = this.hosts.valueIterator();
    while (hostsIterator.hasNext()) {
      hostsIterator.next().stop();
    }
  }

  @Override
  protected void willUnload() {
    super.willUnload();
    final Iterator<HostBinding> hostsIterator = this.hosts.valueIterator();
    while (hostsIterator.hasNext()) {
      hostsIterator.next().unload();
    }
  }

  @Override
  protected void willClose() {
    super.willClose();
    final Iterator<HostBinding> hostsIterator = this.hosts.valueIterator();
    while (hostsIterator.hasNext()) {
      hostsIterator.next().close();
    }
  }

  @Override
  public void didClose() {
    // nop
  }

  @Override
  public void didFail(Throwable error) {
    error.printStackTrace();
  }

  @SuppressWarnings("unchecked")
  static final AtomicReferenceFieldUpdater<PartTable, HashTrieMap<Uri, HostBinding>> HOSTS =
      AtomicReferenceFieldUpdater.newUpdater(PartTable.class, (Class<HashTrieMap<Uri, HostBinding>>) (Class<?>) HashTrieMap.class, "hosts");

  @SuppressWarnings("unchecked")
  static final AtomicReferenceFieldUpdater<PartTable, HashTrieMap<Value, PartTableUplink>> UPLINKS =
      AtomicReferenceFieldUpdater.newUpdater(PartTable.class, (Class<HashTrieMap<Value, PartTableUplink>>) (Class<?>) HashTrieMap.class, "uplinks");
}
