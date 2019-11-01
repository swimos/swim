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
import swim.util.Builder;

public abstract class AvroRecordType<F, T> extends AvroNamedType<T> {
  public abstract String doc();

  public abstract AvroRecordType<F, T> doc(String doc);

  public abstract int fieldCount();

  @Override
  public abstract AvroRecordType<F, T> alias(AvroName alias);

  public abstract AvroFieldType<?, ? extends F> getField(int index);

  public abstract AvroRecordType<F, T> field(AvroFieldType<?, ? extends F> field);

  public abstract Builder<F, T> recordBuilder();
}
