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
import swim.protobuf.schema.ProtobufRepeatedType;
import swim.protobuf.schema.ProtobufType;

final class RepeatedFieldReflection<V, M> extends ProtobufFieldType<V, M> {

  final Field field;
  final long fieldNumber;
  final ProtobufRepeatedType<V, ?> repeatedType;

  RepeatedFieldReflection(Field field, long fieldNumber, ProtobufRepeatedType<V, ?> repeatedType) {
    this.field = field;
    this.fieldNumber = fieldNumber;
    this.repeatedType = repeatedType;
  }

  @Override
  public long fieldNumber() {
    return this.fieldNumber;
  }

  @Override
  public ProtobufType<? extends V> valueType() {
    return this.repeatedType.itemType();
  }

  @SuppressWarnings("unchecked")
  @Override
  public M updated(M message, V item) {
    try {
      final Object oldValue = this.field.get(message);
      final Object newValue = ((ProtobufRepeatedType<V, Object>) this.repeatedType).appended(oldValue, item);
      this.field.set(message, newValue);
      return message;
    } catch (IllegalAccessException cause) {
      throw new ProtobufException(cause);
    }
  }

  @Override
  public ProtobufFieldType<?, M> packedType() {
    return new FieldReflection<>(this.field, this.fieldNumber, this.repeatedType);
  }

}
