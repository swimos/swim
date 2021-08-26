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

import java.lang.reflect.Field;
import swim.protobuf.ProtobufException;
import swim.protobuf.schema.ProtobufFieldType;
import swim.protobuf.schema.ProtobufType;

final class FieldReflection<V, M> extends ProtobufFieldType<V, M> {

  final Field field;
  final long fieldNumber;
  final ProtobufType<? extends V> valueType;

  FieldReflection(Field field, long fieldNumber, ProtobufType<? extends V> valueType) {
    this.field = field;
    this.fieldNumber = fieldNumber;
    this.valueType = valueType;
  }

  @Override
  public long fieldNumber() {
    return this.fieldNumber;
  }

  @Override
  public ProtobufType<? extends V> valueType() {
    return this.valueType;
  }

  @Override
  public M updated(M message, V value) {
    try {
      this.field.set(message, value);
      return message;
    } catch (IllegalAccessException cause) {
      throw new ProtobufException(cause);
    }
  }

  @Override
  public ProtobufFieldType<?, M> packedType() {
    return null;
  }

}
