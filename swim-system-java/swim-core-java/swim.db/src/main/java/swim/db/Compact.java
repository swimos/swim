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

public final class Compact {
  final int deleteDelay;
  final boolean isForced;
  final boolean isShifted;
  final FingerTrieSeq<Cont<Store>> conts;

  public Compact(int deleteDelay, boolean isForced, boolean isShifted,
                 FingerTrieSeq<Cont<Store>> conts) {
    this.deleteDelay = deleteDelay;
    this.isForced = isForced;
    this.isShifted = isShifted;
    this.conts = conts;
  }

  public Compact(int deleteDelay, boolean isForced, boolean isShifted) {
    this(deleteDelay, isForced, isShifted, FingerTrieSeq.<Cont<Store>>empty());
  }

  public int deleteDelay() {
    return this.deleteDelay;
  }

  public Compact deleteDelay(int deleteDelay) {
    return new Compact(deleteDelay, this.isForced, this.isShifted, this.conts);
  }

  public boolean isForced() {
    return this.isForced;
  }

  public Compact isForced(boolean isForced) {
    return new Compact(this.deleteDelay, isForced, this.isShifted, this.conts);
  }

  public boolean isShifted() {
    return this.isShifted;
  }

  public Compact isShifted(boolean isShifted) {
    return new Compact(this.deleteDelay, this.isForced, isShifted, this.conts);
  }

  public FingerTrieSeq<Cont<Store>> conts() {
    return this.conts;
  }

  public Compact andThen(Cont<Store> cont) {
    return new Compact(this.deleteDelay, this.isForced, this.isShifted, this.conts.appended(cont));
  }

  public void bind(Store store) {
    for (Cont<Store> cont : conts) {
      try {
        cont.bind(store);
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
    for (Cont<Store> cont : conts) {
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

  public Compact merged(Compact that) {
    final int deleteDelay = Math.max(this.deleteDelay, that.deleteDelay);
    final boolean isForced = this.isForced || that.isForced;
    final boolean isShifted = this.isShifted || that.isShifted;
    final FingerTrieSeq<Cont<Store>> conts = this.conts.appended(that.conts);
    return new Compact(deleteDelay, isForced, isShifted, conts);
  }

  public Commit commit() {
    return new Commit(false, this.isForced, this.isShifted);
  }

  public static Compact forced(int deleteDelay) {
    return new Compact(deleteDelay, true, false);
  }
}
