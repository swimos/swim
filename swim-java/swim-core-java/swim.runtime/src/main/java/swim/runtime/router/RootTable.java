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

import java.util.Collections;
import java.util.Iterator;
import java.util.concurrent.atomic.AtomicReferenceFieldUpdater;
import swim.api.data.DataFactory;
import swim.api.downlink.Downlink;
import swim.api.policy.Policy;
import swim.collections.HashTrieMap;
import swim.concurrent.Schedule;
import swim.concurrent.Stage;
import swim.math.Z2Form;
import swim.runtime.AbstractTierBinding;
import swim.runtime.HttpBinding;
import swim.runtime.LinkBinding;
import swim.runtime.MeshBinding;
import swim.runtime.MeshContext;
import swim.runtime.PushRequest;
import swim.runtime.RootBinding;
import swim.runtime.RootContext;
import swim.runtime.TierContext;
import swim.runtime.downlink.DownlinkView;
import swim.runtime.uplink.ErrorUplinkModem;
import swim.runtime.uplink.HttpErrorUplinkModem;
import swim.store.DataBinding;
import swim.store.ListDataBinding;
import swim.store.MapDataBinding;
import swim.store.SpatialDataBinding;
import swim.store.ValueDataBinding;
import swim.structure.Record;
import swim.structure.Value;
import swim.uri.Uri;

public class RootTable extends AbstractTierBinding implements RootBinding {
  protected RootContext rootContext;

  volatile HashTrieMap<Uri, MeshBinding> meshes;

  volatile MeshBinding network;

  public RootTable() {
    this.meshes = HashTrieMap.empty();
  }

  @Override
  public final TierContext tierContext() {
    return this.rootContext;
  }

  @Override
  public final RootContext rootContext() {
    return this.rootContext;
  }

  @Override
  public void setRootContext(RootContext rootContext) {
    this.rootContext = rootContext;
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T unwrapRoot(Class<T> rootClass) {
    if (rootClass.isAssignableFrom(getClass())) {
      return (T) this;
    } else {
      return null;
    }
  }

  protected MeshContext createMeshContext(MeshBinding mesh, Uri meshUri) {
    return new RootTableMesh(this, mesh, meshUri);
  }

  @Override
  public final Uri meshUri() {
    return Uri.empty();
  }

  @Override
  public Policy policy() {
    return this.rootContext.policy();
  }

  @Override
  public Schedule schedule() {
    return this.rootContext.schedule();
  }

  @Override
  public Stage stage() {
    return this.rootContext.stage();
  }

  @Override
  public DataFactory data() {
    return this.rootContext.data();
  }

  @Override
  public MeshBinding getNetwork() {
    return this.network;
  }

  @Override
  public void setNetwork(MeshBinding network) {
    this.network = network;
  }

  @Override
  public HashTrieMap<Uri, MeshBinding> getMeshes() {
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
        meshBinding = this.rootContext.createMesh(meshUri);
        if (meshBinding != null) {
          meshBinding = this.rootContext.injectMesh(meshUri, meshBinding);
          final MeshContext meshContext = createMeshContext(meshBinding, meshUri);
          meshBinding.setMeshContext(meshContext);
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
          meshBinding = this.rootContext.injectMesh(meshUri, mesh);
          final MeshContext meshContext = createMeshContext(meshBinding, meshUri);
          meshBinding.setMeshContext(meshContext);
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
  public Iterator<DataBinding> dataBindings() {
    return Collections.emptyIterator();
  }

  @Override
  public void closeData(Value name) {
    // nop
  }

  @Override
  public ListDataBinding openListData(Value name) {
    return this.rootContext.openListData(name);
  }

  @Override
  public ListDataBinding injectListData(ListDataBinding dataBinding) {
    return this.rootContext.injectListData(dataBinding);
  }

  @Override
  public MapDataBinding openMapData(Value name) {
    return this.rootContext.openMapData(name);
  }

  @Override
  public MapDataBinding injectMapData(MapDataBinding dataBinding) {
    return this.rootContext.injectMapData(dataBinding);
  }

  @Override
  public <S> SpatialDataBinding<S> openSpatialData(Value name, Z2Form<S> shapeForm) {
    return this.rootContext.openSpatialData(name, shapeForm);
  }

  @Override
  public <S> SpatialDataBinding<S> injectSpatialData(SpatialDataBinding<S> dataBinding) {
    return this.rootContext.injectSpatialData(dataBinding);
  }

  @Override
  public ValueDataBinding openValueData(Value name) {
    return this.rootContext.openValueData(name);
  }

  @Override
  public ValueDataBinding injectValueData(ValueDataBinding dataBinding) {
    return this.rootContext.injectValueData(dataBinding);
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
  public void httpDownlink(HttpBinding http) {
    // TODO
  }

  @Override
  public void openUplink(LinkBinding link) {
    final MeshBinding meshBinding = openMesh(link.meshUri());
    if (meshBinding != null) {
      meshBinding.openUplink(link);
    } else {
      final ErrorUplinkModem linkContext = new ErrorUplinkModem(link, Record.of().attr("noMesh"));
      link.setLinkContext(linkContext);
      linkContext.cueDown();
    }
  }

  @Override
  public void httpUplink(HttpBinding http) {
    final MeshBinding meshBinding = openMesh(http.meshUri());
    if (meshBinding != null) {
      meshBinding.httpUplink(http);
    } else {
      final HttpErrorUplinkModem httpContext = new HttpErrorUplinkModem(http);
      http.setHttpContext(httpContext);
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
    this.rootContext.trace(message);
  }

  @Override
  public void debug(Object message) {
    this.rootContext.debug(message);
  }

  @Override
  public void info(Object message) {
    this.rootContext.info(message);
  }

  @Override
  public void warn(Object message) {
    this.rootContext.warn(message);
  }

  @Override
  public void error(Object message) {
    this.rootContext.error(message);
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
  static final AtomicReferenceFieldUpdater<RootTable, HashTrieMap<Uri, MeshBinding>> MESHES =
      AtomicReferenceFieldUpdater.newUpdater(RootTable.class, (Class<HashTrieMap<Uri, MeshBinding>>) (Class<?>) HashTrieMap.class, "meshes");
}
