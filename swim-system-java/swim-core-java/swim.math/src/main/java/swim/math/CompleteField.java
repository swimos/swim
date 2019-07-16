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

public interface CompleteField<S> extends Field<S> {
  S exp(S a);

  S log(S a);

  S pow(S b, S e);

  S sqrt(S a);

  S hypot(S x, S y);

  S sin(S a);

  S cos(S a);

  S tan(S a);

  S asin(S a);

  S acos(S a);

  S atan(S a);

  S atan2(S y, S x);

  S sinh(S x);

  S cosh(S x);

  S tanh(S x);

  S sigmoid(S x);

  S rectify(S x);

  S ceil(S a);

  S floor(S a);

  S round(S a);
}
