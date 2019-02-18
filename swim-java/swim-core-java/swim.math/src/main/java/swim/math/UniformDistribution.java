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

public class UniformDistribution extends Distribution {
  final Random random;
  final double lower;
  final double upper;

  public UniformDistribution(Random random, double lower, double upper) {
    if (lower >= upper) {
      throw new IllegalArgumentException(lower + " >= " + upper);
    }
    this.random = random;
    this.lower = lower;
    this.upper = upper;
  }

  public UniformDistribution(double lower, double upper) {
    this(Random.get(), lower, upper);
  }

  @Override
  public double density(double x) {
    if (this.lower <= x && x <= this.upper) {
      return 1.0 / (this.upper - this.lower);
    } else {
      return 0.0;
    }
  }

  @Override
  public double sample() {
    final double u = this.random.nextDouble();
    return u * this.upper + (1.0 - u) * this.lower;
  }
}
