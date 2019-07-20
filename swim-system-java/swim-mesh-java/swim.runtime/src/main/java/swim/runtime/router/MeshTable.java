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

package swim.runtime.router;

import java.util.Iterator;
import java.util.concurrent.atomic.AtomicReferenceFieldUpdater;
import swim.api.downlink.Downlink;
import swim.api.policy.Policy;
import swim.collections.FingerTrieSeq;
import swim.concurrent.Schedule;
import swim.concurrent.Stage;
import swim.runtime.AbstractTierBinding;
import swim.runtime.EdgeBinding;
import swim.runtime.HttpBinding;
import swim.runtime.LinkBinding;
import swim.runtime.MeshBinding;
import swim.runtime.MeshContext;
import swim.runtime.PartBinding;
import swim.runtime.PartContext;
import swim.runtime.PushRequest;
import swim.runtime.TierContext;
import swim.runtime.uplink.ErrorUplinkModem;
import swim.runtime.uplink.HttpErrorUplinkModem;
import swim.store.StoreBinding;
import swim.structure.Extant;
import swim.structure.Record;
import swim.structure.Text;
import swim.structure.Value;
import swim.uri.Uri;

public class MeshTable extends AbstractTierBinding implements MeshBinding {
  protected MeshContext meshContext;

  volatile FingerTrieSeq<PartBinding> parts;

  volatile PartBinding gateway;

  volatile PartBinding ourself;

  public MeshTable() {
    this.parts = FingerTrieSeq.empty();
  }

  @Override
  public final TierContext tierContext() {
    return this.meshContext;
  }

  @Override
  public final EdgeBinding edge() {
    return this.meshContext.edge();
  }

  @Override
  public final MeshBinding meshWrapper() {
    return this;
  }

  @Override
  public final MeshContext meshContext() {
    return this.meshContext;
  }

  @Override
  public void setMeshContext(MeshContext meshContext) {
    this.meshContext = meshContext;
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T unwrapMesh(Class<T> meshClass) {
    if (meshClass.isAssignableFrom(getClass())) {
      return (T) this;
    } else {
      return this.meshContext.unwrapMesh(meshClass);
    }
  }

  protected PartContext createPartContext(PartBinding part, Value partKey) {
    return new MeshTablePart(this, part, partKey);
  }

  @Override
  public final Uri meshUri() {
    return this.meshContext.meshUri();
  }

  @Override
  public Policy policy() {
    return this.meshContext.policy();
  }

  @Override
  public Schedule schedule() {
    return this.meshContext.schedule();
  }

  @Override
  public Stage stage() {
    return this.meshContext.stage();
  }

  @Override
  public StoreBinding store() {
    return this.meshContext.store();
  }

  @Override
  public PartBinding gateway() {
    return this.gateway;
  }

  @Override
  public void setGateway(PartBinding gateway) {
    this.gateway = gateway;
  }

  @Override
  public PartBinding ourself() {
    return this.ourself;
  }

  @Override
  public void setOurself(PartBinding ourself) {
    this.ourself = ourself;
  }

  @Override
  public FingerTrieSeq<PartBinding> parts() {
    return this.parts;
  }

  boolean isMetaNode(Uri nodeUri) {
    return !meshUri().isDefined() && "swim".equals(nodeUri.schemeName());
  }

  @Override
  public PartBinding getPart(Uri nodeUri) {
    if (isMetaNode(nodeUri)) {
      return this.ourself;
    }
    final FingerTrieSeq<PartBinding> parts = this.parts;
    for (int i = 0, n = parts.size(); i < n; i += 1) {
      final PartBinding part = parts.get(i);
      if (part.predicate().test(nodeUri)) {
        return part;
      }
    }
    return this.gateway;
  }

  @Override
  public PartBinding getPart(Value partKey) {
    final FingerTrieSeq<PartBinding> parts = this.parts;
    for (int i = 0, n = parts.size(); i < n; i += 1) {
      final PartBinding part = parts.get(i);
      if (partKey.equals(part.partKey())) {
        return part;
      }
    }
    return null;
  }

  @Override
  public PartBinding openPart(Uri nodeUri) {
    FingerTrieSeq<PartBinding> oldParts;
    FingerTrieSeq<PartBinding> newParts;
    PartBinding partBinding = null;
    Value partKey = Value.absent();
    do {
      oldParts = this.parts;
      PartBinding part = null;
      if (isMetaNode(nodeUri)) {
        part = this.ourself;
      } else {
        for (int i = 0, n = oldParts.size(); i < n; i += 1) {
          final PartBinding oldPart = oldParts.get(i);
          if (oldPart.predicate().test(nodeUri)) {
            part = oldPart;
            break;
          }
        }
      }
      if (part != null) {
        if (partBinding != null) {
          // Lost creation race.
          partBinding.close();
        }
        partBinding = part;
        newParts = oldParts;
        break;
      } else if (partBinding == null) {
        if (isMetaNode(nodeUri)) {
          partKey = Text.from("swim");
        } else {
          partKey = Value.absent();
        }
        partBinding = this.meshContext.createPart(partKey);
        if (partBinding != null) {
          partBinding = this.meshContext.injectPart(partKey, partBinding);
          final PartContext partContext = createPartContext(partBinding, partKey);
          partBinding.setPartContext(partContext);
          partBinding = partBinding.partWrapper();
          newParts = oldParts.appended(partBinding);
        } else {
          newParts = oldParts;
          break;
        }
      } else {
        newParts = oldParts.appended(partBinding);
      }
    } while (oldParts != newParts && !PARTS.compareAndSet(this, oldParts, newParts));
    if (oldParts != newParts) {
      if (partKey instanceof Extant) {
        this.gateway = partBinding;
      } else if (isMetaNode(nodeUri)) {
        this.ourself = partBinding;
      }
      activate(partBinding);
    }
    return partBinding;
  }

  @Override
  public PartBinding openGateway() {
    FingerTrieSeq<PartBinding> oldParts;
    FingerTrieSeq<PartBinding> newParts;
    PartBinding partBinding = null;
    do {
      oldParts = this.parts;
      final PartBinding part = this.gateway;
      if (part != null) {
        if (partBinding != null) {
          // Lost creation race.
          partBinding.close();
        }
        partBinding = part;
        newParts = oldParts;
        break;
      } else if (partBinding == null) {
        final Value partKey = Value.absent();
        partBinding = this.meshContext.createPart(partKey);
        if (partBinding != null) {
          partBinding = this.meshContext.injectPart(partKey, partBinding);
          final PartContext partContext = createPartContext(partBinding, partKey);
          partBinding.setPartContext(partContext);
          partBinding = partBinding.partWrapper();
          newParts = oldParts.appended(partBinding);
        } else {
          newParts = oldParts;
          break;
        }
      } else {
        newParts = oldParts.appended(partBinding);
      }
    } while (oldParts != newParts && !PARTS.compareAndSet(this, oldParts, newParts));
    if (oldParts != newParts) {
      this.gateway = partBinding;
      activate(partBinding);
    }
    return partBinding;
  }

  @Override
  public PartBinding addPart(Value partKey, PartBinding part) {
    FingerTrieSeq<PartBinding> oldParts;
    FingerTrieSeq<PartBinding> newParts;
    PartBinding partBinding = null;
    do {
      oldParts = this.parts;
      for (int i = 0, n = oldParts.size(); i < n; i += 1) {
        final PartBinding oldPart = oldParts.get(i);
        if (partKey.equals(oldPart.partKey())) {
          break;
        }
      }
      if (partBinding == null) {
        partBinding = this.meshContext.injectPart(partKey, part);
        final PartContext partContext = createPartContext(partBinding, partKey);
        partBinding.setPartContext(partContext);
        partBinding = partBinding.partWrapper();
      }
      newParts = oldParts.appended(partBinding);
    } while (oldParts != newParts && !PARTS.compareAndSet(this, oldParts, newParts));
    if (partBinding != null) {
      activate(partBinding);
    }
    return partBinding;
  }

  public void closePart(Value partKey) {
    FingerTrieSeq<PartBinding> oldParts;
    FingerTrieSeq<PartBinding> newParts;
    PartBinding partBinding;
    do {
      oldParts = this.parts;
      newParts = oldParts;
      partBinding = null;
      for (int i = 0, n = oldParts.size(); i < n; i += 1) {
        final PartBinding part = oldParts.get(i);
        if (partKey.equals(part.partKey())) {
          partBinding = part;
          newParts = oldParts.removed(i);
          break;
        }
      }
    } while (oldParts != newParts && !PARTS.compareAndSet(this, oldParts, newParts));
    if (partBinding != null) {
      if (this.gateway == partBinding) {
        this.gateway = null;
      } else if (this.ourself == partBinding) {
        this.ourself = null;
      }
      partBinding.didClose();
    }
  }

  @Override
  public LinkBinding bindDownlink(Downlink downlink) {
    return this.meshContext.bindDownlink(downlink);
  }

  @Override
  public void openDownlink(LinkBinding link) {
    this.meshContext.openDownlink(link);
  }

  @Override
  public void closeDownlink(LinkBinding link) {
  }

  @Override
  public void openUplink(LinkBinding link) {
    final PartBinding partBinding = openPart(link.nodeUri());
    if (partBinding != null) {
      partBinding.openUplink(link);
    } else {
      final ErrorUplinkModem linkContext = new ErrorUplinkModem(link, Record.of().attr("noPart"));
      link.setLinkContext(linkContext);
      linkContext.cueDown();
    }
  }

  @Override
  public void httpDownlink(HttpBinding http) {
    // TODO
  }

  @Override
  public void httpUplink(HttpBinding http) {
    final PartBinding partBinding = openPart(http.nodeUri());
    if (partBinding != null) {
      partBinding.httpUplink(http);
    } else {
      final HttpErrorUplinkModem httpContext = new HttpErrorUplinkModem(http);
      http.setHttpContext(httpContext);
    }
  }

  @Override
  public void pushDown(PushRequest pushRequest) {
    this.meshContext.pushDown(pushRequest);
  }

  @Override
  public void pushUp(PushRequest pushRequest) {
    final PartBinding partBinding = openPart(pushRequest.nodeUri());
    if (partBinding != null) {
      partBinding.pushUp(pushRequest);
    } else {
      pushRequest.didDecline();
    }
  }

  @Override
  public void trace(Object message) {
    this.meshContext.trace(message);
  }

  @Override
  public void debug(Object message) {
    this.meshContext.debug(message);
  }

  @Override
  public void info(Object message) {
    this.meshContext.info(message);
  }

  @Override
  public void warn(Object message) {
    this.meshContext.warn(message);
  }

  @Override
  public void error(Object message) {
    this.meshContext.error(message);
  }

  @Override
  protected void willOpen() {
    super.willOpen();
    final Iterator<PartBinding> partsIterator = this.parts.iterator();
    while (partsIterator.hasNext()) {
      partsIterator.next().open();
    }
  }

  @Override
  protected void willLoad() {
    super.willLoad();
    final Iterator<PartBinding> partsIterator = this.parts.iterator();
    while (partsIterator.hasNext()) {
      partsIterator.next().load();
    }
  }

  @Override
  protected void willStart() {
    super.willStart();
    final Iterator<PartBinding> partsIterator = this.parts.iterator();
    while (partsIterator.hasNext()) {
      partsIterator.next().start();
    }
  }

  @Override
  protected void willStop() {
    super.willStop();
    final Iterator<PartBinding> partsIterator = this.parts.iterator();
    while (partsIterator.hasNext()) {
      partsIterator.next().stop();
    }
  }

  @Override
  protected void willUnload() {
    super.willUnload();
    final Iterator<PartBinding> partsIterator = this.parts.iterator();
    while (partsIterator.hasNext()) {
      partsIterator.next().unload();
    }
  }

  @Override
  protected void willClose() {
    super.willClose();
    final Iterator<PartBinding> partsIterator = this.parts.iterator();
    while (partsIterator.hasNext()) {
      partsIterator.next().close();
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
  static final AtomicReferenceFieldUpdater<MeshTable, FingerTrieSeq<PartBinding>> PARTS =
      AtomicReferenceFieldUpdater.newUpdater(MeshTable.class, (Class<FingerTrieSeq<PartBinding>>) (Class<?>) FingerTrieSeq.class, "parts");
}
