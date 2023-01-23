// Copyright 2015-2023 Swim.inc
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
import swim.avro.AvroNamespace;

public abstract class AvroNamedType<T> extends AvroComplexType<T> {

  AvroNamedType() {
    // sealed
  }

  public AvroNamespace namespace() {
    return this.fullName().namespace();
  }

  public String name() {
    return this.fullName().name();
  }

  public abstract AvroName fullName();

  public abstract int aliasCount();

  public abstract AvroName getAlias(int index);

  public abstract AvroNamedType<T> alias(AvroName alias);

}
