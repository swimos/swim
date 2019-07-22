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

package swim.runtime;

import java.util.concurrent.atomic.AtomicLong;
import swim.structure.Num;
import swim.structure.Value;

public final class LinkKeys {
  private LinkKeys() {
    // static
  }

  static final AtomicLong LINK_COUNT = new AtomicLong(0);

  public static Value generateLinkKey() {
    return Num.from(LINK_COUNT.incrementAndGet());
  }
}
