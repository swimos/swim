// Copyright 2015-2021 Swim Inc.
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
import swim.codec.Binary;
import swim.codec.Output;
import swim.codec.OutputBuffer;
import swim.codec.Utf8;
import swim.collections.FingerTrieSeq;

public class Chunk {

  final Database database;
  final Commit commit;
  final int post;
  final int zone;
  final Germ germ;
  final long size;
  final FingerTrieSeq<Tree> trees;
  final FingerTrieSeq<Page> pages;

  public Chunk(Database database, Commit commit, int post, int zone, Germ germ,
               long size, FingerTrieSeq<Tree> trees, FingerTrieSeq<Page> pages) {
    this.database = database;
    this.commit = commit;
    this.post = post;
    this.zone = zone;
    this.germ = germ;
    this.size = size;
    this.trees = trees;
    this.pages = pages;
  }

  public final Database database() {
    return this.database;
  }

  public final Commit commit() {
    return this.commit;
  }

  public final int post() {
    return this.post;
  }

  public final int zone() {
    return this.zone;
  }

  public final Germ germ() {
    return this.germ;
  }

  public final long size() {
    return this.size;
  }

  public final FingerTrieSeq<Tree> trees() {
    return this.trees;
  }

  public final FingerTrieSeq<Page> pages() {
    return this.pages;
  }

  public void soften() {
    final long version = this.germ.version();
    for (Tree tree : this.trees) {
      tree.soften(version);
    }
  }

  public void write(WritableByteChannel channel) {
    try {
      final FingerTrieSeq<Page> pages = this.pages;
      for (int i = 0; i < pages.size(); i += 1) {
        final Page page = pages.get(i);
        final int pageSize = page.pageSize();
        final OutputBuffer<ByteBuffer> output = Binary.outputBuffer(new byte[pageSize]);
        final Output<ByteBuffer> encoder = Utf8.encodedOutput(output);
        page.writePage(encoder);
        final ByteBuffer pageBuffer = output.bind();
        if (pageBuffer.remaining() != pageSize) {
          throw new StoreException("serialized page size of " + pageBuffer.remaining() + " bytes "
                                 + "does not match expected page size of " + pageSize + " bytes");
        }
        do {
          channel.write(pageBuffer);
        } while (pageBuffer.hasRemaining());
        if (pageBuffer.hasRemaining()) {
          throw new StoreException("wrote incomplete chunk");
        }
      }
    } catch (IOException cause) {
      throw new StoreException(cause);
    }
  }

}
