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

package swim.protobuf.reflection;

import swim.collections.BTree;
import swim.protobuf.schema.ProtobufVarintType;

final class EnumReflection<T extends Enum<T>> extends ProtobufVarintType<T> {

  final BTree<Integer, T> constants;

  EnumReflection(BTree<Integer, T> constants) {
    this.constants = constants;
  }

  public int constantCount() {
    return this.constants.size();
  }

  public String getConstant(int ordinal) {
    return this.constants.get(ordinal).name();
  }

  @Override
  public T cast(long ordinal) {
    return this.constants.get((int) ordinal);
  }

  static <T extends Enum<T>> EnumReflection<T> fromType(Class<T> type) {
    BTree<Integer, T> constants = BTree.empty();
    final T[] values = type.getEnumConstants();
    for (int i = 0, n = values.length; i < n; i += 1) {
      final T value = values[i];
      constants = constants.updated(value.ordinal(), value);
    }
    return new EnumReflection<T>(constants);
  }

}
