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

package swim.runtime.warp;

import swim.structure.Attr;
import swim.structure.Record;
import swim.structure.Value;

public abstract class ListLinkDelta {
  ListLinkDelta() {
    // sealed
  }

  public abstract Value toValue();

  public static ListLinkDelta update(int index, Value key, Value value) {
    return new ListLinkDeltaUpdate(index, key, value);
  }

  public static ListLinkDelta remove(int index, Value key) {
    return new ListLinkDeltaRemove(index, key);
  }

  public static ListLinkDelta move(int fromIndex, int toIndex, Value key) {
    return new ListLinkDeltaMove(fromIndex, toIndex, key);
  }

  public static ListLinkDelta drop(int lower) {
    return new ListLinkDeltaDrop(lower);
  }

  public static ListLinkDelta take(int upper) {
    return new ListLinkDeltaTake(upper);
  }

  public static ListLinkDelta clear() {
    return new ListLinkDeltaClear();
  }
}

final class ListLinkDeltaUpdate extends ListLinkDelta {
  final int index;
  final Value key;
  final Value value;

  ListLinkDeltaUpdate(int index, Value key, Value value) {
    this.index = index;
    this.key = key;
    this.value = value;
  }

  @Override
  public Value toValue() {
    final Record header = Record.create(2).slot("index", this.index)
                                          .slot("key", this.key);
    return Attr.of("update", header).concat(this.value);
  }
}

final class ListLinkDeltaRemove extends ListLinkDelta {
  final int index;
  final Value key;

  ListLinkDeltaRemove(int index, Value key) {
    this.index = index;
    this.key = key;
  }

  @Override
  public Value toValue() {
    final Record header = Record.create(2).slot("index", this.index)
                                          .slot("key", this.key);
    return Record.create(1).attr("remove", header);
  }
}

final class ListLinkDeltaMove extends ListLinkDelta {
  final int fromIndex;
  final int toIndex;
  final Value key;

  ListLinkDeltaMove(int fromIndex, int toIndex, Value key) {
    this.fromIndex = fromIndex;
    this.toIndex = toIndex;
    this.key = key;
  }

  @Override
  public Value toValue() {
    final Record header = Record.create(3).slot("from", this.fromIndex)
                                          .slot("to", this.toIndex)
                                          .slot("key", this.key);
    return Record.create(1).attr("move", header);
  }
}

final class ListLinkDeltaDrop extends ListLinkDelta {
  final int lower;

  ListLinkDeltaDrop(int lower) {
    this.lower = lower;
  }

  @Override
  public Value toValue() {
    return Record.create(1).attr("drop", this.lower);
  }
}

final class ListLinkDeltaTake extends ListLinkDelta {
  final int upper;

  ListLinkDeltaTake(int upper) {
    this.upper = upper;
  }

  @Override
  public Value toValue() {
    return Record.create(1).attr("take", this.upper);
  }
}

final class ListLinkDeltaClear extends ListLinkDelta {
  @Override
  public Value toValue() {
    return Record.create(1).attr("clear");
  }
}
