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

package swim.security;

import java.math.BigInteger;
import swim.structure.Num;
import swim.structure.Record;
import swim.structure.Value;
import swim.util.Builder;

class DerStructureDecoder extends DerDecoder<Value> {

  @Override
  public Value integer(byte[] data) {
    return Num.from(new BigInteger(data));
  }

  @SuppressWarnings("unchecked")
  @Override
  public Builder<Value, Value> sequenceBuilder() {
    return (Builder<Value, Value>) (Builder<?, ?>) Record.builder();
  }

}
