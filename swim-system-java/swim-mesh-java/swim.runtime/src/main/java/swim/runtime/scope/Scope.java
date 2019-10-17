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
import swim.api.Downlink;
import swim.api.policy.Policy;
import swim.collections.HashTrieSet;
import swim.concurrent.Schedule;
import swim.concurrent.Stage;
import swim.runtime.CellAddress;
import swim.runtime.CellContext;
import swim.runtime.LinkBinding;
import swim.runtime.Metric;
import swim.runtime.NodeBinding;
import swim.runtime.PushRequest;
import swim.store.StoreBinding;

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

  public final CellContext cellContext() {
    return this.cellContext;
  }

  @Override
  public CellAddress cellAddress() {
    return this.cellContext.cellAddress();
  }

  @Override
  public String edgeName() {
    return this.cellContext.edgeName();
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
  public StoreBinding store() {
    return this.cellContext.store();
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
  public void openMetaDownlink(LinkBinding downlink, NodeBinding metaDownlink) {
    this.cellContext.openMetaDownlink(downlink, metaDownlink);
  }

  @Override
  public void pushDown(PushRequest pushRequest) {
    this.cellContext.pushDown(pushRequest);
  }

  @Override
  public void reportDown(Metric metric) {
    this.cellContext.reportDown(metric);
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

  @Override
  public void fail(Object message) {
    this.cellContext.fail(message);
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
