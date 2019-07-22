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
import swim.api.Downlink;
import swim.api.policy.Policy;
import swim.collections.HashTrieMap;
import swim.concurrent.Schedule;
import swim.concurrent.Stage;
import swim.runtime.AbstractTierBinding;
import swim.runtime.DownlinkView;
import swim.runtime.EdgeBinding;
import swim.runtime.EdgeContext;
import swim.runtime.LinkBinding;
import swim.runtime.MeshBinding;
import swim.runtime.MeshContext;
import swim.runtime.PushRequest;
import swim.runtime.TierContext;
import swim.runtime.UplinkError;
import swim.store.StoreBinding;
import swim.uri.Uri;

public class EdgeTable extends AbstractTierBinding implements EdgeBinding {
  protected EdgeContext edgeContext;

  volatile HashTrieMap<Uri, MeshBinding> meshes;

  volatile MeshBinding network;

  public EdgeTable() {
    this.meshes = HashTrieMap.empty();
  }

  @Override
  public final TierContext tierContext() {
    return this.edgeContext;
  }

  @Override
  public final EdgeBinding edgeWrapper() {
    return this;
  }

  @Override
  public final EdgeContext edgeContext() {
    return this.edgeContext;
  }

  @Override
  public void setEdgeContext(EdgeContext edgeContext) {
    this.edgeContext = edgeContext;
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T unwrapEdge(Class<T> edgeClass) {
    if (edgeClass.isAssignableFrom(getClass())) {
      return (T) this;
    } else {
      return this.edgeContext.unwrapEdge(edgeClass);
    }
  }

  protected MeshContext createMeshContext(MeshBinding mesh, Uri meshUri) {
    return new EdgeTableMesh(this, mesh, meshUri);
  }

  @Override
  public final Uri meshUri() {
    return Uri.empty();
  }

  @Override
  public Policy policy() {
    return this.edgeContext.policy();
  }

  @Override
  public Schedule schedule() {
    return this.edgeContext.schedule();
  }

  @Override
  public Stage stage() {
    return this.edgeContext.stage();
  }

  @Override
  public StoreBinding store() {
    return this.edgeContext.store();
  }

  @Override
  public MeshBinding network() {
    return this.network;
  }

  @Override
  public void setNetwork(MeshBinding network) {
    this.network = network;
  }

  @Override
  public HashTrieMap<Uri, MeshBinding> meshes() {
    return this.meshes;
  }

  @Override
  public MeshBinding getMesh(Uri meshUri) {
    return this.meshes.get(meshUri);
  }

  @Override
  public MeshBinding openMesh(Uri meshUri) {
    HashTrieMap<Uri, MeshBinding> oldMeshes;
    HashTrieMap<Uri, MeshBinding> newMeshes;
    MeshBinding meshBinding = null;
    do {
      oldMeshes = this.meshes;
      final MeshBinding mesh = oldMeshes.get(meshUri);
      if (mesh != null) {
        if (meshBinding != null) {
          // Lost creation race.
          meshBinding.close();
        }
        meshBinding = mesh;
        newMeshes = oldMeshes;
        break;
      } else if (meshBinding == null) {
        meshBinding = this.edgeContext.createMesh(meshUri);
        if (meshBinding != null) {
          meshBinding = this.edgeContext.injectMesh(meshUri, meshBinding);
          final MeshContext meshContext = createMeshContext(meshBinding, meshUri);
          meshBinding.setMeshContext(meshContext);
          meshBinding = meshBinding.meshWrapper();
          newMeshes = oldMeshes.updated(meshUri, meshBinding);
        } else {
          newMeshes = oldMeshes;
          break;
        }
      } else {
        newMeshes = oldMeshes.updated(meshUri, meshBinding);
      }
    } while (oldMeshes != newMeshes && !MESHES.compareAndSet(this, oldMeshes, newMeshes));
    if (oldMeshes != newMeshes) {
      activate(meshBinding);
    }
    return meshBinding;
  }

  @Override
  public MeshBinding openMesh(Uri meshUri, MeshBinding mesh) {
    HashTrieMap<Uri, MeshBinding> oldMeshes;
    HashTrieMap<Uri, MeshBinding> newMeshes;
    MeshBinding meshBinding = null;
    do {
      oldMeshes = this.meshes;
      if (oldMeshes.containsKey(meshUri)) {
        meshBinding = null;
        newMeshes = oldMeshes;
        break;
      } else {
        if (meshBinding == null) {
          meshBinding = this.edgeContext.injectMesh(meshUri, mesh);
          final MeshContext meshContext = createMeshContext(meshBinding, meshUri);
          meshBinding.setMeshContext(meshContext);
          meshBinding = meshBinding.meshWrapper();
        }
        newMeshes = oldMeshes.updated(meshUri, meshBinding);
      }
    } while (oldMeshes != newMeshes && !MESHES.compareAndSet(this, oldMeshes, newMeshes));
    if (meshBinding != null) {
      activate(meshBinding);
    }
    return meshBinding;
  }

  public void closeMesh(Uri meshUri) {
    HashTrieMap<Uri, MeshBinding> oldMeshes;
    HashTrieMap<Uri, MeshBinding> newMeshes;
    MeshBinding meshBinding = null;
    do {
      oldMeshes = this.meshes;
      final MeshBinding mesh = oldMeshes.get(meshUri);
      if (mesh != null) {
        meshBinding = mesh;
        newMeshes = oldMeshes.removed(meshUri);
      } else {
        meshBinding = null;
        newMeshes = oldMeshes;
        break;
      }
    } while (oldMeshes != newMeshes && !MESHES.compareAndSet(this, oldMeshes, newMeshes));
    if (meshBinding != null) {
      if (this.network == meshBinding) {
        this.network = null;
      }
      meshBinding.didClose();
    }
  }

  @Override
  public LinkBinding bindDownlink(Downlink downlink) {
    final LinkBinding link = ((DownlinkView) downlink).createDownlinkModel();
    openUplink(link);
    return link;
  }

  @Override
  public void openDownlink(LinkBinding link) {
    openUplink(link);
  }

  @Override
  public void closeDownlink(LinkBinding link) {
    // nop
  }

  @Override
  public void openUplink(LinkBinding link) {
    final MeshBinding meshBinding = openMesh(link.meshUri());
    if (meshBinding != null) {
      meshBinding.openUplink(link);
    } else {
      UplinkError.rejectMeshNotFound(link);
    }
  }

  @Override
  public void pushDown(PushRequest pushRequest) {
    pushUp(pushRequest);
  }

  @Override
  public void pushUp(PushRequest pushRequest) {
    final MeshBinding meshBinding = openMesh(pushRequest.meshUri());
    if (meshBinding != null) {
      meshBinding.pushUp(pushRequest);
    } else {
      pushRequest.didDecline();
    }
  }

  @Override
  public void trace(Object message) {
    this.edgeContext.trace(message);
  }

  @Override
  public void debug(Object message) {
    this.edgeContext.debug(message);
  }

  @Override
  public void info(Object message) {
    this.edgeContext.info(message);
  }

  @Override
  public void warn(Object message) {
    this.edgeContext.warn(message);
  }

  @Override
  public void error(Object message) {
    this.edgeContext.error(message);
  }

  @Override
  protected void willOpen() {
    super.willOpen();
    final Iterator<MeshBinding> meshesIterator = this.meshes.valueIterator();
    while (meshesIterator.hasNext()) {
      meshesIterator.next().open();
    }
  }

  @Override
  protected void willLoad() {
    super.willLoad();
    final Iterator<MeshBinding> meshesIterator = this.meshes.valueIterator();
    while (meshesIterator.hasNext()) {
      meshesIterator.next().load();
    }
  }

  @Override
  protected void willStart() {
    super.willStart();
    final Iterator<MeshBinding> meshesIterator = this.meshes.valueIterator();
    while (meshesIterator.hasNext()) {
      meshesIterator.next().start();
    }
  }

  @Override
  protected void willStop() {
    super.willStop();
    final Iterator<MeshBinding> meshesIterator = this.meshes.valueIterator();
    while (meshesIterator.hasNext()) {
      meshesIterator.next().stop();
    }
  }

  @Override
  protected void willUnload() {
    super.willUnload();
    final Iterator<MeshBinding> meshesIterator = this.meshes.valueIterator();
    while (meshesIterator.hasNext()) {
      meshesIterator.next().unload();
    }
  }

  @Override
  protected void willClose() {
    super.willClose();
    final Iterator<MeshBinding> meshesIterator = this.meshes.valueIterator();
    while (meshesIterator.hasNext()) {
      meshesIterator.next().close();
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
  static final AtomicReferenceFieldUpdater<EdgeTable, HashTrieMap<Uri, MeshBinding>> MESHES =
      AtomicReferenceFieldUpdater.newUpdater(EdgeTable.class, (Class<HashTrieMap<Uri, MeshBinding>>) (Class<?>) HashTrieMap.class, "meshes");
}
