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

package swim.runtime.scope;

import java.util.Iterator;
import java.util.concurrent.atomic.AtomicReferenceFieldUpdater;
import swim.api.data.DataFactory;
import swim.api.downlink.Downlink;
import swim.api.policy.Policy;
import swim.collections.HashTrieSet;
import swim.concurrent.Schedule;
import swim.concurrent.Stage;
import swim.math.Z2Form;
import swim.runtime.CellContext;
import swim.runtime.HttpBinding;
import swim.runtime.LinkBinding;
import swim.runtime.PushRequest;
import swim.store.ListDataBinding;
import swim.store.MapDataBinding;
import swim.store.SpatialDataBinding;
import swim.store.ValueDataBinding;
import swim.structure.Value;

public abstract class Scope implements CellContext {
  protected final CellContext cellContext;

  protected final Stage stage;

  volatile HashTrieSet<LinkBinding> links;

  public Scope(CellContext cellContext, Stage stage) {
    this.cellContext = cellContext;
    this.stage = stage;
    this.links = HashTrieSet.empty();
  }

  public Scope(CellContext cellContext) {
    this(cellContext, cellContext.stage());
  }

  public final CellContext getCellContext() {
    return this.cellContext;
  }

  @Override
  public Policy policy() {
    return this.cellContext.policy();
  }

  @Override
  public Schedule schedule() {
    return this.cellContext.schedule();
  }

  public final Stage stage() {
    return this.stage;
  }

  @Override
  public DataFactory data() {
    return this.cellContext.data();
  }

  @Override
  public ListDataBinding openListData(Value name) {
    return this.cellContext.openListData(name);
  }

  @Override
  public ListDataBinding injectListData(ListDataBinding dataBinding) {
    return this.cellContext.injectListData(dataBinding);
  }

  @Override
  public MapDataBinding openMapData(Value name) {
    return this.cellContext.openMapData(name);
  }

  @Override
  public MapDataBinding injectMapData(MapDataBinding dataBinding) {
    return this.cellContext.injectMapData(dataBinding);
  }

  @Override
  public <S> SpatialDataBinding<S> openSpatialData(Value name, Z2Form<S> shapeForm) {
    return this.cellContext.openSpatialData(name, shapeForm);
  }

  @Override
  public <S> SpatialDataBinding<S> injectSpatialData(SpatialDataBinding<S> dataBinding) {
    return this.cellContext.injectSpatialData(dataBinding);
  }

  @Override
  public ValueDataBinding openValueData(Value name) {
    return this.cellContext.openValueData(name);
  }

  @Override
  public ValueDataBinding injectValueData(ValueDataBinding dataBinding) {
    return this.cellContext.injectValueData(dataBinding);
  }

  @Override
  public LinkBinding bindDownlink(Downlink downlink) {
    final LinkBinding link = this.cellContext.bindDownlink(downlink);
    link.setCellContext(this);
    HashTrieSet<LinkBinding> oldLinks;
    HashTrieSet<LinkBinding> newLinks;
    do {
      oldLinks = this.links;
      newLinks = oldLinks.added(link);
    } while (oldLinks != newLinks && !LINKS.compareAndSet(this, oldLinks, newLinks));
    return link;
  }

  @Override
  public void openDownlink(LinkBinding link) {
    this.cellContext.openDownlink(link);
    link.setCellContext(this);
    HashTrieSet<LinkBinding> oldLinks;
    HashTrieSet<LinkBinding> newLinks;
    do {
      oldLinks = this.links;
      newLinks = oldLinks.added(link);
    } while (oldLinks != newLinks && !LINKS.compareAndSet(this, oldLinks, newLinks));
  }

  @Override
  public void closeDownlink(LinkBinding link) {
    HashTrieSet<LinkBinding> oldLinks;
    HashTrieSet<LinkBinding> newLinks;
    do {
      oldLinks = this.links;
      newLinks = oldLinks.removed(link);
    } while (oldLinks != newLinks && !LINKS.compareAndSet(this, oldLinks, newLinks));
  }

  @Override
  public void httpDownlink(HttpBinding http) {
    // TODO
  }

  @Override
  public void pushDown(PushRequest pushRequest) {
    this.cellContext.pushDown(pushRequest);
  }

  @Override
  public void trace(Object message) {
    this.cellContext.trace(message);
  }

  @Override
  public void debug(Object message) {
    this.cellContext.debug(message);
  }

  @Override
  public void info(Object message) {
    this.cellContext.info(message);
  }

  @Override
  public void warn(Object message) {
    this.cellContext.warn(message);
  }

  @Override
  public void error(Object message) {
    this.cellContext.error(message);
  }

  public void close() {
    HashTrieSet<LinkBinding> oldLinks;
    final HashTrieSet<LinkBinding> newLinks = HashTrieSet.empty();
    do {
      oldLinks = this.links;
    } while (oldLinks != newLinks && !LINKS.compareAndSet(this, oldLinks, newLinks));
    final Iterator<LinkBinding> linksIterator = oldLinks.iterator();
    while (linksIterator.hasNext()) {
      linksIterator.next().closeDown();
    }
  }

  @SuppressWarnings("unchecked")
  static final AtomicReferenceFieldUpdater<Scope, HashTrieSet<LinkBinding>> LINKS =
      AtomicReferenceFieldUpdater.newUpdater(Scope.class, (Class<HashTrieSet<LinkBinding>>) (Class<?>) HashTrieSet.class, "links");
}
