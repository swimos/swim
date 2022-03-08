// Copyright 2015-2022 Swim.inc
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

package swim.db;

import java.io.IOException;
import java.nio.channels.FileChannel;
import java.util.Iterator;
import java.util.concurrent.atomic.AtomicReferenceFieldUpdater;
import swim.collections.HashTrieMap;

final class FilePageLoader extends PageLoader {

  final FileStore store;
  final TreeDelegate treeDelegate;
  final boolean isResident;
  volatile HashTrieMap<Integer, FileChannel> channels;

  FilePageLoader(FileStore store, TreeDelegate treeDelegate, boolean isResident) {
    this.store = store;
    this.treeDelegate = treeDelegate;
    this.isResident = isResident;
    this.channels = HashTrieMap.empty();
  }

  @Override
  public boolean isResident() {
    return this.isResident;
  }

  @Override
  public Page loadPage(PageRef pageRef) {
    final int zoneId = pageRef.zone();
    final FileZone zone = this.store.openZone(zoneId);
    return this.loadPage(zone, pageRef);
  }

  Page loadPage(FileZone zone, PageRef pageRef) {
    final Integer zoneId = zone.id;
    FileChannel channel = null;
    do {
      final HashTrieMap<Integer, FileChannel> oldChannels = this.channels;
      final FileChannel oldChannel = oldChannels.get(zoneId);
      if (oldChannel == null) {
        try {
          channel = zone.openReadChannel();
        } catch (IOException cause) {
          throw new StoreException(cause);
        }
        final HashTrieMap<Integer, FileChannel> newChannels = oldChannels.updated(zoneId, channel);
        if (FilePageLoader.CHANNELS.compareAndSet(this, oldChannels, newChannels)) {
          break;
        }
      } else {
        if (channel != null) {
          // Lost open race
          try {
            channel.close();
          } catch (IOException swallow) {
            swallow.printStackTrace();
          }
        }
        channel = oldChannel;
        break;
      }
    } while (true);
    return zone.loadPage(channel, pageRef, this.treeDelegate, this.isResident);
  }

  @Override
  public void close() {
    do {
      final HashTrieMap<Integer, FileChannel> oldChannels = this.channels;
      final HashTrieMap<Integer, FileChannel> newChannels = HashTrieMap.empty();
      if (oldChannels != newChannels) {
        if (FilePageLoader.CHANNELS.compareAndSet(this, oldChannels, newChannels)) {
          final Iterator<FileChannel> channelIterator = oldChannels.valueIterator();
          while (channelIterator.hasNext()) {
            try {
              channelIterator.next().close();
            } catch (IOException swallow) {
              swallow.printStackTrace();
            }
          }
          break;
        }
      } else {
        break;
      }
    } while (true);
  }

  @SuppressWarnings("unchecked")
  static final AtomicReferenceFieldUpdater<FilePageLoader, HashTrieMap<Integer, FileChannel>> CHANNELS =
      AtomicReferenceFieldUpdater.newUpdater(FilePageLoader.class, (Class<HashTrieMap<Integer, FileChannel>>) (Class<?>) HashTrieMap.class, "channels");

}
