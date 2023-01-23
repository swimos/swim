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

import {Spec, Test, Exam} from "@swim/unit";
import {Mapping, Domain, Range, LinearDomain} from "@swim/util";

export class LinearDomainSpec extends Spec {
  @Test
  testUnitDomain(exam: Exam): void {
    const domain = Domain.unit;
    exam.instanceOf(domain, LinearDomain);
    exam.instanceOf(domain, Domain);
    exam.instanceOf(domain, Mapping);
    exam.identical(domain.domain, domain);
    exam.identical(domain.range, Range.unit);
    exam.equal(domain[0], 0);
    exam.equal(domain[1], 1);
    exam.equal(domain(0), 0);
    exam.equal(domain(0.5), 0.5);
    exam.equal(domain(1), 1);
  }

  @Test
  testLinearDomain(exam: Exam): void {
    const domain = LinearDomain(-2, 2);
    exam.instanceOf(domain, LinearDomain);
    exam.instanceOf(domain, Domain);
    exam.instanceOf(domain, Mapping);
    exam.identical(domain.domain, domain);
    exam.identical(domain.range, Range.unit);
    exam.equal(domain[0], -2);
    exam.equal(domain[1], 2);
    exam.equal(domain(-2), 0);
    exam.equal(domain(0), 0.5);
    exam.equal(domain(2), 1);
  }

  @Test
  interpolateLinearDomains(exam: Exam): void {
    const a = LinearDomain(-1, 1);
    const b = LinearDomain(-2, 2);
    const interpolator = a.interpolateTo(b);
    exam.equal(interpolator(0), a);
    exam.equal(interpolator(0.5), LinearDomain(-1.5, 1.5));
    exam.equal(interpolator(1), b);
  }
}
