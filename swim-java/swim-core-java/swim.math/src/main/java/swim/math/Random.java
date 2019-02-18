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

public abstract class Random {
  public abstract byte nextByte();

  public abstract short nextShort();

  public abstract int nextInt();

  public abstract long nextLong();

  public abstract float nextFloat();

  public abstract double nextDouble();

  public abstract boolean nextBoolean();

  private static final ThreadLocal<Random> RANDOM = new ThreadLocal<Random>();

  public static Random get() {
    Random random = RANDOM.get();
    if (random == null) {
      random = new MersenneTwister64();
      RANDOM.set(random);
    }
    return random;
  }
}
