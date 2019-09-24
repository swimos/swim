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

package swim.db;

import java.io.IOException;
import java.nio.channels.FileChannel;
import java.util.Iterator;
import java.util.concurrent.atomic.AtomicReferenceFieldUpdater;
import swim.collections.HashTrieMap;
import swim.concurrent.Cont;
import swim.concurrent.Conts;

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
  public void loadPageAsync(PageRef pageRef, Cont<Page> cont) {
    try {
      final int zoneId = pageRef.zone();
      this.store.openZoneAsync(zoneId, new LoadPage(this, pageRef, cont));
    } catch (Throwable cause) {
      if (Conts.isNonFatal(cause)) {
        cont.trap(cause);
      } else {
        throw cause;
      }
    }
  }

  void loadPageAsync(FileZone zone, PageRef pageRef, Cont<Page> cont) {
    try {
      final Integer zoneId = zone.id;
      FileChannel channel = null;
      do {
        final HashTrieMap<Integer, FileChannel> oldChannels = this.channels;
        final FileChannel oldChannel = oldChannels.get(zoneId);
        if (oldChannel == null) {
          channel = zone.openReadChannel();
          final HashTrieMap<Integer, FileChannel> newChannels = oldChannels.updated(zoneId, channel);
          if (CHANNELS.compareAndSet(this, oldChannels, newChannels)) {
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
      zone.loadPageAsync(channel, pageRef, this.treeDelegate, this.isResident, cont);
    } catch (IOException cause) {
      cont.trap(cause);
    } catch (Throwable cause) {
      if (Conts.isNonFatal(cause)) {
        cont.trap(cause);
      } else {
        throw cause;
      }
    }
  }

  @Override
  public void close() {
    do {
      final HashTrieMap<Integer, FileChannel> oldChannels = this.channels;
      final HashTrieMap<Integer, FileChannel> newChannels = HashTrieMap.empty();
      if (oldChannels != newChannels) {
        if (CHANNELS.compareAndSet(this, oldChannels, newChannels)) {
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

  static final class LoadPage implements Cont<Zone> {
    final FilePageLoader pageLoader;
    final PageRef pageRef;
    final Cont<Page> cont;

    LoadPage(FilePageLoader pageLoader, PageRef pageRef, Cont<Page> cont) {
      this.pageLoader = pageLoader;
      this.pageRef = pageRef;
      this.cont = cont;
    }

    @Override
    public void bind(Zone zone) {
      try {
        this.pageLoader.loadPageAsync((FileZone) zone, this.pageRef, this.cont);
      } catch (Throwable cause) {
        if (Conts.isNonFatal(cause)) {
          this.cont.trap(cause);
        } else {
          throw cause;
        }
      }
    }

    @Override
    public void trap(Throwable error) {
      this.cont.trap(error);
    }
  }
}
