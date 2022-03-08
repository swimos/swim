// Copyright 2015-2022 Swim.inc
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

import type {Spec} from "./Spec";
import type {Proof} from "./Proof";
import type {Exam} from "./Exam";

/**
 * Unit test result aggregator.
 * @public
 */
export class Report {
  /**
   * Lifecycle callback invoked before running the `spec`.
   */
  willRunSpec(spec: Spec): void {
    // hook
  }

  /**
   * Lifecycle callback invoked before running any [[TestFunc test functions]]
   * registered with the `spec`.
   */
  willRunTests(spec: Spec): void {
    // hook
  }

  /**
   * Lifecycle callback invoked before evaluating the `exam`'s [[TestFunc test
   * function]].
   */
  willRunTest(spec: Spec, exam: Exam): void {
    // hook
  }

  /**
   * Lifecycle callback invoked every time a test function attempts to proove
   * an assertion.
   */
  onProof(spec: Spec, exam: Exam, proof: Proof): void {
    // hook
  }

  /**
   * Lifecycle callback invoked every time a test function makes a comment.
   */
  onComment(spec: Spec, exam: Exam, message: string): void {
    // hook
  }

  /**
   * Lifecycle callback invoked after evaluating the `exam`'s [[TestFunc test
   * function]], passing in the returned value of the test function–or a thrown
   * exception–in `result`.
   */
  didRunTest(spec: Spec, exam: Exam, result: unknown): void {
    // hook
  }

  /**
   * Lifecycle callback invoked after all [[TestFunc test functions]]
   * registered with the `spec` have been evaluated.
   */
  didRunTests(spec: Spec): void {
    // hook
  }

  /**
   * Lifecycle callback invoked before executing any child specs returned by
   * [[TestUnit unit factory functions]] registered with the `spec`.
   */
  willRunUnits(spec: Spec): void {
    // hook
  }

  /**
   * Lifecycle callback invoked before executing a child `unit` spec.
   */
  willRunUnit(spec: Spec, unit: Spec): void {
    // hook
  }

  /**
   * Lifecycle callback invoked after executing a child `unit` spec.
   */
  didRunUnit(spec: Spec, unit: Spec): void {
    // hook
  }

  /**
   * Lifecycle callback invoked after all child specs returned by [[TestUnit
   * unit factory functions]] registered with the `spec` have been executed.
   */
  didRunUnits(spec: Spec): void {
    // hook
  }

  /**
   * Lifecycle callback invoked after all [[TestFunc test functions]] and child
   * specs returned by [[UnitFunc unit factory functions]] registered with the
   * `spec` have been evaluated.
   */
  didRunSpec(spec: Spec): void {
    // hook
  }
}
