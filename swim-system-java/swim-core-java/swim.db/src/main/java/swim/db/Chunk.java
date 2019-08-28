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
import java.nio.ByteBuffer;
import java.nio.channels.WritableByteChannel;
import java.nio.charset.Charset;
import swim.collections.FingerTrieSeq;

public class Chunk {
  final Database database;
  final Commit commit;
  final int zone;
  final Germ germ;
  final FingerTrieSeq<Tree> trees;
  final ByteBuffer buffer;

  public Chunk(Database database, Commit commit, int zone, Germ germ,
               FingerTrieSeq<Tree> trees, ByteBuffer buffer) {
    this.database = database;
    this.commit = commit;
    this.zone = zone;
    this.germ = germ;
    this.trees = trees;
    this.buffer = buffer;
  }

  public Database database() {
    return this.database;
  }

  public Commit commit() {
    return this.commit;
  }

  public int zone() {
    return this.zone;
  }

  public Germ germ() {
    return this.germ;
  }

  public FingerTrieSeq<Tree> trees() {
    return this.trees;
  }

  public ByteBuffer toByteBuffer() {
    return this.buffer;
  }

  public long size() {
    return this.buffer.capacity();
  }

  public void write(WritableByteChannel channel) {
    final ByteBuffer buffer = this.buffer;
    int k;
    try {
      do {
        k = channel.write(buffer);
      } while (k > 0 && buffer.hasRemaining());
      if (buffer.hasRemaining()) {
        throw new StoreException("wrote incomplete chunk");
      }
    } catch (IOException cause) {
      throw new StoreException(cause);
    }
  }

  public void soften() {
    final long version = this.germ.version();
    for (Tree tree : this.trees) {
      tree.soften(version);
    }
  }

  @Override
  public String toString() {
    return new String(this.buffer.array(), Charset.forName("UTF-8"));
  }
}
