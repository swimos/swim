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
import java.util.concurrent.atomic.AtomicIntegerFieldUpdater;
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
import swim.runtime.NodeBinding;
import swim.runtime.NodeContext;
import swim.runtime.PartBinding;
import swim.runtime.PushRequest;
import swim.runtime.TierContext;
import swim.runtime.uplink.ErrorUplinkModem;
import swim.runtime.uplink.HttpErrorUplinkModem;
import swim.store.StoreBinding;
import swim.structure.Record;
import swim.structure.Value;
import swim.uri.Uri;

public class HostTable extends AbstractTierBinding implements HostBinding {
  protected HostContext hostContext;

  volatile HashTrieMap<Uri, NodeBinding> nodes;

  volatile int flags;

  public HostTable() {
    this.nodes = HashTrieMap.empty();
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

  @Override
  public final HostContext hostContext() {
    return this.hostContext;
  }

  @Override
  public void setHostContext(HostContext hostContext) {
    this.hostContext = hostContext;
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

  protected NodeContext createNodeContext(NodeBinding node, Uri nodeUri) {
    return new HostTableNode(this, node, nodeUri);
  }

  @Override
  public final Uri meshUri() {
    return this.hostContext.meshUri();
  }

  @Override
  public final Value partKey() {
    return this.hostContext.partKey();
  }

  @Override
  public final Uri hostUri() {
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
    return true;
  }

  @Override
  public boolean isRemote() {
    return false;
  }

  @Override
  public boolean isSecure() {
    return true;
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
    if (oldFlags != newFlags) {
      closeNodes();
    }
  }

  @Override
  public HashTrieMap<Uri, NodeBinding> nodes() {
    return this.nodes;
  }

  @Override
  public NodeBinding getNode(Uri nodeUri) {
    return this.nodes.get(nodeUri);
  }

  @Override
  public NodeBinding openNode(Uri nodeUri) {
    HashTrieMap<Uri, NodeBinding> oldNodes;
    HashTrieMap<Uri, NodeBinding> newNodes;
    NodeBinding nodeBinding = null;
    do {
      oldNodes = this.nodes;
      final NodeBinding node = oldNodes.get(nodeUri);
      if (node != null) {
        if (nodeBinding != null) {
          // Lost creation race.
          nodeBinding.close();
        }
        nodeBinding = node;
        newNodes = oldNodes;
        break;
      } else if (nodeBinding == null) {
        nodeBinding = this.hostContext.createNode(nodeUri);
        if (nodeBinding != null) {
          nodeBinding = this.hostContext.injectNode(nodeUri, nodeBinding);
          final NodeContext nodeContext = createNodeContext(nodeBinding, nodeUri);
          nodeBinding.setNodeContext(nodeContext);
          nodeBinding = nodeBinding.nodeWrapper();
          this.hostContext.openAgents(nodeUri, nodeBinding);
          newNodes = oldNodes.updated(nodeUri, nodeBinding);
        } else {
          newNodes = oldNodes;
          break;
        }
      } else {
        newNodes = oldNodes.updated(nodeUri, nodeBinding);
      }
    } while (oldNodes != newNodes && !NODES.compareAndSet(this, oldNodes, newNodes));
    if (oldNodes != newNodes) {
      activate(nodeBinding);
    }
    return nodeBinding;
  }

  @Override
  public NodeBinding openNode(Uri nodeUri, NodeBinding node) {
    HashTrieMap<Uri, NodeBinding> oldNodes;
    HashTrieMap<Uri, NodeBinding> newNodes;
    NodeBinding nodeBinding = null;
    do {
      oldNodes = this.nodes;
      if (oldNodes.containsKey(nodeUri)) {
        nodeBinding = null;
        newNodes = oldNodes;
        break;
      } else {
        if (nodeBinding == null) {
          nodeBinding = this.hostContext.injectNode(nodeUri, node);
          final NodeContext nodeContext = createNodeContext(nodeBinding, nodeUri);
          nodeBinding.setNodeContext(nodeContext);
          nodeBinding = nodeBinding.nodeWrapper();
          this.hostContext.openAgents(nodeUri, nodeBinding);
        }
        newNodes = oldNodes.updated(nodeUri, nodeBinding);
      }
    } while (oldNodes != newNodes && !NODES.compareAndSet(this, oldNodes, newNodes));
    if (nodeBinding != null) {
      activate(nodeBinding);
    }
    return nodeBinding;
  }

  public void closeNode(Uri nodeUri) {
    HashTrieMap<Uri, NodeBinding> oldNodes;
    HashTrieMap<Uri, NodeBinding> newNodes;
    NodeBinding nodeBinding = null;
    do {
      oldNodes = this.nodes;
      final NodeBinding node = oldNodes.get(nodeUri);
      if (node != null) {
        nodeBinding = node;
        newNodes = oldNodes.removed(nodeUri);
      } else {
        nodeBinding = null;
        newNodes = oldNodes;
        break;
      }
    } while (oldNodes != newNodes && !NODES.compareAndSet(this, oldNodes, newNodes));
    if (nodeBinding != null) {
      nodeBinding.didClose();
    }
  }

  public void closeNodes() {
    HashTrieMap<Uri, NodeBinding> oldNodes;
    final HashTrieMap<Uri, NodeBinding> newNodes = HashTrieMap.empty();
    do {
      oldNodes = this.nodes;
    } while (oldNodes != newNodes && !NODES.compareAndSet(this, oldNodes, newNodes));
    for (NodeBinding nodeBinding : oldNodes.values()) {
      nodeBinding.close();
      nodeBinding.didClose();
    }
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
  public void httpDownlink(HttpBinding http) {
    this.hostContext.httpDownlink(http);
  }

  @Override
  public void pushDown(PushRequest pushRequest) {
    this.hostContext.pushDown(pushRequest);
  }

  @Override
  public void openUplink(LinkBinding link) {
    final NodeBinding nodeBinding = openNode(link.nodeUri());
    if (nodeBinding != null) {
      nodeBinding.openUplink(link);
    } else {
      final ErrorUplinkModem linkContext = new ErrorUplinkModem(link, Record.of().attr("nodeNotFound"));
      link.setLinkContext(linkContext);
      linkContext.cueDown();
    }
  }

  @Override
  public void httpUplink(HttpBinding http) {
    final NodeBinding nodeBinding = openNode(http.nodeUri());
    if (nodeBinding != null) {
      nodeBinding.httpUplink(http);
    } else {
      final HttpErrorUplinkModem httpContext = new HttpErrorUplinkModem(http);
      http.setHttpContext(httpContext);
    }
  }

  @Override
  public void pushUp(PushRequest pushRequest) {
    final NodeBinding nodeBinding = openNode(pushRequest.envelope().nodeUri());
    if (nodeBinding != null) {
      nodeBinding.pushUp(pushRequest);
    } else {
      pushRequest.didDecline();
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
  protected void willOpen() {
    super.willOpen();
    final Iterator<NodeBinding> nodesIterator = this.nodes.valueIterator();
    while (nodesIterator.hasNext()) {
      nodesIterator.next().open();
    }
  }

  @Override
  protected void willLoad() {
    super.willLoad();
    final Iterator<NodeBinding> nodesIterator = this.nodes.valueIterator();
    while (nodesIterator.hasNext()) {
      nodesIterator.next().load();
    }
  }

  @Override
  protected void willStart() {
    super.willStart();
    final Iterator<NodeBinding> nodesIterator = this.nodes.valueIterator();
    while (nodesIterator.hasNext()) {
      nodesIterator.next().start();
    }
  }

  @Override
  protected void willStop() {
    super.willStop();
    final Iterator<NodeBinding> nodesIterator = this.nodes.valueIterator();
    while (nodesIterator.hasNext()) {
      nodesIterator.next().stop();
    }
  }

  @Override
  protected void willUnload() {
    super.willUnload();
    final Iterator<NodeBinding> nodesIterator = this.nodes.valueIterator();
    while (nodesIterator.hasNext()) {
      nodesIterator.next().unload();
    }
  }

  @Override
  protected void willClose() {
    super.willClose();
    final Iterator<NodeBinding> nodesIterator = this.nodes.valueIterator();
    while (nodesIterator.hasNext()) {
      nodesIterator.next().close();
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

  static final int PRIMARY = 1 << 0;
  static final int REPLICA = 1 << 1;
  static final int MASTER = 1 << 2;
  static final int SLAVE = 1 << 3;

  @SuppressWarnings("unchecked")
  static final AtomicReferenceFieldUpdater<HostTable, HashTrieMap<Uri, NodeBinding>> NODES =
      AtomicReferenceFieldUpdater.newUpdater(HostTable.class, (Class<HashTrieMap<Uri, NodeBinding>>) (Class<?>) HashTrieMap.class, "nodes");

  static final AtomicIntegerFieldUpdater<HostTable> FLAGS =
      AtomicIntegerFieldUpdater.newUpdater(HostTable.class, "flags");
}
