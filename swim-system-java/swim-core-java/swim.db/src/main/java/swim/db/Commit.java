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

import swim.collections.FingerTrieSeq;
import swim.concurrent.Cont;
import swim.concurrent.Conts;

public final class Commit {
  final boolean isClosed;
  final boolean isForced;
  final boolean isShifted;
  final FingerTrieSeq<Cont<Chunk>> conts;

  public Commit(boolean isClosed, boolean isForced, boolean isShifted,
                FingerTrieSeq<Cont<Chunk>> conts) {
    this.isClosed = isClosed;
    this.isForced = isForced;
    this.isShifted = isShifted;
    this.conts = conts;
  }

  public Commit(boolean isClosed, boolean isForced, boolean isShifted) {
    this(isClosed, isForced, isShifted, FingerTrieSeq.<Cont<Chunk>>empty());
  }

  public boolean isClosed() {
    return this.isClosed;
  }

  public Commit isClosed(boolean isClosed) {
    return new Commit(isClosed, this.isForced, this.isShifted, this.conts);
  }

  public boolean isForced() {
    return this.isForced;
  }

  public Commit isForced(boolean isForced) {
    return new Commit(this.isClosed, isForced, this.isShifted, this.conts);
  }

  public boolean isShifted() {
    return this.isShifted;
  }

  public Commit isShifted(boolean isShifted) {
    return new Commit(this.isClosed, this.isForced, isShifted, this.conts);
  }

  public FingerTrieSeq<Cont<Chunk>> conts() {
    return this.conts;
  }

  public Commit andThen(Cont<Chunk> cont) {
    return new Commit(this.isClosed, this.isForced, this.isShifted, this.conts.appended(cont));
  }

  public void bind(Chunk chunk) {
    for (Cont<Chunk> cont : conts) {
      try {
        cont.bind(chunk);
      } catch (Throwable cause) {
        if (Conts.isNonFatal(cause)) {
          cont.trap(cause);
        } else {
          throw cause;
        }
      }
    }
  }

  public void trap(Throwable error) {
    for (Cont<Chunk> cont : conts) {
      try {
        cont.trap(error);
      } catch (Throwable cause) {
        if (Conts.isNonFatal(cause)) {
          cause.printStackTrace(); // swallow
        } else {
          throw cause;
        }
      }
    }
  }

  public Commit merged(Commit that) {
    final boolean isClosed = this.isClosed || that.isClosed;
    final boolean isForced = this.isForced || that.isForced;
    final boolean isShifted = this.isShifted || that.isShifted;
    final FingerTrieSeq<Cont<Chunk>> conts = this.conts.appended(that.conts);
    return new Commit(isClosed, isForced, isShifted, conts);
  }

  private static Commit closed;
  private static Commit forced;

  public static Commit closed() {
    if (closed == null) {
      closed = new Commit(true, true, false);
    }
    return closed;
  }

  public static Commit forced() {
    if (forced == null) {
      forced = new Commit(false, true, false);
    }
    return forced;
  }
}
