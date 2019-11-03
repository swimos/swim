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

package swim.avro.schema;

import swim.avro.AvroName;

public abstract class AvroRecordType<T, R> extends AvroNamedType<T> {
  public abstract String doc();

  public abstract AvroRecordType<T, R> doc(String doc);

  public abstract int fieldCount();

  @Override
  public abstract AvroRecordType<T, R> alias(AvroName alias);

  public abstract AvroFieldType<R, ?> getField(int index);

  public abstract AvroRecordType<T, R> field(AvroFieldType<R, ?> field);

  public abstract R create();

  public abstract T cast(R record);
}
