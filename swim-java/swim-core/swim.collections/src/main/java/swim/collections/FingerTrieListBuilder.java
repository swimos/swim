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

package swim.collections;

import java.util.Collection;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.util.Assume;

@Public
@Since("5.0")
public final class FingerTrieListBuilder<T> {

  Object @Nullable [] prefix;
  @Nullable FingerTrieListBuilder<Object[]> branch;
  Object @Nullable [] buffer;
  int size;

  public FingerTrieListBuilder(FingerTrieList<? extends T> trie) {
    if (trie.size > 32) {
      this.prefix = trie.prefix;
      if (trie.branch.size > 0) {
        this.branch = new FingerTrieListBuilder<Object[]>(trie.branch);
      }
      this.buffer = trie.suffix;
    } else if (trie.size > 0) {
      this.buffer = trie.prefix;
    }
    this.size = trie.size;
  }

  public FingerTrieListBuilder() {
    this.prefix = null;
    this.branch = null;
    this.buffer = null;
    this.size = 0;
  }

  int getSkew() {
    return (this.prefix != null ? this.size - this.prefix.length : this.size) & 0x1F;
  }

  public boolean add(@Nullable T elem) {
    final int offset = this.getSkew();
    if (offset == 0) {
      if (this.buffer != null) {
        if (this.prefix == null) {
          this.prefix = this.buffer;
        } else {
          if (this.branch == null) {
            this.branch = new FingerTrieListBuilder<Object[]>();
          }
          this.branch.add(this.buffer);
        }
      }
      this.buffer = new Object[32];
    } else {
      this.buffer = Assume.nonNull(this.buffer);
      if (this.buffer.length < 32) {
        final Object[] newBuffer = new Object[32];
        System.arraycopy(this.buffer, 0, newBuffer, 0, offset);
        this.buffer = newBuffer;
      }
    }
    this.buffer[offset] = elem;
    this.size += 1;
    return true;
  }

  public boolean addAll(Collection<? extends T> elems) {
    if (elems instanceof FingerTrieList<?>) {
      return this.addAll((FingerTrieList<? extends T>) elems);
    }
    for (T elem : elems) {
      this.add(elem);
    }
    return true;
  }

  public boolean addAll(FingerTrieList<? extends T> that) {
    if (this.size == 0 && that.size != 0) {
      if (that.size > 32) {
        this.prefix = that.prefix;
        if (that.branch.size > 0) {
          this.branch = new FingerTrieListBuilder<Object[]>(that.branch);
        }
        this.buffer = that.suffix;
      } else {
        this.buffer = that.prefix;
      }
      this.size = that.size;
    } else if (that.size != 0) {
      final int offset = this.getSkew();
      if (((offset + that.prefix.length) & 0x1F) == 0) {
        if (Assume.nonNull(this.buffer).length < 32) {
          final Object[] newBuffer = new Object[32];
          System.arraycopy(this.buffer, 0, newBuffer, 0, offset);
          this.buffer = newBuffer;
        }
        if (offset > 0) {
          System.arraycopy(that.prefix, 0, this.buffer, offset, 32 - offset);
        } else {
          if (this.prefix == null) {
            this.prefix = this.buffer;
          } else {
            if (this.branch == null) {
              this.branch = new FingerTrieListBuilder<Object[]>();
            }
            this.branch.add(this.buffer);
          }
          this.buffer = that.prefix;
        }
        if (that.suffix.length > 0) {
          if (this.branch == null) {
            this.branch = new FingerTrieListBuilder<Object[]>();
          }
          this.branch.add(this.buffer);
          this.branch.addAll(that.branch);
          this.buffer = that.suffix;
        }
        this.size += that.size;
      } else {
        for (T elem : that) {
          this.add(elem);
        }
      }
    }
    return true;
  }

  public void clear() {
    this.prefix = null;
    this.branch = null;
    this.buffer = null;
    this.size = 0;
  }

  public FingerTrieList<T> build() {
    if (this.size == 0) {
      return FingerTrieList.empty();
    }
    final int offset = this.getSkew();
    if (offset != 0 && offset != Assume.nonNull(this.buffer).length) {
      final Object[] suffix = new Object[offset];
      System.arraycopy(this.buffer, 0, suffix, 0, offset);
      this.buffer = suffix;
    }
    if (this.prefix == null) {
      return new FingerTrieList<T>(this.size, Assume.nonNull(this.buffer), FingerTrieList.empty(), FingerTrieList.EMPTY_LEAF);
    } else if (this.branch == null) {
      return new FingerTrieList<T>(this.size, this.prefix, FingerTrieList.empty(), Assume.nonNull(this.buffer));
    } else {
      return new FingerTrieList<T>(this.size, this.prefix, this.branch.build(), Assume.nonNull(this.buffer));
    }
  }

}
