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

package swim.streamlet.combinator;

import swim.streamlet.AbstractInoutlet;

public abstract class MapValueOperator<I, O> extends AbstractInoutlet<I, O> {
  @Override
  public O get() {
    if (this.input != null) {
      return evaluate(this.input.get());
    } else {
      return null;
    }
  }

  public abstract O evaluate(I value);
}
