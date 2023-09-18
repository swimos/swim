// Copyright 2015-2023 Nstream, inc.
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

package swim.system.warp;

import java.util.Collection;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.atomic.AtomicReferenceFieldUpdater;
import swim.collections.HashTrieSet;
import swim.concurrent.Cont;
import swim.structure.Value;
import swim.system.Push;
import swim.uri.Uri;
import swim.warp.CommandMessage;

public abstract class MapDownlinkModem<View extends WarpDownlinkView> extends WarpDownlinkModel<View> {

  final ConcurrentLinkedQueue<Push<CommandMessage>> upQueue;
  volatile HashTrieSet<Value> keyQueue;
  volatile Value lastKey;

  public MapDownlinkModem(Uri meshUri, Uri hostUri, Uri nodeUri, Uri laneUri,
                          float prio, float rate, Value body) {
    super(meshUri, hostUri, nodeUri, laneUri, prio, rate, body);
    this.upQueue = new ConcurrentLinkedQueue<Push<CommandMessage>>();
    this.keyQueue = HashTrieSet.empty();
    this.lastKey = null;
  }

  @Override
  protected boolean upQueueIsEmpty() {
    return this.upQueue.isEmpty();
  }

  @Override
  protected void queueUp(Value body, Cont<CommandMessage> cont) {
    final Uri hostUri = this.hostUri();
    final Uri nodeUri = this.nodeUri();
    final Uri laneUri = this.laneUri();
    final float prio = this.prio();
    final CommandMessage message = new CommandMessage(nodeUri, laneUri, body);
    this.upQueue.add(new Push<CommandMessage>(Uri.empty(), hostUri, nodeUri, laneUri,
                                              prio, null, message, cont));
  }

  public void cueUpKey(Value key) {
    do {
      final HashTrieSet<Value> oldKeyQueue = MapDownlinkModem.KEY_QUEUE.get(this);
      final HashTrieSet<Value> newKeyQueue = oldKeyQueue.added(key);
      if (oldKeyQueue != newKeyQueue) {
        if (MapDownlinkModem.KEY_QUEUE.compareAndSet(this, oldKeyQueue, newKeyQueue)) {
          this.cueUp();
          break;
        }
      } else {
        break;
      }
    } while (true);
  }

  protected void cueUpKeys(Collection<? extends Value> keys) {
    if (!keys.isEmpty()) {
      do {
        final HashTrieSet<Value> oldKeyQueue = MapDownlinkModem.KEY_QUEUE.get(this);
        final HashTrieSet<Value> newKeyQueue = oldKeyQueue.added(keys);
        if (MapDownlinkModem.KEY_QUEUE.compareAndSet(this, oldKeyQueue, newKeyQueue)) {
          break;
        }
      } while (true);
      this.cueUp();
    }
  }

  protected abstract Value nextUpKey(Value key);

  @Override
  protected Push<CommandMessage> nextUpQueue() {
    return this.upQueue.poll();
  }

  @Override
  protected Push<CommandMessage> nextUpCue() {
    do {
      final HashTrieSet<Value> oldKeyQueue = MapDownlinkModem.KEY_QUEUE.get(this);
      Value key = oldKeyQueue.next(this.lastKey);
      if (key == null) {
        key = oldKeyQueue.head();
      }
      final HashTrieSet<Value> newKeyQueue = oldKeyQueue.removed(key);
      if (MapDownlinkModem.KEY_QUEUE.compareAndSet(this, oldKeyQueue, newKeyQueue)) {
        if (key != null) {
          this.lastKey = key;
          final Uri hostUri = this.hostUri();
          final Uri nodeUri = this.nodeUri();
          final Uri laneUri = this.laneUri();
          final float prio = this.prio();
          final Value body = this.nextUpKey(key);
          final CommandMessage message = new CommandMessage(nodeUri, laneUri, body);
          return new Push<CommandMessage>(Uri.empty(), hostUri, nodeUri, laneUri,
                                          prio, null, message, null);
        } else {
          return null;
        }
      }
    } while (true);
  }

  @Override
  protected void feedUp() {
    if (!MapDownlinkModem.KEY_QUEUE.get(this).isEmpty()) {
      this.cueUp();
    }
    super.feedUp();
  }

  @SuppressWarnings("unchecked")
  static final AtomicReferenceFieldUpdater<MapDownlinkModem<?>, HashTrieSet<Value>> KEY_QUEUE =
      AtomicReferenceFieldUpdater.newUpdater((Class<MapDownlinkModem<?>>) (Class<?>) MapDownlinkModem.class, (Class<HashTrieSet<Value>>) (Class<?>) HashTrieSet.class, "keyQueue");

}
