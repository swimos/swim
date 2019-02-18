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

package swim.math;

import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;

public class Z implements VectorModule<Long, Long>, OrderedRing<Long>, Debug {
  protected Z() {
    // stub
  }

  @Override
  public Z scalar() {
    return this;
  }

  @Override
  public final Long zero() {
    return 0L;
  }

  @Override
  public final Long unit() {
    return 1L;
  }

  @Override
  public final Long add(Long a, Long b) {
    return a + b;
  }

  @Override
  public final Long opposite(Long a) {
    return -a;
  }

  @Override
  public final Long subtract(Long a, Long b) {
    return a - b;
  }

  @Override
  public final Long multiply(Long a, Long b) {
    return a * b;
  }

  @Override
  public Long combine(Long a, Long u, Long b, Long v) {
    return a * u + b * v;
  }

  @Override
  public final Long abs(Long a) {
    return Math.abs(a);
  }

  @Override
  public final Long min(Long a, Long b) {
    return Math.min(a, b);
  }

  @Override
  public final Long max(Long a, Long b) {
    return Math.max(a, b);
  }

  @Override
  public final int compare(Long a, Long b) {
    return Long.compare(a, b);
  }

  @Override
  public void debug(Output<?> output) {
    output.write('Z').write('.').write("ring").write('(').write(')');
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static Z ring;

  public static Z ring() {
    if (ring == null) {
      ring = new Z();
    }
    return ring;
  }
}
